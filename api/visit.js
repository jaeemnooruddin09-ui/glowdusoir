const { sql, ensureDb, todayParts } = require('./_db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  await ensureDb();
  const { day, month, year } = todayParts();
  await sql`INSERT INTO visits (day, month, year) VALUES (${day}, ${month}, ${year})`;
  res.json({ ok: true });
};
