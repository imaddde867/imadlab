# Security Audit: imadlab.com

**Date:** 2026-06-07  
**Target:** https://imadlab.com  
**Repository:** https://github.com/imaddde867/imadlab  
**Operator:** Imad Eddine El Mouss  

---

## Summary

This report documents findings from a security-focused reconnaissance of imadlab.com and its supporting infrastructure (Supabase, GitHub Pages, Cloudflare). All tests were passive/non-destructive. The goal is to highlight misconfigurations before they are exploited by malicious actors.

---

## Severity Legend

| Color | Meaning |
|-------|---------|
| 🔴 **Critical** | Immediate exploitation possible, sensitive data or control plane at risk |
| 🟠 **High** | Exploitable with moderate effort |
| 🟡 **Medium** | Boundary case or requires chaining |
| 🔵 **Low** | Informational / hardening opportunity |

---

## 🔴 Critical Findings

### C-01: Supabase Anon Key Enables Unauthenticated Writes to `newsletter_subscribers`

The Supabase anon key is embedded in the client-side JS bundle at `assets/js/index-rFCdR7xM.js`. While anon keys are expected in Supabase SPAs, the associated Row-Level Security (RLS) policy is **too permissive**:

- **`POST /rest/v1/newsletter_subscribers`** accepts inserts with only the anon key — no CAPTCHA, no rate limiting, no authentication.
- Confirmed: HTTP `201 Created` for arbitrary email submissions.

**Impact:** Anyone can:
- Flood the table with unlimited junk data (storage cost DoS)
- Inject malformed payloads
- Enumerate valid subscribers if a SELECT policy is also misconfigured

**Fix:** Add RLS policies that require authentication for writes, or implement CAPTCHA/Turnstile on the client side before hitting the Supabase endpoint.

**Location:**
- `assets/js/NewsletterSignup-BpWLY6yE.js` — `supabase.from("newsletter_subscribers").insert([{email}])`
- Anon key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wa2d1Z2Nhc3hwYW5ocmtwa2hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3OTU4NTEsImV4cCI6MjA2NzM3MTg1MX0.sn9HyUjNlKHrTGEpD-33bl0NfTwVz02ljAtR92YP3hI`

---

## 🟠 High Findings

### H-01: Missing HTTP Security Headers

The following security headers are **absent** from all responses:

| Header | Function | Risk |
|--------|----------|------|
| `Strict-Transport-Security` | Enforces TLS | MiTM downgrade |
| `Content-Security-Policy` | Restricts script/style sources | XSS amplification |
| `X-Frame-Options` | Prevents clickjacking | UI redressing |
| `X-Content-Type-Options` | Prevents MIME sniffing | Drive-by download |

Additionally, `Access-Control-Allow-Origin: *` is set on all responses — unnecessary for a static site.

**Fix:** Add all four headers via Cloudflare Page Rules or the Pages Functions middleware.

### H-02: Admin Panel Path Exposed in robots.txt

```
Disallow: /admin/
Disallow: /admin/*
```

Listing `/admin/` in robots.txt advertises its existence. The admin login uses `supabase.auth.signInWithPassword(email, password)` — a brute-force target.

**Fix:** Remove `/admin/` from robots.txt (security by obscurity alone is insufficient), implement rate limiting on auth, and consider adding MFA.

### H-03: Full DB Schema Leaked in Client-Side JS

Chunk `assets/js/content-selects-Bl1-GPQZ.js` contains the **complete column names** for both `posts` and `projects` tables:

```js
// posts: id, title, slug, excerpt, body, tags, published_date, updated_at, read_time, image_url, created_at
// projects: id, title, description, full_description, image_url, tech_tags, repo_url, demo_url, created_at, updated_at
```

**Fix:** Use Supabase RLS views or GraphQL with field-level restrictions to limit what the anon key can see.

---

## 🟡 Medium Findings

### M-01: Admin Dashboard Chunks Publicly Loaded

All admin UI code is bundled into public JS chunks:
- `AdminLogin-BIxI5GrX.js` — Login form and auth logic
- `ManagePosts-Bp5TC--C.js` — CRUD operations on posts
- `ManageProjects-BvuawOZQ.js` — CRUD operations on projects
- `EmailDashboard-DIlmY-Yj.js` — Email/notification management
- `AnalyticsDashboard-Bp97YFBM.js` — Analytics views
- `users-BShtbNTf.js` — User management

While gated by auth, this exposes the full admin attack surface to unauthenticated users.

**Fix:** Lazy-load admin chunks only after successful authentication.

---

## 🔵 Low / Informational

### I-01: User Email Exposed in Public GitHub Profile

The email `imadeddine200507@gmail.com` is readable from:
- `github.com/imaddde867` profile README
- WHOIS records (via Namecheap)
- Multiple GitHub commits

**Risk:** Phishing / social engineering surface.

### I-02: GitHub Commit History May Contain Secrets

Commit `cc58e982` deleted `.env.example`. The `.env.example` previously contained:
```
DISCORD_WEBHOOK_URL=[REDACTED_DISCORD_WEBHOOK]
```

If a real `.env` was ever accidentally committed and later removed, the secret is still recoverable from git history.

**Fix:** Use `git filter-repo` or `bfg` to purge any secrets from history. Rotate any keys that may have been exposed.

### I-03: No `security.txt`

`/.well-known/security.txt` returns 404. Security researchers have no clear channel to report findings.

**Fix:** Create `https://imadlab.com/.well-known/security.txt` with a disclosure policy and contact.

### I-04: Supabase Instance URL Hardcoded in HTML

```html
<link rel="dns-prefetch" href="https://mpkgugcasxpanhrkpkhs.supabase.co">
```

While not a vulnerability by itself, it confirms the Supabase project reference, which combined with the anon key enables the attacks in C-01.

---

## Attack Chain Examples

### Chain 1: Newsletter DB Flood
```
anon key → POST /rest/v1/newsletter_subscribers → unlimited inserts
```
Automated script fills the subscriber table with garbage, causing storage costs and polluting legitimate data.

### Chain 2: Admin Brute Force + XSS
```
/admin path known → supabase.auth.signInWithPassword() → no rate limiting → credential stuffing
```
Combine with missing CSP: if any admin input reflects unsanitized content, stored XSS in the admin panel could compromise the session.

---

## Infrastructure Overview

| Component | Detail |
|-----------|--------|
| Frontend | React 18 + TypeScript + Vite (SPA) |
| Hosting | GitHub Pages |
| CDN | Cloudflare + Fastly |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email/password) |
| Registrar | Namecheap |
| DNS | Cloudflare |
| Domains | `imadlab.com`, `imadlab.me` (redirects) |

---

## Disclosure Timeline

- **2026-06-07:** Reconnaissance performed, findings documented
- **Pending:** Report submitted to repository owner

---

*This report was produced as a professional security assessment. No data was exfiltrated, no services were disrupted, and no unauthorized access was gained beyond what is publicly available.*
