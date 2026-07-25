import { describe, expect, it } from "vitest";
import {
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
  publicApiWorkProfileDisplaySections,
  publicApiWorkProfiles,
  publicApiScopeResourceOrder,
  publicApiMcpToolsetKeys,
  publicApiQuickstart,
  publicApiResourceContracts,
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
  publicApiAgentOperationRiskCatalog,
} from "./index";

type PublicApiSchemaObject = {
  $ref?: string;
  additionalProperties?: unknown;
  allOf?: unknown[];
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
      publicApiExamplePayloads.webhookSubscription.event_patterns,
    ).toEqual(["subscriber.created", "subscriber.updated"]);
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
    expect(formDefinitionSchema.$ref).toBe(
      "#/components/schemas/FormDefinition",
    );
    const exactFormDefinitionSchema = publicApiSpec.components.schemas
      .FormDefinition as PublicApiSchemaObject;
    expect(exactFormDefinitionSchema.additionalProperties).toBe(false);
    expect(exactFormDefinitionSchema.required).toContain("builder");
    expect(exactFormDefinitionSchema.properties).toEqual(
      expect.objectContaining({
        display: expect.objectContaining({
          $ref: "#/components/schemas/FormDisplaySettings",
        }),
        builder: expect.objectContaining({
          type: "object",
          additionalProperties: false,
        }),
      }),
    );
    expect(exactFormDefinitionSchema.properties).not.toHaveProperty("fields");
    expect(exactFormDefinitionSchema.properties).not.toHaveProperty("styles");
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
    expect(formUpsertDefinitionSchema.allOf).toEqual([
      { $ref: "#/components/schemas/FormDefinition" },
    ]);
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
      publicApiSpec.paths["/v1/sequences/{sequence_id}/preflight"]?.get,
    ).toBeDefined();
    expect(
      publicApiSpec.paths["/v1/sequences/{sequence_id}/journey-preview"]?.get,
    ).toBeDefined();
    expect(
      publicApiSpec.paths["/v1/sequences/{sequence_id}/test"]?.post,
    ).toBeDefined();
    expect(
      publicApiSpec.paths["/v1/automations/{automation_id}/preflight"]?.get,
    ).toBeDefined();
    expect(
      publicApiSpec.paths[
        "/v1/automations/{automation_id}/journey-preview"
      ]?.get,
    ).toBeDefined();
    expect(
      publicApiSpec.paths["/v1/automations/{automation_id}/test"]?.post,
    ).toBeDefined();
    expect(
      (
        publicApiSpec.components.schemas.SubscriberImportJobCreateRequest as {
          required?: string[];
          properties?: Record<string, Record<string, unknown>>;
        }
      ).required,
    ).toEqual(expect.arrayContaining(["upload_id", "mappings"]));
    expect(
      publicApiSpec.paths["/v1/jobs/subscriber-import-uploads"]?.post,
    ).toBeDefined();
    expect(
      publicApiSpec.paths[
        "/v1/jobs/subscriber-import-uploads/{upload_id}"
      ]?.get,
    ).toBeDefined();
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

  it("publishes metadata-first starting points and create-by-id contracts", () => {
    expect(
      publicApiSdkResources.find(
        (resource) => resource.namespace === "startingPoints",
      )?.operations,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          operationId: "listEmailStartingPoints",
          requiredScopes: ["email_templates:read"],
        }),
        expect.objectContaining({
          operationId: "getFormStartingPoint",
          requiredScopes: ["forms:read"],
        }),
        expect.objectContaining({
          operationId: "getLandingPageStartingPoint",
          requiredScopes: ["landing_pages:read"],
        }),
      ]),
    );
    expect(
      publicApiSpec.components.schemas.EmailTemplateUpsertRequest.properties,
    ).toHaveProperty("starting_point_id");
    expect(
      publicApiSpec.components.schemas.FormUpsertRequest.properties,
    ).toHaveProperty("starting_point_id");
    expect(
      publicApiSpec.components.schemas.LandingPageUpsertRequest.properties,
    ).toHaveProperty("starting_point_id");
    expect(
      publicApiSpec.paths["/v1/starting-points/forms"]?.get?.responses?.[
        "200"
      ],
    ).toBeDefined();
  });

  it("publishes a generated SDK resource manifest for TypeScript and Python clients", () => {
    expect(publicApiSdkResources.map((resource) => resource.namespace)).toEqual(
      [
        "discovery",
        "workspace",
        "senderIdentities",
        "emailDeliveryConnections",
        "analytics",
        "diagnostics",
        "subscribers",
        "tags",
        "customFields",
        "emailTemplates",
        "startingPoints",
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
        (resource) => resource.namespace === "sequences",
      )?.operations,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          methodName: "preflight",
          operationId: "preflightSequence",
        }),
        expect.objectContaining({
          methodName: "previewJourney",
          operationId: "previewSequenceJourney",
        }),
        expect.objectContaining({
          methodName: "sendTest",
          operationId: "testSequence",
          requiredScopes: [
            "live_actions:write",
            "subscribers:read",
            "sequences:write",
          ],
        }),
      ]),
    );
    expect(
      publicApiSdkResources.find(
        (resource) => resource.namespace === "automations",
      )?.operations,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          methodName: "preflight",
          operationId: "preflightAutomation",
        }),
        expect.objectContaining({
          methodName: "previewJourney",
          operationId: "previewAutomationJourney",
        }),
        expect.objectContaining({
          methodName: "sendTest",
          operationId: "testAutomation",
          requiredScopes: [
            "live_actions:write",
            "subscribers:read",
            "automations:write",
          ],
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
          requiredScopes: [
            "live_actions:write",
            "subscribers:read",
            "broadcasts:write",
          ],
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

  it("publishes exact rich-object schemas and omission-safe update contracts", () => {
    for (const schemaName of [
      "AudienceDefinition",
      "BroadcastEmailDocument",
      "SequenceDefinition",
      "AutomationDefinition",
      "FormDefinition",
      "LandingPageDefinition",
      "LandingPageStyles",
      "LandingPageSettings",
    ]) {
      expect(
        publicApiSpec.components.schemas[schemaName],
        schemaName,
      ).not.toHaveProperty("additionalProperties", true);
    }

    for (const schemaName of [
      "TagUpdateRequest",
      "CustomFieldUpdateRequest",
      "EmailTemplateUpdateRequest",
      "FormUpdateRequest",
      "LandingPageUpdateRequest",
      "SequenceUpdateRequest",
      "AutomationUpdateRequest",
      "MagicLinkUpdateRequest",
      "BroadcastUpdateRequest",
      "SegmentUpdateRequest",
    ]) {
      const schema = publicApiSpec.components.schemas[
        schemaName
      ] as PublicApiSchemaObject;
      expect(schema.required, schemaName).toBeUndefined();
      expect(schema.additionalProperties, schemaName).toBe(false);
    }

    expect(publicApiSpec.paths["/v1/sender-identities"]?.get).toMatchObject({
      operationId: "listSenderIdentities",
    });
    expect(
      publicApiSpec.paths["/v1/broadcasts/{broadcast_id}/schedule"]?.put,
    ).toMatchObject({ operationId: "scheduleBroadcast" });
    expect(
      publicApiSpec.paths["/v1/broadcasts/{broadcast_id}/schedule"]?.delete,
    ).toMatchObject({ operationId: "unscheduleBroadcast" });
    expect(
      publicApiSpec.components.schemas.AutomationStatusRequest,
    ).toMatchObject({
      properties: {
        status: { enum: ["draft", "running", "paused"] },
      },
    });
  });

  it("adds complete operation-specific risk, idempotency, and toolset metadata", () => {
    const sdkOperations = publicApiSdkResources.flatMap(
      (resource) => resource.operations,
    );
    const riskByOperation = new Map(
      publicApiAgentOperationRiskCatalog.map((risk) => [risk.operationId, risk]),
    );

    expect(publicApiMcpToolsetKeys).toEqual([
      "full_email_marketing_access",
      "reporting",
      "subscriber_management",
      "content_and_capture",
      "broadcasts",
      "sequences",
      "automations",
      "email_delivery_setup",
      "subscriber_import_export",
      "outbound_webhooks",
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
        "full_email_marketing_access",
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
      "sender_identities",
      "email_delivery_connections",
      "analytics",
      "diagnostics",
      "subscribers",
      "tags",
      "custom_fields",
      "email_templates",
      "starting_points",
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
          requiredScopes: [
            "live_actions:write",
            "landing_pages:write",
          ],
        }),
        expect.objectContaining({
          method: "GET",
          path: "/v1/landing-pages/{landing_page_id}/submissions",
          requiredScopes: ["landing_page_submissions:read"],
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
          requiredScopes: ["form_submissions:read"],
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
          requiredScopes: [
            "live_actions:write",
            "broadcasts:write",
          ],
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
          requiredScopes: ["custom_fields:write"],
        }),
        expect.objectContaining({
          method: "DELETE",
          path: "/v1/custom-fields/{custom_field_id}",
          requiredScopes: ["custom_fields:write"],
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
          requiredScopes: ["segments:write"],
        }),
        expect.objectContaining({
          method: "DELETE",
          path: "/v1/segments/{segment_id}",
          requiredScopes: ["segments:write"],
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
          requiredScopes: [
            "live_actions:write",
            "subscribers:import",
          ],
        }),
        expect.objectContaining({
          method: "GET",
          path: "/v1/jobs/subscriber-imports/{job_id}",
          requiredScopes: ["subscribers:import"],
        }),
        expect.objectContaining({
          method: "GET",
          path: "/v1/jobs/subscriber-exports/{job_id}",
          requiredScopes: ["subscribers:export"],
        }),
        expect.objectContaining({
          method: "POST",
          path: "/v1/jobs/subscriber-exports",
          requiredScopes: ["subscribers:export"],
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
          requiredScopes: ["subscribers:read"],
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
          requiredScopes: ["subscribers:write"],
        }),
        expect.objectContaining({
          method: "DELETE",
          path: "/v1/subscribers/{subscriber_id}/tags/{tag_id}",
          requiredScopes: [
            "live_actions:write",
            "subscribers:write",
          ],
        }),
        expect.objectContaining({
          method: "PUT",
          path: "/v1/subscribers/{subscriber_id}/sequences/{sequence_id}",
          requiredScopes: [
            "live_actions:write",
            "subscribers:write",
          ],
        }),
        expect.objectContaining({
          method: "DELETE",
          path: "/v1/subscribers/{subscriber_id}/sequences/{sequence_id}",
          requiredScopes: [
            "live_actions:write",
            "subscribers:write",
          ],
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
          requiredScopes: [
            "live_actions:write",
            "webhooks:write",
          ],
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
        requiredScopes: [
          "live_actions:write",
          "webhooks:write",
        ],
      }),
    );
    expect(
      webhookOperations.find(
        (operation) => operation.operationId === "updateWebhookSubscription",
      ),
    ).toEqual(
      expect.objectContaining({
        requiredScopes: [
          "live_actions:write",
          "webhooks:write",
        ],
      }),
    );
  });

  it("publishes a canonical public API scope model", () => {
    expect(publicApiScopeDefinitions.map((scope) => scope.key)).toEqual(
      publicApiScopeKeys,
    );
    expect(publicApiDefaultScopeKeys).toEqual(publicApiScopeKeys);
    expect(normalizePublicApiScopeKeys(["tags:write"])).toEqual([
      "tags:write",
    ]);
    expect(normalizePublicApiScopeKeys(["invalid", "forms:read"])).toEqual([
      "forms:read",
    ]);
    expect(validatePublicApiScopeKeys(["tags:write"])).toEqual({
      ok: true,
      value: ["tags:write"],
    });
    expect(validatePublicApiScopeKeys(["tags:configure"])).toEqual({
      ok: false,
      unsupportedScopeKeys: ["tags:configure"],
    });
    expect(
      validatePublicApiScopeKeys(["forms:read", "invalid", "invalid"]),
    ).toEqual({
      ok: false,
      unsupportedScopeKeys: ["invalid"],
    });
    expect(publicApiWorkProfiles.map((preset) => preset.label)).toEqual([
      "Full Email Marketing Access",
      "Reporting",
      "Subscriber Management",
      "Content And Capture",
      "Broadcasts",
      "Sequences",
      "Automations",
      "Email Delivery Setup",
      "Subscriber Import And Export",
      "Outbound Webhooks",
    ]);
    expect([
      ...new Set(publicApiScopeDefinitions.map((scope) => scope.resourceKey)),
    ]).toEqual(publicApiScopeResourceOrder);
    expect(
      publicApiScopeDisplaySections.flatMap((section) =>
        section.resources.flatMap((resource) => resource.resourceKeys),
      ),
    ).toEqual(publicApiScopeResourceOrder);
    const displayedWorkProfileKeys =
      publicApiWorkProfileDisplaySections.flatMap(
        (section) => section.profileKeys,
      );
    expect(new Set(displayedWorkProfileKeys)).toEqual(
      new Set(publicApiWorkProfiles.map((preset) => preset.key)),
    );
    expect(displayedWorkProfileKeys).toHaveLength(
      new Set(displayedWorkProfileKeys).size,
    );
    for (const preset of publicApiWorkProfiles) {
      expect(preset.scopeKeys).toEqual(
        normalizePublicApiScopeKeys(preset.scopeKeys),
      );
    }
    expect(
      publicApiWorkProfiles.find((preset) => preset.key === "full_email_marketing_access")
        ?.scopeKeys,
    ).toEqual(publicApiScopeKeys);
    const reporting = publicApiWorkProfiles.find(
      (preset) => preset.key === "reporting",
    )!;
    expect(
      reporting.scopeKeys.every(
        (scopeKey) =>
          publicApiScopeDefinitions.find((scope) => scope.key === scopeKey)
            ?.action === "read",
      ),
    ).toBe(true);
    expect(reporting.scopeKeys).not.toContain("webhooks:read");
    const fullEmailMarketingAccess = publicApiWorkProfiles.find(
      (profile) => profile.key === "full_email_marketing_access",
    )!;
    expect(fullEmailMarketingAccess.scopeKeys).toEqual(publicApiScopeKeys);
    const broadcasts = publicApiWorkProfiles.find(
      (profile) => profile.key === "broadcasts",
    )!;
    expect(broadcasts.scopeKeys).toEqual(
      expect.arrayContaining(["broadcasts:read", "broadcasts:write"]),
    );
    expect(broadcasts.scopeKeys).not.toContain("sequences:write");
    const subscriberManagement = publicApiWorkProfiles.find(
      (profile) => profile.key === "subscriber_management",
    )!;
    expect(subscriberManagement.scopeKeys).toEqual(
      expect.arrayContaining(["subscribers:read", "subscribers:write"]),
    );
  });

  it("keeps every custom permission tied to an implemented API capability", () => {
    const implementedScopeKeys = new Set(
      publicApiCapabilityResources.flatMap((resource) =>
        resource.operations.flatMap((operation) => operation.requiredScopes),
      ),
    );

    expect(
      publicApiScopeKeys.filter(
        (scopeKey) => !implementedScopeKeys.has(scopeKey),
      ),
    ).toEqual([]);
  });

  it("keeps every durable resource directly retrievable through the contract", () => {
    const operations = publicApiCapabilityResources.flatMap(
      (resource) => resource.operations,
    );
    const operationPathKeys = new Set(
      operations.map((operation) => `${operation.method} ${operation.path}`),
    );
    const declaredPaths = publicApiResourceContracts.flatMap((resource) => [
      ...(resource.collectionPaths ?? []),
      ...(resource.itemPaths ?? []),
    ]);

    for (const path of declaredPaths) {
      expect(
        operations.some((operation) => operation.path === path),
        path,
      ).toBe(true);
    }
    for (const resource of publicApiResourceContracts) {
      if (
        resource.archetype === "derived_view" ||
        resource.archetype === "ephemeral_handle"
      ) {
        continue;
      }
      for (const itemPath of resource.itemPaths ?? []) {
        expect(operationPathKeys.has(`GET ${itemPath}`), itemPath).toBe(true);
      }
    }

    expect(
      publicApiResourceContracts.find(
        (resource) => resource.key === "subscribers",
      )?.exactNaturalKeys,
    ).toEqual(["email"]);
    expect(
      publicApiResourceContracts
        .filter((resource) => resource.key !== "subscribers")
        .every((resource) => resource.exactNaturalKeys.length === 0),
    ).toBe(true);
  });

  it("keeps outbound webhook authorization at the resource level", () => {
    const webhookOperations =
      publicApiCapabilityResources.find(
        (resource) => resource.key === "webhook_subscriptions",
      )?.operations ?? [];
    expect(
      webhookOperations
        .filter((operation) => operation.method === "GET")
        .every((operation) =>
          operation.requiredScopes.includes("webhooks:read"),
        ),
    ).toBe(true);
    expect(
      webhookOperations
        .filter((operation) => operation.method !== "GET")
        .every((operation) =>
          operation.requiredScopes.includes("webhooks:write"),
        ),
    ).toBe(true);
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
