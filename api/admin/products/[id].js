const { readDb, writeDb, authed } = require('../../_db');

module.exports = (req, res) => {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });
  if (!authed(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query;
  const db = readDb();
  const product = db.products.find(p => p.id === id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const data = req.body || {};
  ['name', 'brand', 'category', 'price', 'stock'].forEach(k => {
    if (data[k] !== undefined) product[k] = data[k];
  });

  writeDb(db);
  res.json({ ok: true, product });
};
