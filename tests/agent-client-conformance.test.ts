import { describe, expect, it } from "vitest";
import { connectorEndpointsAreCanonical } from "../scripts/agent-client-conformance";

describe("agent client endpoint conformance", () => {
  it("requires every active JSON endpoint field to be canonical", () => {
    expect(
      connectorEndpointsAreCanonical(
        "chatgpt",
        JSON.stringify({
          mcpServers: {
            mailrith: {
              url: "https://api.mailrith.com/mcp",
              oauth_resource: "https://api.mailrith.com/mcp",
            },
          },
        }),
      ),
    ).toBe(true);
    expect(
      connectorEndpointsAreCanonical(
        "chatgpt",
        JSON.stringify({
          mcpServers: {
            mailrith: {
              url: "https://different.example/mcp",
              oauth_resource: "https://api.mailrith.com/mcp",
            },
          },
        }),
      ),
    ).toBe(false);
  });

  it("rejects URL credentials, alternate paths, queries, and fragments", () => {
    for (const endpoint of [
      "https://user:secret@api.mailrith.com/mcp",
      "https://api.mailrith.com/other",
      "https://api.mailrith.com/mcp?next=1",
      "https://api.mailrith.com/mcp#fragment",
    ]) {
      expect(
        connectorEndpointsAreCanonical(
          "openai",
          JSON.stringify({ server_url: endpoint }),
        ),
      ).toBe(false);
    }
  });

  it("parses the exact Codex, n8n, and Pipedream endpoint assignments", () => {
    expect(
      connectorEndpointsAreCanonical(
        "codex",
        'url = "https://api.mailrith.com/mcp"',
      ),
    ).toBe(true);
    expect(
      connectorEndpointsAreCanonical(
        "n8n",
        JSON.stringify({ url: "https://api.mailrith.com/v1/capabilities" }),
      ),
    ).toBe(true);
    expect(
      connectorEndpointsAreCanonical(
        "pipedream",
        'url: "https://api.mailrith.com/v1/capabilities",',
      ),
    ).toBe(true);
  });
});
