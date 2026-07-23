import { describe, expect, it } from "vitest";
import {
  getPublicApiWebhookEventPatternRequiredScopes,
  getPublicApiOperations,
  publicApiAgentReadQuickstartScopeKeys,
  publicApiAgentSkillsIndexPath,
  publicApiAgentStatusPath,
  publicApiCapabilityResources,
  publicApiCatalogPath,
  publicApiBasePath,
  publicApiCapabilitiesPath,
  publicApiDefaultScopeKeys,
  publicApiExamplePayloads,
  publicApiGuides,
  publicApiMcpOperationContractMap,
  publicApiMcpOperationContracts,
  publicApiMcpDocsPath,
  publicApiMcpPath,
  publicApiMcpServerCardPath,
  publicApiSdkDocsPath,
  publicApiSdkResources,
  publicApiWebhookSubscriptionsPath,
  publicApiScopeDefinitions,
  publicApiScopeDisplaySections,
  publicApiScopeKeys,
  publicApiScopePresetDisplaySections,
  publicApiScopePresets,
  publicApiScopeResourceOrder,
  publicApiMcpToolsetKeys,
  publicApiQuickstart,
  emailTemplateBodyDocumentMaxBytes,
  emailTemplateNameMaxLength,
  normalizePublicApiScopeKeys,
  validatePublicApiScopeKeys,
  publicApiSpec,
  publicApiOAuthWellKnownPath,
  publicApiOpenIdConfigurationPath,
  publicApiOAuthAuthorizePath,
  publicApiOAuthTokenPath,
  publicApiOAuthRevokePath,
  publicApiOAuthRegisterPath,
  publicApiOAuthProtectedResourcePath,
  publicApiMcpOAuthProtectedResourcePath,
  publicApiWebhookEventPatternScopeRequirements,
  publicApiAgentOperationRiskCatalog,
} from "./index";

type PublicApiSchemaObject = {
  additionalProperties?: unknown;
  properties?: Record<string, unknown>;
  required?: string[];
};

describe("@mailrith/public-api", () => {
  it("keeps the read-only agent starter and copyable payloads aligned with the contract", () => {
    expect(publicApiAgentReadQuickstartScopeKeys).toEqual([
      "workspace:read",
      "subscribers:read",
    ]);

    const expectExampleToMatchSchema = (
      example: Record<string, unknown>,
      schemaName:
        | "BroadcastUpsertRequest"
        | "WebhookSubscriptionCreateRequest",
    ) => {
      const schema = publicApiSpec.components.schemas[
        schemaName
      ] as PublicApiSchemaObject;
      expect(Object.keys(example).sort()).toEqual(
        expect.arrayContaining(schema.required ?? []),
      );
      expect(
        Object.keys(example).filter(
          (key) => !(key in (schema.properties ?? {})),
        ),
      ).toEqual([]);
    };

    expectExampleToMatchSchema(
      publicApiExamplePayloads.broadcastDraft,
      "BroadcastUpsertRequest",
    );
    expectExampleToMatchSchema(
      publicApiExamplePayloads.webhookSubscription,
      "WebhookSubscriptionCreateRequest",
    );
    expect(publicApiExamplePayloads.broadcastDraft).not.toHaveProperty("body");
    expect(publicApiExamplePayloads.broadcastDraft).not.toHaveProperty(
      "status",
    );
    expect(
      publicApiExamplePayloads.webhookSubscription.event_patterns.every(
        (pattern) =>
          getPublicApiWebhookEventPatternRequiredScopes([pattern]).length > 0,
      ),
    ).toBe(true);
  });

  it("publishes a versioned OpenAPI document", () => {
    expect(publicApiSpec.openapi).toBe("3.1.0");
    expect(publicApiSpec.info.version).toBe("v1");
    expect(publicApiBasePath).toBe("/v1");
    expect(publicApiCapabilitiesPath).toBe("/v1/capabilities");
    expect(publicApiWebhookSubscriptionsPath).toBe("/v1/webhook-subscriptions");
    expect(publicApiSdkDocsPath).toBe("/developers/sdks");
    expect(publicApiMcpDocsPath).toBe("/developers/mcp");
    expect(publicApiMcpPath).toBe("/mcp");
    expect(publicApiCatalogPath).toBe("/.well-known/api-catalog");
    expect(publicApiAgentStatusPath).toBe(
      "/.well-known/agent-status.json",
    );
    expect(publicApiMcpServerCardPath).toBe(
      "/.well-known/mcp/server-card.json",
    );
    expect(publicApiAgentSkillsIndexPath).toBe(
      "/.well-known/agent-skills/index.json",
    );
    expect(publicApiSpec.paths["/v1/capabilities"]?.get).toBeDefined();
    expect(publicApiSpec.paths["/v1/workspace"]?.get).toBeDefined();
    expect(
      publicApiSpec.paths["/v1/webhook-subscriptions"]?.post,
    ).toBeDefined();
    expect(
      publicApiSpec.paths["/v1/webhook-subscriptions"]?.post.description,
    ).toContain("up to 20 webhook subscriptions");
    expect(
      publicApiSpec.paths["/v1/webhook-subscriptions"]?.post.responses["409"]
        .description,
    ).toContain("20-subscription limit");
    expect(
      publicApiSpec.paths["/v1/broadcasts/{broadcast_id}/cancel"]?.post,
    ).toEqual(
      expect.objectContaining({
        operationId: "cancelBroadcastSend",
      }),
    );
    expect(
      (
        publicApiSpec.paths["/v1/broadcasts/{broadcast_id}/cancel"]?.post
          .responses["202"].content?.["application/json"].schema as {
          properties?: {
            data?: { properties?: { status?: { enum?: string[] } } };
          };
        }
      ).properties?.data?.properties?.status?.enum,
    ).toEqual(["canceling", "canceled"]);
    expect(publicApiSpec.paths["/v1/subscribers"]?.post).toBeDefined();
    expect(
      publicApiSpec.paths["/v1/subscribers"]?.post.responses["409"],
    ).toBeDefined();
    expect(
      publicApiSpec.paths["/v1/subscribers"]?.get.parameters?.map(
        (parameter) => parameter.name,
      ),
    ).toEqual(
      expect.arrayContaining([
        "email",
        "tag_id",
        "tag_ids",
        "tag_operator",
        "sequence_id",
        "sequence_ids",
        "sequence_operator",
      ]),
    );
    expect(
      publicApiSpec.paths["/v1/subscribers/{subscriber_id}"]?.patch,
    ).toBeDefined();
    expect(
      publicApiSpec.paths["/v1/subscribers/{subscriber_id}"]?.patch.responses[
        "409"
      ],
    ).toBeDefined();
    expect(publicApiQuickstart.response).toContain('"country": null');
    expect(
      publicApiSpec.paths["/v1/subscribers/{subscriber_id}/tags/{tag_id}"]
        ?.delete,
    ).toBeDefined();
    expect(
      publicApiSpec.paths["/v1/forms/{form_id}/submissions"]?.get,
    ).toBeDefined();
    const formSchema = publicApiSpec.components.schemas
      .Form as PublicApiSchemaObject;
    expect(formSchema.required).toEqual(
      expect.arrayContaining([
        "public_token",
        "submit_url",
        "embed_url",
        "hosted_url",
      ]),
    );
    expect(formSchema.required).not.toContain("styles");
    expect(formSchema.properties).not.toHaveProperty("styles");
    const formDefinitionSchema = formSchema.properties
      ?.definition as PublicApiSchemaObject;
    expect(formDefinitionSchema.additionalProperties).toBe(false);
    expect(formDefinitionSchema.required).toContain("builder");
    expect(formDefinitionSchema.properties).toEqual(
      expect.objectContaining({
        display: expect.objectContaining({ type: "object" }),
        builder: expect.objectContaining({ type: "object" }),
      }),
    );
    expect(formDefinitionSchema.properties).not.toHaveProperty("fields");
    expect(formDefinitionSchema.properties).not.toHaveProperty("styles");
    expect(formSchema.properties).toEqual(
      expect.objectContaining({
        public_token: expect.objectContaining({ type: "string" }),
        hosted_url: expect.objectContaining({ type: "string" }),
      }),
    );
    const formUpsertRequestSchema = publicApiSpec.components.schemas
      .FormUpsertRequest as PublicApiSchemaObject;
    expect(formUpsertRequestSchema.additionalProperties).toBe(false);
    expect(formUpsertRequestSchema.properties).not.toHaveProperty("styles");
    const formUpsertDefinitionSchema = formUpsertRequestSchema.properties
      ?.definition as PublicApiSchemaObject;
    expect(formUpsertDefinitionSchema.additionalProperties).toBe(false);
    expect(formUpsertDefinitionSchema.required).toContain("builder");
    expect(formUpsertDefinitionSchema.properties).not.toHaveProperty("fields");
    expect(formUpsertDefinitionSchema.properties).not.toHaveProperty("styles");
    expect(
      publicApiSpec.paths["/v1/landing-pages/{landing_page_id}/submissions"]
        ?.get,
    ).toBeDefined();
    expect(
      publicApiSpec.paths[
        "/v1/subscribers/{subscriber_id}/sequences/{sequence_id}"
      ]?.put,
    ).toBeDefined();
    expect(
      publicApiSpec.paths[
        "/v1/subscribers/{subscriber_id}/sequences/{sequence_id}"
      ]?.put.responses["403"],
    ).toBeDefined();
    expect(
      publicApiSpec.paths[
        "/v1/subscribers/{subscriber_id}/sequences/{sequence_id}"
      ]?.delete,
    ).toBeDefined();
    expect(
      (
        publicApiSpec.components.schemas.SubscriberUpsertRequest as {
          properties?: Record<string, Record<string, unknown>>;
        }
      ).properties?.create_only,
    ).toEqual(expect.objectContaining({ type: "boolean" }));
    expect(
      (
        publicApiSpec.components.schemas.Subscriber as {
          required?: string[];
        }
      ).required,
    ).toContain("country");
    expect(
      (
        publicApiSpec.components.schemas.Subscriber as {
          properties?: Record<string, Record<string, unknown>>;
        }
      ).properties?.country,
    ).toEqual(
      expect.objectContaining({
        type: "string",
        nullable: true,
        description: expect.stringContaining("Subscriber country"),
      }),
    );
    expect(
      (
        publicApiSpec.components.schemas.SubscriberUpsertRequest as {
          properties?: Record<string, Record<string, unknown>>;
        }
      ).properties?.country,
    ).toEqual(expect.objectContaining({ type: "string", nullable: true }));
    expect(
      (
        publicApiSpec.components.schemas.SubscriberUpdateRequest as {
          properties?: Record<string, Record<string, unknown>>;
        }
      ).properties?.country,
    ).toEqual(expect.objectContaining({ type: "string", nullable: true }));
    expect(
      (
        publicApiSpec.components.schemas.Workspace as {
          required?: string[];
        }
      ).required,
    ).toEqual(expect.arrayContaining(["state", "postal_code"]));
    expect(
      (
        publicApiSpec.components.schemas.Workspace as {
          properties?: Record<string, Record<string, unknown>>;
        }
      ).properties,
    ).toEqual(
      expect.objectContaining({
        state: expect.objectContaining({ type: "string", nullable: true }),
        postal_code: expect.objectContaining({
          type: "string",
          nullable: true,
        }),
        country: expect.objectContaining({
          type: "string",
          nullable: true,
          description: "Country for the workspace address.",
        }),
      }),
    );
    expect(
      Object.keys(
        (
          publicApiSpec.components.schemas.SubscriberUpsertRequest as {
            properties?: Record<string, Record<string, unknown>>;
          }
        ).properties ?? {},
      ),
    ).not.toEqual(
      expect.arrayContaining([
        "lawful_basis",
        "email_marketing_consent",
        "consent_text",
        "consent_collected_at",
      ]),
    );
    expect(
      (
        publicApiSpec.components.schemas.Tag as {
          required?: string[];
          properties?: Record<string, Record<string, unknown>>;
        }
      ).required,
    ).toContain("gdpr_consent_purpose");
    expect(
      (
        publicApiSpec.components.schemas.Tag as {
          required?: string[];
          properties?: Record<string, Record<string, unknown>>;
        }
      ).properties?.gdpr_consent_purpose,
    ).toEqual(
      expect.objectContaining({
        type: "string",
        nullable: true,
        enum: ["email_marketing", "ads_personalization"],
      }),
    );
    expect(publicApiSpec.paths["/v1/broadcasts"]?.post).toBeDefined();
    const sequenceSchema = publicApiSpec.components.schemas
      .Sequence as PublicApiSchemaObject;
    expect(sequenceSchema.required).toEqual(
      expect.arrayContaining([
        "is_updating",
        "bounced_count",
        "complained_count",
      ]),
    );
    expect(sequenceSchema.properties).toEqual(
      expect.objectContaining({
        is_updating: expect.objectContaining({ type: "boolean" }),
        bounced_count: expect.objectContaining({ type: "integer" }),
        complained_count: expect.objectContaining({ type: "integer" }),
      }),
    );
    const automationSchema = publicApiSpec.components.schemas
      .Automation as PublicApiSchemaObject;
    expect(automationSchema.required).toEqual(
      expect.arrayContaining(["is_updating"]),
    );
    expect(automationSchema.properties).toEqual(
      expect.objectContaining({
        is_updating: expect.objectContaining({ type: "boolean" }),
      }),
    );
    const broadcastSchema = publicApiSpec.components.schemas
      .Broadcast as PublicApiSchemaObject;
    expect(broadcastSchema.required).toEqual(
      expect.arrayContaining(["bounced_count", "complained_count"]),
    );
    expect(broadcastSchema.properties).toEqual(
      expect.objectContaining({
        bounced_count: expect.objectContaining({ type: "integer" }),
        complained_count: expect.objectContaining({ type: "integer" }),
      }),
    );
    expect(publicApiSpec.paths["/v1/email-templates"]?.post).toBeDefined();
    const emailTemplateUpsertRequestSchema = publicApiSpec.components.schemas
      .EmailTemplateUpsertRequest as PublicApiSchemaObject;
    expect(emailTemplateUpsertRequestSchema.properties).toEqual(
      expect.objectContaining({
        name: expect.objectContaining({
          maxLength: emailTemplateNameMaxLength,
        }),
        body_document: expect.objectContaining({
          description: expect.stringContaining(
            `${emailTemplateBodyDocumentMaxBytes} bytes or less`,
          ),
        }),
      }),
    );
    expect(publicApiSpec.paths["/v1/landing-pages"]?.post).toBeDefined();
    for (const path of [
      "/v1/tags",
      "/v1/sequences",
      "/v1/forms",
      "/v1/landing-pages",
    ] as const) {
      expect(
        publicApiSpec.paths[path]?.get.parameters?.map(
          (parameter) => parameter.name,
        ),
      ).toContain("search");
    }
    expect(
      publicApiSpec.paths["/v1/landing-pages/{landing_page_id}"]?.put,
    ).toBeDefined();
    expect(publicApiSpec.paths["/v1/custom-fields"]?.post).toBeDefined();
    expect(
      publicApiSpec.paths["/v1/custom-fields/{custom_field_id}"]?.put,
    ).toBeDefined();
    expect(publicApiSpec.paths["/v1/segments"]?.post).toBeDefined();
    expect(publicApiSpec.paths["/v1/segments/{segment_id}"]?.put).toBeDefined();
    expect(
      publicApiSpec.paths["/v1/jobs/subscriber-imports"]?.post,
    ).toBeDefined();
    expect(
      (
        publicApiSpec.components.schemas.SubscriberImportJobCreateRequest as {
          required?: string[];
          properties?: Record<string, Record<string, unknown>>;
        }
      ).required,
    ).toEqual(expect.arrayContaining(["csv_text", "mappings"]));
    expect(
      (
        publicApiSpec.components.schemas.SubscriberImportJobCreateRequest as {
          required?: string[];
        }
      ).required,
    ).not.toContain("permission_attested");
    expect(
      (
        publicApiSpec.components.schemas.SubscriberImportJobCreateRequest as {
          properties?: Record<string, unknown>;
        }
      ).properties,
    ).not.toHaveProperty("permission_attested");
    expect(
      (
        publicApiSpec.components.schemas.SubscriberImportJobCreateRequest as {
          properties?: {
            mappings?: {
              items?: {
                properties?: {
                  field?: {
                    properties?: { type?: { enum?: string[] } };
                  };
                };
              };
            };
          };
        }
      ).properties?.mappings?.items?.properties?.field?.properties?.type
        ?.enum ?? [],
    ).toEqual(
      expect.arrayContaining([
        "email",
        "name",
        "custom-field",
        "country",
        "subscriber-status",
      ]),
    );
    expect(
      (
        publicApiSpec.components.schemas.SubscriberImportJobCreateRequest as {
          properties?: {
            mappings?: {
              items?: {
                properties?: {
                  field?: {
                    properties?: { type?: { enum?: string[] } };
                  };
                };
              };
            };
          };
        }
      ).properties?.mappings?.items?.properties?.field?.properties?.type
        ?.enum ?? [],
    ).not.toEqual(
      expect.arrayContaining([
        "consent-source",
        "consent-date",
        "lawful-basis",
        "tracking-consent",
        "suppression-reason",
        "needs-consent",
      ]),
    );
    expect(
      (
        publicApiSpec.components.schemas.WebhookSubscriptionCreateRequest as {
          properties?: Record<string, Record<string, unknown>>;
        }
      ).properties?.url?.description,
    ).toContain("Public HTTPS destination URL");
  });

  it("documents the durable Broadcast start and bounded progress contracts", () => {
    const send =
      publicApiSpec.paths["/v1/broadcasts/{broadcast_id}/send"]?.post;
    expect(send?.responses["202"]).toMatchObject({
      content: {
        "application/json": {
          schema: {
            properties: {
              data: {
                required: ["status", "run_id", "resource"],
                properties: {
                  status: { enum: ["running", "queued"] },
                  run_id: { type: "string" },
                },
              },
            },
          },
        },
      },
    });
    expect(
      send?.requestBody?.content["application/json"]?.schema,
    ).toMatchObject({
      properties: {
        preflight_proof: { type: "string" },
      },
    });
    expect(
      send?.requestBody?.content["application/json"]?.schema?.properties,
    ).not.toHaveProperty("confirmation");
    expect(
      publicApiSpec.components.schemas.BroadcastSendProgress,
    ).toMatchObject({
      required: expect.arrayContaining([
        "selected",
        "provider",
        "estimated_completion_basis",
        "next_retry_at",
        "next_retry_action",
      ]),
      properties: {
        selected: { type: "integer" },
        provider: { type: "string", nullable: true },
        estimated_completion_basis: {
          type: "string",
          enum: ["current-rate", "provider-quota"],
          nullable: true,
          description: expect.any(String),
        },
        next_retry_at: expect.any(Object),
        next_retry_action: {
          type: "string",
          enum: ["resume", "recheck"],
          nullable: true,
          description: expect.any(String),
        },
      },
    });
    expect(
      publicApiSpec.components.schemas.BroadcastSendPreflight,
    ).not.toHaveProperty("additionalProperties", true);
    expect(
      publicApiSpec.components.schemas.BroadcastSendPreflight,
    ).toMatchObject({
      required: expect.arrayContaining(["send_proof", "send_proof_expires_at"]),
    });
    expect(
      publicApiSpec.paths["/v1/broadcasts/{broadcast_id}/delivery-errors"]?.get
        .responses["404"],
    ).toBeDefined();
  });

  it("documents landing page custom slug fields", () => {
    expect(
      publicApiSpec.components.schemas.LandingPage.properties,
    ).toMatchObject({
      custom_path: { type: "string", nullable: true },
      customPath: { type: "string", nullable: true },
    });
    expect(
      publicApiSpec.components.schemas.LandingPageUpsertRequest.properties,
    ).toMatchObject({
      custom_path: { type: "string", nullable: true },
      customPath: { type: "string", nullable: true },
    });
  });

  it("includes the shared developer guide sections", () => {
    expect(publicApiGuides.map((section) => section.id)).toEqual(
      expect.arrayContaining([
        "quickstart",
        "authentication",
        "pagination",
        "errors",
        "idempotency",
        "versioning",
        "webhooks",
      ]),
    );
  });

  it("publishes a generated SDK resource manifest for TypeScript and Python clients", () => {
    expect(publicApiSdkResources.map((resource) => resource.namespace)).toEqual(
      [
        "discovery",
        "workspace",
        "agentActivity",
        "analytics",
        "diagnostics",
        "subscribers",
        "tags",
        "customFields",
        "emailTemplates",
        "forms",
        "landingPages",
        "sequences",
        "automations",
        "magicLinks",
        "broadcasts",
        "segments",
        "webhookSubscriptions",
        "jobs",
      ],
    );
    expect(
      publicApiSdkResources.find(
        (resource) => resource.namespace === "discovery",
      )?.operations,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          methodName: "getMetadata",
          path: "/v1",
        }),
        expect.objectContaining({
          methodName: "getCapabilities",
          path: "/v1/capabilities",
        }),
      ]),
    );
    expect(
      publicApiSdkResources.find(
        (resource) => resource.namespace === "subscribers",
      )?.operations,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          methodName: "list",
          operationId: "listSubscribers",
          queryParams: expect.arrayContaining(["email"]),
        }),
      ]),
    );
    expect(
      publicApiSdkResources.find(
        (resource) => resource.namespace === "landingPages",
      )?.operations,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          methodName: "create",
          operationId: "createLandingPage",
        }),
        expect.objectContaining({
          methodName: "delete",
          operationId: "deleteLandingPage",
        }),
      ]),
    );
    expect(
      publicApiSdkResources.find(
        (resource) => resource.namespace === "broadcasts",
      )?.operations,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          methodName: "send",
          operationId: "sendBroadcast",
        }),
        expect.objectContaining({
          methodName: "sendTest",
          operationId: "testBroadcast",
        }),
      ]),
    );
    expect(
      publicApiSdkResources.find(
        (resource) => resource.namespace === "customFields",
      )?.operations,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          methodName: "create",
          operationId: "createCustomField",
        }),
        expect.objectContaining({
          methodName: "delete",
          operationId: "deleteCustomField",
        }),
      ]),
    );
    expect(
      publicApiSdkResources.find(
        (resource) => resource.namespace === "segments",
      )?.operations,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          methodName: "create",
          operationId: "createSegment",
        }),
        expect.objectContaining({
          methodName: "delete",
          operationId: "deleteSegment",
        }),
      ]),
    );
  });

  it("generates an exact MCP schema for every body-bearing operation", () => {
    for (const operation of getPublicApiOperations()) {
      const contract = publicApiMcpOperationContractMap.get(
        operation.operationId,
      );
      expect(contract, operation.operationId).toBeDefined();
      const properties = contract?.inputSchema.properties as
        | Record<string, unknown>
        | undefined;

      if (operation.requestBody) {
        expect(properties?.body, operation.operationId).toBeDefined();
        expect(properties?.body, operation.operationId).not.toEqual({});
        const required = (contract?.inputSchema.required ?? []) as string[];
        expect(required.includes("body"), operation.operationId).toBe(
          operation.requestBody.required === true,
        );
      } else {
        expect(properties?.body, operation.operationId).toBeUndefined();
      }
    }
  });

  it("preserves required fields, enums, formats, limits, nesting, nullable values, and examples in MCP schemas", () => {
    const upsert = publicApiMcpOperationContractMap.get("upsertSubscriber");
    const upsertDefinitions = upsert?.inputSchema.$defs as
      | Record<string, Record<string, unknown>>
      | undefined;
    const upsertRequest = upsertDefinitions?.SubscriberUpsertRequest;
    const upsertProperties = upsertRequest?.properties as
      | Record<string, Record<string, unknown>>
      | undefined;

    expect(upsertRequest).toMatchObject({
      type: "object",
      required: ["email"],
    });
    expect(upsertRequest?.examples).toEqual([
      expect.objectContaining({ email: "ada@example.com" }),
    ]);
    expect(upsertProperties?.email).toMatchObject({
      type: "string",
      format: "email",
    });
    expect(upsertProperties?.status.enum).toContain("Unsubscribed");
    expect(upsertProperties?.custom_fields).toMatchObject({
      type: "object",
      additionalProperties: true,
    });

    const template = publicApiMcpOperationContractMap.get(
      "createEmailTemplate",
    );
    const templateDefinitions = template?.inputSchema.$defs as
      | Record<string, Record<string, unknown>>
      | undefined;
    const templateProperties = templateDefinitions?.EmailTemplateUpsertRequest
      ?.properties as Record<string, Record<string, unknown>> | undefined;
    expect(templateProperties?.name?.maxLength).toBe(
      emailTemplateNameMaxLength,
    );
    expect(JSON.stringify(upsert?.outputSchema)).toContain('"type":"null"');
  });

  it("adds complete operation-specific risk, idempotency, and toolset metadata", () => {
    const sdkOperations = publicApiSdkResources.flatMap(
      (resource) => resource.operations,
    );
    const riskByOperation = new Map(
      publicApiAgentOperationRiskCatalog.map((risk) => [risk.operationId, risk]),
    );

    expect(publicApiMcpToolsetKeys).toEqual([
      "reporting",
      "subscriber_sync",
      "data_transfer",
      "content_and_targeting",
      "capture",
      "broadcast_preparation",
      "broadcast_sending",
      "sequence_preparation",
      "sequence_operations",
      "automations",
      "webhooks",
      "administration",
    ]);
    for (const operation of sdkOperations) {
      const risk = riskByOperation.get(operation.operationId);
      expect(operation, operation.operationId).toMatchObject({
        risk: risk?.risk,
        externalSideEffect: risk?.externalSideEffect,
        sideEffectClass: risk?.sideEffectClass,
        idempotencyPolicy: risk?.idempotencyPolicy,
      });
      expect(operation.toolsets, operation.operationId).toContain(
        "administration",
      );
      expect(operation.annotations, operation.operationId).toEqual({
        readOnlyHint: operation.risk === "read",
        destructiveHint: operation.risk === "delete",
        idempotentHint: operation.idempotencyPolicy !== "idempotency-key",
        openWorldHint: operation.externalSideEffect,
      });
      if (operation.idempotencyPolicy === "idempotency-key") {
        expect(operation.headerParams, operation.operationId).toContain(
          "Idempotency-Key",
        );
      }
    }

    expect(
      sdkOperations.find((operation) => operation.operationId === "testBroadcast"),
    ).toMatchObject({
      risk: "test",
      sideEffectClass: "external-email",
      annotations: { openWorldHint: true },
    });
  });

  it("keeps OpenAPI, capability, SDK, and MCP operation contracts in sync", () => {
    const openApiOperationIds = getPublicApiOperations()
      .map((operation) => operation.operationId)
      .sort();
    const capabilityOperationIds = publicApiCapabilityResources
      .flatMap((resource) => resource.operations)
      .map((operation) => operation.operationId)
      .concat([
        "getPublicApiMeta",
        "getPublicApiCapabilities",
        "getPublicApiOpenApiDocument",
      ])
      .sort();
    const sdkOperationIds = publicApiSdkResources
      .flatMap((resource) => resource.operations)
      .map((operation) => operation.operationId)
      .sort();
    const mcpOperationIds = publicApiMcpOperationContracts
      .map((operation) => operation.operationId)
      .sort();

    expect(capabilityOperationIds).toEqual(openApiOperationIds);
    expect(sdkOperationIds).toEqual(openApiOperationIds);
    expect(mcpOperationIds).toEqual(openApiOperationIds);
  });

  it("derives a stable operation list", () => {
    const operations = getPublicApiOperations();
    expect(operations.length).toBeGreaterThanOrEqual(25);
    expect(operations[0]?.path.startsWith("/v1")).toBe(true);
  });

  it("publishes the current authenticated resource capability map", () => {
    expect(
      publicApiCapabilityResources.map((resource) => resource.key),
    ).toEqual([
      "workspace",
      "agent_activity",
      "analytics",
      "diagnostics",
      "subscribers",
      "tags",
      "custom_fields",
      "email_templates",
      "forms",
      "landing_pages",
      "sequences",
      "automations",
      "magic_links",
      "broadcasts",
      "segments",
      "webhook_subscriptions",
      "jobs",
    ]);
    expect(
      publicApiCapabilityResources.find(
        (resource) => resource.key === "landing_pages",
      )?.operations,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          method: "GET",
          path: "/v1/landing-pages",
          requiredScopes: ["landing_pages:read"],
        }),
        expect.objectContaining({
          method: "DELETE",
          path: "/v1/landing-pages/{landing_page_id}",
          requiredScopes: ["landing_pages:delete"],
        }),
        expect.objectContaining({
          method: "GET",
          path: "/v1/landing-pages/{landing_page_id}/submissions",
          requiredScopes: ["landing_pages:submissions_read"],
        }),
      ]),
    );
    expect(
      publicApiCapabilityResources.find((resource) => resource.key === "forms")
        ?.operations,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          method: "GET",
          path: "/v1/forms/{form_id}/submissions",
          requiredScopes: ["forms:submissions_read"],
        }),
      ]),
    );
    expect(
      publicApiCapabilityResources.find(
        (resource) => resource.key === "broadcasts",
      )?.operations,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          method: "POST",
          path: "/v1/broadcasts/{broadcast_id}/send",
          requiredScopes: ["broadcasts:send"],
        }),
        expect.objectContaining({
          method: "GET",
          path: "/v1/broadcasts",
          requiredScopes: ["broadcasts:read"],
        }),
      ]),
    );
    expect(
      publicApiCapabilityResources.find(
        (resource) => resource.key === "custom_fields",
      )?.operations,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          method: "POST",
          path: "/v1/custom-fields",
          requiredScopes: ["custom_fields:configure"],
        }),
        expect.objectContaining({
          method: "DELETE",
          path: "/v1/custom-fields/{custom_field_id}",
          requiredScopes: ["custom_fields:delete"],
        }),
      ]),
    );
    expect(
      publicApiCapabilityResources.find(
        (resource) => resource.key === "segments",
      )?.operations,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          method: "POST",
          path: "/v1/segments",
          requiredScopes: ["segments:configure"],
        }),
        expect.objectContaining({
          method: "DELETE",
          path: "/v1/segments/{segment_id}",
          requiredScopes: ["segments:delete"],
        }),
      ]),
    );
    expect(
      publicApiCapabilityResources.find((resource) => resource.key === "jobs")
        ?.operations,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          method: "POST",
          path: "/v1/jobs/subscriber-imports",
          requiredScopes: ["subscribers:bulk_import"],
        }),
        expect.objectContaining({
          method: "GET",
          path: "/v1/jobs/subscriber-imports/{job_id}",
          requiredScopes: ["subscribers:bulk_import"],
        }),
        expect.objectContaining({
          method: "GET",
          path: "/v1/jobs/subscriber-exports/{job_id}",
          requiredScopes: ["subscribers:bulk_export"],
        }),
        expect.objectContaining({
          method: "POST",
          path: "/v1/jobs/subscriber-exports",
          requiredScopes: ["subscribers:bulk_export"],
        }),
      ]),
    );
    expect(
      publicApiCapabilityResources.find(
        (resource) => resource.key === "diagnostics",
      )?.operations,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          operationId: "listAutomationRunDiagnostics",
          requiredScopes: ["automations:read"],
        }),
        expect.objectContaining({
          operationId: "getSequenceDiagnostics",
          requiredScopes: ["sequences:read"],
        }),
        expect.objectContaining({
          operationId: "getBroadcastDiagnostics",
          requiredScopes: ["broadcasts:read"],
        }),
        expect.objectContaining({
          operationId: "getSubscriberActivityDiagnostics",
          requiredScopes: ["subscribers:read", "subscriptions:read"],
        }),
      ]),
    );
    expect(
      publicApiCapabilityResources.find(
        (resource) => resource.key === "subscribers",
      )?.operations,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          method: "PATCH",
          path: "/v1/subscribers/{subscriber_id}",
          requiredScopes: ["subscribers:profile"],
        }),
        expect.objectContaining({
          method: "DELETE",
          path: "/v1/subscribers/{subscriber_id}/tags/{tag_id}",
          requiredScopes: ["subscribers:targeting"],
        }),
        expect.objectContaining({
          method: "PUT",
          path: "/v1/subscribers/{subscriber_id}/sequences/{sequence_id}",
          requiredScopes: ["subscribers:sequence_enroll"],
        }),
        expect.objectContaining({
          method: "DELETE",
          path: "/v1/subscribers/{subscriber_id}/sequences/{sequence_id}",
          requiredScopes: ["subscribers:sequence_enroll"],
        }),
      ]),
    );
    expect(
      publicApiCapabilityResources.find(
        (resource) => resource.key === "webhook_subscriptions",
      )?.operations,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          method: "GET",
          path: "/v1/webhook-subscriptions",
          requiredScopes: ["webhooks:read"],
        }),
        expect.objectContaining({
          method: "DELETE",
          path: "/v1/webhook-subscriptions/{webhook_subscription_id}",
          requiredScopes: ["webhooks:write"],
        }),
      ]),
    );
    const webhookOperations =
      publicApiCapabilityResources.find(
        (resource) => resource.key === "webhook_subscriptions",
      )?.operations ?? [];
    expect(
      webhookOperations.find(
        (operation) => operation.operationId === "createWebhookSubscription",
      ),
    ).toEqual(
      expect.objectContaining({
        requiredScopes: ["webhooks:write"],
        eventPatternScopeRequirements:
          publicApiWebhookEventPatternScopeRequirements,
      }),
    );
    expect(
      webhookOperations.find(
        (operation) => operation.operationId === "updateWebhookSubscription",
      ),
    ).toEqual(
      expect.objectContaining({
        requiredScopes: ["webhooks:write"],
        eventPatternScopeRequirements:
          publicApiWebhookEventPatternScopeRequirements,
      }),
    );
  });

  it("publishes a canonical public API scope model", () => {
    expect(publicApiScopeDefinitions.map((scope) => scope.key)).toEqual(
      publicApiScopeKeys,
    );
    expect(publicApiDefaultScopeKeys).toEqual(
      expect.arrayContaining([
        "workspace:read",
        "custom_fields:read",
        "landing_pages:read",
        "segments:read",
        "webhooks:read",
      ]),
    );
    expect(normalizePublicApiScopeKeys(["tags:configure"])).toEqual([
      "tags:configure",
    ]);
    expect(normalizePublicApiScopeKeys(["invalid", "forms:read"])).toEqual([
      "forms:read",
    ]);
    expect(validatePublicApiScopeKeys(["tags:configure"])).toEqual({
      ok: true,
      value: ["tags:configure"],
    });
    expect(validatePublicApiScopeKeys(["tags:write"])).toEqual({
      ok: false,
      unsupportedScopeKeys: ["tags:write"],
    });
    expect(
      validatePublicApiScopeKeys(["forms:read", "invalid", "invalid"]),
    ).toEqual({
      ok: false,
      unsupportedScopeKeys: ["invalid"],
    });
    expect(publicApiScopePresets.map((preset) => preset.label)).toEqual([
      "Reporting",
      "Subscriber Sync",
      "Subscriber Import & Export",
      "Templates, Tags, Fields & Segments",
      "Forms, Landing Pages & Magic Links",
      "Broadcast Preparation",
      "Broadcast Sending",
      "Sequence Preparation",
      "Sequence Operations",
      "Automation Management",
      "Outbound Webhook Setup",
      "Full Administration",
    ]);
    expect([
      ...new Set(publicApiScopeDefinitions.map((scope) => scope.resourceKey)),
    ]).toEqual(publicApiScopeResourceOrder);
    expect(
      publicApiScopeDisplaySections.flatMap((section) =>
        section.resources.flatMap((resource) => resource.resourceKeys),
      ),
    ).toEqual(publicApiScopeResourceOrder);
    expect(
      publicApiScopePresetDisplaySections.flatMap(
        (section) => section.presetKeys,
      ),
    ).toEqual(publicApiScopePresets.map((preset) => preset.key));
    for (const preset of publicApiScopePresets) {
      expect(preset.scopeKeys).toEqual(
        normalizePublicApiScopeKeys(preset.scopeKeys),
      );
    }
    expect(
      publicApiScopePresets.find((preset) => preset.key === "full_administration")
        ?.scopeKeys,
    ).toEqual(publicApiScopeKeys);
    const reporting = publicApiScopePresets.find(
      (preset) => preset.key === "reporting",
    )!;
    expect(
      reporting.scopeKeys.every(
        (scopeKey) =>
          publicApiScopeDefinitions.find((scope) => scope.key === scopeKey)
            ?.action === "read",
      ),
    ).toBe(true);
    const broadcastPreparation = publicApiScopePresets.find(
      (preset) => preset.key === "broadcast_preparation",
    )!;
    expect(broadcastPreparation.scopeKeys).toContain("broadcasts:draft");
    expect(broadcastPreparation.scopeKeys).toContain("broadcasts:delete");
    expect(broadcastPreparation.scopeKeys).not.toEqual(
      expect.arrayContaining([
        "broadcasts:send",
        "sequences:activate",
        "automations:activate",
        "subscribers:bulk_import",
      ]),
    );
    const broadcastSending = publicApiScopePresets.find(
      (preset) => preset.key === "broadcast_sending",
    )!;
    expect(broadcastSending.scopeKeys).toEqual(
      expect.arrayContaining([
        "broadcasts:preflight",
        "broadcasts:test",
        "broadcasts:send",
        "broadcasts:cancel",
      ]),
    );
    expect(broadcastSending.scopeKeys).not.toEqual(
      expect.arrayContaining([
        "automations:draft",
        "automations:activate",
        "automations:delete",
      ]),
    );
    const sequencePreparation = publicApiScopePresets.find(
      (preset) => preset.key === "sequence_preparation",
    )!;
    expect(sequencePreparation.scopeKeys).toEqual(
      expect.arrayContaining([
        "sequences:read",
        "sequences:draft",
        "sequences:delete",
      ]),
    );
    expect(sequencePreparation.scopeKeys).not.toContain("sequences:activate");
    expect(sequencePreparation.scopeKeys).not.toContain(
      "subscribers:sequence_enroll",
    );
    const sequenceOperations = publicApiScopePresets.find(
      (preset) => preset.key === "sequence_operations",
    )!;
    expect(sequenceOperations.scopeKeys).toEqual(
      expect.arrayContaining([
        "sequences:read",
        "sequences:activate",
        "subscribers:sequence_enroll",
      ]),
    );
    expect(sequenceOperations.scopeKeys).not.toContain("sequences:draft");

    const captureManagement = publicApiScopePresets.find(
      (preset) => preset.key === "capture_management",
    )!;
    const subscriberSync = publicApiScopePresets.find(
      (preset) => preset.key === "subscriber_sync",
    )!;
    expect(subscriberSync.scopeKeys).toEqual(
      expect.arrayContaining(["subscriptions:read", "subscriptions:write"]),
    );
    expect(captureManagement.scopeKeys).not.toEqual(
      expect.arrayContaining([
        "subscribers:profile",
        "subscriptions:write",
        "subscribers:targeting",
      ]),
    );
    expect(broadcastPreparation.scopeKeys).not.toContain(
      "email_templates:draft",
    );
  });

  it("keeps every custom permission tied to an implemented API capability", () => {
    const implementedScopeKeys = new Set(
      publicApiCapabilityResources.flatMap((resource) =>
        resource.operations.flatMap((operation) => [
          ...operation.requiredScopes,
          ...Object.values(
            operation.payloadFieldScopeRequirements?.requiredScopesByField ??
              {},
          ).flat(),
        ]),
      ),
    );

    expect(
      publicApiScopeKeys.filter(
        (scopeKey) => !implementedScopeKeys.has(scopeKey),
      ),
    ).toEqual([]);
  });

  it("derives event-family scopes for webhook subscriptions", () => {
    expect(
      getPublicApiWebhookEventPatternRequiredScopes(["subscriber.*"]),
    ).toEqual(["subscribers:read", "subscriptions:read"]);
    expect(
      getPublicApiWebhookEventPatternRequiredScopes(["form.submitted"]),
    ).toEqual(["subscribers:read", "forms:read"]);
    expect(
      getPublicApiWebhookEventPatternRequiredScopes(["broadcast.*"]),
    ).toEqual(["broadcasts:read"]);
    expect(
      getPublicApiWebhookEventPatternRequiredScopes(["automation.*"]),
    ).toEqual(["subscribers:read", "automations:read"]);
    expect(getPublicApiWebhookEventPatternRequiredScopes(["*"])).toEqual(
      expect.arrayContaining([
        "subscribers:read",
        "subscriptions:read",
        "forms:read",
        "landing_pages:read",
        "broadcasts:read",
        "automations:read",
      ]),
    );
    expect(
      publicApiWebhookEventPatternScopeRequirements
        .requiredScopesByEventPattern["form.submitted"],
    ).toEqual(["subscribers:read", "forms:read"]);
    expect(
      publicApiWebhookEventPatternScopeRequirements
        .requiredScopesByEventPattern["automation.*"],
    ).toEqual(["subscribers:read", "automations:read"]);
  });
});

describe("OAuth discovery paths", () => {
  it("exports the standard well-known authorization server metadata path", () => {
    expect(publicApiOAuthWellKnownPath).toBe(
      "/.well-known/oauth-authorization-server",
    );
    expect(publicApiOpenIdConfigurationPath).toBe(
      "/.well-known/openid-configuration",
    );
  });

  it("exports the OAuth endpoint paths for authorization, token, revocation, and registration", () => {
    expect(publicApiOAuthAuthorizePath).toBe("/oauth/authorize");
    expect(publicApiOAuthTokenPath).toBe("/oauth/token");
    expect(publicApiOAuthRevokePath).toBe("/oauth/revoke");
    expect(publicApiOAuthRegisterPath).toBe("/oauth/register");
  });

  it("exports protected resource metadata paths for MCP OAuth discovery", () => {
    expect(publicApiOAuthProtectedResourcePath).toBe(
      "/.well-known/oauth-protected-resource",
    );
    expect(publicApiMcpOAuthProtectedResourcePath).toBe(
      "/.well-known/oauth-protected-resource/mcp",
    );
  });

  it("includes OAuth as a supported bearer credential path in the developer guide", () => {
    const authGuide = publicApiGuides.find(
      (section) => section.id === "authentication",
    );
    expect(authGuide).toBeDefined();
    const bodyText = authGuide!.body.join(" ");
    expect(bodyText.toLowerCase()).toContain("oauth");
  });

  it("documents the currently available public webhook Subscriber events", () => {
    const webhookGuide = publicApiGuides.find(
      (section) => section.id === "webhooks",
    );
    expect(webhookGuide).toBeDefined();
    const bodyText = webhookGuide!.body.join(" ");
    expect(bodyText).toContain("subscriber.created");
    expect(bodyText).toContain("subscriber.status_changed");
    expect(bodyText).not.toContain("subscriber.erasure_completed");
    expect(bodyText).toContain("not email addresses or raw technical evidence");
  });
});
