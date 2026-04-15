const { neon } = require('@neondatabase/serverless');
const crypto = require('crypto');

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL);

const ADMIN_USER = '/owner.access';
const ADMIN_PASS = '652712';
const ADMIN_TOKEN = crypto.createHash('sha256').update(ADMIN_USER + ':' + ADMIN_PASS).digest('hex');
const OWNER_EMAIL = process.env.OWNER_EMAIL || 'glowdusoir@gmail.com';

const defaultProducts = [
  {id:'p1', name:'AXIS-Y Complete No-Stress Physical Sunscreen', brand:'AXIS-Y', category:'Skincare', price:'750tk', stock:50},
  {id:'p2', name:'Bioré UV Aqua Rich Watery Essence', brand:'Bioré', category:'Skincare', price:'600tk', stock:50},
  {id:'p3', name:'COSRX Hydrium Watery Toner', brand:'COSRX', category:'Skincare', price:'2150tk', stock:50},
  {id:'p4', name:'Wardāh Brightening & Hydrating Toner', brand:'Wardāh', category:'Skincare', price:'877tk', stock:50},
  {id:'p5', name:'OXY Acne Control Toner 150ml', brand:'OXY', category:'Skincare', price:'950tk', stock:50},
  {id:'p6', name:'Sunplay Sport Sunscreen SPF50+', brand:'Sunplay', category:'Skincare', price:'925tk', stock:50},
  {id:'p7', name:'AXIS-Y Daily Purifying Treatment Toner', brand:'AXIS-Y', category:'Skincare', price:'280tk', stock:50},
  {id:'p8', name:'COSRX Aloe Soothing Sun Cream', brand:'COSRX', category:'Skincare', price:'1350tk', stock:50},
  {id:'p9', name:'COSRX AHA/BHA Clarifying Toner', brand:'COSRX', category:'Skincare', price:'1200tk', stock:50},
  {id:'p10', name:'Some By Mi AHA.BHA.PHA Miracle Toner', brand:'Some By Mi', category:'Skincare', price:'1700tk', stock:50}
];

async function initDb() {
  await sql`CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    brand TEXT,
    category TEXT,
    price TEXT,
    stock INTEGER DEFAULT 0
  )`;

  await sql`CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT,
    customer JSONB,
    items JSONB,
    subtotal NUMERIC,
    delivery NUMERIC,
    total NUMERIC,
    payment JSONB,
    email_status TEXT
  )`;

  await sql`CREATE TABLE IF NOT EXISTS visits (
    id SERIAL PRIMARY KEY,
    visited_at TIMESTAMPTZ DEFAULT NOW(),
    day TEXT,
    month TEXT,
    year TEXT
  )`;

  await sql`CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    to_email TEXT,
    subject TEXT,
    body TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT
  )`;

  // Seed products if table is empty
  const existing = await sql`SELECT COUNT(*) as cnt FROM products`;
  if (Number(existing[0].cnt) === 0) {
    for (const p of defaultProducts) {
      await sql`INSERT INTO products (id, name, brand, category, price, stock) VALUES (${p.id}, ${p.name}, ${p.brand}, ${p.category}, ${p.price}, ${p.stock})`;
    }
  }
}

let dbReady = null;
function ensureDb() {
  if (!dbReady) dbReady = initDb();
  return dbReady;
}

function todayParts() {
  const d = new Date();
  const day = d.toISOString().slice(0, 10);
  const month = day.slice(0, 7);
  const year = day.slice(0, 4);
  return { day, month, year };
}

function authed(req) {
  return req.headers['x-admin-token'] === ADMIN_TOKEN;
}

module.exports = { sql, ensureDb, todayParts, authed, ADMIN_USER, ADMIN_PASS, ADMIN_TOKEN, OWNER_EMAIL, defaultProducts };
