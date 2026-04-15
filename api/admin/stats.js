const { sql, ensureDb, authed } = require('../_db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!authed(req)) return res.status(401).json({ error: 'Unauthorized' });
  await ensureDb();

  const products = await sql`SELECT * FROM products ORDER BY id`;
  const orders = await sql`SELECT * FROM orders ORDER BY created_at DESC`;
  const notifications = await sql`SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50`;

  // Build visits stats
  const totalVisits = await sql`SELECT COUNT(*) as cnt FROM visits`;
  const visitsByDay = await sql`SELECT day, COUNT(*) as cnt FROM visits GROUP BY day ORDER BY day DESC LIMIT 30`;
  const visitsByMonth = await sql`SELECT month, COUNT(*) as cnt FROM visits GROUP BY month ORDER BY month DESC LIMIT 12`;
  const visitsByYear = await sql`SELECT year, COUNT(*) as cnt FROM visits GROUP BY year ORDER BY year DESC`;

  const visits = {
    total: Number(totalVisits[0].cnt),
    byDay: Object.fromEntries(visitsByDay.map(r => [r.day, Number(r.cnt)])),
    byMonth: Object.fromEntries(visitsByMonth.map(r => [r.month, Number(r.cnt)])),
    byYear: Object.fromEntries(visitsByYear.map(r => [r.year, Number(r.cnt)]))
  };

  // Build sales stats
  const totalSales = await sql`SELECT COALESCE(SUM(total), 0) as total FROM orders`;
  const salesByDay = await sql`SELECT TO_CHAR(created_at, 'YYYY-MM-DD') as day, SUM(total) as total FROM orders GROUP BY day ORDER BY day DESC LIMIT 30`;
  const salesByMonth = await sql`SELECT TO_CHAR(created_at, 'YYYY-MM') as month, SUM(total) as total FROM orders GROUP BY month ORDER BY month DESC LIMIT 12`;
  const salesByYear = await sql`SELECT TO_CHAR(created_at, 'YYYY') as year, SUM(total) as total FROM orders GROUP BY year ORDER BY year DESC`;

  const sales = {
    total: Number(totalSales[0].total),
    byDay: Object.fromEntries(salesByDay.map(r => [r.day, Number(r.total)])),
    byMonth: Object.fromEntries(salesByMonth.map(r => [r.month, Number(r.total)])),
    byYear: Object.fromEntries(salesByYear.map(r => [r.year, Number(r.total)]))
  };

  // Format orders for frontend compatibility
  const formattedOrders = orders.map(o => ({
    id: o.id,
    createdAt: o.created_at,
    status: o.status,
    customer: o.customer,
    items: o.items,
    subtotal: Number(o.subtotal),
    delivery: Number(o.delivery),
    total: Number(o.total),
    payment: o.payment,
    emailNotificationStatus: o.email_status
  }));

  const formattedNotifs = notifications.map(n => ({
    id: n.id,
    to: n.to_email,
    subject: n.subject,
    text: n.body,
    createdAt: n.created_at,
    status: n.status
  }));

  res.json({ products, orders: formattedOrders, notifications: formattedNotifs, visits, sales });
};
