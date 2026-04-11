const { readDb, authed } = require('../_db');

module.exports = (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!authed(req)) return res.status(401).json({ error: 'Unauthorized' });
  const db = readDb();
  res.json({ products: db.products, orders: db.orders, notifications: db.notifications, visits: db.visits, sales: db.sales });
};
