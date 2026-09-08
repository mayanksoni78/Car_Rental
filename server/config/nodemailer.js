import nodemailer from "nodemailer";

// ---------------------------------------------------------------------------
// IMPORTANT: This module is imported at startup before dotenv.config() runs
// (ES module imports are hoisted above runtime code in server.js).
// Therefore we must NOT call createTransport() at module evaluation time.
// Instead, we build the transporter lazily on first use, using a getter,
// so that process.env values are read AFTER dotenv has populated them.
// ---------------------------------------------------------------------------

let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;

  const user = process.env.EMAIL_USER;
  // Strip spaces from App Password — Gmail shows it grouped (e.g. "xxxx xxxx xxxx xxxx")
  const pass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, "") : undefined;

  if (!user || !pass) {
    console.error(
      "[nodemailer] Email configuration incomplete: " +
        (!user ? "EMAIL_USER missing. " : "") +
        (!pass ? "EMAIL_PASS missing." : "")
    );
  }

  // Use explicit Gmail SMTP settings (nodemailer v8 requires this for reliability)
  _transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // SSL
    auth: { user, pass },
  });

  return _transporter;
}

// Verify SMTP connection on startup — called from server.js after dotenv loads
export async function verifyTransporter() {
  const t = getTransporter();
  try {
    await t.verify();
    console.log("[nodemailer] ✅ Email transporter verified — SMTP connection OK");
    console.log(
      "[nodemailer] EMAIL_USER configured:",
      Boolean(process.env.EMAIL_USER)
    );
    return true;
  } catch (err) {
    console.error(
      "[nodemailer] ❌ Email transporter verification failed:",
      err.message,
      "| code:", err.code || "n/a"
    );
    console.log(
      "[nodemailer] EMAIL_USER configured:",
      Boolean(process.env.EMAIL_USER),
      "| EMAIL_PASS configured:",
      Boolean(process.env.EMAIL_PASS)
    );
    return false;
  }
}

// Proxy object: any property access or method call transparently delegates
// to the lazily-built transporter. This preserves the existing
// `transporter.sendMail(...)` call sites without any changes needed there.
const transporter = new Proxy(
  {},
  {
    get(_target, prop) {
      const t = getTransporter();
      const val = t[prop];
      return typeof val === "function" ? val.bind(t) : val;
    },
  }
);

export default transporter;