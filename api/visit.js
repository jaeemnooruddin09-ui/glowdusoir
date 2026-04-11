const { readDb, writeDb, todayParts } = require('./_db');

module.exports = (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const db = readDb();
  const { day, month, year } = todayParts();
  db.visits.total++;
  db.visits.byDay[day] = (db.visits.byDay[day] || 0) + 1;
  db.visits.byMonth[month] = (db.visits.byMonth[month] || 0) + 1;
  db.visits.byYear[year] = (db.visits.byYear[year] || 0) + 1;
  writeDb(db);
  res.json({ ok: true });
};
