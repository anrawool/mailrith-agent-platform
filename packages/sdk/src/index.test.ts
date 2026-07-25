import { describe, expect, it, vi } from "vitest";
import {
  publicApiAgentReadQuickstartScopeKeys,
  publicApiSdkResources,
} from "@mailrith/public-api";
import {
  MailrithApiError,
  createMailrithClient,
  mailrithAgentReadQuickstartScopeKeys,
  mailrithOperationDiscovery,
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
    expect(createWebhookOperation?.requiredScopes).toEqual([
      "live_actions:write",
      "webhooks:write",
    ]);
    expect(createWebhookOperation).not.toHaveProperty(
      "eventPatternScopeRequirements",
    );
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

  it("recommends one correct operation for common agent task language", () => {
    const cases = [
      ["unsubscribe this subscriber", "updateSubscriberStatus"],
      ["add a subscriber", "upsertSubscriber"],
      ["update subscriber custom fields", "updateSubscriber"],
      ["add the VIP tag to this subscriber", "addSubscriberTag"],
      ["attach a tag to a contact", "addSubscriberTag"],
      ["remove the VIP tag from this subscriber", "removeSubscriberTag"],
      ["detach a tag from a contact", "removeSubscriberTag"],
      [
        "unsubscribe a subscriber from a sequence",
        "removeSubscriberSequence",
      ],
      ["enroll a contact in a sequence", "addSubscriberSequence"],
      ["resubscribe this contact", "updateSubscriberStatus"],
      ["block this contact from email", "updateSubscriberStatus"],
      ["connect Mailgun", "startEmailDeliveryConnectionSetup"],
      ["connect Resend as our email provider", "startEmailDeliveryConnectionSetup"],
      ["replace our SMTP credentials", "startEmailDeliveryConnectionSetup"],
      ["replace Postmark credentials", "startEmailDeliveryConnectionSetup"],
      ["schedule the newsletter", "scheduleBroadcast"],
      ["reschedule the campaign", "scheduleBroadcast"],
      ["cancel the scheduled newsletter", "unscheduleBroadcast"],
      ["send a test newsletter", "testBroadcast"],
      ["check newsletter send progress", "getBroadcastSendProgress"],
      ["stop the active broadcast", "cancelBroadcastSend"],
      ["import subscribers from CSV", "startSubscriberImportUpload"],
      ["check CSV import progress", "getSubscriberImportJob"],
      ["export contacts to CSV", "createSubscriberExportJob"],
      ["check CSV export progress", "getSubscriberExportJob"],
      ["show newsletter performance", "createAnalyticsReport"],
      ["view automation analytics", "createAnalyticsReport"],
      ["publish a signup form", "createForm"],
      ["make the landing page live", "createLandingPage"],
    ] as const;

    for (const [query, operationId] of cases) {
      const result = mailrithOperationDiscovery.search({ query });
      expect(result.matches[0]?.operation.operationId, query).toBe(
        operationId,
      );
      expect(result.selection, query).toMatchObject({
        status: "recommended",
        recommended_operation_id: operationId,
      });
    }
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
            message: "Missing broadcasts:write",
            credential_type: "workspace_api_key",
            missing_scopes: ["broadcasts:write"],
            replacement_scopes: [
              "workspace:read",
              "broadcasts:read",
              "broadcasts:write",
            ],
            recovery: {
              action: "replace_api_key",
              message: "Create and install a replacement key.",
              replacement_scopes: [
                "workspace:read",
                "broadcasts:read",
                "broadcasts:write",
              ],
              access_update_url:
                "https://app.mailrith.com/settings?tab=api-keys",
            },
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
        credentialRecovery: {
          credentialType: "workspace_api_key",
          action: "replace_api_key",
          message: "Create and install a replacement key.",
          missingScopes: ["broadcasts:write"],
          replacementScopes: [
            "workspace:read",
            "broadcasts:read",
            "broadcasts:write",
          ],
          accessUpdateUrl:
            "https://app.mailrith.com/settings?tab=api-keys",
        },
      }),
    );
  });
});
