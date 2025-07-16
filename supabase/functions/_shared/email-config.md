# Email Service Configuration Guide

## Required Environment Variables

Add these environment variables to your Supabase project:

### Resend API Configuration
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxx
SITE_URL=https://your-domain.com
```

## Resend Setup Instructions

### 1. Create Resend Account
1. Go to [resend.com](https://resend.com) and create an account
2. Verify your domain or use the sandbox domain for testing

### 2. Get API Key
1. Navigate to API Keys in your Resend dashboard
2. Create a new API key with "Sending access"
3. Copy the key and add it as `RESEND_API_KEY` environment variable

### 3. Configure Webhook
1. Go to Webhooks in your Resend dashboard
2. Create a new webhook with the following settings:
   - **Endpoint URL**: `https://your-project-ref.supabase.co/functions/v1/email-webhook`
   - **Events**: Select all email events (sent, delivered, opened, clicked, bounced, complained)
3. Copy the webhook secret and add it as `RESEND_WEBHOOK_SECRET`

### 4. Domain Configuration
1. Add your domain in Resend dashboard
2. Configure DNS records as instructed
3. Verify domain ownership

## Supabase Environment Variables Setup

### Via Supabase Dashboard
1. Go to Project Settings > API
2. Navigate to Environment Variables
3. Add the required variables:
   - `RESEND_API_KEY`
   - `RESEND_WEBHOOK_SECRET` 
   - `SITE_URL`

### Via Supabase CLI
```bash
supabase secrets set RESEND_API_KEY=your_api_key
supabase secrets set RESEND_WEBHOOK_SECRET=your_webhook_secret
supabase secrets set SITE_URL=https://your-domain.com
```

## Testing Configuration

### Test Email Sending
```bash
curl -X POST https://your-project-ref.supabase.co/functions/v1/send-newsletter-emails \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

### Test Webhook
```bash
curl -X POST https://your-project-ref.supabase.co/functions/v1/email-webhook \
  -H "Content-Type: application/json" \
  -H "svix-signature: test" \
  -H "svix-timestamp: $(date +%s)" \
  -d '{"type":"email.delivered","data":{"email_id":"test","to":["test@example.com"]}}'
```

## Rate Limits and Best Practices

### Resend Limits
- **Free Plan**: 100 emails/day, 3,000 emails/month
- **Pro Plan**: 50,000 emails/month
- **Rate Limit**: 10 requests/second

### Best Practices
1. **Batch Processing**: Process emails in batches of 50-100
2. **Retry Logic**: Implement exponential backoff for failures
3. **Monitoring**: Set up alerts for failed deliveries
4. **Compliance**: Include unsubscribe links in all emails
5. **Authentication**: Use SPF, DKIM, and DMARC records

## Troubleshooting

### Common Issues
1. **Invalid API Key**: Check if key is correct and has sending permissions
2. **Webhook Failures**: Verify webhook URL and secret
3. **Domain Issues**: Ensure domain is verified in Resend
4. **Rate Limiting**: Implement proper delays between requests

### Debug Mode
Enable debug logging by setting:
```bash
supabase secrets set DEBUG_EMAIL=true
```

## Production Checklist

- [ ] Domain verified in Resend
- [ ] SPF/DKIM records configured
- [ ] Webhook endpoint secured
- [ ] Rate limiting implemented
- [ ] Error monitoring setup
- [ ] Unsubscribe flow tested
- [ ] Email templates tested across clients
- [ ] Analytics tracking verified