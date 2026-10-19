# Newsletter configuration

Newsletter sends are manual: select content in `/admin/emails`, preview it, then
confirm the send. Publishing content does not send email automatically.

## Sender

Verify `imadlab.com` in Resend. Add the DNS records returned by `resend domains get`
to Cloudflare using the exact names and values. Keep any CNAME record DNS-only.
The failed `imadlab.me` domain does not authorize sending from `imadlab.com`.

Configure these Supabase secrets through the dashboard or a local secret file:

- `RESEND_API_KEY`: a Resend key with sending access.
- `NEWSLETTER_FROM`: `imadlab <newsletter@imadlab.com>` after domain verification.
- `RESEND_WEBHOOK_SECRET`: the signing secret for the newsletter webhook.
- `SITE_URL`: `https://imadlab.com`.

The sender refuses to run without `NEWSLETTER_FROM`. Resend's
`onboarding@resend.dev` test sender cannot deliver to arbitrary subscribers.

## Authorization and deployment

Send and preview require a verified JWT for the site owner UID used by database
RLS, an admin JWT with `app_metadata.role = admin`, or an `x-job-secret` header
matching the optional `NEWSLETTER_JOB_SECRET`.
Never use the anonymous key alone to authorize a send.

Deploy the email functions with their own authorization checks:

```bash
supabase functions deploy send-newsletter-emails render-email-preview handle-unsubscribe email-webhook --no-verify-jwt --project-ref mpkgugcasxpanhrkpkhs
```

The webhook authenticates Resend's `svix-id`, `svix-timestamp` and `svix-signature`
against the raw request body. Supabase gateway JWT verification must be disabled
for this function because Resend does not send a Supabase JWT.

Enable the existing Resend webhook only after the corrected function is deployed:

```text
https://mpkgugcasxpanhrkpkhs.supabase.co/functions/v1/email-webhook
```

Subscribe to `email.delivered`, `email.opened`, `email.clicked`, `email.bounced`
and `email.complained`. Opens and clicks also require the corresponding domain
tracking setting; changing those settings is a separate privacy choice.

## Verification

```bash
deno test --no-lock --allow-env --allow-net=127.0.0.1,0.0.0.0 supabase/functions/shared/admin-auth.test.ts supabase/functions/shared/email-templates.test.ts supabase/functions/send-newsletter-emails/send-newsletter-emails.test.ts
deno test --no-lock --allow-env --import-map=supabase/functions/email-webhook/test-import-map.json supabase/functions/email-webhook/email-webhook.test.ts
deno test --no-lock --no-check --allow-env --import-map=supabase/functions/send-newsletter-emails/test-import-map.json supabase/functions/send-newsletter-emails/delivery.test.ts
```

The endpoint tests replace server/database boundaries and make no live sends.
The sender fixture uses simplified query types, hence `--no-check`; it validates
runtime behavior, not production types. The database integration test requires
a disposable test Supabase project and deletes test records. Do not run it
against production.

After DNS verification and deployment, test only the owner's approved addresses.
Check Resend's delivery events as well as the HTTP response. A successful send
means the provider accepted the message; it does not establish inbox delivery.

Sends are paced below ten requests per second within one invocation. Other
concurrent senders share the account limit and can still produce `429` errors.
Failed queue rows remain retryable; the existing recipient history prevents
resending to recipients already recorded for that queue item. Webhook attribution
currently uses recipient and recent-send matching, so overlapping campaigns can
misattribute events until provider email IDs are stored.
