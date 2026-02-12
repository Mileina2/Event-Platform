const fs = require('fs');
const path = require('path');

function createAuditService({ dataDir }) {
  const file = path.join(dataDir || path.join(__dirname, '../../data'), 'audit.log');
  // Ensure file exists
  try { fs.appendFileSync(file, ''); } catch (e) { fs.writeFileSync(file, ''); }

  function log(entry) {
    const line = JSON.stringify(Object.assign({ timestamp: new Date().toISOString() }, entry));
    try { fs.appendFileSync(file, line + '\n'); } catch (e) { console.error('Failed to write audit log', e); }
  }

  function logForbidden({ req, userId, reason }) {
    try {
      log({ level: 'FORBIDDEN', path: req.originalUrl, method: req.method, userId: userId || req.header('X-User-Id') || 'unknown', ip: req.ip, reason });
    } catch (e) { console.error('Audit logging failed', e); }
  }

  return { log, logForbidden };
}

module.exports = { createAuditService };
