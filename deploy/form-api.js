// Minimal form handler for suprithanalwad.in
// Receives JSON from the site's contact + feedback forms, emails it to you,
// and appends a copy to submissions.log so nothing is ever lost.
//
//   npm init -y && npm install nodemailer
//   node form-api.js        (or run under systemd — see DEPLOY.md)

const http = require("http");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

const PORT = process.env.PORT || 3001;
const TO = process.env.MAIL_TO || "hello@suprithanalwad.in";
const LOG = path.join(__dirname, "submissions.log");

// Hostinger email SMTP. Set these in the systemd unit, not here.
const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.hostinger.com",
  port: Number(process.env.SMTP_PORT || 465),
  secure: true,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

const hits = new Map(); // crude per-IP rate limit: 5 submissions / 10 min

function allowed(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 600000);
  if (list.length >= 5) return false;
  list.push(now);
  hits.set(ip, list);
  return true;
}

function body(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (ch) => {
      data += ch;
      if (data.length > 20000) { reject(new Error("too large")); req.destroy(); }
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function asText(p) {
  const lines = [];
  lines.push("Type: " + p.type);
  Object.keys(p.fields || {}).forEach((k) => { if (p.fields[k]) lines.push(k + ": " + p.fields[k]); });
  if (p.preferredSlots) lines.push("Preferred slots: " + p.preferredSlots.join(", "));
  if (p.region) lines.push("Region shown: " + p.region);
  if (p.rating) lines.push("Rating: " + p.rating + "/5");
  if (p.role) lines.push("Submitted as: " + p.role);
  if (p.permission) lines.push("Publish permission: " + p.permission);
  lines.push("Submitted: " + p.submittedAt);
  lines.push("Page: " + p.page);
  return lines.join("\n");
}

http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "https://suprithanalwad.in");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.writeHead(204).end(); return; }
  if (req.method !== "POST") { res.writeHead(405).end(); return; }

  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  if (!allowed(ip)) { res.writeHead(429).end("Too many submissions"); return; }

  try {
    const payload = JSON.parse(await body(req));
    if (payload.company) { res.writeHead(200).end("ok"); return; } // honeypot
    const text = asText(payload);
    fs.appendFileSync(LOG, "\n---\n" + text + "\n");

    const reply = (payload.fields && payload.fields.EMAIL) || undefined;
    await transport.sendMail({
      from: '"suprithanalwad.in" <' + (process.env.SMTP_USER || TO) + ">",
      to: TO,
      replyTo: reply,
      subject: (payload.type === "enquiry" ? "New assessment request" : "New feedback") +
        " — " + ((payload.fields && (payload.fields["YOUR NAME"] || payload.fields["FIRST NAME"])) || "unknown"),
      text
    });

    res.writeHead(200, { "Content-Type": "application/json" }).end('{"ok":true}');
  } catch (e) {
    console.error(e);
    res.writeHead(500).end("error");
  }
}).listen(PORT, "127.0.0.1", () => console.log("form api on 127.0.0.1:" + PORT));
