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
4. Preview high-impact eligibility, targeting, or Sequence-enrollment changes.
5. Use a stable source identifier and an idempotency key for retriable writes.
6. Return created, updated, skipped, and failed counts without echoing full profiles.

## Campaign Draft

1. Read the available Sender Identities, Subscriber targeting options, and templates.
2. Create or update draft content only.
3. Confirm subject, sender, recipients, exclusions, and unsubscribe behavior.
4. Preview the send operation separately. Drafting permission does not imply sending permission.

## Preview And Approved Execution

1. Call the intended operation in plan mode using the final canonical input.
2. Show the action ID, risk, target resources, estimated effects, warnings, and expiration.
3. Ask the user to review the action in Mailrith under **Settings → Agents → Approvals**.
4. Wait until Mailrith reports `approved`.
5. Claim the short-lived approval token only in memory and execute the exact planned operation once.
6. If Mailrith reports a conflict or changed resource version, create a new plan. Never force the stale plan.

## Progress And Activity

1. Read broadcast send progress by broadcast ID; do not repeat the send request.
2. Use bounded polling and increase the interval for long-running work.
3. Read agent activity by request ID, action ID, operation, or resource ID when diagnosing.
4. Report the latest terminal or non-terminal state and a support-ready request ID.

## Permission Diagnosis

1. Run `mailrith doctor --json` for discovery, OAuth, MCP, and capability checks.
2. Read capabilities to compare required and granted scopes.
3. Ask for the narrow missing scope. Do not ask for a broad administrative key.
4. If authentication is invalid, use OAuth login or replace the API key without printing either credential.
