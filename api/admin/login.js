const { ADMIN_USER, ADMIN_PASS, ADMIN_TOKEN } = require('../_db');

module.exports = (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { username, password } = req.body || {};
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return res.json({ ok: true, token: ADMIN_TOKEN });
  }
  res.status(401).json({ error: 'Invalid login' });
};
