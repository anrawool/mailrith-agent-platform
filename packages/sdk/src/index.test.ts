import { describe, expect, it, vi } from "vitest";
import {
  publicApiAgentReadQuickstartScopeKeys,
  publicApiSdkResources,
} from "@mailrith/public-api";
import {
  MailrithApiError,
  createMailrithClient,
  mailrithAgentReadQuickstartScopeKeys,
  mailrithSdkResources,
} from "./index";

describe("@mailrith/sdk", () => {
  it("exposes discovery and resource namespaces generated from the public api manifest", () => {
    const client = createMailrithClient({
      fetch: vi.fn() as unknown as typeof fetch,
    });

    expect(mailrithSdkResources.map((resource) => resource.namespace)).toEqual(
      expect.arrayContaining([
        "discovery",
        "subscribers",
        "landingPages",
        "broadcasts",
        "jobs",
      ]),
    );
    expect(typeof client.discovery.getMetadata).toBe("function");
    expect(typeof client.subscribers.list).toBe("function");
    expect(typeof client.landingPages.create).toBe("function");
    expect(typeof client.broadcasts.send).toBe("function");
    expect(typeof client.broadcasts.cancel).toBe("function");
    const createWebhookOperation = client.getOperation(
      "webhookSubscriptions",
      "create",
    );
    expect(
      createWebhookOperation &&
        "eventPatternScopeRequirements" in createWebhookOperation
        ? createWebhookOperation.eventPatternScopeRequirements
            .requiredScopesByEventPattern["form.submitted"]
        : undefined,
    ).toEqual(["subscribers:read", "forms:read"]);
  });

  it("keeps generated resources in sync with the public api manifest", () => {
    expect(mailrithAgentReadQuickstartScopeKeys).toEqual(
      publicApiAgentReadQuickstartScopeKeys,
    );
    expect(mailrithSdkResources).toEqual(publicApiSdkResources);
    expect(
      mailrithSdkResources
        .find((resource) => resource.namespace === "subscribers")
        ?.operations.find((operation) => operation.methodName === "list")
        ?.queryParams,
    ).toEqual(expect.arrayContaining(["email"]));
  });

  it("builds authenticated requests with path params, query params, body, and idempotency headers", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: { id: "subscriber-1" } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    const client = createMailrithClient({
      baseUrl: "https://api.mailrith.com/",
      apiKey: "mrk_secret",
      fetch: fetchMock as unknown as typeof fetch,
      defaultHeaders: {
        "x-client": "mailrith-sdk-test",
      },
    });

    const response = await client.broadcasts.send({
      path: { broadcast_id: "broadcast 123" },
      query: { dry_run: true, limit: 5 },
      body: { confirm: true },
      idempotencyKey: "broadcast-send-1",
    });

    expect(response).toEqual({ data: { id: "subscriber-1" } });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(url.toString()).toBe(
      "https://api.mailrith.com/v1/broadcasts/broadcast%20123/send?dry_run=true&limit=5",
    );
    expect(init.method).toBe("POST");

    const headers = new Headers(init.headers);
    expect(headers.get("authorization")).toBe("Bearer mrk_secret");
    expect(headers.get("content-type")).toBe("application/json");
    expect(headers.get("idempotency-key")).toBe("broadcast-send-1");
    expect(headers.get("x-client")).toBe("mailrith-sdk-test");
    expect(init.body).toBe(JSON.stringify({ confirm: true }));
  });

  it("supports unauthenticated discovery requests", async () => {
    const onResponse = vi.fn();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ version: "v1" }), {
        status: 200,
        headers: {
          "content-type": "application/json",
          "x-mailrith-request-id": "req_server",
        },
      }),
    );
    const client = createMailrithClient({
      baseUrl: "https://api.mailrith.com",
      fetch: fetchMock as unknown as typeof fetch,
      onResponse,
    });

    const response = await client.discovery.getMetadata();

    expect(response).toEqual({ version: "v1" });
    const [, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
    const headers = new Headers(init.headers);
    expect(headers.get("authorization")).toBeNull();
    expect(onResponse).toHaveBeenCalledWith({
      operationId: "getPublicApiMeta",
      requestId: "req_server",
      status: 200,
    });
  });

  it("throws a typed api error for non-success responses", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            type: "permission_error",
            code: "insufficient_scope",
            message: "Missing broadcasts:send",
          },
        }),
        {
          status: 403,
          headers: {
            "content-type": "application/json",
            "x-mailrith-request-id": "req_denied",
          },
        },
      ),
    );
    const client = createMailrithClient({
      apiKey: "mrk_secret",
      fetch: fetchMock as unknown as typeof fetch,
    });

    await expect(client.broadcasts.send({ path: { broadcast_id: "broadcast-123" } })).rejects.toEqual(
      expect.objectContaining<Partial<MailrithApiError>>({
        name: "MailrithApiError",
        status: 403,
        type: "permission_error",
        code: "insufficient_scope",
        requestId: "req_denied",
      }),
    );
  });
});
