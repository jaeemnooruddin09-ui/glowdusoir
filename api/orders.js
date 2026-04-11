const { readDb, writeDb, todayParts, OWNER_EMAIL } = require('./_db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const db = readDb();
  const data = req.body;

  if (!data.customer || !Array.isArray(data.items) || !data.items.length) {
    return res.status(400).json({ error: 'Missing order details' });
  }

  const { day, month, year } = todayParts();
  const order = {
    id: 'GDS-' + Date.now(),
    createdAt: new Date().toISOString(),
    status: data.payment?.status === 'Paid' ? 'Paid - bKash manual verification needed' : 'Unpaid - Cash on Delivery',
    ...data
  };

  db.orders.unshift(order);

  const total = Number(data.total) || 0;
  db.sales.total += total;
  db.sales.byDay[day] = (db.sales.byDay[day] || 0) + total;
  db.sales.byMonth[month] = (db.sales.byMonth[month] || 0) + total;
  db.sales.byYear[year] = (db.sales.byYear[year] || 0) + total;

  // Email notification (will work if SMTP env vars are set on Vercel)
  const paymentStatus = order.payment?.status || 'Unpaid';
  const lines = order.items.map(i => `- ${i.name} × ${i.qty} = ${i.lineTotal}tk`).join('\n');
  const text = `New Glow du Soir order\n\nOrder ID: ${order.id}\nPayment status: ${paymentStatus}\nPayment method: ${order.payment?.method || ''}\nbKash number: ${order.payment?.bkashNumber || 'N/A'}\nTransaction ID: ${order.payment?.trxId || 'N/A'}\n\nCustomer:\n${order.customer.fullName}\n${order.customer.mobile}\n${order.customer.address}\n${order.customer.area}, ${order.customer.thana}\n${order.customer.district} ${order.customer.postalCode}\n\nItems:\n${lines}\n\nSubtotal: ${order.subtotal}tk\nDelivery: ${order.delivery}tk\nTotal: ${order.total}tk`;

  const notification = {
    id: 'EMAIL-' + Date.now(),
    to: OWNER_EMAIL,
    subject: `New order ${order.id} — ${paymentStatus}`,
    text,
    createdAt: new Date().toISOString(),
    status: 'smtp_not_configured'
  };

  try {
    const hasSmtp = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
    if (hasSmtp) {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      });
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: OWNER_EMAIL,
        subject: notification.subject,
        text
      });
      notification.status = 'sent';
    }
  } catch (emailErr) {
    notification.status = 'email_error';
  }

  order.emailNotificationStatus = notification.status;
  db.notifications.unshift(notification);
  writeDb(db);

  res.json({ ok: true, order });
};
