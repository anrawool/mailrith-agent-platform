# Mailrith Workflow Recipes

## Read-Only Review

1. Discover the API and read capabilities.
2. Confirm the workspace and granted scopes.
3. Request a bounded page with only task-relevant filters.
4. Summarize aggregate findings. Do not retain Subscriber rows after the task.

## Subscriber Sync

1. Inspect custom fields and Tags before mapping incoming fields.
2. Separate profile updates from sending-eligibility or targeting changes.
3. Use the Subscriber upsert operation for one record or the bulk-import job for a bounded file.
4. Confirm the intended eligibility, targeting, or Sequence-enrollment change before calling the scoped mutation.
5. Use a stable source identifier and an idempotency key for retriable writes.
6. Return created, updated, skipped, and failed counts without echoing full profiles.

## Broadcast Preparation

1. Read the available Sender Identities, Subscriber targeting options, and templates.
2. Create or update draft content only.
3. Confirm subject, sender, recipients, exclusions, and unsubscribe behavior.
4. Run Broadcast preflight separately. Drafting permission does not imply sending permission.

## Sequence Preparation And Operations

1. Use Sequence Preparation to create, read, change, or delete paused Sequences.
2. Read sender settings, steps, delays, and current Subscriber count before activation.
3. Use a separate Sequence Operations credential to activate, pause, or change individual Subscriber enrollment.
4. Treat activation and enrollment as live email operations.
5. Confirm the saved status and Subscriber count after each operation.

## Preflight And Scoped Execution

1. Confirm the credential has the exact execute, bulk, delete, or admin scope required by the operation.
2. For Broadcast sends, run preflight and resolve every blocking issue.
3. Call the final operation with canonical input and an idempotency key when supported.
4. If Mailrith reports a conflict, read the current resource state before deciding whether to retry.
5. Use Agent Activity to correlate the request and confirm the result.

## Progress And Activity

1. Read broadcast send progress by broadcast ID; do not repeat the send request.
2. Use bounded polling and increase the interval for long-running work.
3. Read Agent Activity by request ID, activity ID, operation, or resource ID when diagnosing.
4. Report the latest terminal or non-terminal state and a support-ready request ID.

## Permission Diagnosis

1. Run `mailrith doctor --json` for discovery, OAuth, MCP, and capability checks.
2. Read capabilities to compare required and granted scopes.
3. Ask for the narrow missing scope. Do not ask for a broad administrative key.
4. If authentication is invalid, use OAuth login or replace the API key without printing either credential.
