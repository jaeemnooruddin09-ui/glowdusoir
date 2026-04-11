const { readDb } = require('./_db');

module.exports = (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const db = readDb();
  res.json({ products: db.products });
};
