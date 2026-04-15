const { sql, ensureDb, authed } = require('../../_db');

module.exports = async (req, res) => {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });
  if (!authed(req)) return res.status(401).json({ error: 'Unauthorized' });
  await ensureDb();

  const { id } = req.query;
  const data = req.body || {};

  const existing = await sql`SELECT * FROM products WHERE id = ${id}`;
  if (!existing.length) return res.status(404).json({ error: 'Product not found' });

  const product = existing[0];
  const name = data.name !== undefined ? data.name : product.name;
  const brand = data.brand !== undefined ? data.brand : product.brand;
  const category = data.category !== undefined ? data.category : product.category;
  const price = data.price !== undefined ? data.price : product.price;
  const stock = data.stock !== undefined ? data.stock : product.stock;

  await sql`UPDATE products SET name=${name}, brand=${brand}, category=${category}, price=${price}, stock=${stock} WHERE id=${id}`;

  const updated = await sql`SELECT * FROM products WHERE id = ${id}`;
  res.json({ ok: true, product: updated[0] });
};
