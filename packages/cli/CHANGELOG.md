# Changelog

## 0.1.2 - 2026-07-24

- Report the published package version in CLI output and request headers.
- Correct the public-registry clean-install release gate.

## 0.1.1 - 2026-07-24

- Republish the CLI as part of the coordinated Agent Skill patch release.

## 0.1.0 - 2026-07-24

- Request the workspace and Subscriber read permissions required by the read-only starter.
- Execute operations directly when the credential has the required permission instead of requiring an additional `--yes` flag.
- Add OAuth and API-key authentication without secret output.
- Add bounded discovery, capabilities, Subscriber sync, Broadcast draft, preview, execution, activity, progress, generic operation, and doctor commands.
- Add JSON output, request IDs, stable exit codes, idempotency support, and bounded cursor pagination.
