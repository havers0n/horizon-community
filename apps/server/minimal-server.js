const express = require('express');
const app = express();

app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Minimal server is running'
  });
});

// Simple realtime endpoints
const eventCache = new Map();

app.post('/api/realtime/broadcast', (req, res) => {
  try {
    const { type, data, channels = ['all'] } = req.body;
    
    if (!type) {
      return res.status(400).json({
        success: false,
        error: 'Event type is required'
      });
    }
    
    const event = {
      id: Date.now().toString(),
      type,
      data,
      timestamp: Date.now(),
      channels
    };
    
    channels.forEach(channel => {
      if (!eventCache.has(channel)) {
        eventCache.set(channel, []);
      }
      eventCache.get(channel).push(event);
    });
    
    console.log(`📡 Event broadcasted: ${type} to channels: ${channels.join(', ')}`);
    
    res.json({
      success: true,
      message: 'Event broadcasted successfully',
      event: { type, data, channels },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error broadcasting event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to broadcast event'
    });
  }
});

app.get('/api/realtime/events', (req, res) => {
  try {
    const channels = req.query.channels || 'all';
    const since = req.query.since ? parseInt(req.query.since) : undefined;
    
    const channelList = channels.split(',').map(ch => ch.trim());
    
    const allEvents = [];
    const cutoffTime = since || (Date.now() - 5 * 60 * 1000);
    
    channelList.forEach(channel => {
      const channelEvents = eventCache.get(channel) || [];
      const filteredEvents = channelEvents.filter(event => 
        event.timestamp > cutoffTime
      );
      allEvents.push(...filteredEvents);
    });
    
    const uniqueEvents = allEvents.filter((event, index, self) => 
      index === self.findIndex(e => e.id === event.id)
    );
    
    res.json({
      success: true,
      events: uniqueEvents,
      timestamp: Date.now(),
      count: uniqueEvents.length
    });
  } catch (error) {
    console.error('Error getting realtime events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get realtime events'
    });
  }
});

app.get('/api/realtime/stats', (req, res) => {
  try {
    const stats = {};
    let totalEvents = 0;
    
    for (const [channel, events] of eventCache.entries()) {
      stats[channel] = events.length;
      totalEvents += events.length;
    }
    
    res.json({
      success: true,
      cache: {
        channels: stats,
        totalEvents,
        maxCacheSize: 1000,
        cacheTimeout: 5 * 60 * 1000
      },
      websocket: {
        connectedClients: 0,
        totalEvents: 0
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error getting realtime stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get realtime stats'
    });
  }
});

const port = process.env.PORT || 5000;
const host = '127.0.0.1';

app.listen(port, host, () => {
  console.log(`🚀 Minimal server running on ${host}:${port}`);
  console.log(`📡 Health check: http://${host}:${port}/api/health`);
  console.log(`📡 Realtime endpoints: http://${host}:${port}/api/realtime/*`);
});