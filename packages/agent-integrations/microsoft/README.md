# Microsoft MCP Certification Package

This folder prepares Mailrith for Microsoft MCP server certification through
the **Apps and Agents for M365 and Copilot** offer type in Partner Center.

The committed files contain no OAuth client secret, access token, reviewer
password, or Azure tenant identifier.

## Package Contents

- `manifest.template.json`: Microsoft 365 app manifest with two required
  deployment placeholders.
- `mcptools.json`: generated snapshot matching Mailrith's submitted MCP
  `tools/list` catalog.
- `intro.md`: setup, usage, safety, support, and limitations.
- `Color.png`: 192 by 192 pixel color icon.
- `Outline.png`: 32 by 32 pixel transparent outline icon.
- `assets/Color.svg` and `assets/Outline.svg`: editable source icons.

## Required Owner Setup

Before rendering and submitting the final package:

1. Complete business verification in Microsoft Partner Center.
2. Enroll the verified publisher in the Microsoft 365 and Copilot program.
3. Create an Azure Key Vault for the certification credentials.
4. Register a confidential Mailrith OAuth client using the callback URL
   supplied by Microsoft's submission flow.
5. Store these case-sensitive secrets in the Key Vault:
   `ClientId`, `ClientSecret`, `AuthorizationUrl`, `TokenUrl`, `RefreshUrl`,
   and `Scopes`.
6. Grant the Microsoft certification service principal
   `8e91e74f-afe9-41cd-8c3f-17a9562a74ea` permission to read the secrets.
7. Replace `__MICROSOFT_APP_ID__` with the Partner Center app ID.
8. Replace `__MICROSOFT_KEY_VAULT_URI__` with the Key Vault URI.
9. Save the rendered file as `manifest.json`.
10. Validate the package in the Microsoft 365 Developer Portal before
    uploading it to Partner Center.

Use these public OAuth endpoints:

- Authorization: `https://api.mailrith.com/oauth/authorize`
- Token and refresh: `https://api.mailrith.com/oauth/token`

Do not commit the rendered tenant-specific manifest or any Key Vault secret.
