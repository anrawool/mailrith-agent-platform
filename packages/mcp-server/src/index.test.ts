import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { publicApiScopeKeys } from "@mailrith/public-api";
import { MailrithApiError, mailrithSdkResources } from "@mailrith/sdk";
import { describe, expect, it, vi } from "vitest";
import {
  createMcpCapabilityContextHeaders,
  createMailrithMcpCompactToolDefinitions,
  createMailrithMcpToolDefinitions,
  handleMailrithMcpHttpRequest,
  mailrithMcpStandardOAuthScopes,
  resolveMailrithMcpApiKey,
  resolveEnabledMcpToolsets,
} from "./index";
import { createLazyMcpSchemaCache } from "./lazy-schema-cache";

describe("@mailrith/mcp-server", () => {
  it("uses the canonical full-access profile for a standard connection", () => {
    expect(
      resolveEnabledMcpToolsets(
        new Request("https://api.mailrith.com/mcp"),
        undefined,
      ),
    ).toMatchObject({
      ok: true,
      toolsets: ["full_email_marketing_access"],
      challengeScopes: publicApiScopeKeys,
    });
  });

  it("forwards the active toolsets and read-only profile to capability discovery", () => {
    expect(
      createMcpCapabilityContextHeaders({
        enabledToolsets: ["reporting", "email_delivery_setup"],
        readOnly: true,
      }),
    ).toEqual({
      "mailrith-mcp-toolsets": "reporting,email_delivery_setup",
      "mailrith-mcp-read-only": "true",
    });
    expect(createMcpCapabilityContextHeaders({})).toEqual({});
  });

  it("keeps write operations discoverable but unavailable in read-only compact discovery", async () => {
    const tools = createMailrithMcpCompactToolDefinitions(
      { request: vi.fn() } as never,
      { readOnly: true },
    );
    const search = tools.find(
      (tool) => tool.name === "mailrith_search_operations",
    );

    const result = await search?.invoke({
      query: "create broadcast",
      limit: 25,
    });
    expect(result).toMatchObject({
      structuredContent: {
        response: {
          data: expect.arrayContaining([
            expect.objectContaining({
              operation_id: "createBroadcast",
              available: false,
              availability: "blocked",
              blocking_limitations: expect.arrayContaining([
                expect.objectContaining({
                  code: "mcp_read_only_filter_active",
                }),
              ]),
            }),
          ]),
        },
      },
    });
  });

  it("loads one output schema only when requested", async () => {
    const tools = createMailrithMcpCompactToolDefinitions({
      request: vi.fn(),
    } as never);
    const getOperation = tools.find(
      (tool) => tool.name === "mailrith_get_operation",
    );

    await expect(
      getOperation?.invoke({ operation_id: "createBroadcast" }),
    ).resolves.not.toMatchObject({
      structuredContent: {
        response: { output_schema: expect.anything() },
      },
    });
    await expect(
      getOperation?.invoke({
        operation_id: "createBroadcast",
        include_output_schema: true,
      }),
    ).resolves.toMatchObject({
      structuredContent: {
        response: {
          operation_id: "createBroadcast",
          output_schema: expect.objectContaining({ type: "object" }),
        },
      },
    });
  });

  it("explains toolset restrictions without allowing execution", async () => {
    const request = vi.fn();
    const tools = createMailrithMcpCompactToolDefinitions(
      { request } as never,
      {
        enabledToolsets: ["reporting"],
        capabilityContext: {
          workspace: { id: "workspace-1", name: "Test" },
          credentialType: "oauth_access_token",
          scopes: publicApiScopeKeys,
          effectiveOperationIds: null,
          limitations: [],
        },
      },
    );
    const getOperation = tools.find(
      (tool) => tool.name === "mailrith_get_operation",
    );
    const write = tools.find((tool) => tool.name === "mailrith_write");

    await expect(
      getOperation?.invoke({ operation_id: "createBroadcast" }),
    ).resolves.toMatchObject({
      structuredContent: {
        response: {
          operation_id: "createBroadcast",
          available: false,
          availability: "blocked",
          blocking_limitations: expect.arrayContaining([
            expect.objectContaining({
              code: "mcp_toolset_filter_active",
            }),
          ]),
        },
      },
    });
    await expect(
      write?.invoke({
        operation_id: "createBroadcast",
        arguments: { body: { name: "Draft" } },
      }),
    ).resolves.toMatchObject({
      isError: true,
      structuredContent: {
        error: { code: "toolset_restricted" },
      },
    });
    expect(request).not.toHaveBeenCalled();
  });

  it("routes every live-capable permanent delete through the delete tool", async () => {
    const request = vi.fn().mockResolvedValue({ data: { deleted: true } });
    const tools = createMailrithMcpCompactToolDefinitions({
      request,
    } as never);
    const getOperation = tools.find(
      (tool) => tool.name === "mailrith_get_operation",
    );
    const deleteTool = tools.find(
      (tool) => tool.name === "mailrith_delete",
    );
    const liveTool = tools.find((tool) => tool.name === "mailrith_live");
    const cases = [
      ["deleteForm", { form_id: "form-1" }],
      ["deleteLandingPage", { landing_page_id: "page-1" }],
      ["deleteMagicLink", { magic_link_id: "link-1" }],
      [
        "deleteWebhookSubscription",
        { webhook_subscription_id: "webhook-1" },
      ],
    ] as const;

    for (const [operationId, args] of cases) {
      await expect(
        getOperation?.invoke({ operation_id: operationId }),
      ).resolves.toMatchObject({
        structuredContent: {
          response: {
            operation_id: operationId,
            category: "delete",
            execution_tool: "mailrith_delete",
          },
        },
      });
      await expect(
        deleteTool?.invoke({
          operation_id: operationId,
          arguments: args,
        }),
      ).resolves.toMatchObject({
        structuredContent: { operation_id: operationId },
      });
      await expect(
        liveTool?.invoke({
          operation_id: operationId,
          arguments: args,
        }),
      ).resolves.toMatchObject({
        isError: true,
        structuredContent: {
          error: {
            code: "wrong_operation_tool",
            required_tool: "mailrith_delete",
          },
        },
      });
    }
  });

  it("reports effective workspace blockers in operation search and schemas", async () => {
    const request = vi.fn();
    const tools = createMailrithMcpCompactToolDefinitions(
      { request } as never,
      {
        grantedScopes: publicApiScopeKeys,
        capabilityContext: {
          workspace: { id: "workspace-1", name: "Test" },
          credentialType: "workspace_api_key",
          scopes: publicApiScopeKeys,
          effectiveOperationIds: ["listBroadcasts", "getBroadcast"],
          limitations: [
            {
              code: "email_delivery_connection_missing",
              message:
                "Creation operations that can send email are omitted until an email delivery connection is set up.",
              setupUrl:
                "https://app.mailrith.test/email-delivery-connections?workspace=workspace-1",
            },
          ],
        },
      },
    );
    const search = tools.find(
      (tool) => tool.name === "mailrith_search_operations",
    );
    const getOperation = tools.find(
      (tool) => tool.name === "mailrith_get_operation",
    );

    const searchResult = await search?.invoke({
      query: "draft a newsletter",
      limit: 3,
    });
    const searchResponse = searchResult?.structuredContent?.response as {
      data?: Array<Record<string, unknown>>;
    };
    expect(
      searchResponse.data?.find(
        (operation) => operation.operation_id === "createBroadcast",
      ),
    ).toMatchObject({
      available: false,
      availability: "blocked",
      blocking_limitations: [
        {
          code: "email_delivery_connection_missing",
          setup_url:
            "https://app.mailrith.test/email-delivery-connections?workspace=workspace-1",
        },
      ],
    });
    await expect(
      getOperation?.invoke({ operation_id: "createBroadcast" }),
    ).resolves.toMatchObject({
      structuredContent: {
        response: {
          available: false,
          availability: "blocked",
        },
      },
    });
    expect(request).not.toHaveBeenCalled();
  });

  it("uses the effective capability response in connection diagnostics", async () => {
    const request = vi.fn(async (operation: { operationId: string }) => {
      if (operation.operationId !== "getPublicApiCapabilities") {
        throw new Error("Unexpected operation.");
      }
      return {
        data: {
          workspace: { id: "workspace-1", name: "Test" },
          credential: {
            type: "workspace_api_key",
            scopes: publicApiScopeKeys,
          },
          resources: [
            {
              key: "broadcasts",
              operations: [
                { operation_id: "listBroadcasts" },
                { operation_id: "getBroadcast" },
              ],
            },
          ],
          limitations: [
            {
              code: "email_delivery_connection_disabled",
              message:
                "Creation operations that can send email are omitted until an email delivery connection is enabled.",
              setup_url:
                "https://app.mailrith.test/email-delivery-connections?workspace=workspace-1",
            },
          ],
        },
      };
    });
    const check = createMailrithMcpCompactToolDefinitions({
      request,
    } as never).find(
      (tool) => tool.name === "mailrith_check_connection",
    );

    await expect(
      check?.invoke({ operation_id: "createBroadcast" }),
    ).resolves.toMatchObject({
      structuredContent: {
        response: {
          connected: true,
          operation: {
            operation_id: "createBroadcast",
            available: false,
            availability: "blocked",
            blocking_limitations: [
              { code: "email_delivery_connection_disabled" },
            ],
          },
          limitations: [
            { code: "email_delivery_connection_disabled" },
          ],
        },
      },
    });
    expect(request).toHaveBeenCalledTimes(1);
  });

  it("finds operations from natural task language without contiguous phrase matches", async () => {
    const tools = createMailrithMcpCompactToolDefinitions(
      { request: vi.fn() } as never,
    );
    const search = tools.find(
      (tool) => tool.name === "mailrith_search_operations",
    );

    const newsletter = await search?.invoke({
      query: "draft a newsletter for my subscribers",
      limit: 5,
    });
    expect(newsletter?.structuredContent).toMatchObject({
      response: {
        data: expect.arrayContaining([
          expect.objectContaining({
            operation_id: "createBroadcast",
            resource: "broadcasts",
          }),
        ]),
      },
    });

    const nurture = await search?.invoke({
      query: "build an automated nurture email series",
      category: "write",
      limit: 5,
    });
    expect(nurture?.structuredContent).toMatchObject({
      response: {
        data: expect.arrayContaining([
          expect.objectContaining({
            operation_id: "createSequence",
            resource: "sequences",
          }),
        ]),
      },
    });

    const smtp = await search?.invoke({
      query: "connect my SMTP sending provider",
      limit: 5,
    });
    expect(smtp?.structuredContent).toMatchObject({
      response: {
        data: expect.arrayContaining([
          expect.objectContaining({
            operation_id: "startEmailDeliveryConnectionSetup",
            resource: "emailDeliveryConnections",
          }),
        ]),
      },
    });

    const verbose = await search?.invoke({
      query:
        "Please show me all of the active newsletters we created for the summer launch last month",
      category: "read",
      limit: 10,
    });
    expect(verbose?.structuredContent).toMatchObject({
      response: {
        data: expect.arrayContaining([
          expect.objectContaining({
            operation_id: "listBroadcasts",
            resource: "broadcasts",
          }),
        ]),
      },
    });
  });

  it("discovers natural-language operations across every main product area", async () => {
    const search = createMailrithMcpCompactToolDefinitions(
      { request: vi.fn() } as never,
    ).find((tool) => tool.name === "mailrith_search_operations");
    const cases = [
      ["show recently added contacts", "read", "listSubscribers"],
      ["make a VIP label", "write", "createTag"],
      ["build a saved filter for engaged people", "write", "createSegment"],
      ["add a subscriber profile field", "write", "createCustomField"],
      ["draft a reusable email design", "write", "createEmailTemplate"],
      ["build a webinar signup form", "live", "createForm"],
      ["make a webinar signup page", "live", "createLandingPage"],
      ["create a tracked link for the offer", "live", "createMagicLink"],
      ["draft the monthly newsletter campaign", "write", "createBroadcast"],
      ["build an onboarding drip email series", "write", "createSequence"],
      ["create a triggered customer journey", "write", "createAutomation"],
      [
        "connect our SMTP sending provider",
        "write",
        "startEmailDeliveryConnectionSetup",
      ],
      ["show our from email identities", "read", "listSenderIdentities"],
      ["show delivery failure diagnostics", "read", "listBroadcastDeliveryErrors"],
      ["show outbound event callbacks", "read", "listWebhookSubscriptions"],
    ] as const;

    for (const [query, category, operationId] of cases) {
      const result = await search?.invoke({ query, category, limit: 12 });
      expect(
        (
          result?.structuredContent?.response as {
            data?: Array<{ operation_id?: string }>;
          }
        )?.data?.map((operation) => operation.operation_id),
        query,
      ).toContain(operationId);
    }
  });

  it("matches ordinary action and resource language without semantic storage", async () => {
    const search = createMailrithMcpCompactToolDefinitions(
      { request: vi.fn() } as never,
    ).find((tool) => tool.name === "mailrith_search_operations");
    const cases = [
      ["create a sequence", "createSequence"],
      ["make a new sequence", "createSequence"],
      ["check sequence readiness", "preflightSequence"],
      ["activate a sequence", "updateSequenceStatus"],
      ["pause the sequence", "updateSequenceStatus"],
      ["check automation readiness", "preflightAutomation"],
      ["activate an automation", "updateAutomationStatus"],
      ["make the automation inactive", "updateAutomationStatus"],
      ["return the automation to draft", "updateAutomationStatus"],
      ["stop the automation", "updateAutomationStatus"],
      ["inspect broadcast readiness", "preflightBroadcast"],
      [
        "enable the email delivery connection",
        "updateEmailDeliveryConnectionStatus",
      ],
      [
        "disable the sending provider connection",
        "updateEmailDeliveryConnectionStatus",
      ],
      ["draft a newsletter campaign", "createBroadcast"],
      ["build an onboarding email series", "createSequence"],
      ["activate the customer workflow", "updateAutomationStatus"],
    ] as const;

    for (const [query, operationId] of cases) {
      const result = await search?.invoke({ query, limit: 12 });
      const response = result?.structuredContent?.response as {
        data?: Array<{ operation_id?: string }>;
        selection?: {
          status?: string;
          recommended_operation_id?: string;
        };
      };
      expect(response.data?.[0]?.operation_id, query).toBe(operationId);
      expect(response.selection, query).toMatchObject({
        status: "recommended",
        recommended_operation_id: operationId,
      });
    }
  });

  it("keeps ambiguous operation choices explicit", async () => {
    const search = createMailrithMcpCompactToolDefinitions(
      { request: vi.fn() } as never,
    ).find((tool) => tool.name === "mailrith_search_operations");

    const ambiguous = await search?.invoke({
      query: "sequence",
      limit: 5,
    });
    expect(ambiguous?.structuredContent).toMatchObject({
      response: {
        selection: {
          status: "ambiguous",
          requires_clarification: true,
          candidate_operation_ids: expect.arrayContaining([
            "listSequences",
            "createSequence",
          ]),
        },
      },
    });

    const exact = await search?.invoke({
      query: "updateSequenceStatus",
      limit: 5,
    });
    expect(exact?.structuredContent).toMatchObject({
      response: {
        selection: {
          status: "recommended",
          requires_clarification: false,
          recommended_operation_id: "updateSequenceStatus",
        },
      },
    });
  });

  it("keeps every generated operation discoverable from its public summary", async () => {
    const search = createMailrithMcpCompactToolDefinitions(
      { request: vi.fn() } as never,
    ).find((tool) => tool.name === "mailrith_search_operations");

    for (const resource of mailrithSdkResources) {
      for (const operation of resource.operations) {
        const result = await search?.invoke({
          query: operation.summary,
          limit: 12,
        });
        const response = result?.structuredContent?.response as {
          data?: Array<{ operation_id?: string }>;
        };
        expect(
          response.data?.map((candidate) => candidate.operation_id),
          operation.summary,
        ).toContain(operation.operationId);
      }
    }
  });

  it("returns useful search guidance when no operation matches", async () => {
    const search = createMailrithMcpCompactToolDefinitions(
      { request: vi.fn() } as never,
    ).find((tool) => tool.name === "mailrith_search_operations");

    await expect(
      search?.invoke({ query: "reconcile quantum invoices", limit: 5 }),
    ).resolves.toMatchObject({
      structuredContent: {
        response: {
          data: [],
          pagination: { returned: 0, total_matches: 0 },
          suggestions: expect.arrayContaining([expect.any(String)]),
        },
      },
    });
  });

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
      "subscribers:write",
    );
    expect(subscriberAddToSequenceTool).toBeDefined();
    expect(subscriberAddToSequenceTool?.description).toContain(
      "subscribers:write",
    );
    expect(updateTool).toBeDefined();
    expect(updateTool?.description).toContain(
      "broadcasts:write",
    );
    expect(landingPageCreateTool?.description).toContain(
      "landing_pages:write",
    );
    expect(webhookCreateTool?.description).toContain("webhooks:write");

    await listTool?.invoke({
      email: "ada@example.com",
      limit: 5,
      starting_after: "subscriber-123",
      tag_id: "tag-vip",
      sequence_id: "sequence-welcome",
    });

    const result = await updateTool?.invoke({
      broadcast_id: "broadcast-123",
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
        query: undefined,
        body: {
          subject: "Updated subject",
          body_document: { type: "doc" },
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
        "live_actions:write",
        "subscribers:read",
        "subscribers:write",
      ],
      enabledToolsets: ["subscriber_management"],
    }).map((tool) => tool.name);

    expect(subscriberTools).toEqual(
      expect.arrayContaining([
        "discovery_get_metadata",
        "workspace_get",
        "subscribers_list",
        "subscribers_update",
        "subscribers_update_status",
      ]),
    );
    expect(subscriberTools).not.toEqual(
      expect.arrayContaining([
        "broadcasts_list",
        "broadcasts_send",
      ]),
    );

    const broadcastSendTools = createMailrithMcpToolDefinitions(client, {
      grantedScopes: [
        "workspace:read",
        "live_actions:write",
        "subscribers:read",
        "broadcasts:read",
        "broadcasts:write",
      ],
      enabledToolsets: ["broadcasts"],
    }).map((tool) => tool.name);
    expect(broadcastSendTools).toEqual(
      expect.arrayContaining([
        "broadcasts_list",
        "broadcasts_send_test",
        "broadcasts_send",
      ]),
    );
    expect(broadcastSendTools).toContain("broadcasts_create");

    const workflowSafetyTools = createMailrithMcpToolDefinitions(client, {
      grantedScopes: [
        "workspace:read",
        "live_actions:write",
        "subscribers:read",
        "sequences:read",
        "sequences:write",
        "automations:read",
        "automations:write",
      ],
      enabledToolsets: ["sequences", "automations"],
    }).map((tool) => tool.name);
    expect(workflowSafetyTools).toEqual(
      expect.arrayContaining([
        "sequences_preflight",
        "sequences_preview_journey",
        "sequences_send_test",
        "automations_preflight",
        "automations_preview_journey",
        "automations_send_test",
      ]),
    );
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

    const missingScopeRequest = vi.fn().mockRejectedValue(
      new MailrithApiError({
        status: 403,
        message: "Reconnect to add permission.",
        code: "insufficient_scope",
        responseBody: {
          error: {
            required_scopes: ["broadcasts:write"],
            missing_scopes: ["broadcasts:write"],
            replacement_scopes: [
              "broadcasts:read",
              "broadcasts:write",
            ],
            credential_type: "workspace_api_key",
            reconnect_required: true,
            permissions_help_url:
              "https://mailrith.com/developers/authentication#add-permissions",
            recovery: {
              action: "replace_api_key",
              message:
                "Create a replacement API key with the complete permission set.",
              replacement_scopes: [
                "broadcasts:read",
                "broadcasts:write",
              ],
              access_update_url:
                "https://app.mailrith.com/settings?tab=api-keys",
            },
            details: {
              reason: "The requested Broadcast operation needs write access.",
              resource: {
                type: "broadcast",
                id: "broadcast-1",
              },
              internal_detail: "must not be copied",
            },
            internal_detail: "must not be copied",
          },
        },
      }),
    );
    const missingScopeTool = createMailrithMcpToolDefinitions({
      request: missingScopeRequest,
    } as never).find((candidate) => candidate.name === "broadcasts_create");
    const missingScopeResult = await missingScopeTool?.invoke({
      body: {
        subject: "Draft",
        body_document: { type: "doc" },
      },
    });
    expect(missingScopeResult?.structuredContent).toMatchObject({
      error: {
        required_scopes: ["broadcasts:write"],
        missing_scopes: ["broadcasts:write"],
        replacement_scopes: [
          "broadcasts:read",
          "broadcasts:write",
        ],
        credential_type: "workspace_api_key",
        reconnect_required: true,
        permissions_help_url:
          "https://mailrith.com/developers/authentication#add-permissions",
        recovery: {
          action: "replace_api_key",
          replacement_scopes: [
            "broadcasts:read",
            "broadcasts:write",
          ],
          access_update_url:
            "https://app.mailrith.com/settings?tab=api-keys",
        },
        details: {
          reason: "The requested Broadcast operation needs write access.",
          resource: {
            type: "broadcast",
            id: "broadcast-1",
          },
        },
      },
    });
    expect(
      missingScopeTool?.outputSchema.safeParse(
        missingScopeResult?.structuredContent,
      ).success,
    ).toBe(true);
    expect(missingScopeResult?.content[0]?.text).not.toContain(
      "must not be copied",
    );

    const missingDeliveryRequest = vi.fn().mockRejectedValue(
      new MailrithApiError({
        status: 409,
        message:
          "Set up an email delivery connection before creating this resource.",
        code: "email_delivery_setup_connection_missing",
        responseBody: {
          error: {
            prerequisite: {
              resource: "email_delivery_setup_connection",
              state: "missing",
              required_scopes: ["email_delivery_connections:write"],
              work_profile: "email_delivery_setup",
              setup_url:
                "https://app.mailrith.com/email-delivery-connections?workspace=workspace-1",
              internal_detail: "must not be copied",
            },
            retry: {
              safe: true,
              guidance:
                "Complete setup, read capabilities, and retry the create request.",
              internal_detail: "must not be copied",
            },
          },
        },
      }),
    );
    const missingDeliveryTool = createMailrithMcpToolDefinitions({
      request: missingDeliveryRequest,
    } as never).find((candidate) => candidate.name === "broadcasts_create");
    const missingDeliveryResult = await missingDeliveryTool?.invoke({
      body: {
        subject: "Draft",
        body_document: { type: "doc" },
      },
    });
    expect(missingDeliveryResult?.structuredContent).toMatchObject({
      error: {
        prerequisite: {
          resource: "email_delivery_setup_connection",
          state: "missing",
          required_scopes: ["email_delivery_connections:write"],
          work_profile: "email_delivery_setup",
          setup_url:
            "https://app.mailrith.com/email-delivery-connections?workspace=workspace-1",
        },
        retry: {
          safe: true,
          guidance:
            "Complete setup, read capabilities, and retry the create request.",
        },
      },
    });
    expect(
      missingDeliveryTool?.outputSchema.safeParse(
        missingDeliveryResult?.structuredContent,
      ).success,
    ).toBe(true);
    expect(missingDeliveryResult?.content[0]?.text).not.toContain(
      "must not be copied",
    );
  });

  it("keeps durable GA tool names and operation-specific annotations", () => {
    const tools = createMailrithMcpToolDefinitions({ request: vi.fn() } as never);
    const names = tools.map((tool) => tool.name);

    expect(names).toEqual(
      expect.arrayContaining([
        "subscribers_update_status",
        "sequences_update_status",
        "automations_update_status",
        "email_delivery_connections_list",
        "email_delivery_connections_start_setup",
        "email_delivery_connections_get_setup",
        "email_delivery_connections_verify",
        "email_delivery_connections_send_test",
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
      body: {
        recipient: "reviewer@example.com",
        subscriber_id: "subscriber-1",
      },
    });
    await invoke("broadcasts_send", { broadcast_id: "broadcast-1" });
    await invoke("jobs_create_import", {
      body: {
        upload_id: "3f328b9c-b3a7-4c8e-83ac-cc19022912fd",
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
    const mailrithApiFetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = input instanceof Request ? new Request(input, init) : new Request(input, init);
      const url = new URL(request.url);

      if (url.pathname === "/v1/capabilities") {
        return new Response(
          JSON.stringify({
            data: {
              workspace: { id: "workspace-1", name: "Test" },
              credential: {
                type: "workspace_api_key",
                scopes: [
                  "workspace:read",
                  "subscribers:read",
                  "broadcasts:write",
                  "landing_pages:write",
                ],
              },
              resources: [
                {
                  key: "subscribers",
                  operations: [{ operation_id: "listSubscribers" }],
                },
                {
                  key: "broadcasts",
                  operations: [{ operation_id: "getBroadcast" }],
                },
              ],
              limitations: [
                {
                  code: "email_delivery_connection_missing",
                  message:
                    "Creation operations that can send email are omitted until an email delivery connection is set up.",
                  setup_url:
                    "https://app.mailrith.com/email-delivery-connections?workspace=workspace-1",
                },
              ],
            },
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        );
      }

      if (url.pathname === "/v1/subscribers") {
        return new Response(
          JSON.stringify({
            data: [
              {
                id: "subscriber-1",
                self: "/v1/subscribers/subscriber-1",
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
        "subscriber_management,broadcasts",
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
    expect(tools.tools.map((tool) => tool.name)).toEqual([
      "mailrith_check_connection",
      "mailrith_search_operations",
      "mailrith_get_operation",
      "mailrith_read",
      "mailrith_write",
      "mailrith_delete",
      "mailrith_live",
    ]);
    expect(
      tools.tools.find((tool) => tool.name === "mailrith_write")
        ?.inputSchema,
    ).toMatchObject({
      type: "object",
      required: ["operation_id"],
      properties: {
        operation_id: expect.any(Object),
        arguments: expect.any(Object),
      },
    });
    expect(
      tools.tools.find((tool) => tool.name === "mailrith_write")
        ?.outputSchema,
    ).toBeUndefined();

    const broadcastCreate = await client.callTool({
      name: "mailrith_get_operation",
      arguments: { operation_id: "createBroadcast" },
    });
    expect(broadcastCreate.structuredContent).toMatchObject({
      operation_id: "mailrith_get_operation",
      response: {
        operation_id: "createBroadcast",
        category: "write",
        available: false,
        availability: "blocked",
        blocking_limitations: [
          { code: "email_delivery_connection_missing" },
        ],
        input_schema: {
          type: "object",
          required: expect.arrayContaining(["body"]),
          properties: { body: expect.any(Object) },
        },
      },
    });
    expect(
      (
        broadcastCreate.structuredContent as {
          response?: Record<string, unknown>;
        }
      ).response,
    ).not.toHaveProperty(
      "output_schema",
    );
    const capabilityRequests = mailrithApiFetch.mock.calls
      .map(([input, init]) =>
        input instanceof Request
          ? new Request(input, init)
          : new Request(input, init),
      )
      .filter(
        (request) =>
          new URL(request.url).pathname === "/v1/capabilities",
      );
    expect(capabilityRequests.length).toBeGreaterThan(0);
    expect(
      capabilityRequests.every(
        (request) =>
          request.headers.get("mailrith-mcp-toolsets") ===
          "subscriber_management,broadcasts",
      ),
    ).toBe(true);

    const result = await client.callTool({
      name: "mailrith_read",
      arguments: {
        operation_id: "listSubscribers",
        arguments: { limit: 1 },
      },
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
      request.headers.set("mailrith-mcp-toolsets", "full_email_marketing_access");
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
      name: "mailrith_live",
      arguments: {
        operation_id: "upsertSubscriber",
        arguments: {
          body: { email: "ada@example.com", status: "NotAStatus" },
        },
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
      ["mailrith_read", "listSubscribers", { limit: 1 }],
      [
        "mailrith_write",
        "updateBroadcast",
        {
          broadcast_id: "broadcast-1",
          body: { subject: "Draft subject", body_document: { type: "doc" } },
        },
      ],
      [
        "mailrith_live",
        "testBroadcast",
        {
          broadcast_id: "broadcast-1",
          body: {
            recipient: "reviewer@example.com",
            subscriber_id: "subscriber-1",
          },
        },
      ],
      ["mailrith_live", "sendBroadcast", { broadcast_id: "broadcast-1" }],
      [
        "mailrith_live",
        "createSubscriberImportJob",
        {
          body: {
            upload_id: "3f328b9c-b3a7-4c8e-83ac-cc19022912fd",
            mappings: [
              { csv_column: "email", field: { type: "email" } },
            ],
          },
        },
      ],
      [
        "mailrith_delete",
        "deleteCustomField",
        { custom_field_id: "field-1" },
      ],
      [
        "mailrith_live",
        "rotateWebhookSubscriptionSecret",
        { webhook_subscription_id: "webhook-1" },
      ],
    ] as const;

    for (const [name, operationId, operationArguments] of calls) {
      const result = await client.callTool({
        name,
        arguments: {
          operation_id: operationId,
          arguments: operationArguments,
        },
      });
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
    expect(scope).toEqual(mailrithMcpStandardOAuthScopes);
    expect(scope).toHaveLength(publicApiScopeKeys.length);
    await expect(response.json()).resolves.toMatchObject({
      required_scopes: mailrithMcpStandardOAuthScopes,
      reconnect_required: false,
      permissions_help_url:
        "https://mailrith.com/developers/authentication#add-permissions",
    });
  });

  it("supports internally configured focused OAuth permissions", async () => {
    const response = await handleMailrithMcpHttpRequest(
      new Request("https://mailrith.test/mcp", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "mailrith-mcp-toolsets": "email_delivery_setup",
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
    const scope = response.headers
      .get("www-authenticate")
      ?.match(/scope="([^"]+)"/)?.[1]
      ?.split(" ");
    expect(scope).toEqual([
      "live_actions:write",
      "workspace:read",
      "email_delivery_connections:read",
      "email_delivery_connections:write",
    ]);
  });

  it("keeps the standard connection and internal toolsets bounded", async () => {
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
            {
              status: 200,
              headers: { "content-type": "application/json" },
            },
          );
        }
        return new Response(JSON.stringify({ data: {} }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
    );
    const toolsetHeaders = [
      null,
      "full_email_marketing_access",
      "reporting",
      "subscriber_management",
      "subscriber_import_export",
      "content_and_capture",
      "broadcasts",
      "sequences",
      "automations",
      "email_delivery_setup",
      "outbound_webhooks",
    ];

    for (const toolsetHeader of toolsetHeaders) {
      const response = await handleMailrithMcpHttpRequest(
        new Request("https://mailrith.test/mcp", {
          method: "POST",
          headers: {
            authorization: "Bearer mrat_token",
            accept: "application/json, text/event-stream",
            "content-type": "application/json",
            ...(toolsetHeader
              ? { "mailrith-mcp-toolsets": toolsetHeader }
              : {}),
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "tools/list",
          }),
        }),
        {
          baseUrl: "https://api.mailrith.com",
          fetch: mailrithApiFetch as unknown as typeof fetch,
        },
      );
      const text = await response.text();
      const label = toolsetHeader ?? "standard";
      expect(response.status, `${label}: ${text}`).toBe(200);
      expect(
        new TextEncoder().encode(text).byteLength,
        `${label} tool list exceeded 256 KiB`,
      ).toBeLessThanOrEqual(256 * 1024);
      if (toolsetHeader === null) {
        const payload = JSON.parse(text) as {
          result?: { tools?: Array<{ outputSchema?: unknown }> };
        };
        expect(
          payload.result?.tools?.every(
            (tool) => tool.outputSchema === undefined,
          ),
        ).toBe(true);
      }
    }
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
                type: "oauth_access_token",
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
    await expect(response.json()).resolves.toMatchObject({
      required_scopes: ["subscribers:read"],
      missing_scopes: ["subscribers:read"],
      replacement_scopes: ["subscribers:read", "workspace:read"],
      credential_type: "oauth_access_token",
      reconnect_required: true,
      recovery: {
        action: "reconnect_oauth",
        replacement_scopes: ["subscribers:read", "workspace:read"],
      },
      permissions_help_url:
        "https://mailrith.com/developers/authentication#add-permissions",
    });
    expect(mailrithApiFetch).toHaveBeenCalledTimes(1);
  });

  it("returns the resource write permission in Subscriber challenges", async () => {
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
                  scopes: [],
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
            name: "mailrith_live",
            arguments: {
              operation_id: "upsertSubscriber",
              arguments: {
                body: {
                  email: "subscriber@example.com",
                  status: "Active",
                  existing_tag_ids: ["tag-vip"],
                },
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
      'scope="live_actions:write subscribers:write"',
    );
    expect(mailrithApiFetch).toHaveBeenCalledTimes(1);
  });

  it("uses one resource permission for outbound webhook challenges", async () => {
    const mailrithApiFetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = input instanceof Request ? new Request(input, init) : new Request(input, init);
      const url = new URL(request.url);

      if (url.pathname === "/v1/capabilities") {
        return new Response(
          JSON.stringify({
            data: {
              credential: {
                scopes: [],
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
            name: "mailrith_live",
            arguments: {
              operation_id: "createWebhookSubscription",
              arguments: {
                body: {
                  name: "Forms",
                  url: "https://example.com/webhooks/forms",
                  event_patterns: ["form.submitted"],
                },
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
      'scope="live_actions:write webhooks:write"',
    );
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
