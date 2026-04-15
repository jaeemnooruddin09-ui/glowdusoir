const { sql, ensureDb } = require('./_db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  await ensureDb();
  const products = await sql`SELECT * FROM products ORDER BY id`;
  res.json({ products });
};
