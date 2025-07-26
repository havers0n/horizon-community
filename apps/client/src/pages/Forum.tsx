import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Users, Eye, Clock, Pin, Lock, User, Search, Home, Shield, Car, Phone, Truck, Heart, BookOpen, Settings, Bell, Plus, Edit, Trash, ThumbsUp, ThumbsDown, Heart as HeartIcon, Reply, Quote, MoreHorizontal } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Layout } from '../components/Layout';

interface ForumCategory {
  id: number;
  name: string;
  description: string;
  departmentId: number | null;
  icon: string;
  color: string;
  orderIndex: number;
  isActive: boolean;
  topicsCount: number;
  postsCount: number;
  lastActivity: string | null;
  departmentName: string | null;
}

interface ForumTopic {
  id: number;
  title: string;
  content: string;
  status: string;
  isPinned: boolean;
  isLocked: boolean;
  viewsCount: number;
  repliesCount: number;
  lastPostAt: string | null;
  tags: string[];
  createdAt: string;
  authorId: number;
  authorUsername: string;
  lastPostAuthorId: number | null;
  lastPostAuthorUsername: string | null;
  categoryId: number;
  categoryName: string;
}

interface ForumPost {
  id: number;
  content: string;
  isEdited: boolean;
  editedAt: string | null;
  reactionsCount: number;
  createdAt: string;
  authorId: number;
  authorUsername: string;
  parentId: number | null;
}

interface ForumStats {
  totalTopics: number;
  totalPosts: number;
  totalMembers: number;
  onlineNow: number;
}

const Forum: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'main' | 'category' | 'topic'>('main');
  const [selectedCategory, setSelectedCategory] = useState<ForumCategory | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'replies'>('latest');
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // API функции
  const fetchStats = async (): Promise<ForumStats> => {
    const response = await fetch('/api/forum/stats');
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  };

  const fetchCategories = async (): Promise<ForumCategory[]> => {
    const response = await fetch('/api/forum/categories');
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  };

  const fetchTopics = async (categoryId: number): Promise<{ topics: ForumTopic[]; pagination: any }> => {
    const response = await fetch(`/api/forum/categories/${categoryId}/topics?page=${currentPage}&limit=20&sort=${sortBy}`);
    if (!response.ok) throw new Error('Failed to fetch topics');
    return response.json();
  };

  const fetchTopic = async (topicId: number): Promise<{ topic: ForumTopic; posts: ForumPost[]; pagination: any }> => {
    const response = await fetch(`/api/forum/topics/${topicId}?page=${currentPage}&limit=20`);
    if (!response.ok) throw new Error('Failed to fetch topic');
    return response.json();
  };

  const createTopic = async (data: { categoryId: number; title: string; content: string; tags: string[] }) => {
    const response = await fetch('/api/forum/topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create topic');
    return response.json();
  };

  const createPost = async (data: { topicId: number; content: string; parentId?: number }) => {
    const response = await fetch(`/api/forum/topics/${data.topicId}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create post');
    return response.json();
  };

  // Queries
  const { data: stats } = useQuery({ queryKey: ['forum-stats'], queryFn: fetchStats });
  const { data: categories } = useQuery({ queryKey: ['forum-categories'], queryFn: fetchCategories });
  
  const { data: topicsData, refetch: refetchTopics } = useQuery({
    queryKey: ['forum-topics', selectedCategory?.id, currentPage, sortBy],
    queryFn: () => selectedCategory ? fetchTopics(selectedCategory.id) : null,
    enabled: !!selectedCategory
  });

  const { data: topicData, refetch: refetchTopic } = useQuery({
    queryKey: ['forum-topic', selectedTopic?.id, currentPage],
    queryFn: () => selectedTopic ? fetchTopic(selectedTopic.id) : null,
    enabled: !!selectedTopic
  });

  // Mutations
  const createTopicMutation = useMutation({
    mutationFn: createTopic,
    onSuccess: () => {
      toast({ title: 'Тема создана', description: 'Тема успешно создана' });
      refetchTopics();
      setActiveSection('category');
    },
    onError: (error) => {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    }
  });

  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      toast({ title: 'Сообщение отправлено', description: 'Сообщение успешно добавлено' });
      refetchTopic();
    },
    onError: (error) => {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    }
  });

  // Handlers
  const handleCategoryClick = (category: ForumCategory) => {
    setSelectedCategory(category);
    setActiveSection('category');
    setCurrentPage(1);
  };

  const handleTopicClick = (topic: ForumTopic) => {
    setSelectedTopic(topic);
    setActiveSection('topic');
    setCurrentPage(1);
  };

  const handleBackToMain = () => {
    setActiveSection('main');
    setSelectedCategory(null);
    setSelectedTopic(null);
  };

  const handleBackToCategory = () => {
    setActiveSection('category');
    setSelectedTopic(null);
  };

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, React.ComponentType<any>> = {
      shield: Shield,
      users: Users,
      phone: Phone,
      truck: Truck,
      heart: Heart,
      'book-open': BookOpen
    };
    return icons[iconName] || BookOpen;
  };

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: ru });
  };

  const MainForum = () => (
    <div className="space-y-6">
      {/* Статистика */}
      {stats && (
        <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">Добро пожаловать на форум игрового сообщества!</h2>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.totalTopics}</div>
                <div className="text-sm opacity-80">Тем</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.totalPosts}</div>
                <div className="text-sm opacity-80">Сообщений</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.totalMembers}</div>
                <div className="text-sm opacity-80">Участников</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-200">{stats.onlineNow}</div>
                <div className="text-sm opacity-80">Онлайн</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Категории */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-foreground mb-4">Департаменты</h3>
        {categories?.map(category => {
          const IconComponent = getIconComponent(category.icon);
          return (
            <Card key={category.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleCategoryClick(category)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`${category.color} p-3 rounded-lg text-white`}>
                      <IconComponent size={24} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{category.name}</h4>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div>{category.topicsCount} тем</div>
                    <div>{category.postsCount} сообщений</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const CategoryView = () => {
    const [showCreateTopic, setShowCreateTopic] = useState(false);
    const [newTopicTitle, setNewTopicTitle] = useState('');
    const [newTopicContent, setNewTopicContent] = useState('');
    const [newTopicTags, setNewTopicTags] = useState<string[]>([]);

    const handleCreateTopic = () => {
      if (!selectedCategory || !newTopicTitle || !newTopicContent) return;
      
      createTopicMutation.mutate({
        categoryId: selectedCategory.id,
        title: newTopicTitle,
        content: newTopicContent,
        tags: newTopicTags
      });
      
      setShowCreateTopic(false);
      setNewTopicTitle('');
      setNewTopicContent('');
      setNewTopicTags([]);
    };

    return (
      <div className="space-y-6">
        {/* Заголовок категории */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className={`${selectedCategory?.color} p-4 rounded-lg text-white`}>
                {selectedCategory && React.createElement(getIconComponent(selectedCategory.icon), { size: 32 })}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{selectedCategory?.name}</h2>
                <p className="text-muted-foreground">{selectedCategory?.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Кнопка создания темы */}
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-foreground">Темы</h3>
          {user && (
            <Dialog open={showCreateTopic} onOpenChange={setShowCreateTopic}>
              <DialogTrigger asChild>
                <Button>
                  <Plus size={16} className="mr-2" />
                  Создать тему
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Создать новую тему</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Заголовок</label>
                    <Input
                      value={newTopicTitle}
                      onChange={(e) => setNewTopicTitle(e.target.value)}
                      placeholder="Введите заголовок темы"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Содержание</label>
                    <Textarea
                      value={newTopicContent}
                      onChange={(e) => setNewTopicContent(e.target.value)}
                      placeholder="Введите содержимое темы"
                      rows={6}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowCreateTopic(false)}>
                      Отмена
                    </Button>
                    <Button onClick={handleCreateTopic} disabled={!newTopicTitle || !newTopicContent}>
                      Создать
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Сортировка */}
        <div className="flex justify-between items-center">
          <Select value={sortBy} onValueChange={(value: 'latest' | 'popular' | 'replies') => setSortBy(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">По дате</SelectItem>
              <SelectItem value="popular">По популярности</SelectItem>
              <SelectItem value="replies">По ответам</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Список тем */}
        <div className="space-y-2">
          {topicsData?.topics.map(topic => (
            <Card key={topic.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleTopicClick(topic)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {topic.isPinned && <Pin size={16} className="text-blue-500" />}
                      {topic.isLocked && <Lock size={16} className="text-red-500" />}
                      <h4 className="font-semibold text-foreground hover:text-primary">
                        {topic.title}
                      </h4>
                      {topic.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center space-x-1">
                        <User size={14} />
                        <span>{topic.authorUsername}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MessageCircle size={14} />
                        <span>{topic.repliesCount}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Eye size={14} />
                        <span>{topic.viewsCount}</span>
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock size={14} />
                      <span>{formatDate(topic.lastPostAt || topic.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Пагинация */}
        {topicsData?.pagination && topicsData.pagination.pages > 1 && (
          <div className="flex justify-center space-x-2">
            {Array.from({ length: topicsData.pagination.pages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const TopicView = () => {
    const [newPostContent, setNewPostContent] = useState('');
    const [replyToPost, setReplyToPost] = useState<ForumPost | null>(null);

    const handleCreatePost = () => {
      if (!selectedTopic || !newPostContent) return;
      
      createPostMutation.mutate({
        topicId: selectedTopic.id,
        content: newPostContent,
        parentId: replyToPost?.id
      });
      
      setNewPostContent('');
      setReplyToPost(null);
    };

    if (!topicData) return null;

    return (
      <div className="space-y-6">
        {/* Заголовок темы */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-2">
              {selectedTopic?.isPinned && <Pin size={16} className="text-blue-500" />}
              {selectedTopic?.isLocked && <Lock size={16} className="text-red-500" />}
              <h2 className="text-2xl font-bold text-foreground">{selectedTopic?.title}</h2>
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Автор: {selectedTopic?.authorUsername}</span>
              <span>Создано: {formatDate(selectedTopic?.createdAt || '')}</span>
              <span>Просмотров: {selectedTopic?.viewsCount}</span>
              <span>Ответов: {selectedTopic?.repliesCount}</span>
            </div>
            {selectedTopic?.tags && selectedTopic.tags.length > 0 && (
              <div className="flex space-x-2 mt-2">
                {selectedTopic.tags.map(tag => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Сообщения */}
        <div className="space-y-4">
          {topicData.posts.map(post => (
            <Card key={post.id}>
              <CardContent className="p-4">
                <div className="flex space-x-4">
                  <Avatar>
                    <AvatarFallback>{post.authorUsername.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-foreground">{post.authorUsername}</span>
                        <span className="text-sm text-muted-foreground">{formatDate(post.createdAt)}</span>
                        {post.isEdited && <Badge variant="outline" className="text-xs">Изменено</Badge>}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => setReplyToPost(post)}>
                            <Reply size={14} className="mr-2" />
                            Ответить
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Quote size={14} className="mr-2" />
                            Цитировать
                          </DropdownMenuItem>
                          {user?.id === post.authorId && (
                            <>
                              <DropdownMenuItem>
                                <Edit size={14} className="mr-2" />
                                Редактировать
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash size={14} className="mr-2" />
                                Удалить
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="prose max-w-none text-foreground">
                      {post.content}
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button variant="ghost" size="sm">
                        <ThumbsUp size={14} className="mr-1" />
                        {post.reactionsCount}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Reply size={14} className="mr-1" />
                        Ответить
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Форма ответа */}
        {user && !selectedTopic?.isLocked && (
          <Card>
            <CardContent className="p-4">
              {replyToPost && (
                <div className="mb-4 p-3 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">
                    Ответ на сообщение от {replyToPost.authorUsername}:
                  </div>
                  <div className="text-sm mt-1">{replyToPost.content.substring(0, 100)}...</div>
                  <Button variant="ghost" size="sm" onClick={() => setReplyToPost(null)} className="mt-2">
                    Отменить ответ
                  </Button>
                </div>
              )}
              <div className="space-y-4">
                <Textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Введите ваше сообщение..."
                  rows={4}
                />
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setNewPostContent('')}>
                    Очистить
                  </Button>
                  <Button onClick={handleCreatePost} disabled={!newPostContent}>
                    Отправить
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Пагинация */}
        {topicData.pagination && topicData.pagination.pages > 1 && (
          <div className="flex justify-center space-x-2">
            {Array.from({ length: topicData.pagination.pages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Внутренняя навигация форума */}
        <div className="bg-card shadow-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold text-foreground">Форум сообщества</h1>
                <Button
                  variant="ghost"
                  onClick={handleBackToMain}
                  className={`flex items-center space-x-1 ${
                    activeSection === 'main' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Home size={16} />
                  <span>Главная</span>
                </Button>
                {activeSection !== 'main' && (
                  <Button variant="ghost" onClick={handleBackToCategory} className="text-muted-foreground hover:text-foreground">
                    ← Назад
                  </Button>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Поиск..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 w-64"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Основной контент */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Основной контент */}
            <div className="lg:col-span-3">
              {activeSection === 'main' && <MainForum />}
              {activeSection === 'category' && <CategoryView />}
              {activeSection === 'topic' && <TopicView />}
            </div>

            {/* Боковая панель */}
            <div className="space-y-6">
              {/* Пользователи онлайн */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Онлайн</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-foreground">Комиссар_Джонс</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-foreground">Доктор_Уилсон</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-foreground">Капитан_Рэд</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Быстрые ссылки */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Быстрые ссылки</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start">
                      Правила сервера
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      Подать жалобу
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      Справка для новичков
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      Команда проекта
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Последние обновления */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Последние обновления</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="border-l-3 border-primary pl-3">
                      <div className="font-medium text-foreground">Обновление 2.1.5</div>
                      <div className="text-muted-foreground">Исправления багов</div>
                      <div className="text-xs text-muted-foreground">2 дня назад</div>
                    </div>
                    <div className="border-l-3 border-green-500 pl-3">
                      <div className="font-medium text-foreground">Новые правила ПД</div>
                      <div className="text-muted-foreground">Обновлены протоколы</div>
                      <div className="text-xs text-muted-foreground">5 дней назад</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Forum; 