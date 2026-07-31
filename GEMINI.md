# Mailrith

Use the Mailrith MCP server and the `mailrith-email-marketing` skill for
Mailrith email marketing work.

- Connect through OAuth and choose the intended Mailrith workspace.
- Read the connected workspace and available permissions before taking action.
- Prefer reads, drafts, previews, and preflight checks before live changes.
- Ask for confirmation before scheduling or sending a Broadcast, activating a
  Sequence or Automation, changing Subscriber sending eligibility, deleting
  data, or taking another live action.
- Keep Subscriber data and tool results bounded.
- Report what changed, the resulting status, and any request or resource IDs.

The extension uses only the official endpoint:
`https://api.mailrith.com/mcp`.
