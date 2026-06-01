# Content-Security-Policy Headers

GitHub Pages does not support custom HTTP headers. Since this site uses a custom domain (imadlab.com), set these headers in Cloudflare.

## Option A: Cloudflare Custom Rules (WAF)

Go to: Cloudflare Dashboard > Security > WAF > Custom Rules
Create a rule:

**Field**: `Hostname` → `equals` → `imadlab.com` (and `www.imadlab.com`)
**Response**: Add Header
- Name: `Content-Security-Policy`
- Value: `default-src 'self'; script-src 'self' 'unsafe-inline' static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://mpkgugcasxpanhrkpkhs.supabase.co https://api.strava.com https://spotify.com https://ip-api.com https://api.indexnow.org; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests`

Also add these headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Option B: Cloudflare Pages/Workers (Edge Rules)

If using Cloudflare Workers as a reverse proxy for GitHub Pages:

```javascript
// worker entry point
export default {
  async fetch(request, env, ctx) {
    const response = await fetch(request);
    const headers = new Headers(response.headers);
    headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://mpkgugcasxpanhrkpkhs.supabase.co https://api.strava.com https://spotify.com https://ip-api.com https://api.indexnow.org; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests"
    );
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('X-Frame-Options', 'DENY');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  }
}
```

## CSP Policy Breakdown

| Directive | Allowed Sources | Why |
|-----------|----------------|-----|
| `default-src` | `'self'` | Block everything by default |
| `script-src` | `'self'`, `'unsafe-inline'`, `static.cloudflareinsights.com` | Inline scripts (React/Vite) + Cloudflare Analytics |
| `style-src` | `'self'`, `'unsafe-inline'` | Tailwind/shadcn/ui inline styles |
| `img-src` | `'self'`, `data:`, `https:` | Self-hosted, inline data URIs, any HTTPS image |
| `font-src` | `'self'`, `data:` | Self-hosted fonts + data URIs |
| `connect-src` | `'self'`, Supabase, Strava, Spotify, ip-api, IndexNow | API calls from frontend |
| `frame-src` | `'none'` | No iframes |
| `object-src` | `'none'` | No `<object>`/`<embed>` |
| `base-uri` | `'self'` | No external base tags |
| `form-action` | `'self'` | Forms only submit to own origin |
| `upgrade-insecure-requests` | — | Upgrade HTTP to HTTPS automatically |
