# Marketplace Reviewer Workspace

Use one dedicated Mailrith workspace for OpenAI, Anthropic, and Cursor review.
Never copy customer data into this workspace.

## Prepare The Workspace

1. Create a workspace named **Mailrith Marketplace Review** with timezone
   **UTC**.
2. Add only the synthetic records described in
   `workspace-fixture.json`.
3. Verify the sender identity using an address controlled by Mailrith.
4. Connect a delivery provider that is restricted to Mailrith's reviewer test
   addresses.
5. Create one reviewer user without MFA, SMS, private-network, or email-link
   requirements during the review window.
6. Grant the reviewer access only to this workspace.
7. Test OAuth from a clean browser session before handing over the account.

Credentials must be shared through an approved secret-sharing service. Never
write them into this repository, a submission note, or a support ticket.

## Reset The Workspace

1. Revoke the reviewer user's active Mailrith connections under
   **Integrations → Authorized Apps**.
2. Stop any in-progress reviewer Broadcast.
3. Return the named Broadcasts, Sequences, and Automations to the states listed
   in `workspace-fixture.json`.
4. Remove any records created by reviewers that are not in the fixture.
5. Restore the three synthetic Subscribers, the Tag, Segment, sender identity,
   and Template.
6. Confirm that no scheduled delivery targets an address outside the approved
   reviewer domain.
7. Complete the positive and negative cases in
   `chatgpt-app-submission.json` before the next handoff.

## Close The Review Window

1. Revoke every reviewer OAuth connection.
2. Disable the reviewer user.
3. Remove the temporary delivery-provider restriction only after confirming
   no reviewer jobs remain.
4. Keep the synthetic workspace for later marketplace re-review, or delete it
   through the normal Mailrith workspace process.
