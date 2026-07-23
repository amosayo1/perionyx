# Best Practices

## API Integration

### 1. Use the Right Authentication Method
- **Server-to-server**: Use API keys or service accounts
- **User-facing**: Use OAuth2 or Personal Access Tokens
- **CI/CD**: Use service accounts with minimal scopes
- **One-time operations**: Use scoped tokens

### 2. Handle Rate Limits Gracefully
- Monitor `X-RateLimit-Remaining` headers
- Implement exponential backoff on 429 responses
- Cache responses where possible
- Use bulk endpoints for batch operations

### 3. Use Idempotency
- Webhooks may be delivered more than once
- Use `x-webhook-id` for deduplication
- Design your handlers to be idempotent

### 4. Paginate Responsibly
- Use reasonable page sizes (25-100)
- Cache paginated results when possible
- Use cursor-based pagination for real-time data

### 5. Validate Webhook Signatures
Always verify the `x-webhook-signature` header before processing webhook payloads.

## Security

### 1. Rotate Credentials Regularly
- API keys: Every 90 days
- Personal Access Tokens: Every 30 days
- Webhook secrets: Every 6 months

### 2. Use Scoped Permissions
Request only the scopes your integration needs. Use scoped tokens for limited operations.

### 3. Secure Webhook Endpoints
- Use HTTPS only
- Verify signatures before processing
- Respond with 200 OK quickly
- Consider IP allowlisting

### 4. Monitor and Audit
- Review API usage regularly
- Monitor authentication failures
- Audit permission scope changes
- Set up alerts for unusual activity

## Performance

### 1. Reduce API Calls
- Use field selection to limit response size
- Use filter and sort parameters instead of client-side processing
- Use bulk operations when available
- Cache responses with appropriate TTLs

### 2. Optimize Pagination
- Use larger page sizes for batch processing
- Cache paginated results for repetitive queries
- Use cursor-based pagination for real-time data

### 3. Handle Errors Efficiently
- Implement proper retry logic
- Use exponential backoff
- Log errors with request IDs for support
