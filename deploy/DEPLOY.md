# Deploying suprithanalwad.in to your Hostinger VPS

Everything in this `deploy/` folder is what goes on the server.

| File | Where it goes | What it is |
|---|---|---|
| `index.html` | `/var/www/suprithanalwad.in/public/index.html` | The whole website, self-contained (fonts + images inlined) |
| `og.png` | `/var/www/suprithanalwad.in/public/og.png` | Link preview image for WhatsApp / Facebook / LinkedIn |
| `form-api.js` | `/var/www/suprithanalwad.in/api/form-api.js` | Receives the contact + feedback forms, emails them to you |
| `suprithanalwad-forms.service` | `/etc/systemd/system/` | Keeps the form handler running and restarts it on reboot |
| `nginx.conf` | `/etc/nginx/sites-available/suprithanalwad.in` | Web server config, HTTPS redirect, API proxy |

---

## 1. Point the domain at the VPS

In Hostinger → Domains → DNS for `suprithanalwad.in`:

```
A     @      <your VPS IPv4>
A     www    <your VPS IPv4>
```

Delete any parking/redirect records. Allow up to an hour to propagate; check with
`dig suprithanalwad.in +short`.

## 2. Prepare the server

SSH in as root:

```bash
apt update && apt install -y nginx nodejs npm certbot python3-certbot-nginx
mkdir -p /var/www/suprithanalwad.in/public /var/www/suprithanalwad.in/api
```

## 3. Upload the site

From your own machine, in this `deploy/` folder:

```bash
scp index.html og.png root@<VPS-IP>:/var/www/suprithanalwad.in/public/
scp form-api.js root@<VPS-IP>:/var/www/suprithanalwad.in/api/
scp nginx.conf root@<VPS-IP>:/etc/nginx/sites-available/suprithanalwad.in
scp suprithanalwad-forms.service root@<VPS-IP>:/etc/systemd/system/
```

## 4. Turn on nginx + HTTPS

```bash
ln -s /etc/nginx/sites-available/suprithanalwad.in /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
certbot --nginx -d suprithanalwad.in -d www.suprithanalwad.in
```

Certbot writes the certificate lines into the config and sets up auto-renewal.
The site is now live at `https://suprithanalwad.in`.

## 5. Make the forms actually send email

Create the mailbox `hello@suprithanalwad.in` in Hostinger → Emails first, then:

```bash
cd /var/www/suprithanalwad.in/api
npm init -y && npm install nodemailer
nano /etc/systemd/system/suprithanalwad-forms.service   # set SMTP_PASS
systemctl daemon-reload
systemctl enable --now suprithanalwad-forms
systemctl status suprithanalwad-forms
```

Test by submitting the contact form on the live site. Every submission is also
appended to `/var/www/suprithanalwad.in/api/submissions.log` as a backup.

**If you'd rather not run a service:** set `FORM_ENDPOINT` in the site source to a
Formspree URL (`https://formspree.io/f/xxxxxxx`) and skip steps 5 entirely — free
tier covers 50 submissions a month.

## 6. Updating the site later

Re-export `index.html` from the design file and re-upload it:

```bash
scp index.html root@<VPS-IP>:/var/www/suprithanalwad.in/public/
```

No restart needed — nginx serves it immediately (it's set to `no-cache`).

---

## Before you announce it

- [ ] Every review on the Reviews page is real and the family has agreed to it.
      Invented testimonials breach UK CAP advertising rules.
- [ ] The 5.0 average and "24 verified reviews" match reality — edit the number in
      the design file if not.
- [ ] Qualification claims (M.Tech, fifteen years) are evidenced if asked.
- [ ] Add a privacy notice page — UK GDPR requires one because the forms collect
      parents' contact details and children's year groups. Say what you collect,
      why, how long you keep it, and that it's never shared.
- [ ] Decide your cancellation/refund terms and state them, since you take fees.
- [ ] Optional: add Plausible or Google Analytics if you want traffic numbers.
- [ ] Optional: submit the site to Google Search Console so it gets indexed.
