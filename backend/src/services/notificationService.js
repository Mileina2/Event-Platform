const { Writable } = require('stream');

function createNotificationService() {
  // Map userId -> Set of response objects (SSE connections)
  const clients = new Map();

  function subscribe(req, res) {
    const userId = req.header('X-User-Id') || req.query.userId;
    if (!userId) return res.status(400).json({ error: 'Missing X-User-Id or userId query' });

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    });
    res.write('\n');

    const set = clients.get(userId) || new Set();
    set.add(res);
    clients.set(userId, set);

    req.on('close', () => {
      const s = clients.get(userId);
      if (s) {
        s.delete(res);
        if (s.size === 0) clients.delete(userId);
      }
    });
  }

  function notifyUser(userId, payload) {
    const set = clients.get(String(userId));
    const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
    if (!set || set.size === 0) return false;
    for (const res of set) {
      try {
        res.write(`data: ${data}\n\n`);
      } catch (e) {
        // ignore broken clients
      }
    }
    return true;
  }

  function broadcast(payload) {
    const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
    for (const [userId, set] of clients.entries()) {
      for (const res of set) {
        try { res.write(`data: ${data}\n\n`); } catch(e){}
      }
    }
  }

  return { subscribe, notifyUser, broadcast };
}

module.exports = { createNotificationService };
/**
 * Notification service placeholder - console logging and in-memory queue
 */

const pending = [];

function createNotificationService() {
  return {
    notifyUser(userId, message) {
      // placeholder: push to in-memory queue and console.log
      pending.push({ userId, message, at: new Date().toISOString() });
      console.log(`Notify user ${userId}: ${message}`);
    },

    drain() {
      const copy = pending.splice(0);
      return copy;
    }
  };
}

module.exports = { createNotificationService };
