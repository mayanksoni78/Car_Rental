/**
 * test_email.js — Standalone Nodemailer SMTP diagnostic
 * Usage: node server/test_email.js
 *
 * Tests:
 *  1. .env loading
 *  2. EMAIL_USER / EMAIL_PASS present
 *  3. SMTP connection (transporter.verify)
 *  4. Send test email to EMAIL_USER itself
 *
 * DEVELOPMENT ONLY — do not expose this as a public HTTP endpoint.
 */

import 'dotenv/config';
import nodemailer from 'nodemailer';

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS
  ? process.env.EMAIL_PASS.replace(/\s+/g, '')  // strip spaces from App Password
  : undefined;

console.log('\n=== Car Rental — Email Configuration Diagnostic ===\n');
console.log('EMAIL_USER configured:', Boolean(EMAIL_USER));
console.log('EMAIL_PASS configured:', Boolean(EMAIL_PASS));

if (!EMAIL_USER || !EMAIL_PASS) {
  console.error('\n❌ FAIL: EMAIL_USER or EMAIL_PASS is missing from server/.env');
  console.error('   Add the missing values and re-run this script.\n');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: { user: EMAIL_USER, pass: EMAIL_PASS },
});

console.log('\n=== SMTP Connection Test ===\n');
try {
  await transporter.verify();
  console.log('✅ SMTP connection: PASS\n');
} catch (err) {
  console.error('❌ SMTP connection: FAIL');
  console.error('   Error:', err.message);
  console.error('   Code:', err.code || 'n/a');
  console.error('\n   Common causes:');
  console.error('   • EAUTH   → Gmail App Password is wrong or not a 16-char App Password');
  console.error('             → 2-Step Verification must be ON for App Passwords to work');
  console.error('             → Generate App Password at: myaccount.google.com/apppasswords');
  console.error('   • ENOTFOUND → No internet / DNS failure');
  console.error('   • ETIMEDOUT → Network/firewall blocking port 465\n');
  process.exit(1);
}

console.log('=== Test Email Send ===\n');
try {
  const info = await transporter.sendMail({
    from: `"Car Rental Test" <${EMAIL_USER}>`,
    to: EMAIL_USER,          // sends to itself — safe, no arbitrary recipient
    subject: 'Car Rental — SMTP Test Email',
    html: `
      <h2>✅ SMTP Test Passed</h2>
      <p>If you received this email, Nodemailer is configured correctly.</p>
      <p><small>Sent at: ${new Date().toISOString()}</small></p>
    `,
  });
  console.log('✅ Test email sent: PASS');
  console.log('   Message ID:', info.messageId, '\n');
} catch (err) {
  console.error('❌ Test email send: FAIL');
  console.error('   Error:', err.message);
  console.error('   Code:', err.code || 'n/a', '\n');
  process.exit(1);
}

console.log('=== All Tests Passed ✅ ===\n');
console.log('Check your inbox at:', EMAIL_USER);
console.log('(Also check spam/junk folder)\n');
