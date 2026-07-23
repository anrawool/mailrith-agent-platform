# Mailrith Safety And Retry Rules

## Retry Decision

- Retry safe reads after transient network, timeout, rate-limit, or server failures. Respect `Retry-After` and use bounded exponential backoff with jitter.
- Retry idempotent writes only with the same idempotency key and identical canonical input.
- Inspect resource or activity state before retrying resource-state operations.
- Do not retry non-idempotent operations automatically.
- Treat a timeout after request transmission as uncertain. Look up progress or activity by request ID before doing anything else.

## Secret Handling

Keep API keys, access tokens, and refresh tokens in the client secret store or process environment. Redact them from errors and tool output. Never place them in email content, Subscriber fields, logs, screenshots, or activity annotations.

## Scope Selection

Start with read scopes. Add draft/configure scopes for authoring. Add execute, bulk, delete, or admin scopes only for the exact workflow that needs them. A missing scope is a control boundary, not a reason to bypass Mailrith's public interface.

## Content And Recipient Checks

Before a send, confirm the selected workspace, sender identity, Subscriber filters, exclusions, estimated recipient count, subject, content, and unsubscribe behavior. Run Broadcast preflight again after any relevant value changes.
