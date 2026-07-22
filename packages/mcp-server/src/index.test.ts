import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { publicApiScopeKeys } from "@mailrith/public-api";
import { MailrithApiError } from "@mailrith/sdk";
import { describe, expect, it, vi } from "vitest";
import {
  createMailrithMcpToolDefinitions,
  handleMailrithMcpHttpRequest,
  mailrithMcpDefaultOAuthScopes,
  resolveMailrithMcpApiKey,
} from "./index";
import { createLazyMcpSchemaCache } from "./lazy-schema-cache";

describe("@mailrith/mcp-server", () => {
  it("compiles only requested schemas and caches them by operation", () => {
    const compile = vi.fn((schema: { name: string }) => ({
      compiledName: schema.name,
    }));
    const cache = createLazyMcpSchemaCache(compile);
    const firstTool = {
      operationId: "first",
      inputSchema: { name: "first-input" },
      outputSchema: { name: "first-output" },
    };

    expect(compile).not.toHaveBeenCalled();
    const firstSchemas = cache.get(firstTool);
    expect(compile).toHaveBeenCalledTimes(2);
    expect(firstSchemas).toEqual({
      inputSchema: { compiledName: "first-input" },
      outputSchema: { compiledName: "first-output" },
    });
    expect(cache.get(firstTool)).toBe(firstSchemas);
    expect(compile).toHaveBeenCalledTimes(2);

    expect(
      cache.get({
        operationId: "second",
        inputSchema: { name: "second-input" },
        outputSchema: { name: "second-output" },
      }),
    ).toEqual({
      inputSchema: { compiledName: "second-input" },
      outputSchema: { compiledName: "second-output" },
    });
    expect(compile).toHaveBeenCalledTimes(4);
  });

  it("builds snake_case MCP tools and translates request inputs into Mailrith SDK calls", async () => {
    const request = vi.fn().mockResolvedValue({ data: { id: "subscriber-1" } });
    const tools = createMailrithMcpToolDefinitions({
      request,
    } as never);
    const listTool = tools.find((candidate) => candidate.name === "subscribers_list");
    const subscriberUpdateTool = tools.find(
      (candidate) => candidate.name === "subscribers_update",
    );
    const subscriberAddToSequenceTool = tools.find(
      (candidate) => candidate.name === "subscribers_add_to_sequence",
    );
    const subscriberUpsertTool = tools.find(
      (candidate) => candidate.name === "subscribers_upsert",
    );
    const updateTool = tools.find((candidate) => candidate.name === "broadcasts_update");
    const landingPageCreateTool = tools.find(
      (candidate) => candidate.name === "landing_pages_create",
    );
    const webhookCreateTool = tools.find(
      (candidate) => candidate.name === "webhook_subscriptions_create",
    );

    expect(listTool).toBeDefined();
    expect(subscriberUpsertTool).toBeDefined();
    expect(subscriberUpsertTool?.description).toContain("create_only is true");
    expect(subscriberUpdateTool).toBeDefined();
    expect(subscriberUpdateTool?.description).toContain(
      "Calls PATCH /v1/subscribers/{subscriber_id}.",
    );
    expect(subscriberUpdateTool?.description).toContain("subscribers:profile");
    expect(subscriberAddToSequenceTool).toBeDefined();
    expect(subscriberAddToSequenceTool?.description).toContain(
      "Calls PUT /v1/subscribers/{subscriber_id}/sequences/{sequence_id}.",
    );
    expect(updateTool).toBeDefined();
    expect(updateTool?.description).toContain("call this tool with mode=plan");
    expect(landingPageCreateTool?.description).toContain(
      "landing_pages:configure",
    );
    expect(webhookCreateTool?.description).toContain(
      "Additional webhook event scopes depend on body.event_patterns",
    );

    await listTool?.invoke({
      email: "ada@example.com",
      limit: 5,
      starting_after: "subscriber-123",
      tag_id: "tag-vip",
      sequence_id: "sequence-welcome",
    });

    const result = await updateTool?.invoke({
      broadcast_id: "broadcast-123",
      mode: "plan",
      action_id: "act_123",
      approval_token: "mat_secret",
      approval_return_url: "https://agent.example/done",
      body: {
        subject: "Updated subject",
        body_document: { type: "doc" },
      },
    });
    await subscriberUpdateTool?.invoke({
      subscriber_id: "subscriber-123",
      body: { email: "ada-updated@example.com", name: "Ada Updated" },
    });
    await subscriberUpsertTool?.invoke({
      body: { email: "ada@example.com", create_only: true },
      idempotency_key: "subscriber-create-1",
    });
    await subscriberAddToSequenceTool?.invoke({
      subscriber_id: "subscriber-123",
      sequence_id: "sequence-welcome",
    });

    expect(result?.structuredContent).toMatchObject({
      operation_id: "updateBroadcast",
      request_id: expect.stringMatching(/^mcp_[0-9a-f-]{36}$/),
      response: { data: { id: "subscriber-1" } },
    });
    expect(result?.content[0]?.text).toBe(
      JSON.stringify(result?.structuredContent, null, 2),
    );
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        operationId: "listSubscribers",
      }),
      {
        path: undefined,
        query: {
          email: "ada@example.com",
          limit: 5,
          starting_after: "subscriber-123",
          tag_id: "tag-vip",
          sequence_id: "sequence-welcome",
        },
        body: undefined,
        idempotencyKey: undefined,
      },
    );
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        operationId: "updateBroadcast",
      }),
      {
        path: { broadcast_id: "broadcast-123" },
        query: { mode: "plan" },
        body: {
          subject: "Updated subject",
          body_document: { type: "doc" },
        },
        headers: {
          "X-Mailrith-Action-Id": "act_123",
          "X-Mailrith-Approval-Return-Url": "https://agent.example/done",
          "X-Mailrith-Approval-Token": "mat_secret",
        },
        idempotencyKey: undefined,
      },
    );
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        operationId: "updateSubscriber",
      }),
      {
        path: { subscriber_id: "subscriber-123" },
        query: undefined,
        body: { email: "ada-updated@example.com", name: "Ada Updated" },
        idempotencyKey: undefined,
      },
    );
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        operationId: "upsertSubscriber",
      }),
      {
        path: undefined,
        query: undefined,
        body: { email: "ada@example.com", create_only: true },
        idempotencyKey: "subscriber-create-1",
      },
    );
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        operationId: "addSubscriberSequence",
      }),
      {
        path: {
          subscriber_id: "subscriber-123",
          sequence_id: "sequence-welcome",
        },
        query: undefined,
        body: undefined,
        idempotencyKey: undefined,
      },
    );
  });

  it("validates exact request bodies, enums, nested values, and unknown tool arguments", () => {
    const tools = createMailrithMcpToolDefinitions({ request: vi.fn() } as never);
    const upsert = tools.find(
      (candidate) => candidate.name === "subscribers_upsert",
    );

    expect(upsert).toBeDefined();
    expect(
      upsert?.inputSchema.safeParse({
        body: {
          email: "ada@example.com",
          status: "Active",
          custom_fields: { cf_company: "Analytical Engines" },
        },
      }).success,
    ).toBe(true);
    expect(upsert?.inputSchema.safeParse({}).success).toBe(false);
    expect(
      upsert?.inputSchema.safeParse({
        body: { email: "ada@example.com", status: "Invalid" },
      }).success,
    ).toBe(false);
    expect(
      upsert?.inputSchema.safeParse({
        body: { email: "ada@example.com" },
        unexpected: true,
      }).success,
    ).toBe(false);
  });

  it("filters tools by both granted scopes and selected toolsets", () => {
    const client = { request: vi.fn() } as never;
    const subscriberTools = createMailrithMcpToolDefinitions(client, {
      grantedScopes: [
        "workspace:read",
        "subscribers:read",
        "subscribers:profile",
      ],
      enabledToolsets: ["subscriber_sync"],
    }).map((tool) => tool.name);

    expect(subscriberTools).toEqual(
      expect.arrayContaining([
        "discovery_get_metadata",
        "workspace_get",
        "subscribers_list",
        "subscribers_update",
      ]),
    );
    expect(subscriberTools).not.toEqual(
      expect.arrayContaining([
        "subscribers_update_status",
        "broadcasts_list",
        "broadcasts_send",
      ]),
    );

    const campaignSendTools = createMailrithMcpToolDefinitions(client, {
      grantedScopes: [
        "workspace:read",
        "broadcasts:read",
        "broadcasts:test",
        "broadcasts:send",
      ],
      enabledToolsets: ["campaign_sending"],
    }).map((tool) => tool.name);
    expect(campaignSendTools).toEqual(
      expect.arrayContaining([
        "broadcasts_list",
        "broadcasts_send_test",
        "broadcasts_send",
      ]),
    );
    expect(campaignSendTools).not.toContain("broadcasts_create");
  });

  it("returns stable machine-readable errors with request correlation", async () => {
    const statuses = [
      [400, "validation"],
      [401, "authentication"],
      [403, "permission"],
      [409, "conflict"],
      [429, "rate_limit"],
      [503, "transient"],
    ] as const;

    for (const [status, category] of statuses) {
      const request = vi.fn().mockRejectedValue(
        new MailrithApiError({
          status,
          message: `Failure ${status}`,
          code: `failure_${status}`,
          responseBody: { intentionally: "not copied into MCP errors" },
        }),
      );
      const tool = createMailrithMcpToolDefinitions({ request } as never).find(
        (candidate) => candidate.name === "subscribers_list",
      );
      const result = await tool?.invoke({ limit: 1 });

      expect(result).toMatchObject({
        isError: true,
        structuredContent: {
          operation_id: "listSubscribers",
          request_id: expect.stringMatching(/^mcp_[0-9a-f-]{36}$/),
          error: {
            category,
            status,
            code: `failure_${status}`,
          },
        },
      });
      expect(
        tool?.outputSchema.safeParse(result?.structuredContent).success,
      ).toBe(true);
      expect(result?.content[0]?.text).not.toContain("intentionally");
    }

    const approvalTool = createMailrithMcpToolDefinitions({
      request: vi.fn().mockRejectedValue(
        new MailrithApiError({
          status: 403,
          message: "Approval required",
          code: "approval_required",
          responseBody: null,
        }),
      ),
    } as never).find((candidate) => candidate.name === "broadcasts_send");
    await expect(approvalTool?.invoke({ broadcast_id: "broadcast-1" })).resolves
      .toMatchObject({
        structuredContent: { error: { category: "approval" } },
      });
  });

  it("keeps durable GA tool names and operation-specific annotations", () => {
    const tools = createMailrithMcpToolDefinitions({ request: vi.fn() } as never);
    const names = tools.map((tool) => tool.name);

    expect(names).toEqual(
      expect.arrayContaining([
        "subscribers_update_status",
        "sequences_update_status",
        "automations_update_status",
        "broadcasts_get_send_progress",
        "broadcasts_preflight",
        "webhook_subscriptions_rotate_secret",
      ]),
    );
    expect(names).not.toEqual(
      expect.arrayContaining([
        "subscribers_update_subscriber_status",
        "broadcasts_preflight_broadcast",
      ]),
    );
    expect(
      tools.find((tool) => tool.name === "broadcasts_send")?.annotations,
    ).toMatchObject({
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    });
    expect(
      tools.find((tool) => tool.name === "broadcasts_delete")?.annotations,
    ).toMatchObject({
      destructiveHint: true,
      idempotentHint: true,
    });
    expect(
      tools.find((tool) => tool.name === "broadcasts_get_send_progress")
        ?.description,
    ).toContain("stop after 15 minutes");
  });

  it("routes representative read, draft, test, send, bulk, delete, and admin operations through MCP tools", async () => {
    const request = vi.fn().mockResolvedValue({ data: { accepted: true } });
    const tools = createMailrithMcpToolDefinitions({ request } as never);
    const invoke = async (name: string, args: Record<string, unknown> = {}) => {
      const tool = tools.find((candidate) => candidate.name === name);
      expect(tool, `Expected ${name} to be registered`).toBeDefined();
      return tool?.invoke(args);
    };

    await invoke("subscribers_list", { limit: 1 });
    await invoke("broadcasts_update", {
      broadcast_id: "broadcast-1",
      body: { subject: "Draft subject", body_document: { type: "doc" } },
    });
    await invoke("broadcasts_send_test", {
      broadcast_id: "broadcast-1",
      body: { recipient: "reviewer@example.com" },
    });
    await invoke("broadcasts_send", { broadcast_id: "broadcast-1" });
    await invoke("jobs_create_import", {
      body: {
        csv_text: "email\nada@example.com",
        mappings: [{ csv_column: "email", field: { type: "email" } }],
      },
    });
    await invoke("custom_fields_delete", { custom_field_id: "field-1" });
    await invoke("webhook_subscriptions_rotate_secret", {
      webhook_subscription_id: "webhook-1",
    });

    expect(
      request.mock.calls.map(([operation]) => operation.operationId),
    ).toEqual([
      "listSubscribers",
      "updateBroadcast",
      "testBroadcast",
      "sendBroadcast",
      "createSubscriberImportJob",
      "deleteCustomField",
      "rotateWebhookSubscriptionSecret",
    ]);
  });

  it("resolves API keys from Bearer auth only", () => {
    expect(
      resolveMailrithMcpApiKey(
        new Request("https://api.mailrith.com/mcp", {
          headers: {
            authorization: "Bearer mrk_header_secret",
          },
        }),
      ),
    ).toBe("mrk_header_secret");

    expect(
      resolveMailrithMcpApiKey(
        new Request("https://api.mailrith.com/mcp?api_key=mrk_query_secret"),
      ),
    ).toBeUndefined();
  });

  it("serves the official streamable HTTP MCP endpoint with tool listing and calls", async () => {
    let subscriberRequestCount = 0;
    const mailrithApiFetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = input instanceof Request ? new Request(input, init) : new Request(input, init);
      const url = new URL(request.url);

      if (url.pathname === "/v1/capabilities") {
        return new Response(
          JSON.stringify({
            data: {
              credential: {
                scopes: [
                  "workspace:read",
                  "subscribers:read",
                  "broadcasts:draft",
                  "landing_pages:configure",
                ],
              },
            },
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        );
      }

      if (url.pathname === "/v1/subscribers") {
        subscriberRequestCount += 1;
        if (subscriberRequestCount === 2) {
          return new Response(JSON.stringify({ data: [] }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }
        return new Response(
          JSON.stringify({
            data: [
              {
                id: "subscriber-1",
                email: "ada@example.com",
                name: "Ada Lovelace",
                status: "Active",
                country: "US",
                subscribed_at: "2026-07-21T12:00:00.000Z",
                tags: [],
                sequence_ids: [],
                custom_fields: {},
                created_at: "2026-07-21T12:00:00.000Z",
                updated_at: "2026-07-21T12:00:00.000Z",
              },
            ],
            pagination: { has_more: false, next_cursor: null },
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        );
      }

      return new Response(
        JSON.stringify({
          version: "v1",
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      );
    });

    const mcpSessionHeaders: Array<string | null> = [];
    const mcpFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = input instanceof Request ? new Request(input, init) : new Request(input, init);
      request.headers.set("authorization", "Bearer mrk_secret");
      request.headers.set(
        "mailrith-mcp-toolsets",
        "subscriber_sync,campaign_drafting",
      );
      mcpSessionHeaders.push(request.headers.get("mcp-session-id"));
      return handleMailrithMcpHttpRequest(request, {
        baseUrl: "https://api.mailrith.com",
        fetch: mailrithApiFetch as unknown as typeof fetch,
      });
    };

    const transport = new StreamableHTTPClientTransport(
      new URL("https://mailrith.test/mcp"),
      {
        fetch: mcpFetch as never,
      },
    );
    const client = new Client(
      { name: "mailrith-mcp-test", version: "1.0.0" },
      { capabilities: {} },
    );

    await client.connect(transport);

    const tools = await client.listTools();
    expect(tools.tools.map((tool) => tool.name)).toEqual(
      expect.arrayContaining([
        "discovery_get_metadata",
        "subscribers_list",
        "broadcasts_create",
      ]),
    );
    expect(tools.tools.map((tool) => tool.name)).not.toEqual(
      expect.arrayContaining(["broadcasts_send", "landing_pages_create"]),
    );
    const broadcastCreate = tools.tools.find(
      (tool) => tool.name === "broadcasts_create",
    );
    expect(broadcastCreate?.inputSchema).toMatchObject({
      type: "object",
      required: expect.arrayContaining(["body"]),
      properties: { body: expect.any(Object) },
    });
    expect(broadcastCreate?.outputSchema).toMatchObject({
      type: "object",
      required: ["operation_id", "request_id"],
      anyOf: [
        { required: ["response"] },
        { required: ["error"] },
      ],
    });
    expect(broadcastCreate?._meta).toMatchObject({
      "mailrith/operationId": "createBroadcast",
      "mailrith/risk": "draft",
      "mailrith/approvalPolicy": "policy",
    });

    const result = await client.callTool({
      name: "subscribers_list",
      arguments: { limit: 1 },
    });

    expect(mailrithApiFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        href: "https://api.mailrith.com/v1/subscribers?limit=1",
      }),
      expect.objectContaining({
        method: "GET",
      }),
    );
    expect(result.structuredContent).toMatchObject({
      operation_id: "listSubscribers",
      request_id: expect.stringMatching(/^mcp_[0-9a-f-]{36}$/),
      response: {
        data: [
          expect.objectContaining({
            id: "subscriber-1",
            email: "ada@example.com",
          }),
        ],
        pagination: { has_more: false, next_cursor: null },
      },
    });
    expect(mcpSessionHeaders.every((value) => value === null)).toBe(true);

    const invalidOutput = await client.callTool({
      name: "subscribers_list",
      arguments: { limit: 1 },
    });
    expect(invalidOutput).toMatchObject({
      isError: true,
      structuredContent: {
        operation_id: "listSubscribers",
        request_id: expect.stringMatching(/^mcp_[0-9a-f-]{36}$/),
        error: {
          category: "transient",
          code: "invalid_tool_output",
          retryable: false,
        },
      },
    });

    await transport.terminateSession();
    await client.close();
  });

  it("routes representative risk classes through the hosted MCP transport", async () => {
    const mailrithApiFetch = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const request =
          input instanceof Request
            ? new Request(input, init)
            : new Request(input, init);
        if (new URL(request.url).pathname === "/v1/capabilities") {
          return new Response(
            JSON.stringify({
              data: { credential: { scopes: publicApiScopeKeys } },
            }),
            { status: 200, headers: { "content-type": "application/json" } },
          );
        }
        return new Response(
          JSON.stringify({
            error: {
              type: "invalid_request",
              code: "integration_stub",
              message: "The operation reached the API integration boundary.",
            },
          }),
          { status: 400, headers: { "content-type": "application/json" } },
        );
      },
    );
    const mcpFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const request =
        input instanceof Request
          ? new Request(input, init)
          : new Request(input, init);
      request.headers.set("authorization", "Bearer mrk_full_access");
      request.headers.set("mailrith-mcp-toolsets", "administration");
      return handleMailrithMcpHttpRequest(request, {
        baseUrl: "https://api.mailrith.com",
        fetch: mailrithApiFetch as unknown as typeof fetch,
      });
    };
    const transport = new StreamableHTTPClientTransport(
      new URL("https://mailrith.test/mcp"),
      { fetch: mcpFetch as never },
    );
    const client = new Client(
      { name: "mailrith-risk-integration-test", version: "1.0.0" },
      { capabilities: {} },
    );
    await client.connect(transport);

    const apiOperationCallCount = () =>
      mailrithApiFetch.mock.calls.filter(([input, init]) => {
        const request =
          input instanceof Request
            ? new Request(input, init)
            : new Request(input, init);
        return new URL(request.url).pathname !== "/v1/capabilities";
      }).length;
    const callsBeforeInvalidInput = apiOperationCallCount();
    const invalidInput = await client.callTool({
      name: "subscribers_upsert",
      arguments: {
        body: { email: "ada@example.com", status: "NotAStatus" },
      },
    });
    expect(invalidInput).toMatchObject({
      isError: true,
      structuredContent: {
        operation_id: "upsertSubscriber",
        request_id: expect.stringMatching(/^mcp_[0-9a-f-]{36}$/),
        error: {
          category: "validation",
          code: "invalid_tool_arguments",
          retryable: false,
        },
      },
    });
    expect(apiOperationCallCount()).toBe(callsBeforeInvalidInput);

    const calls = [
      ["subscribers_list", { limit: 1 }, "listSubscribers"],
      [
        "broadcasts_update",
        {
          broadcast_id: "broadcast-1",
          body: { subject: "Draft subject", body_document: { type: "doc" } },
        },
        "updateBroadcast",
      ],
      [
        "broadcasts_send_test",
        {
          broadcast_id: "broadcast-1",
          body: { recipient: "reviewer@example.com" },
        },
        "testBroadcast",
      ],
      ["broadcasts_send", { broadcast_id: "broadcast-1" }, "sendBroadcast"],
      [
        "jobs_create_import",
        {
          body: {
            csv_text: "email\nada@example.com",
            mappings: [
              { csv_column: "email", field: { type: "email" } },
            ],
          },
        },
        "createSubscriberImportJob",
      ],
      [
        "custom_fields_delete",
        { custom_field_id: "field-1" },
        "deleteCustomField",
      ],
      [
        "webhook_subscriptions_rotate_secret",
        { webhook_subscription_id: "webhook-1" },
        "rotateWebhookSubscriptionSecret",
      ],
    ] as const;

    for (const [name, args, operationId] of calls) {
      const result = await client.callTool({ name, arguments: args });
      expect(result).toMatchObject({
        isError: true,
        structuredContent: {
          operation_id: operationId,
          request_id: expect.stringMatching(/^mcp_[0-9a-f-]{36}$/),
          error: { category: "validation", code: "integration_stub" },
        },
      });
    }

    await transport.terminateSession();
    await client.close();
  });

  it("challenges unauthenticated hosted MCP requests with OAuth resource metadata", async () => {
    const response = await handleMailrithMcpHttpRequest(
      new Request("https://mailrith.test/mcp", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "initialize",
          params: {},
        }),
      }),
      {
        baseUrl: "https://api.mailrith.com",
      },
    );

    expect(response.status).toBe(401);
    expect(response.headers.get("www-authenticate")).toContain(
      'resource_metadata="https://api.mailrith.com/.well-known/oauth-protected-resource/mcp"',
    );
    const scope = response.headers
      .get("www-authenticate")
      ?.match(/scope="([^"]+)"/)?.[1]
      ?.split(" ");
    expect(scope).toEqual(mailrithMcpDefaultOAuthScopes);
    expect(scope).toEqual(["workspace:read"]);
  });

  it("rejects unknown hosted MCP toolsets before creating a server", async () => {
    const response = await handleMailrithMcpHttpRequest(
      new Request("https://mailrith.test/mcp", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "mailrith-mcp-toolsets": "reporting,not-a-toolset",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "tools/list",
        }),
      }),
      { baseUrl: "https://api.mailrith.com" },
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: -32602,
        message: "Unknown Mailrith MCP toolset: not-a-toolset.",
      },
    });
  });

  it("returns an MCP scope challenge before calling tools with insufficient credentials", async () => {
    const mailrithApiFetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = input instanceof Request ? new Request(input, init) : new Request(input, init);
      const url = new URL(request.url);

      if (url.pathname === "/v1/capabilities") {
        return new Response(
          JSON.stringify({
            data: {
              credential: {
                scopes: ["workspace:read"],
              },
            },
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        );
      }

      return new Response(JSON.stringify({ data: [] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    });

    const response = await handleMailrithMcpHttpRequest(
      new Request("https://mailrith.test/mcp", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer mrat_token",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "tools/call",
          params: {
            name: "subscribers_list",
            arguments: {},
          },
        }),
      }),
      {
        baseUrl: "https://api.mailrith.com",
        fetch: mailrithApiFetch as unknown as typeof fetch,
      },
    );

    expect(response.status).toBe(403);
    expect(response.headers.get("www-authenticate")).toContain(
      'error="insufficient_scope"',
    );
    expect(response.headers.get("www-authenticate")).toContain(
      'scope="subscribers:read"',
    );
    expect(mailrithApiFetch).toHaveBeenCalledTimes(1);
  });

  it("adds payload-specific Subscriber scopes to hosted MCP challenges", async () => {
    const mailrithApiFetch = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const request =
          input instanceof Request
            ? new Request(input, init)
            : new Request(input, init);
        const url = new URL(request.url);

        if (url.pathname === "/v1/capabilities") {
          return new Response(
            JSON.stringify({
              data: {
                credential: {
                  scopes: [
                    "subscribers:profile",
                  ],
                },
              },
            }),
            {
              status: 200,
              headers: { "content-type": "application/json" },
            },
          );
        }

        return new Response(JSON.stringify({ data: [] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
    );

    const response = await handleMailrithMcpHttpRequest(
      new Request("https://mailrith.test/mcp", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer mrat_token",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "tools/call",
          params: {
            name: "subscribers_upsert",
            arguments: {
              body: {
                email: "subscriber@example.com",
                status: "Active",
                existing_tag_ids: ["tag-vip"],
              },
            },
          },
        }),
      }),
      {
        baseUrl: "https://api.mailrith.com",
        fetch: mailrithApiFetch as unknown as typeof fetch,
      },
    );

    expect(response.status).toBe(403);
    expect(response.headers.get("www-authenticate")).toContain(
      'scope="subscribers:eligibility consent:write subscribers:targeting"',
    );
    expect(mailrithApiFetch).toHaveBeenCalledTimes(1);
  });

  it("adds webhook event pattern scopes to hosted MCP scope challenges", async () => {
    const mailrithApiFetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = input instanceof Request ? new Request(input, init) : new Request(input, init);
      const url = new URL(request.url);

      if (url.pathname === "/v1/capabilities") {
        return new Response(
          JSON.stringify({
            data: {
              credential: {
                scopes: ["webhook_subscriptions:configure"],
              },
            },
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        );
      }

      return new Response(JSON.stringify({ data: [] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    });

    const response = await handleMailrithMcpHttpRequest(
      new Request("https://mailrith.test/mcp", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer mrat_token",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "tools/call",
          params: {
            name: "webhook_subscriptions_create",
            arguments: {
              body: {
                name: "Forms",
                url: "https://example.com/webhooks/forms",
                event_patterns: ["form.submitted"],
              },
            },
          },
        }),
      }),
      {
        baseUrl: "https://api.mailrith.com",
        fetch: mailrithApiFetch as unknown as typeof fetch,
      },
    );

    expect(response.status).toBe(403);
    expect(response.headers.get("www-authenticate")).toContain(
      'scope="subscribers:read forms:read"',
    );
    expect(mailrithApiFetch).toHaveBeenCalledTimes(1);
  });

  it("uses wildcard event scopes when hosted MCP updates a webhook without event patterns", async () => {
    const mailrithApiFetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = input instanceof Request ? new Request(input, init) : new Request(input, init);
      const url = new URL(request.url);

      if (url.pathname === "/v1/capabilities") {
        return new Response(
          JSON.stringify({
            data: {
              credential: {
                scopes: ["webhook_subscriptions:configure"],
              },
            },
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        );
      }

      return new Response(JSON.stringify({ data: [] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    });

    const response = await handleMailrithMcpHttpRequest(
      new Request("https://mailrith.test/mcp", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer mrat_token",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "tools/call",
          params: {
            name: "webhook_subscriptions_update",
            arguments: {
              webhook_subscription_id: "webhook-subscription-1",
              body: {
                url: "https://example.com/webhooks/updated",
              },
            },
          },
        }),
      }),
      {
        baseUrl: "https://api.mailrith.com",
        fetch: mailrithApiFetch as unknown as typeof fetch,
      },
    );

    const challenge = response.headers.get("www-authenticate");
    expect(response.status).toBe(403);
    expect(challenge).toContain("subscribers:read");
    expect(challenge).toContain("forms:read");
    expect(challenge).toContain("landing_pages:read");
    expect(challenge).toContain("automations:read");
    expect(challenge).toContain("broadcasts:read");
    expect(mailrithApiFetch).toHaveBeenCalledTimes(1);
  });

  it("rejects oversized hosted MCP request bodies before JSON parsing", async () => {
    const response = await handleMailrithMcpHttpRequest(
      new Request("https://mailrith.test/mcp", {
        method: "POST",
        headers: {
          "content-length": String(1024 * 1024 + 1),
          "content-type": "application/json",
          authorization: "Bearer mrk_secret",
        },
        body: "{}",
      }),
    );

    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toMatchObject({
      error: {
        message: "Request body is too large.",
      },
    });
  });
});
