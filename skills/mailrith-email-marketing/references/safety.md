# Mailrith Safety And Retry Rules

## Retry Decision

- Retry safe reads after transient network, timeout, rate-limit, or server failures. Respect `Retry-After` and use bounded exponential backoff with jitter.
- Retry idempotent writes only with the same idempotency key and identical canonical input.
- Inspect the current resource state before retrying resource-state operations.
- Do not retry non-idempotent operations automatically.
- Treat a timeout after request transmission as uncertain. Look up the current
  resource or progress state and keep the request ID for support before doing
  anything else.

## Secret Handling

Keep API keys, access tokens, and refresh tokens in the client secret store or
process environment. Redact them from errors and tool output. Never place them
in email content, Subscriber fields, logs, screenshots, or resource notes.

## Scope Selection

Use Full Email Marketing Access for a general-purpose agent whose job is to operate Mailrith across resources. Use a focused Work Profile or custom permissions for a reporting-only agent, a purpose-built integration, or another deliberately narrow connection. A resource write permission covers every public write operation for that resource. Use client tool limits when a workflow should expose only part of the resource lifecycle. A missing permission is a control boundary, not a reason to bypass Mailrith's public interface.

## Content And Recipient Checks

Before a send, confirm the selected workspace, sender identity, Subscriber filters, exclusions, estimated recipient count, subject, content, and unsubscribe behavior. Run Broadcast preflight again after any relevant value changes.
