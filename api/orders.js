const { sql, ensureDb, todayParts, OWNER_EMAIL } = require('./_db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  await ensureDb();

  const data = req.body;
  if (!data.customer || !Array.isArray(data.items) || !data.items.length) {
    return res.status(400).json({ error: 'Missing order details' });
  }

  const orderId = 'GDS-' + Date.now();
  const status = data.payment?.status === 'Paid' ? 'Paid - bKash manual verification needed' : 'Unpaid - Cash on Delivery';
  const total = Number(data.total) || 0;
  const subtotal = Number(data.subtotal) || 0;
  const delivery = Number(data.delivery) || 0;

  await sql`INSERT INTO orders (id, status, customer, items, subtotal, delivery, total, payment, email_status)
    VALUES (${orderId}, ${status}, ${JSON.stringify(data.customer)}, ${JSON.stringify(data.items)}, ${subtotal}, ${delivery}, ${total}, ${JSON.stringify(data.payment || {})}, 'pending')`;

  // Email notification
  const paymentStatus = data.payment?.status || 'Unpaid';
  const lines = data.items.map(i => `- ${i.name} × ${i.qty} = ${i.lineTotal}tk`).join('\n');
  const text = `New Glow du Soir order\n\nOrder ID: ${orderId}\nPayment status: ${paymentStatus}\nPayment method: ${data.payment?.method || ''}\nbKash number: ${data.payment?.bkashNumber || 'N/A'}\nTransaction ID: ${data.payment?.trxId || 'N/A'}\n\nCustomer:\n${data.customer.fullName}\n${data.customer.mobile}\n${data.customer.address}\n${data.customer.area}, ${data.customer.thana}\n${data.customer.district} ${data.customer.postalCode}\n\nItems:\n${lines}\n\nSubtotal: ${subtotal}tk\nDelivery: ${delivery}tk\nTotal: ${total}tk`;

  const notifId = 'EMAIL-' + Date.now();
  let emailStatus = 'smtp_not_configured';

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
        subject: `New order ${orderId} — ${paymentStatus}`,
        text
      });
      emailStatus = 'sent';
    }
  } catch (emailErr) {
    emailStatus = 'email_error';
  }

  await sql`UPDATE orders SET email_status = ${emailStatus} WHERE id = ${orderId}`;
  await sql`INSERT INTO notifications (id, to_email, subject, body, status) VALUES (${notifId}, ${OWNER_EMAIL}, ${`New order ${orderId} — ${paymentStatus}`}, ${text}, ${emailStatus})`;

  const order = { id: orderId, createdAt: new Date().toISOString(), status, customer: data.customer, items: data.items, subtotal, delivery, total, payment: data.payment, emailNotificationStatus: emailStatus };
  res.json({ ok: true, order });
};
