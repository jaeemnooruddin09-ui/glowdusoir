const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DB_PATH = path.join('/tmp', 'database.json');
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

function freshDb() {
  return {
    products: defaultProducts,
    orders: [],
    notifications: [],
    visits: { total: 0, byDay: {}, byMonth: {}, byYear: {} },
    sales: { total: 0, byDay: {}, byMonth: {}, byYear: {} }
  };
}

function readDb() {
  if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify(freshDb(), null, 2));
  const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  db.products ||= defaultProducts;
  db.orders ||= [];
  db.notifications ||= [];
  db.visits ||= { total: 0, byDay: {}, byMonth: {}, byYear: {} };
  db.sales ||= { total: 0, byDay: {}, byMonth: {}, byYear: {} };
  return db;
}

function writeDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
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

module.exports = { readDb, writeDb, freshDb, todayParts, authed, ADMIN_USER, ADMIN_PASS, ADMIN_TOKEN, OWNER_EMAIL, defaultProducts };
