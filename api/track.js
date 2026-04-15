const { sql, ensureDb } = require('./_db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  await ensureDb();

  const { phone } = req.body || {};
  if (!phone || phone.length < 6) {
    return res.status(400).json({ error: 'Please enter a valid phone number' });
  }

  const clean = phone.replace(/[^0-9]/g, '');
  const orders = await sql`SELECT * FROM orders WHERE customer->>'mobile' LIKE ${'%' + clean + '%'} ORDER BY created_at DESC`;

  const formatted = orders.map(o => ({
    id: o.id,
    date: o.created_at,
    status: o.status,
    items: o.items,
    total: Number(o.total),
    delivery: Number(o.delivery),
    payment: o.payment
  }));

  res.json({ orders: formatted });
};
