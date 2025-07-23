import { Router } from 'express';
import { db } from '../db/index.js';
import { 
  forumCategories, 
  forumTopics, 
  forumPosts, 
  forumReactions, 
  forumSubscriptions, 
  forumViews, 
  forumStats,
  users,
  departments
} from '../../shared/schema.js';
import { eq, desc, asc, and, or, like, sql, count } from 'drizzle-orm';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { rateLimit } from 'express-rate-limit';

const router = Router();

// Rate limiting для API форума
const forumRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов за 15 минут
  message: 'Слишком много запросов к форуму, попробуйте позже'
});

const postRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 минута
  max: 5, // максимум 5 постов за минуту
  message: 'Слишком много сообщений, подождите немного'
});

// Получение статистики форума
router.get('/stats', async (req, res) => {
  try {
    const stats = await db.select().from(forumStats).limit(1);
    
    if (stats.length === 0) {
      // Создаем начальную статистику если её нет
      const [newStats] = await db.insert(forumStats).values({
        totalTopics: 0,
        totalPosts: 0,
        totalMembers: 0,
        onlineNow: 0
      }).returning();
      
      return res.json(newStats);
    }
    
    res.json(stats[0]);
  } catch (error) {
    console.error('Ошибка получения статистики форума:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получение всех категорий форума
router.get('/categories', async (req, res) => {
  try {
    const categories = await db
      .select({
        id: forumCategories.id,
        name: forumCategories.name,
        description: forumCategories.description,
        departmentId: forumCategories.departmentId,
        icon: forumCategories.icon,
        color: forumCategories.color,
        orderIndex: forumCategories.orderIndex,
        isActive: forumCategories.isActive,
        topicsCount: forumCategories.topicsCount,
        postsCount: forumCategories.postsCount,
        lastActivity: forumCategories.lastActivity,
        departmentName: departments.name
      })
      .from(forumCategories)
      .leftJoin(departments, eq(forumCategories.departmentId, departments.id))
      .where(eq(forumCategories.isActive, true))
      .orderBy(asc(forumCategories.orderIndex));
    
    res.json(categories);
  } catch (error) {
    console.error('Ошибка получения категорий форума:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получение тем в категории
router.get('/categories/:categoryId/topics', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 20, sort = 'latest' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    let orderBy;
    switch (sort) {
      case 'popular':
        orderBy = [desc(forumTopics.viewsCount), desc(forumTopics.createdAt)];
        break;
      case 'replies':
        orderBy = [desc(forumTopics.repliesCount), desc(forumTopics.createdAt)];
        break;
      case 'latest':
      default:
        orderBy = [desc(forumTopics.createdAt)];
        break;
    }
    
    const topics = await db
      .select({
        id: forumTopics.id,
        title: forumTopics.title,
        content: forumTopics.content,
        status: forumTopics.status,
        isPinned: forumTopics.isPinned,
        isLocked: forumTopics.isLocked,
        viewsCount: forumTopics.viewsCount,
        repliesCount: forumTopics.repliesCount,
        lastPostAt: forumTopics.lastPostAt,
        tags: forumTopics.tags,
        createdAt: forumTopics.createdAt,
        authorId: forumTopics.authorId,
        authorUsername: users.username,
        lastPostAuthorId: forumTopics.lastPostAuthorId,
        lastPostAuthorUsername: sql<string>`(SELECT username FROM users WHERE id = forum_topics.last_post_author_id)`
      })
      .from(forumTopics)
      .leftJoin(users, eq(forumTopics.authorId, users.id))
      .where(eq(forumTopics.categoryId, Number(categoryId)))
      .orderBy(...orderBy)
      .limit(Number(limit))
      .offset(offset);
    
    // Получаем общее количество тем
    const [{ count: totalTopics }] = await db
      .select({ count: count() })
      .from(forumTopics)
      .where(eq(forumTopics.categoryId, Number(categoryId)));
    
    res.json({
      topics,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalTopics,
        pages: Math.ceil(totalTopics / Number(limit))
      }
    });
  } catch (error) {
    console.error('Ошибка получения тем форума:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Создание новой темы
router.post('/topics', authenticateToken, postRateLimit, async (req, res) => {
  try {
    const { categoryId, title, content, tags = [] } = req.body;
    const userId = req.user.id;
    
    if (!categoryId || !title || !content) {
      return res.status(400).json({ error: 'Необходимо указать категорию, заголовок и содержимое' });
    }
    
    const [newTopic] = await db.insert(forumTopics).values({
      categoryId: Number(categoryId),
      authorId: userId,
      title: title.trim(),
      content: content.trim(),
      tags: tags
    }).returning();
    
    // Создаем первое сообщение в теме
    await db.insert(forumPosts).values({
      topicId: newTopic.id,
      authorId: userId,
      content: content.trim()
    });
    
    res.status(201).json(newTopic);
  } catch (error) {
    console.error('Ошибка создания темы:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получение темы с сообщениями
router.get('/topics/:topicId', async (req, res) => {
  try {
    const { topicId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    // Получаем тему
    const [topic] = await db
      .select({
        id: forumTopics.id,
        title: forumTopics.title,
        content: forumTopics.content,
        status: forumTopics.status,
        isPinned: forumTopics.isPinned,
        isLocked: forumTopics.isLocked,
        viewsCount: forumTopics.viewsCount,
        repliesCount: forumTopics.repliesCount,
        tags: forumTopics.tags,
        createdAt: forumTopics.createdAt,
        authorId: forumTopics.authorId,
        authorUsername: users.username,
        categoryId: forumTopics.categoryId,
        categoryName: forumCategories.name
      })
      .from(forumTopics)
      .leftJoin(users, eq(forumTopics.authorId, users.id))
      .leftJoin(forumCategories, eq(forumTopics.categoryId, forumCategories.id))
      .where(eq(forumTopics.id, Number(topicId)));
    
    if (!topic) {
      return res.status(404).json({ error: 'Тема не найдена' });
    }
    
    // Получаем сообщения
    const posts = await db
      .select({
        id: forumPosts.id,
        content: forumPosts.content,
        isEdited: forumPosts.isEdited,
        editedAt: forumPosts.editedAt,
        reactionsCount: forumPosts.reactionsCount,
        createdAt: forumPosts.createdAt,
        authorId: forumPosts.authorId,
        authorUsername: users.username,
        parentId: forumPosts.parentId
      })
      .from(forumPosts)
      .leftJoin(users, eq(forumPosts.authorId, users.id))
      .where(eq(forumPosts.topicId, Number(topicId)))
      .orderBy(asc(forumPosts.createdAt))
      .limit(Number(limit))
      .offset(offset);
    
    // Получаем общее количество сообщений
    const [{ count: totalPosts }] = await db
      .select({ count: count() })
      .from(forumPosts)
      .where(eq(forumPosts.topicId, Number(topicId)));
    
    // Увеличиваем счетчик просмотров
    await db.insert(forumViews).values({
      topicId: Number(topicId),
      userId: req.user?.id || null,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.json({
      topic,
      posts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalPosts,
        pages: Math.ceil(totalPosts / Number(limit))
      }
    });
  } catch (error) {
    console.error('Ошибка получения темы:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Создание сообщения в теме
router.post('/topics/:topicId/posts', authenticateToken, postRateLimit, async (req, res) => {
  try {
    const { topicId } = req.params;
    const { content, parentId } = req.body;
    const userId = req.user.id;
    
    if (!content) {
      return res.status(400).json({ error: 'Необходимо указать содержимое сообщения' });
    }
    
    // Проверяем существование темы
    const [topic] = await db
      .select({ id: forumTopics.id, isLocked: forumTopics.isLocked })
      .from(forumTopics)
      .where(eq(forumTopics.id, Number(topicId)));
    
    if (!topic) {
      return res.status(404).json({ error: 'Тема не найдена' });
    }
    
    if (topic.isLocked) {
      return res.status(403).json({ error: 'Тема заблокирована' });
    }
    
    const [newPost] = await db.insert(forumPosts).values({
      topicId: Number(topicId),
      authorId: userId,
      content: content.trim(),
      parentId: parentId ? Number(parentId) : null
    }).returning();
    
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Ошибка создания сообщения:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Редактирование сообщения
router.put('/posts/:postId', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    
    if (!content) {
      return res.status(400).json({ error: 'Необходимо указать содержимое сообщения' });
    }
    
    // Проверяем права на редактирование
    const [post] = await db
      .select({ id: forumPosts.id, authorId: forumPosts.authorId })
      .from(forumPosts)
      .where(eq(forumPosts.id, Number(postId)));
    
    if (!post) {
      return res.status(404).json({ error: 'Сообщение не найдено' });
    }
    
    if (post.authorId !== userId && req.user.role !== 'admin' && req.user.role !== 'supervisor') {
      return res.status(403).json({ error: 'Нет прав на редактирование' });
    }
    
    const [updatedPost] = await db
      .update(forumPosts)
      .set({
        content: content.trim(),
        isEdited: true,
        editedAt: new Date(),
        editedBy: userId,
        updatedAt: new Date()
      })
      .where(eq(forumPosts.id, Number(postId)))
      .returning();
    
    res.json(updatedPost);
  } catch (error) {
    console.error('Ошибка редактирования сообщения:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Удаление сообщения
router.delete('/posts/:postId', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    
    // Проверяем права на удаление
    const [post] = await db
      .select({ id: forumPosts.id, authorId: forumPosts.authorId })
      .from(forumPosts)
      .where(eq(forumPosts.id, Number(postId)));
    
    if (!post) {
      return res.status(404).json({ error: 'Сообщение не найдено' });
    }
    
    if (post.authorId !== userId && req.user.role !== 'admin' && req.user.role !== 'supervisor') {
      return res.status(403).json({ error: 'Нет прав на удаление' });
    }
    
    await db.delete(forumPosts).where(eq(forumPosts.id, Number(postId)));
    
    res.json({ message: 'Сообщение удалено' });
  } catch (error) {
    console.error('Ошибка удаления сообщения:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Добавление реакции на сообщение
router.post('/posts/:postId/reactions', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { reactionType } = req.body;
    const userId = req.user.id;
    
    if (!reactionType) {
      return res.status(400).json({ error: 'Необходимо указать тип реакции' });
    }
    
    // Проверяем существование сообщения
    const [post] = await db
      .select({ id: forumPosts.id })
      .from(forumPosts)
      .where(eq(forumPosts.id, Number(postId)));
    
    if (!post) {
      return res.status(404).json({ error: 'Сообщение не найдено' });
    }
    
    // Проверяем, есть ли уже такая реакция
    const [existingReaction] = await db
      .select({ id: forumReactions.id })
      .from(forumReactions)
      .where(and(
        eq(forumReactions.postId, Number(postId)),
        eq(forumReactions.userId, userId),
        eq(forumReactions.reactionType, reactionType)
      ));
    
    if (existingReaction) {
      // Удаляем существующую реакцию
      await db.delete(forumReactions).where(eq(forumReactions.id, existingReaction.id));
      res.json({ message: 'Реакция удалена' });
    } else {
      // Добавляем новую реакцию
      await db.insert(forumReactions).values({
        postId: Number(postId),
        userId,
        reactionType
      });
      res.json({ message: 'Реакция добавлена' });
    }
  } catch (error) {
    console.error('Ошибка работы с реакциями:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Подписка на тему
router.post('/topics/:topicId/subscribe', authenticateToken, async (req, res) => {
  try {
    const { topicId } = req.params;
    const userId = req.user.id;
    
    // Проверяем существование темы
    const [topic] = await db
      .select({ id: forumTopics.id })
      .from(forumTopics)
      .where(eq(forumTopics.id, Number(topicId)));
    
    if (!topic) {
      return res.status(404).json({ error: 'Тема не найдена' });
    }
    
    // Проверяем, есть ли уже подписка
    const [existingSubscription] = await db
      .select({ id: forumSubscriptions.id })
      .from(forumSubscriptions)
      .where(and(
        eq(forumSubscriptions.topicId, Number(topicId)),
        eq(forumSubscriptions.userId, userId)
      ));
    
    if (existingSubscription) {
      // Удаляем подписку
      await db.delete(forumSubscriptions).where(eq(forumSubscriptions.id, existingSubscription.id));
      res.json({ message: 'Подписка удалена' });
    } else {
      // Добавляем подписку
      await db.insert(forumSubscriptions).values({
        topicId: Number(topicId),
        userId
      });
      res.json({ message: 'Подписка добавлена' });
    }
  } catch (error) {
    console.error('Ошибка работы с подписками:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Поиск по форуму
router.get('/search', async (req, res) => {
  try {
    const { q, categoryId, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    if (!q) {
      return res.status(400).json({ error: 'Необходимо указать поисковый запрос' });
    }
    
    let whereConditions = [
      or(
        like(forumTopics.title, `%${q}%`),
        like(forumTopics.content, `%${q}%`)
      )
    ];
    
    if (categoryId) {
      whereConditions.push(eq(forumTopics.categoryId, Number(categoryId)));
    }
    
    const topics = await db
      .select({
        id: forumTopics.id,
        title: forumTopics.title,
        content: forumTopics.content,
        viewsCount: forumTopics.viewsCount,
        repliesCount: forumTopics.repliesCount,
        createdAt: forumTopics.createdAt,
        authorId: forumTopics.authorId,
        authorUsername: users.username,
        categoryId: forumTopics.categoryId,
        categoryName: forumCategories.name
      })
      .from(forumTopics)
      .leftJoin(users, eq(forumTopics.authorId, users.id))
      .leftJoin(forumCategories, eq(forumTopics.categoryId, forumCategories.id))
      .where(and(...whereConditions))
      .orderBy(desc(forumTopics.createdAt))
      .limit(Number(limit))
      .offset(offset);
    
    // Получаем общее количество результатов
    const [{ count: totalResults }] = await db
      .select({ count: count() })
      .from(forumTopics)
      .where(and(...whereConditions));
    
    res.json({
      topics,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalResults,
        pages: Math.ceil(totalResults / Number(limit))
      }
    });
  } catch (error) {
    console.error('Ошибка поиска по форуму:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получение последних активных тем
router.get('/recent', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const topics = await db
      .select({
        id: forumTopics.id,
        title: forumTopics.title,
        viewsCount: forumTopics.viewsCount,
        repliesCount: forumTopics.repliesCount,
        lastPostAt: forumTopics.lastPostAt,
        createdAt: forumTopics.createdAt,
        authorId: forumTopics.authorId,
        authorUsername: users.username,
        categoryId: forumTopics.categoryId,
        categoryName: forumCategories.name
      })
      .from(forumTopics)
      .leftJoin(users, eq(forumTopics.authorId, users.id))
      .leftJoin(forumCategories, eq(forumTopics.categoryId, forumCategories.id))
      .orderBy(desc(forumTopics.lastPostAt))
      .limit(Number(limit));
    
    res.json(topics);
  } catch (error) {
    console.error('Ошибка получения последних тем:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

export default router; 