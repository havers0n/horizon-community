import { Router } from "express";
import { z } from "zod";

const router = Router();

// Discord OAuth2 конфигурация
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || 'http://localhost:5000/api/discord/callback';
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;

// Схемы валидации
const discordAuthSchema = z.object({
  code: z.string(),
});

const webhookSchema = z.object({
  type: z.enum(['application', 'achievement', 'badge', 'notification']),
  userId: z.number(),
  username: z.string(),
  data: z.record(z.any()),
});

// Discord OAuth2 авторизация
router.get('/auth', (req, res) => {
  const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=identify%20guilds.join`;
  
  res.json({ authUrl });
});

// Callback для Discord OAuth2 (упрощенная версия)
router.post('/callback', async (req, res) => {
  try {
    const { code } = discordAuthSchema.parse(req.body);
    
    // Обмениваем код на токен
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID!,
        client_secret: DISCORD_CLIENT_SECRET!,
        grant_type: 'authorization_code',
        code,
        redirect_uri: DISCORD_REDIRECT_URI,
      }),
    });
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      return res.status(400).json({ error: 'Failed to exchange code for token' });
    }
    
    // Получаем информацию о пользователе
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });
    
    const userData = await userResponse.json();
    
    if (!userResponse.ok) {
      return res.status(400).json({ error: 'Failed to get user data' });
    }
    
    res.json({ 
      success: true, 
      discordId: userData.id,
      username: userData.username,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token
    });
    
  } catch (error) {
    console.error('Discord callback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Отправка уведомлений в Discord
router.post('/webhook', async (req, res) => {
  try {
    const { type, userId, username, data } = webhookSchema.parse(req.body);
    
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      return res.status(500).json({ error: 'Discord webhook not configured' });
    }
    
    let embed: any = {
      color: 0x5865F2,
      timestamp: new Date().toISOString(),
      footer: {
        text: 'Horizon Community',
        icon_url: 'https://your-logo-url.com/logo.png',
      },
    };
    
    // Настраиваем embed в зависимости от типа уведомления
    switch (type) {
      case 'application':
        embed.title = '🎯 Новая заявка';
        embed.description = `Пользователь ${username} подал заявку на вступление`;
        embed.fields = [
          { name: 'Тип заявки', value: data.type, inline: true },
          { name: 'Статус', value: data.status, inline: true },
        ];
        break;
        
      case 'achievement':
        embed.title = '🏆 Достижение разблокировано!';
        embed.description = `Поздравляем ${username} с получением достижения!`;
        embed.fields = [
          { name: 'Достижение', value: data.name, inline: true },
          { name: 'Очки', value: data.points.toString(), inline: true },
        ];
        embed.color = 0xFFD700;
        break;
        
      case 'badge':
        embed.title = '🏅 Новый бейдж!';
        embed.description = `${username} получил новый бейдж!`;
        embed.fields = [
          { name: 'Бейдж', value: data.name, inline: true },
          { name: 'Редкость', value: data.rarity, inline: true },
        ];
        embed.color = 0x9B59B6;
        break;
        
      case 'notification':
        embed.title = '📢 Уведомление';
        embed.description = data.message;
        embed.color = 0x3498DB;
        break;
    }
    
    // Отправляем webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embeds: [embed],
      }),
    });
    
    if (!response.ok) {
      console.error('Discord webhook error:', await response.text());
      return res.status(500).json({ error: 'Failed to send Discord notification' });
    }
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получение информации о Discord сервере
router.get('/guild-info', async (req, res) => {
  try {
    const botToken = process.env.DISCORD_BOT_TOKEN;
    if (!botToken || !DISCORD_GUILD_ID) {
      return res.status(500).json({ error: 'Discord bot not configured' });
    }

    const response = await fetch(`https://discord.com/api/guilds/${DISCORD_GUILD_ID}`, {
      headers: {
        Authorization: `Bot ${botToken}`,
      },
    });
    
    if (!response.ok) {
      return res.status(500).json({ error: 'Failed to get guild info' });
    }
    
    const guildData = await response.json();
    
    res.json({
      id: guildData.id,
      name: guildData.name,
      memberCount: guildData.approximate_member_count,
      onlineCount: guildData.approximate_presence_count,
      icon: guildData.icon ? `https://cdn.discordapp.com/icons/${guildData.id}/${guildData.icon}.png` : null,
    });
    
  } catch (error) {
    console.error('Guild info error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 