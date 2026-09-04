# Mailrith CLI

Use Mailrith from a terminal or non-interactive agent runtime without building raw HTTP requests.

```bash
npx @mailrith/cli auth login
npx @mailrith/cli capabilities --json
npx @mailrith/cli operations search "schedule the newsletter" --json
npx @mailrith/cli operations describe scheduleBroadcast --json
npx @mailrith/cli call subscribers list --query limit=10 --json
```

`auth login` uses the **Full Email Marketing Access** profile by default, so the
CLI can use every public email-marketing operation in the selected workspace
after the user approves access. This includes secure email delivery setup,
Subscriber imports and exports, and Outbound Webhooks. It does not grant
billing, team, account-security, credential-reading, or internal
administration access.

Use a view-only connection when the workflow only needs reporting:

```bash
npx @mailrith/cli auth login --profile reporting
```

Repeat `--scope` to request an exact custom permission set. Explicit scopes
take precedence over `--profile`.

Every Work Profile shown by Mailrith OAuth is accepted by `--profile`; run
`npx @mailrith/cli --help` to list their stable keys.

The CLI is generated-SDK based. It keeps saved credentials in a mode-`0600` configuration file, never prints API keys, refresh tokens, or access tokens, and bounds automatic pagination.

A saved credential stays bound to the Mailrith API URL selected during login or
API-key setup. To use another API URL, save a credential for that URL or provide
a credential through the process environment. This prevents an accidental URL
override from sending a saved credential to another service.

Operation search and schema inspection do not require a credential or a
network request. Search uses the same bounded, in-memory intent catalog as the
MCP server. `operations describe` returns only the selected operation's exact
input schema and loads the larger contract only for that
explicit command; add `--include-output-schema` only when the response
contract is also needed.

See [Mailrith Developer Docs](https://mailrith.com/developers) for OAuth, safety, workflow, and configuration guidance.

## Fixing Failed Commands

Known errors explain what needs attention, such as a missing Subscriber ID,
an invalid email address, or a shared connection that must be changed in
Mailrith. Unexpected server details and credentials stay hidden.

Commands using `--body-file` explain when a file is missing, the location is a
folder or invalid path, or access permissions prevent reading it. These exit
with code `2`; fix the file location or permissions before trying again.
File paths and file contents are not included in error output. Unexpected
storage failures use `request_file_read_failed` and exit with code `8`.

With `--body-file -`, the CLI reads JSON from standard input. If the pipe fails,
check the command supplying that JSON. Files and piped input must contain valid
JSON and stay within the existing 1 MiB limit.

If request fields need correcting, the CLI prints an `operations describe`
command for that action. Run it to see the required fields and allowed values.
With `--json`, this command appears in `error.details.help_command`. Known
API errors keep their specific `error.code`; unknown errors use a general code.
Keep the request ID when asking for help with a failed API request.

An invalid request exits with code `2`; correct its fields before trying again.
Missing credentials exit with code `3`. Permission, missing-resource, conflict,
rate-limit and temporary failures retain their separate exit codes.

For maintainers: keep the shared error catalog in `src/api-errors.ts` aligned
with public API error codes. Add only locally written guidance or exact,
reviewed validation messages. Never pass through arbitrary server text or
match only part of a message. Error details must come from trusted local
values or the existing permission-recovery allowlist.

## Official Builds And Forks

Modified public versions must use distinct package and service names and
clearly say that they are unofficial. See the
[Mailrith Trademark And Unofficial Fork Policy](https://github.com/anrawool/mailrith-agent-platform/blob/main/TRADEMARKS.md).
