# GitHub

repo: amitakki/supritha_website
branch: main

## Last sync

date: 2026-09-19T19:37:40Z
note: Read-only inspection. The repo contains only `.gitignore` (a Next.js template
      default) — no site files yet. This project's design files have NOT been pushed;
      pushing must be done by the user from their own machine (see below).

### Updated in this project
- Built the full eight-page site as Design Components (`Supritha Nalwad Site.dc.html`, `SiteHeader`, `SiteFooter`).
- Added course detail modals with the teaching approach and timed 11+ mock-test schedule.
- Added 11+, SATs and KS3 review sets with matching filters.
- Produced a VPS deploy package in `deploy/` (self-contained `index.html`, form API, nginx config, DEPLOY.md).

## Screen map

| Screen | Built from |
|---|---|
| All pages (Home, About, Courses, Pricing, Reviews, Feedback, Contact, FAQ) | `Supritha Nalwad Site.dc.html` |
| Header nav | `SiteHeader.dc.html` |
| Footer | `SiteFooter.dc.html` |
| Hosted build | `deploy/index.html` (compiled, do not hand-edit) |

## Pushing from your machine

```bash
git clone https://github.com/amitakki/supritha_website.git
cd supritha_website
# copy the downloaded deploy/ folder and the .dc.html source files in here
git add .
git commit -m "Add Supritha Nalwad tutoring site and VPS deploy package"
git push origin main
```

The existing `.gitignore` is a Next.js default; it does not exclude anything in
`deploy/`, so no changes are needed to it.
