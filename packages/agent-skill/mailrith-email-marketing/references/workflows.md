# Mailrith Workflow Recipes

## Read-Only Review

1. Discover the API and read capabilities.
2. Confirm the workspace and granted scopes.
3. Search a bounded collection page and use its compact summaries to select an item.
4. Fetch the complete item by ID only when its content or definition is needed.
5. Summarize aggregate findings. Do not retain Subscriber rows after the task.

## Subscriber Management

1. Inspect custom fields and Tags before mapping incoming fields.
2. Separate profile updates from sending-eligibility or targeting changes.
3. Use the Subscriber upsert operation for one record.
4. For a CSV, start a Subscriber import upload and give the short-lived browser link to the signed-in user. Do not ask the user to send the CSV through the chat or agent.
5. Poll the upload at a bounded interval. After it is ready, inspect only its column names and row count, map the columns, and start the import with its upload ID.
6. Confirm the intended eligibility, targeting, or Sequence-enrollment change before calling the scoped mutation.
7. Use a stable source identifier and an idempotency key for retriable writes.
8. Return created, updated, skipped, and failed counts without echoing full profiles.

## Broadcasts

1. Run `mailrith_check_connection` for `createBroadcast`. If Mailrith reports that email delivery is missing or disabled, give the returned setup link to the user or ask them to enable the existing connection.
2. Use `mailrith_search_operations` to find `listSenderIdentities`, targeting reads, and Template reads. Load each required schema with `mailrith_get_operation`, then run it with `mailrith_read`.
3. Find `createBroadcast` or `updateBroadcast`, load its schema, and run it with `mailrith_write`. Keep the Broadcast as a draft.
4. Confirm subject, sender, recipients, exclusions, and unsubscribe behavior.
5. Run `preflightBroadcast` with `mailrith_read`. The Broadcasts Work Profile authorizes sending, but creating or updating a draft does not send it. Run `sendBroadcast` with `mailrith_live` only when the user's task requires a live send.

## Email Delivery Setup

1. Connect through the standard MCP URL, choose Email Delivery Setup during OAuth, and confirm the connection has the required permission.
2. Ask which email delivery provider and sender identity the user wants. Do not ask for an API key, password, secret, or SMTP credential.
3. Find `startEmailDeliveryConnectionSetup`, load its schema, and run it with `mailrith_write`. Include the provider, connection name, From name, and From email. For credential replacement, provide the existing connection ID and use the replacement purpose.
4. Give the returned short-lived setup link to the authorized user. The user signs in to Mailrith and enters provider credentials there; the credentials never pass through the agent. After the link opens, Mailrith keeps the setup in a browser-bound secure session so a reload does not require a new agent link.
5. Run `getEmailDeliveryConnectionSetup` with `mailrith_read` at a bounded interval until it is completed or `expires_at` has passed. Do not poll rapidly or repeatedly create new setup sessions.
6. Read the completed connection and confirm its provider, From name, From email, and enabled status. Saved credentials are never returned.
7. Run `verifyEmailDeliveryConnection` with `mailrith_read` to check provider and sender access. If inspection is unavailable for a send-only provider key, explain that a real test email is still required.
8. With the user's chosen recipient and a stable idempotency key, run `testEmailDeliveryConnection` with `mailrith_live`. Confirm the successful result before preparing email-dependent resources.
9. If the provider requires DNS, domain, or sender verification, tell the user what remains to be completed in the provider account before sending.

## Broadcast Scheduling

1. Read the Broadcast and confirm its sender, Subscriber filters, exclusions, subject, and content.
2. Find `scheduleBroadcast`, load its schema, and run it with `mailrith_live` using a future date and time that includes a UTC offset.
3. Call the same operation with a new date and time to reschedule it.
4. Run `unscheduleBroadcast` with `mailrith_live` to return a scheduled Broadcast to Draft.
5. Read the Broadcast after each change and confirm `status`, `scheduled_at`, and `recipient_count`.

## Sequences And Operations

1. Use Sequences to create, read, change, or delete paused Sequences.
2. Read sender settings, steps, delays, and current Subscriber count before activation.
3. Select a saved Subscriber and preview that Subscriber's eligibility and personalized email journey.
4. Use the Sequences Work Profile to activate, pause, or change individual Subscriber enrollment.
5. Treat activation and enrollment as live email operations.
6. Confirm the saved status and Subscriber count after each operation.

## Personalized Previews And Tests

1. Select a saved Subscriber before previewing or testing a Template, Broadcast, Sequence, Automation, Form, or Landing Page email.
2. Use the returned preview to review real saved personalization without changing the Subscriber or workflow.
3. For Sequences, confirm the Subscriber and per-email eligibility.
4. For Automations, confirm the evaluated branch and remember that the preview uses the Subscriber's current saved state.
5. Send a test only to the explicit test address supplied by the user.

## Preflight And Scoped Execution

1. Confirm the credential has the resource permission required by the operation and Perform Live Actions when the operation crosses the live boundary.
2. For Broadcast sends, run preflight and resolve every blocking issue.
3. Call the final operation with canonical input and an idempotency key when supported.
4. If Mailrith reports a conflict, read the current resource state before deciding whether to retry.
5. Read the changed resource or progress endpoint to confirm the result.

## Progress And Result Verification

1. Read broadcast send progress by broadcast ID; do not repeat the send request.
2. Use bounded polling and increase the interval for long-running work.
3. Read the target resource and its progress state when diagnosing.
4. Report the latest terminal or non-terminal state and a support-ready request ID.

## Permission Diagnosis

1. Run `mailrith doctor --json` for discovery, OAuth, MCP, and capability checks.
2. Read effective capabilities. An omitted operation can be caused by the credential's permissions, the current plan, the workspace limit, a missing or disabled email delivery connection, or a rollout control.
3. Use the returned missing-permission list, recommended Work Profile, and access-update link. A general-purpose agent should normally use Full Email Marketing Access; keep a focused connection narrow unless the user chooses to broaden it.
4. Follow the capability limitation's setup link or guidance when the credential already has the required scope but a workspace prerequisite is not ready.
5. For OAuth, reconnect from the client to approve the listed missing permissions. Never silently expand an existing token.
6. If authentication is invalid, use OAuth login or replace the API key without printing either credential.
