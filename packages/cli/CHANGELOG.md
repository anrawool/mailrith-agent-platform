# Changelog

## Unreleased

- Make **Full Email Marketing Access** the default OAuth login profile while
  preserving explicit Reporting-profile and custom-scope logins.
- Add credential-free `operations search` and `operations describe` commands backed by the same bounded discovery contract as MCP.
- Treat a bounded collection page as a successful result and include its continuation cursor; only `--all` safety-limit exhaustion returns an incomplete result.

## 0.2.0 - 2026-07-24

- Use the final resource-permission contract and complete Work Profiles.
- Support browser-completed Subscriber import uploads and the centralized Live Actions permission.
- Surface exact missing permissions, recommended Work Profiles, and access-update links.
- Expose direct stable-ID retrieval and compact Subscriber import and export job lists.
- Expose Sender Identity discovery and Broadcast scheduling through the generated command contract.
- Expose secure browser-based email delivery setup, connection verification, and real test-email operations without accepting provider credentials.
- Show effective workspace capabilities and their actionable limitations.
- Expose Subscriber-aware previews and tests, evaluated Sequence and Automation journeys, and compact searchable collection results.
- Remove the pre-launch Agent Sandbox contract.
- Remove the pre-launch Agent Activity commands.

## 0.1.2 - 2026-07-24

- Report the published package version in CLI output and request headers.
- Correct the public-registry clean-install release gate.

## 0.1.1 - 2026-07-24

- Republish the CLI as part of the coordinated Agent Skill patch release.

## 0.1.0 - 2026-07-24

- Request the workspace and Subscriber read permissions required by the read-only starter.
- Execute operations directly when the credential has the required permission instead of requiring an additional `--yes` flag.
- Add OAuth and API-key authentication without secret output.
- Add bounded discovery, capabilities, Subscriber sync, Broadcast draft, preview, execution, progress, generic operation, and doctor commands.
- Add JSON output, request IDs, stable exit codes, idempotency support, and bounded cursor pagination.
