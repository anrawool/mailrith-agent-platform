# Agent Integration Submission Guide

The repository work is complete when every automated gate passes. Provider
review cannot be completed by repository automation. A Mailrith owner must use
the organization account that owns each listing and must be able to make the
required identity, legal, privacy, and data-handling statements.

## Shared Pre-Submission Checks

1. Deploy the same reviewed source to the target environment.
2. Confirm `https://api.mailrith.com/mcp` serves the submitted `1.0` profile.
3. Confirm OAuth discovery, Dynamic Client Registration, PKCE, refresh,
   revocation, and resource binding against the deployed endpoint.
4. Prepare and reset the synthetic reviewer workspace using
   `reviewer/README.md`.
5. Run the repository tests, client conformance checks, MCP Inspector, and the
   current provider-specific scanner.
6. Confirm the privacy policy, terms, support URL, product name, logo, and
   descriptions match across all three submissions.
7. Share reviewer credentials only through an approved secret-sharing service.

## Submit ChatGPT And Codex

1. Sign in to the OpenAI Platform organization that will own Mailrith.
2. In **Organization Settings**, confirm the publisher identity is verified.
3. In **Roles**, confirm the submitter has **Apps Management: Write**. An
   organization owner already has this permission.
4. Open the **Plugin Submission** portal and create one Mailrith draft.
5. Package `openai/mailrith` from the exact reviewed commit.
6. Import `chatgpt-app-submission.json` and enter the public MCP URL,
   `https://api.mailrith.com/mcp`.
7. Use the OAuth callback URL generated for that draft. Do not reuse a callback
   URL from another plugin draft.
8. Connect Mailrith from ChatGPT developer mode using a clean reviewer session.
9. Run all five positive cases and all three negative cases.
10. Run the OpenAI production scan and correct every blocking result.
11. Review every tool annotation, justification, starter prompt, public URL,
    country selection, and policy statement.
12. Submit the plugin for review. After OpenAI approves it, return to the same
    draft and publish it to the Plugins Directory for ChatGPT and Codex.

## Submit The Claude Connector

1. Confirm the submitting account belongs to a Claude Team or Enterprise
   organization and has Owner or Directory management permission.
2. Use the listing in `claude/connector-listing.json`.
3. Register `https://claude.ai/api/mcp/auth_callback` for hosted Claude.
   Verify Claude Code separately with its documented port-agnostic localhost
   loopback callbacks.
4. Add the remote URL as a Claude Custom Connector and complete OAuth.
5. Confirm anonymous protected calls produce HTTP `401`, missing-permission
   calls produce HTTP `403`, and both include `WWW-Authenticate`.
6. Run the three listing prompts plus the prompt-injection and unrelated
   evaluation cases.
7. Test the current supported Claude web, Desktop, mobile, and Claude Code
   surfaces where available.
8. In Claude.ai, open **Admin Settings**, then **Connectors**, then
   **Submit Connector**.
9. Enter the listing, ownership, privacy, data-handling, support, and reviewer
   account details. The portal reads the live MCP tools from the server.
10. Submit the Connector. Do not make a separate Claude companion plugin a
    requirement.

## Submit The Cursor Plugin

1. Validate `cursor/mailrith` against Cursor's current plugin schema. The
   validator receives the schema URL; do not add an undeclared `$schema`
   property to the plugin manifest.
2. Install the plugin from a clean local or public-source checkout.
3. Complete OAuth and confirm the exact submitted tool catalog is available.
4. Run the draft, preflight, test, schedule, and activation evaluation cases.
5. Complete the Cursor publisher application and Marketplace terms.
6. Submit the reviewed package and request re-indexing only when needed.

## Roll Back A Bad Release

1. Stop marketplace promotion and notify support.
2. Disable the affected agent rollout using Mailrith's existing rollout
   controls if tool execution is unsafe.
3. Revoke affected OAuth authorizations when credentials may be exposed or
   mis-scoped.
4. Restore the last reviewed server and package artifacts.
5. Re-run authorization, tool-catalog, and consequential-action checks before
   reopening access.
6. Record the incident using request IDs and existing operational logs; do not
   add raw Subscriber payloads or tokens to the incident record.

Product Engineering owns the MCP server and package rollback. Security owns
credential or authorization incidents. Support owns reviewer and marketplace
communications. An authorized Mailrith owner owns final marketplace actions.
