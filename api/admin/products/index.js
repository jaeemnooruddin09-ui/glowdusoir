const { sql, ensureDb, authed } = require('../../_db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!authed(req)) return res.status(401).json({ error: 'Unauthorized' });
  await ensureDb();

  const data = req.body || {};
  if (!data.name || !data.price) {
    return res.status(400).json({ error: 'Product name and price are required' });
  }

  const id = 'p' + Date.now();
  const name = data.name;
  const brand = data.brand || '';
  const category = data.category || 'Skincare';
  const price = data.price;
  const stock = Number(data.stock) || 0;

  await sql`INSERT INTO products (id, name, brand, category, price, stock) VALUES (${id}, ${name}, ${brand}, ${category}, ${price}, ${stock})`;

  const created = await sql`SELECT * FROM products WHERE id = ${id}`;
  res.json({ ok: true, product: created[0] });
};
