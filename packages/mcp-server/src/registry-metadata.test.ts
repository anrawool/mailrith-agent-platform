import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const readJson = async (relativePath: string) =>
  JSON.parse(
    await readFile(new URL(relativePath, import.meta.url), "utf8"),
  ) as Record<string, unknown>;

describe("Official MCP Registry metadata", () => {
  it("publishes the hosted server under the Mailrith domain namespace", async () => {
    const [registryMetadata, packageMetadata] = await Promise.all([
      readJson("../server.json"),
      readJson("../package.json"),
    ]);

    expect(registryMetadata).toMatchObject({
      $schema:
        "https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json",
      name: "com.mailrith/mailrith",
      title: "Mailrith Email Marketing",
      repository: {
        url: "https://github.com/anrawool/mailrith-agent-platform",
        source: "github",
        id: "1308747458",
        subfolder: "packages/mcp-server",
      },
      websiteUrl: "https://mailrith.com/developers/mcp",
      remotes: [
        {
          type: "streamable-http",
          url: "https://api.mailrith.com/mcp",
        },
      ],
      packages: [
        {
          registryType: "npm",
          identifier: "@mailrith/mcp-server",
          runtimeHint: "npx",
          transport: {
            type: "stdio",
          },
          environmentVariables: [
            {
              name: "MAILRITH_API_KEY",
              description: expect.any(String),
              isRequired: true,
              isSecret: true,
              format: "string",
            },
          ],
        },
      ],
    });
    expect(registryMetadata.version).toBe(packageMetadata.version);
    expect(packageMetadata.mcpName).toBe(registryMetadata.name);
    expect(
      (registryMetadata.packages as Array<{ version: string }>)[0]?.version,
    ).toBe(packageMetadata.version);
    expect(registryMetadata.description).toEqual(expect.any(String));
    expect((registryMetadata.description as string).length).toBeLessThanOrEqual(
      100,
    );
  });
});
