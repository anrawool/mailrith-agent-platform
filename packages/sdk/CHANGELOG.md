# Changelog

## Unreleased

- Add a locally generated request ID to API errors, prevent request headers
  from replacing authentication and correlation headers, and limit parsed
  recovery permissions to permissions in the generated Mailrith contract.

## 1.1.0 - 2026-08-17

- Regenerate operation discovery with exact Mailrith personalization-token
  guidance and consent-evidence timestamp requirements.
- Keep Tag and Custom Field operations available through their existing SDK
  methods while the submitted MCP profile exposes the three new focused tools.

## 1.0.2 - 2026-08-14

- Regenerate Broadcast, Sequence, and Automation update descriptions with
  schedule and running-status restoration guidance.

## 1.0.1 - 2026-07-31

- Distinguish relationship actions such as adding or removing a Tag from a
  Subscriber instead of misrouting them to Subscriber profile updates.
- Export a bounded shared operation-discovery index with common task-language intent matching and stable effect categories for MCP and CLI clients.

## 1.0.0 - 2026-07-26

- Regenerate the SDK from the Mailrith MCP 1.0 risk and submitted-profile contract without changing the direct API-key or OAuth client methods.

## 0.2.0 - 2026-07-24

- Use the final resource-permission contract and complete Work Profiles without action-scope aliases.
- Replace inline Subscriber import CSV bodies with short-lived, browser-completed upload sessions.
- Include the centralized Live Actions permission and actionable missing-permission details.
- Add direct Subscriber, Sender Identity, retained submission, import-job-list, and export-job-list methods with stable self links.
- Add Sender Identity listing and Broadcast scheduling methods.
- Add secure email delivery setup-session, verification, and idempotent real test-send methods without accepting or returning provider credentials.
- Make capability results describe only operations currently available to the authenticated credential and workspace.
- Add Sequence and Automation readiness, side-effect-free journey-preview, and bounded test-message methods.
- Add Subscriber-aware Template and double-opt-in previews, Subscriber-aware message tests, and evaluated Sequence and Automation journeys.
- Return compact, searchable collection summaries and keep complete resource definitions on individual GET methods.
- Describe omission-safe resource updates and remove the pre-launch Agent Sandbox contract.
- Remove the pre-launch Agent Activity methods.

## 0.1.2 - 2026-07-24

- Republish the generated TypeScript client with coordinated package version reporting and registry verification.

## 0.1.1 - 2026-07-24

- Republish the generated TypeScript client as part of the coordinated Agent Skill patch release.

## 0.1.0 - 2026-07-24

- Export the contract-generated scopes for the first read-only OAuth connection.
- Document the 20-subscription workspace limit for Webhook subscription creation.
- Regenerate the client for the simplified permission model and remove recommendation, reference-experiment, and generic compliance-event methods.
- Publish the first stable generated TypeScript SDK.
- Add all current public resources, request correlation, and idempotency.
