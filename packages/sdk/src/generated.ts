// This file is generated from packages/public-api/src/index.ts.
// Run `pnpm generate:agent-artifacts` after changing the public API contract.

export const generatedMailrithSdkContractVersion = "v1";

export const generatedMailrithAgentReadQuickstartScopeKeys = [
  "workspace:read",
  "subscribers:read"
] as const;

export const generatedMailrithSdkResources = [
  {
    "namespace": "discovery",
    "name": "Discovery",
    "description": "Resolve Mailrith metadata, OpenAPI, and authenticated capabilities before calling workspace-scoped resources.",
    "operations": [
      {
        "namespace": "discovery",
        "methodName": "getMetadata",
        "operationId": "getPublicApiMeta",
        "method": "GET",
        "path": "/v1",
        "summary": "Get API metadata",
        "description": "Returns the current public API version and discovery links for docs, llms files, the OpenAPI contract, webhook subscriptions, and the authenticated capability endpoint.",
        "authRequired": false,
        "requiredScopes": [],
        "mcpToolName": "discovery_get_metadata",
        "risk": "read",
        "externalSideEffect": false,
        "sideEffectClass": "none",
        "retryMode": "safe",
        "idempotencyPolicy": "safe-read",
        "toolsets": [
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
          "administration"
        ],
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Returns public version and discovery metadata.",
        "pathParams": [],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      },
      {
        "namespace": "discovery",
        "methodName": "getCapabilities",
        "operationId": "getPublicApiCapabilities",
        "method": "GET",
        "path": "/v1/capabilities",
        "summary": "Get authenticated API capabilities",
        "description": "Returns the current workspace context, discovery URLs, shared request conventions, supported webhook events, and public resource operations available to the authenticated bearer credential.",
        "authRequired": true,
        "requiredScopes": [],
        "mcpToolName": "discovery_get_capabilities",
        "risk": "read",
        "externalSideEffect": false,
        "sideEffectClass": "none",
        "retryMode": "safe",
        "idempotencyPolicy": "safe-read",
        "toolsets": [
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
          "administration"
        ],
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Returns the authenticated credential and workspace capability boundary.",
        "pathParams": [],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      },
      {
        "namespace": "discovery",
        "methodName": "getOpenApiDocument",
        "operationId": "getPublicApiOpenApiDocument",
        "method": "GET",
        "path": "/v1/openapi.json",
        "summary": "Get the OpenAPI document",
        "description": "Returns the machine-readable OpenAPI 3.1 contract for the current public API.",
        "authRequired": false,
        "requiredScopes": [],
        "mcpToolName": "discovery_get_open_api_document",
        "risk": "read",
        "externalSideEffect": false,
        "sideEffectClass": "none",
        "retryMode": "safe",
        "idempotencyPolicy": "safe-read",
        "toolsets": [
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
          "administration"
        ],
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Returns the public API contract without reading workspace data.",
        "pathParams": [],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      }
    ]
  },
  {
    "namespace": "workspace",
    "name": "Workspace",
    "description": "Read the current authenticated workspace profile, mailing context, and stable workspace identifier.",
    "operations": [
      {
        "namespace": "workspace",
        "methodName": "get",
        "operationId": "getWorkspace",
        "method": "GET",
        "path": "/v1/workspace",
        "summary": "Get the current workspace",
        "description": "Returns the authenticated workspace profile and mailing context used by broadcasts, sequences, automations, forms, and magic links.",
        "authRequired": true,
        "requiredScopes": [
          "workspace:read"
        ],
        "mcpToolName": "workspace_get",
        "risk": "read",
        "externalSideEffect": false,
        "sideEffectClass": "none",
        "retryMode": "safe",
        "idempotencyPolicy": "safe-read",
        "toolsets": [
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
          "administration"
        ],
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Reads one authenticated workspace profile.",
        "pathParams": [],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      }
    ]
  },
  {
    "namespace": "agentActivity",
    "name": "Agent Activity",
    "description": "Inspect the bounded, redacted activity trail for agent-originated workspace changes.",
    "operations": [
      {
        "namespace": "agentActivity",
        "methodName": "list",
        "operationId": "listAgentActivity",
        "method": "GET",
        "path": "/v1/agent-activity",
        "summary": "List agent activity",
        "description": "Returns one redacted row per logical agent-originated mutation. Results use keyset pagination, default to seven days, and cannot span more than 30 days.",
        "authRequired": true,
        "requiredScopes": [
          "activity:read"
        ],
        "mcpToolName": "agent_activity_list",
        "risk": "read",
        "externalSideEffect": false,
        "sideEffectClass": "none",
        "retryMode": "safe",
        "idempotencyPolicy": "safe-read",
        "toolsets": [
          "reporting",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Reads a bounded, redacted page of agent-originated workspace mutations.",
        "pathParams": [],
        "queryParams": [
          "limit",
          "cursor",
          "from",
          "to",
          "client",
          "credential_type",
          "credential_id",
          "operation",
          "risk",
          "outcome",
          "resource_type",
          "resource_id",
          "request_id",
          "activity_id"
        ],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      },
      {
        "namespace": "agentActivity",
        "methodName": "get",
        "operationId": "getAgentActivity",
        "method": "GET",
        "path": "/v1/agent-activity/{activity_id}",
        "summary": "Get agent activity",
        "description": "Returns one redacted activity trail with correlation, retry, result, and retention metadata.",
        "authRequired": true,
        "requiredScopes": [
          "activity:read"
        ],
        "mcpToolName": "agent_activity_get",
        "risk": "read",
        "externalSideEffect": false,
        "sideEffectClass": "none",
        "retryMode": "safe",
        "idempotencyPolicy": "safe-read",
        "toolsets": [
          "reporting",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Reads one redacted agent mutation trail by its stable action identifier.",
        "pathParams": [
          "activity_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      }
    ]
  },
  {
    "namespace": "analytics",
    "name": "Analytics",
    "description": "Run bounded aggregate reports from compact daily rollups, with explicit metric definitions and previous-period comparisons.",
    "operations": [
      {
        "namespace": "analytics",
        "methodName": "createReport",
        "operationId": "createAnalyticsReport",
        "method": "POST",
        "path": "/v1/analytics/reports",
        "summary": "Create or reuse an analytics report",
        "description": "Runs from compact rollups. Ranges through 31 days complete inline; longer ranges are queued. Results expire after 24 hours and never exceed 100 rows.",
        "authRequired": true,
        "requiredScopes": [
          "analytics:read"
        ],
        "mcpToolName": "analytics_create_report",
        "risk": "read",
        "externalSideEffect": false,
        "sideEffectClass": "none",
        "retryMode": "safe",
        "idempotencyPolicy": "safe-read",
        "toolsets": [
          "reporting",
          "content_and_targeting",
          "broadcast_preparation",
          "broadcast_sending",
          "sequence_preparation",
          "sequence_operations",
          "automations",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Creates or reuses one bounded, expiring aggregate report from compact rollups.",
        "pathParams": [],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": true,
        "requestBodyRequired": true
      },
      {
        "namespace": "analytics",
        "methodName": "getReport",
        "operationId": "getAnalyticsReport",
        "method": "GET",
        "path": "/v1/analytics/reports/{report_id}",
        "summary": "Get an analytics report",
        "description": "Returns one unexpired bounded analytics report by identifier.",
        "authRequired": true,
        "requiredScopes": [
          "analytics:read"
        ],
        "mcpToolName": "analytics_get_report",
        "risk": "read",
        "externalSideEffect": false,
        "sideEffectClass": "none",
        "retryMode": "safe",
        "idempotencyPolicy": "safe-read",
        "toolsets": [
          "reporting",
          "content_and_targeting",
          "broadcast_preparation",
          "broadcast_sending",
          "sequence_preparation",
          "sequence_operations",
          "automations",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Reads one bounded, expiring aggregate report.",
        "pathParams": [
          "report_id"
        ],
        "queryParams": [
          "limit",
          "starting_after"
        ],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      }
    ]
  },
  {
    "namespace": "diagnostics",
    "name": "Diagnostics",
    "description": "Inspect bounded, privacy-conscious execution, delivery, suppression, consent, and engagement diagnostics.",
    "operations": [
      {
        "namespace": "diagnostics",
        "methodName": "listAutomationRuns",
        "operationId": "listAutomationRunDiagnostics",
        "method": "GET",
        "path": "/v1/diagnostics/automations/{automation_id}/runs",
        "summary": "List Automation run diagnostics",
        "description": "Returns at most 50 recent runs with redacted errors and bounded step execution details.",
        "authRequired": true,
        "requiredScopes": [
          "automations:read"
        ],
        "mcpToolName": "diagnostics_list_automation_runs",
        "risk": "read",
        "externalSideEffect": false,
        "sideEffectClass": "none",
        "retryMode": "safe",
        "idempotencyPolicy": "safe-read",
        "toolsets": [
          "reporting",
          "automations",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Reads a bounded page of redacted Automation run diagnostics.",
        "pathParams": [
          "automation_id"
        ],
        "queryParams": [
          "limit"
        ],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      },
      {
        "namespace": "diagnostics",
        "methodName": "getAutomationRun",
        "operationId": "getAutomationRunDiagnostics",
        "method": "GET",
        "path": "/v1/diagnostics/automations/{automation_id}/runs/{run_id}",
        "summary": "Get Automation run diagnostics",
        "description": "Returns one Automation run with status, timing, retries, outcomes, and redacted step failures.",
        "authRequired": true,
        "requiredScopes": [
          "automations:read"
        ],
        "mcpToolName": "diagnostics_get_automation_run",
        "risk": "read",
        "externalSideEffect": false,
        "sideEffectClass": "none",
        "retryMode": "safe",
        "idempotencyPolicy": "safe-read",
        "toolsets": [
          "reporting",
          "automations",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Reads one redacted Automation run and its bounded step diagnostics.",
        "pathParams": [
          "automation_id",
          "run_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      },
      {
        "namespace": "diagnostics",
        "methodName": "getSequence",
        "operationId": "getSequenceDiagnostics",
        "method": "GET",
        "path": "/v1/diagnostics/sequences/{sequence_id}",
        "summary": "Get Sequence diagnostics",
        "description": "Returns bounded Sequence failure, retry, status, and message outcome details.",
        "authRequired": true,
        "requiredScopes": [
          "sequences:read"
        ],
        "mcpToolName": "diagnostics_get_sequence",
        "risk": "read",
        "externalSideEffect": false,
        "sideEffectClass": "none",
        "retryMode": "safe",
        "idempotencyPolicy": "safe-read",
        "toolsets": [
          "reporting",
          "sequence_preparation",
          "sequence_operations",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Reads bounded Sequence failure and retry diagnostics.",
        "pathParams": [
          "sequence_id"
        ],
        "queryParams": [
          "limit"
        ],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      },
      {
        "namespace": "diagnostics",
        "methodName": "getBroadcast",
        "operationId": "getBroadcastDiagnostics",
        "method": "GET",
        "path": "/v1/diagnostics/broadcasts/{broadcast_id}",
        "summary": "Get Broadcast diagnostics",
        "description": "Returns selection totals, provider readiness, and the 20 most common structured delivery reasons.",
        "authRequired": true,
        "requiredScopes": [
          "broadcasts:read"
        ],
        "mcpToolName": "diagnostics_get_broadcast",
        "risk": "read",
        "externalSideEffect": false,
        "sideEffectClass": "none",
        "retryMode": "safe",
        "idempotencyPolicy": "safe-read",
        "toolsets": [
          "reporting",
          "broadcast_preparation",
          "broadcast_sending",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Reads bounded Broadcast selection, provider readiness, and delivery reasons.",
        "pathParams": [
          "broadcast_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      },
      {
        "namespace": "diagnostics",
        "methodName": "getSubscriber",
        "operationId": "getSubscriberActivityDiagnostics",
        "method": "GET",
        "path": "/v1/diagnostics/subscribers/{subscriber_id}",
        "summary": "Get privacy-conscious Subscriber diagnostics",
        "description": "Returns a 90-day, bounded activity view without exposing the Subscriber email address.",
        "authRequired": true,
        "requiredScopes": [
          "subscribers:read",
          "subscriptions:read"
        ],
        "mcpToolName": "diagnostics_get_subscriber",
        "risk": "read",
        "externalSideEffect": false,
        "sideEffectClass": "none",
        "retryMode": "safe",
        "idempotencyPolicy": "safe-read",
        "toolsets": [
          "reporting",
          "subscriber_sync",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Reads one privacy-conscious Subscriber activity and subscription summary without an email address.",
        "pathParams": [
          "subscriber_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      }
    ]
  },
  {
    "namespace": "subscribers",
    "name": "Subscribers",
    "description": "List subscribers in the authenticated workspace and create or upsert subscriber records by email.",
    "operations": [
      {
        "namespace": "subscribers",
        "methodName": "list",
        "operationId": "listSubscribers",
        "method": "GET",
        "path": "/v1/subscribers",
        "summary": "List subscribers",
        "description": "Returns subscribers in the authenticated workspace, sorted from newest to oldest.",
        "authRequired": true,
        "requiredScopes": [
          "subscribers:read"
        ],
        "mcpToolName": "subscribers_list",
        "risk": "read",
        "externalSideEffect": false,
        "sideEffectClass": "none",
        "retryMode": "safe",
        "idempotencyPolicy": "safe-read",
        "toolsets": [
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
          "administration"
        ],
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Reads a bounded, cursor-paginated page of Subscribers.",
        "pathParams": [],
        "queryParams": [
          "search",
          "email",
          "status",
          "cold_only",
          "tag_id",
          "tag_ids",
          "tag_operator",
          "sequence_id",
          "sequence_ids",
          "sequence_operator",
          "limit",
          "starting_after"
        ],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      },
      {
        "namespace": "subscribers",
        "methodName": "upsert",
        "operationId": "upsertSubscriber",
        "method": "POST",
        "path": "/v1/subscribers",
        "summary": "Create or upsert a subscriber",
        "description": "Creates a new subscriber when the email does not exist in the workspace. If the email already exists, the API updates the existing subscriber unless create_only is true.",
        "authRequired": true,
        "requiredScopes": [
          "subscribers:profile"
        ],
        "mcpToolName": "subscribers_upsert",
        "risk": "execute",
        "externalSideEffect": false,
        "sideEffectClass": "subscriber-change",
        "retryMode": "idempotency-key",
        "idempotencyPolicy": "idempotency-key",
        "toolsets": [
          "subscriber_sync",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": false,
          "idempotentHint": false,
          "openWorldHint": false
        },
        "riskRationale": "Creates or changes one Subscriber and can change sending eligibility.",
        "pathParams": [],
        "queryParams": [],
        "headerParams": [
          "Idempotency-Key"
        ],
        "hasRequestBody": true,
        "requestBodyRequired": true,
        "payloadFieldScopeRequirements": {
          "description": "Subscriber relationship fields require their matching granular permission in addition to the operation's base permissions.",
          "requiredScopesByField": {
            "status": [
              "subscriptions:write"
            ],
            "existing_tag_ids": [
              "subscribers:targeting"
            ],
            "new_tags": [
              "subscribers:targeting"
            ],
            "form_id": [
              "subscribers:targeting"
            ],
            "sequence_ids": [
              "subscribers:sequence_enroll"
            ],
            "consent_evidence": [
              "subscriptions:write"
            ]
          }
        }
      },
      {
        "namespace": "subscribers",
        "methodName": "update",
        "operationId": "updateSubscriber",
        "method": "PATCH",
        "path": "/v1/subscribers/{subscriber_id}",
        "summary": "Update a subscriber",
        "description": "Updates profile fields, status, custom fields, tags, or sequence assignments for one subscriber. Fields omitted from the request stay unchanged. Blank optional custom field values also leave saved values unchanged, and filled-in invalid values are rejected.",
        "authRequired": true,
        "requiredScopes": [
          "subscribers:profile"
        ],
        "mcpToolName": "subscribers_update",
        "risk": "draft",
        "externalSideEffect": false,
        "sideEffectClass": "subscriber-change",
        "retryMode": "resource-state",
        "idempotencyPolicy": "resource-state",
        "toolsets": [
          "subscriber_sync",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Changes one Subscriber profile or custom-field values without changing sending eligibility.",
        "pathParams": [
          "subscriber_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": true,
        "requestBodyRequired": true,
        "payloadFieldScopeRequirements": {
          "description": "Subscriber relationship fields require their matching granular permission in addition to the operation's base permissions.",
          "requiredScopesByField": {
            "status": [
              "subscriptions:write"
            ],
            "existing_tag_ids": [
              "subscribers:targeting"
            ],
            "new_tags": [
              "subscribers:targeting"
            ],
            "form_id": [
              "subscribers:targeting"
            ],
            "sequence_ids": [
              "subscribers:sequence_enroll"
            ],
            "consent_evidence": [
              "subscriptions:write"
            ]
          }
        }
      },
      {
        "namespace": "subscribers",
        "methodName": "delete",
        "operationId": "deleteSubscriber",
        "method": "DELETE",
        "path": "/v1/subscribers/{subscriber_id}",
        "summary": "Delete a subscriber",
        "description": "Permanently removes one Subscriber and their Mailrith activity history from the authenticated workspace.",
        "authRequired": true,
        "requiredScopes": [
          "subscribers:delete"
        ],
        "mcpToolName": "subscribers_delete",
        "risk": "delete",
        "externalSideEffect": false,
        "sideEffectClass": "deletion",
        "retryMode": "resource-state",
        "idempotencyPolicy": "resource-state",
        "toolsets": [
          "subscriber_sync",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": true,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Permanently removes one Subscriber and their Mailrith activity history.",
        "pathParams": [
          "subscriber_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      },
      {
        "namespace": "subscribers",
        "methodName": "updateStatus",
        "operationId": "updateSubscriberStatus",
        "method": "PUT",
        "path": "/v1/subscribers/{subscriber_id}/status",
        "summary": "Change Subscriber sending eligibility",
        "description": "Changes the delivery status for one Subscriber without changing profile, targeting, or Sequence enrollment fields.",
        "authRequired": true,
        "requiredScopes": [
          "subscriptions:write"
        ],
        "mcpToolName": "subscribers_update_status",
        "risk": "execute",
        "externalSideEffect": false,
        "sideEffectClass": "subscriber-change",
        "retryMode": "resource-state",
        "idempotencyPolicy": "resource-state",
        "toolsets": [
          "subscriber_sync",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Changes whether one Subscriber can receive email.",
        "pathParams": [
          "subscriber_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": true,
        "requestBodyRequired": true
      },
      {
        "namespace": "subscribers",
        "methodName": "addTag",
        "operationId": "addSubscriberTag",
        "method": "PUT",
        "path": "/v1/subscribers/{subscriber_id}/tags/{tag_id}",
        "summary": "Add a Tag to a Subscriber",
        "description": "Adds the selected Tag to a Subscriber. If the Subscriber already has the Tag, the API returns the Subscriber unchanged.",
        "authRequired": true,
        "requiredScopes": [
          "subscribers:targeting"
        ],
        "mcpToolName": "subscribers_add_tag",
        "risk": "execute",
        "externalSideEffect": false,
        "sideEffectClass": "subscriber-change",
        "retryMode": "resource-state",
        "idempotencyPolicy": "resource-state",
        "toolsets": [
          "subscriber_sync",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Changes one Subscriber's targeting and Automation eligibility.",
        "pathParams": [
          "subscriber_id",
          "tag_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      },
      {
        "namespace": "subscribers",
        "methodName": "removeTag",
        "operationId": "removeSubscriberTag",
        "method": "DELETE",
        "path": "/v1/subscribers/{subscriber_id}/tags/{tag_id}",
        "summary": "Remove a tag from a subscriber",
        "description": "Removes the selected tag from a subscriber. If the subscriber does not have the tag, the API returns the subscriber unchanged.",
        "authRequired": true,
        "requiredScopes": [
          "subscribers:targeting"
        ],
        "mcpToolName": "subscribers_remove_tag",
        "risk": "execute",
        "externalSideEffect": false,
        "sideEffectClass": "subscriber-change",
        "retryMode": "resource-state",
        "idempotencyPolicy": "resource-state",
        "toolsets": [
          "subscriber_sync",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Changes one Subscriber's targeting and automation eligibility.",
        "pathParams": [
          "subscriber_id",
          "tag_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      },
      {
        "namespace": "subscribers",
        "methodName": "addToSequence",
        "operationId": "addSubscriberSequence",
        "method": "PUT",
        "path": "/v1/subscribers/{subscriber_id}/sequences/{sequence_id}",
        "summary": "Add a subscriber to a sequence",
        "description": "Adds the selected subscriber to the selected sequence. If the subscriber is already in the sequence, the API returns the subscriber unchanged.",
        "authRequired": true,
        "requiredScopes": [
          "subscribers:sequence_enroll"
        ],
        "mcpToolName": "subscribers_add_to_sequence",
        "risk": "execute",
        "externalSideEffect": true,
        "sideEffectClass": "external-email",
        "retryMode": "resource-state",
        "idempotencyPolicy": "resource-state",
        "toolsets": [
          "sequence_operations",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": true
        },
        "riskRationale": "Enrollment can cause a running Sequence to send email to the Subscriber.",
        "pathParams": [
          "subscriber_id",
          "sequence_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      },
      {
        "namespace": "subscribers",
        "methodName": "removeFromSequence",
        "operationId": "removeSubscriberSequence",
        "method": "DELETE",
        "path": "/v1/subscribers/{subscriber_id}/sequences/{sequence_id}",
        "summary": "Remove a subscriber from a sequence",
        "description": "Removes the selected subscriber from the selected sequence. If the subscriber is not in the sequence, the API returns the subscriber unchanged.",
        "authRequired": true,
        "requiredScopes": [
          "subscribers:sequence_enroll"
        ],
        "mcpToolName": "subscribers_remove_from_sequence",
        "risk": "execute",
        "externalSideEffect": false,
        "sideEffectClass": "subscriber-change",
        "retryMode": "resource-state",
        "idempotencyPolicy": "resource-state",
        "toolsets": [
          "sequence_operations",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Removes one Subscriber from a lifecycle workflow.",
        "pathParams": [
          "subscriber_id",
          "sequence_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      }
    ]
  },
  {
    "namespace": "tags",
    "name": "Tags",
    "description": "Read the workspace tag catalog and create tags for targeting, imports, and automation entry conditions.",
    "operations": [
      {
        "namespace": "tags",
        "methodName": "list",
        "operationId": "listTags",
        "method": "GET",
        "path": "/v1/tags",
        "summary": "List tags",
        "description": "Returns tags in the authenticated workspace.",
        "authRequired": true,
        "requiredScopes": [
          "tags:read"
        ],
        "mcpToolName": "tags_list",
        "risk": "read",
        "externalSideEffect": false,
        "sideEffectClass": "none",
        "retryMode": "safe",
        "idempotencyPolicy": "safe-read",
        "toolsets": [
          "reporting",
          "subscriber_sync",
          "data_transfer",
          "content_and_targeting",
          "capture",
          "broadcast_preparation",
          "sequence_preparation",
          "automations",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Reads the bounded Tag catalog.",
        "pathParams": [],
        "queryParams": [
          "search",
          "limit",
          "starting_after"
        ],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      },
      {
        "namespace": "tags",
        "methodName": "create",
        "operationId": "createTag",
        "method": "POST",
        "path": "/v1/tags",
        "summary": "Create a tag",
        "description": "Creates a new tag in the authenticated workspace. The GDPR consent tag names can be created and applied like other tags when you need to apply consent collected outside Mailrith. Tag-level double opt-in fields are no longer accepted; configure double opt-in on forms and landing pages instead.",
        "authRequired": true,
        "requiredScopes": [
          "tags:configure"
        ],
        "mcpToolName": "tags_create",
        "risk": "draft",
        "externalSideEffect": false,
        "sideEffectClass": "workspace-change",
        "retryMode": "idempotency-key",
        "idempotencyPolicy": "idempotency-key",
        "toolsets": [
          "subscriber_sync",
          "content_and_targeting",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": false,
          "idempotentHint": false,
          "openWorldHint": false
        },
        "riskRationale": "Creates targeting metadata without contacting Subscribers.",
        "pathParams": [],
        "queryParams": [],
        "headerParams": [
          "Idempotency-Key"
        ],
        "hasRequestBody": true,
        "requestBodyRequired": true
      },
      {
        "namespace": "tags",
        "methodName": "get",
        "operationId": "getTag",
        "method": "GET",
        "path": "/v1/tags/{tag_id}",
        "summary": "Get a tag",
        "description": "Returns one Tag from the authenticated workspace.",
        "authRequired": true,
        "requiredScopes": [
          "tags:read"
        ],
        "mcpToolName": "tags_get",
        "risk": "read",
        "externalSideEffect": false,
        "sideEffectClass": "none",
        "retryMode": "safe",
        "idempotencyPolicy": "safe-read",
        "toolsets": [
          "reporting",
          "subscriber_sync",
          "data_transfer",
          "content_and_targeting",
          "capture",
          "broadcast_preparation",
          "sequence_preparation",
          "automations",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Reads one Tag definition.",
        "pathParams": [
          "tag_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      },
      {
        "namespace": "tags",
        "methodName": "update",
        "operationId": "updateTag",
        "method": "PUT",
        "path": "/v1/tags/{tag_id}",
        "summary": "Update a tag",
        "description": "Changes the name and description of one Tag in the authenticated workspace.",
        "authRequired": true,
        "requiredScopes": [
          "tags:configure"
        ],
        "mcpToolName": "tags_update",
        "risk": "draft",
        "externalSideEffect": false,
        "sideEffectClass": "workspace-change",
        "retryMode": "resource-state",
        "idempotencyPolicy": "resource-state",
        "toolsets": [
          "subscriber_sync",
          "content_and_targeting",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Changes targeting metadata without contacting Subscribers.",
        "pathParams": [
          "tag_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": true,
        "requestBodyRequired": true
      },
      {
        "namespace": "tags",
        "methodName": "delete",
        "operationId": "deleteTag",
        "method": "DELETE",
        "path": "/v1/tags/{tag_id}",
        "summary": "Delete a tag",
        "description": "Permanently removes one Tag when no saved Mailrith resource references it.",
        "authRequired": true,
        "requiredScopes": [
          "tags:delete"
        ],
        "mcpToolName": "tags_delete",
        "risk": "delete",
        "externalSideEffect": false,
        "sideEffectClass": "deletion",
        "retryMode": "resource-state",
        "idempotencyPolicy": "resource-state",
        "toolsets": [
          "content_and_targeting",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": true,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Permanently removes targeting metadata when no saved resource references it.",
        "pathParams": [
          "tag_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      }
    ]
  },
  {
    "namespace": "customFields",
    "name": "Custom Fields",
    "description": "Read and manage custom-field definitions before writing subscriber custom-field values.",
    "operations": [
      {
        "namespace": "customFields",
        "methodName": "list",
        "operationId": "listCustomFields",
        "method": "GET",
        "path": "/v1/custom-fields",
        "summary": "List custom fields",
        "description": "Returns custom fields in the authenticated workspace.",
        "authRequired": true,
        "requiredScopes": [
          "custom_fields:read"
        ],
        "mcpToolName": "custom_fields_list",
        "risk": "read",
        "externalSideEffect": false,
        "sideEffectClass": "none",
        "retryMode": "safe",
        "idempotencyPolicy": "safe-read",
        "toolsets": [
          "reporting",
          "subscriber_sync",
          "data_transfer",
          "content_and_targeting",
          "capture",
          "broadcast_preparation",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Reads the bounded custom-field schema.",
        "pathParams": [],
        "queryParams": [
          "limit",
          "starting_after"
        ],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      },
      {
        "namespace": "customFields",
        "methodName": "create",
        "operationId": "createCustomField",
        "method": "POST",
        "path": "/v1/custom-fields",
        "summary": "Create a custom field",
        "description": "Creates a workspace-scoped custom-field definition.",
        "authRequired": true,
        "requiredScopes": [
          "custom_fields:configure"
        ],
        "mcpToolName": "custom_fields_create",
        "risk": "draft",
        "externalSideEffect": false,
        "sideEffectClass": "workspace-change",
        "retryMode": "idempotency-key",
        "idempotencyPolicy": "idempotency-key",
        "toolsets": [
          "subscriber_sync",
          "content_and_targeting",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": false,
          "idempotentHint": false,
          "openWorldHint": false
        },
        "riskRationale": "Creates a custom-field definition.",
        "pathParams": [],
        "queryParams": [],
        "headerParams": [
          "Idempotency-Key"
        ],
        "hasRequestBody": true,
        "requestBodyRequired": true
      },
      {
        "namespace": "customFields",
        "methodName": "get",
        "operationId": "getCustomField",
        "method": "GET",
        "path": "/v1/custom-fields/{custom_field_id}",
        "summary": "Get a custom field",
        "description": "Returns one custom field from the authenticated workspace.",
        "authRequired": true,
        "requiredScopes": [
          "custom_fields:read"
        ],
        "mcpToolName": "custom_fields_get",
        "risk": "read",
        "externalSideEffect": false,
        "sideEffectClass": "none",
        "retryMode": "safe",
        "idempotencyPolicy": "safe-read",
        "toolsets": [
          "reporting",
          "subscriber_sync",
          "data_transfer",
          "content_and_targeting",
          "capture",
          "broadcast_preparation",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Reads one custom-field definition.",
        "pathParams": [
          "custom_field_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      },
      {
        "namespace": "customFields",
        "methodName": "update",
        "operationId": "updateCustomField",
        "method": "PUT",
        "path": "/v1/custom-fields/{custom_field_id}",
        "summary": "Update a custom field",
        "description": "Updates a custom-field definition for the authenticated workspace.",
        "authRequired": true,
        "requiredScopes": [
          "custom_fields:configure"
        ],
        "mcpToolName": "custom_fields_update",
        "risk": "draft",
        "externalSideEffect": false,
        "sideEffectClass": "workspace-change",
        "retryMode": "resource-state",
        "idempotencyPolicy": "resource-state",
        "toolsets": [
          "subscriber_sync",
          "content_and_targeting",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Changes a custom-field definition used by Subscriber data.",
        "pathParams": [
          "custom_field_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": true,
        "requestBodyRequired": true
      },
      {
        "namespace": "customFields",
        "methodName": "delete",
        "operationId": "deleteCustomField",
        "method": "DELETE",
        "path": "/v1/custom-fields/{custom_field_id}",
        "summary": "Delete a custom field",
        "description": "Deletes a custom-field definition from the authenticated workspace.",
        "authRequired": true,
        "requiredScopes": [
          "custom_fields:delete"
        ],
        "mcpToolName": "custom_fields_delete",
        "risk": "delete",
        "externalSideEffect": false,
        "sideEffectClass": "deletion",
        "retryMode": "resource-state",
        "idempotencyPolicy": "resource-state",
        "toolsets": [
          "content_and_targeting",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": true,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Permanently removes a field definition and associated values.",
        "pathParams": [
          "custom_field_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      }
    ]
  },
  {
    "namespace": "emailTemplates",
    "name": "Email Templates",
    "description": "Create and manage reusable email templates that agents can apply across broadcasts, sequences, and automations.",
    "operations": [
      {
        "namespace": "emailTemplates",
        "methodName": "list",
        "operationId": "listEmailTemplates",
        "method": "GET",
        "path": "/v1/email-templates",
        "summary": "List email templates",
        "description": "Returns reusable email templates linked to the authenticated workspace.",
        "authRequired": true,
        "requiredScopes": [
          "email_templates:read"
        ],
        "mcpToolName": "email_templates_list",
        "risk": "read",
        "externalSideEffect": false,
        "sideEffectClass": "none",
        "retryMode": "safe",
        "idempotencyPolicy": "safe-read",
        "toolsets": [
          "reporting",
          "content_and_targeting",
          "broadcast_preparation",
          "sequence_preparation",
          "automations",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Reads a bounded page of reusable email templates.",
        "pathParams": [],
        "queryParams": [
          "limit",
          "starting_after"
        ],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      },
      {
        "namespace": "emailTemplates",
        "methodName": "create",
        "operationId": "createEmailTemplate",
        "method": "POST",
        "path": "/v1/email-templates",
        "summary": "Create an email template",
        "description": "Creates a reusable email template scoped to the authenticated workspace.",
        "authRequired": true,
        "requiredScopes": [
          "email_templates:draft"
        ],
        "mcpToolName": "email_templates_create",
        "risk": "draft",
        "externalSideEffect": false,
        "sideEffectClass": "workspace-change",
        "retryMode": "idempotency-key",
        "idempotencyPolicy": "idempotency-key",
        "toolsets": [
          "content_and_targeting",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": false,
          "idempotentHint": false,
          "openWorldHint": false
        },
        "riskRationale": "Creates reusable draft content without sending email.",
        "pathParams": [],
        "queryParams": [],
        "headerParams": [
          "Idempotency-Key"
        ],
        "hasRequestBody": true,
        "requestBodyRequired": true
      },
      {
        "namespace": "emailTemplates",
        "methodName": "get",
        "operationId": "getEmailTemplate",
        "method": "GET",
        "path": "/v1/email-templates/{template_id}",
        "summary": "Get an email template",
        "description": "Returns a reusable email template linked to the authenticated workspace.",
        "authRequired": true,
        "requiredScopes": [
          "email_templates:read"
        ],
        "mcpToolName": "email_templates_get",
        "risk": "read",
        "externalSideEffect": false,
        "sideEffectClass": "none",
        "retryMode": "safe",
        "idempotencyPolicy": "safe-read",
        "toolsets": [
          "reporting",
          "content_and_targeting",
          "broadcast_preparation",
          "sequence_preparation",
          "automations",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Reads one reusable email template.",
        "pathParams": [
          "template_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      },
      {
        "namespace": "emailTemplates",
        "methodName": "update",
        "operationId": "updateEmailTemplate",
        "method": "PUT",
        "path": "/v1/email-templates/{template_id}",
        "summary": "Update an email template",
        "description": "Updates the content or enabled state of an existing email template.",
        "authRequired": true,
        "requiredScopes": [
          "email_templates:draft"
        ],
        "mcpToolName": "email_templates_update",
        "risk": "draft",
        "externalSideEffect": false,
        "sideEffectClass": "workspace-change",
        "retryMode": "resource-state",
        "idempotencyPolicy": "resource-state",
        "toolsets": [
          "content_and_targeting",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Changes reusable draft content without sending email.",
        "pathParams": [
          "template_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": true,
        "requestBodyRequired": true
      },
      {
        "namespace": "emailTemplates",
        "methodName": "delete",
        "operationId": "deleteEmailTemplate",
        "method": "DELETE",
        "path": "/v1/email-templates/{template_id}",
        "summary": "Delete an email template",
        "description": "Deletes an existing email template linked to the authenticated workspace.",
        "authRequired": true,
        "requiredScopes": [
          "email_templates:delete"
        ],
        "mcpToolName": "email_templates_delete",
        "risk": "delete",
        "externalSideEffect": false,
        "sideEffectClass": "deletion",
        "retryMode": "resource-state",
        "idempotencyPolicy": "resource-state",
        "toolsets": [
          "content_and_targeting",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": true,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Permanently removes reusable email content.",
        "pathParams": [
          "template_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      }
    ]
  },
  {
    "namespace": "forms",
    "name": "Forms",
    "description": "Create and manage Mailrith-managed forms, then inspect definitions, styling payloads, and public URLs.",
    "operations": [
      {
        "namespace": "forms",
        "methodName": "list",
        "operationId": "listForms",
        "method": "GET",
        "path": "/v1/forms",
        "summary": "List forms",
        "description": "Returns forms from the authenticated workspace.",
        "authRequired": true,
        "requiredScopes": [
          "forms:read"
        ],
        "mcpToolName": "forms_list",
        "risk": "read",
        "externalSideEffect": false,
        "sideEffectClass": "none",
        "retryMode": "safe",
        "idempotencyPolicy": "safe-read",
        "toolsets": [
          "reporting",
          "capture",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Reads a bounded page of Forms.",
        "pathParams": [],
        "queryParams": [
          "search",
          "limit",
          "starting_after"
        ],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      },
      {
        "namespace": "forms",
        "methodName": "create",
        "operationId": "createForm",
        "method": "POST",
        "path": "/v1/forms",
        "summary": "Create a form",
        "description": "Creates a form in the authenticated workspace.",
        "authRequired": true,
        "requiredScopes": [
          "forms:configure"
        ],
        "mcpToolName": "forms_create",
        "risk": "draft",
        "externalSideEffect": true,
        "sideEffectClass": "workspace-change",
        "retryMode": "idempotency-key",
        "idempotencyPolicy": "idempotency-key",
        "toolsets": [
          "capture",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": false,
          "idempotentHint": false,
          "openWorldHint": true
        },
        "riskRationale": "Creates a publicly reachable Subscriber capture surface.",
        "pathParams": [],
        "queryParams": [],
        "headerParams": [
          "Idempotency-Key"
        ],
        "hasRequestBody": true,
        "requestBodyRequired": true
      },
      {
        "namespace": "forms",
        "methodName": "get",
        "operationId": "getForm",
        "method": "GET",
        "path": "/v1/forms/{form_id}",
        "summary": "Get a form",
        "description": "Returns a form from the authenticated workspace.",
        "authRequired": true,
        "requiredScopes": [
          "forms:read"
        ],
        "mcpToolName": "forms_get",
        "risk": "read",
        "externalSideEffect": false,
        "sideEffectClass": "none",
        "retryMode": "safe",
        "idempotencyPolicy": "safe-read",
        "toolsets": [
          "reporting",
          "capture",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Reads one Form definition.",
        "pathParams": [
          "form_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      },
      {
        "namespace": "forms",
        "methodName": "listSubmissions",
        "operationId": "listFormSubmissions",
        "method": "GET",
        "path": "/v1/forms/{form_id}/submissions",
        "summary": "List form submissions",
        "description": "Returns recent real submissions for one form, including the subscriber who submitted the form. Requires both `forms:read` and `subscribers:read`.",
        "authRequired": true,
        "requiredScopes": [
          "forms:submissions_read"
        ],
        "mcpToolName": "forms_list_submissions",
        "risk": "read",
        "externalSideEffect": false,
        "sideEffectClass": "none",
        "retryMode": "safe",
        "idempotencyPolicy": "safe-read",
        "toolsets": [
          "reporting",
          "capture",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Reads a bounded page of Form submissions and Subscriber data.",
        "pathParams": [
          "form_id"
        ],
        "queryParams": [
          "limit",
          "starting_after"
        ],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      },
      {
        "namespace": "forms",
        "methodName": "update",
        "operationId": "updateForm",
        "method": "PUT",
        "path": "/v1/forms/{form_id}",
        "summary": "Update a form",
        "description": "Updates an existing form without creating a new form.",
        "authRequired": true,
        "requiredScopes": [
          "forms:configure"
        ],
        "mcpToolName": "forms_update",
        "risk": "draft",
        "externalSideEffect": true,
        "sideEffectClass": "workspace-change",
        "retryMode": "resource-state",
        "idempotencyPolicy": "resource-state",
        "toolsets": [
          "capture",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": true
        },
        "riskRationale": "Changes a publicly reachable Subscriber capture surface.",
        "pathParams": [
          "form_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": true,
        "requestBodyRequired": true
      },
      {
        "namespace": "forms",
        "methodName": "delete",
        "operationId": "deleteForm",
        "method": "DELETE",
        "path": "/v1/forms/{form_id}",
        "summary": "Delete a form",
        "description": "Deletes a form from the authenticated workspace.",
        "authRequired": true,
        "requiredScopes": [
          "forms:delete"
        ],
        "mcpToolName": "forms_delete",
        "risk": "delete",
        "externalSideEffect": true,
        "sideEffectClass": "deletion",
        "retryMode": "resource-state",
        "idempotencyPolicy": "resource-state",
        "toolsets": [
          "capture",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": true,
          "idempotentHint": true,
          "openWorldHint": true
        },
        "riskRationale": "Removes a public Subscriber capture surface.",
        "pathParams": [
          "form_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      }
    ]
  },
  {
    "namespace": "landingPages",
    "name": "Landing Pages",
    "description": "Create and manage Mailrith-hosted landing pages, custom slugs, page definitions, settings, and public URLs.",
    "operations": [
      {
        "namespace": "landingPages",
        "methodName": "list",
        "operationId": "listLandingPages",
        "method": "GET",
        "path": "/v1/landing-pages",
        "summary": "List landing pages",
        "description": "Returns landing pages from the authenticated workspace.",
        "authRequired": true,
        "requiredScopes": [
          "landing_pages:read"
        ],
        "mcpToolName": "landing_pages_list",
        "risk": "read",
        "externalSideEffect": false,
        "sideEffectClass": "none",
        "retryMode": "safe",
        "idempotencyPolicy": "safe-read",
        "toolsets": [
          "reporting",
          "capture",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Reads a bounded page of Landing Pages.",
        "pathParams": [],
        "queryParams": [
          "search",
          "limit",
          "starting_after"
        ],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      },
      {
        "namespace": "landingPages",
        "methodName": "create",
        "operationId": "createLandingPage",
        "method": "POST",
        "path": "/v1/landing-pages",
        "summary": "Create a landing page",
        "description": "Creates a hosted landing page in the authenticated workspace.",
        "authRequired": true,
        "requiredScopes": [
          "landing_pages:configure"
        ],
        "mcpToolName": "landing_pages_create",
        "risk": "draft",
        "externalSideEffect": true,
        "sideEffectClass": "workspace-change",
        "retryMode": "idempotency-key",
        "idempotencyPolicy": "idempotency-key",
        "toolsets": [
          "capture",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": false,
          "idempotentHint": false,
          "openWorldHint": true
        },
        "riskRationale": "Creates a publicly reachable hosted page.",
        "pathParams": [],
        "queryParams": [],
        "headerParams": [
          "Idempotency-Key"
        ],
        "hasRequestBody": true,
        "requestBodyRequired": true
      },
      {
        "namespace": "landingPages",
        "methodName": "get",
        "operationId": "getLandingPage",
        "method": "GET",
        "path": "/v1/landing-pages/{landing_page_id}",
        "summary": "Get a landing page",
        "description": "Returns a landing page from the authenticated workspace.",
        "authRequired": true,
        "requiredScopes": [
          "landing_pages:read"
        ],
        "mcpToolName": "landing_pages_get",
        "risk": "read",
        "externalSideEffect": false,
        "sideEffectClass": "none",
        "retryMode": "safe",
        "idempotencyPolicy": "safe-read",
        "toolsets": [
          "reporting",
          "capture",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Reads one Landing Page definition.",
        "pathParams": [
          "landing_page_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      },
      {
        "namespace": "landingPages",
        "methodName": "listSubmissions",
        "operationId": "listLandingPageSubmissions",
        "method": "GET",
        "path": "/v1/landing-pages/{landing_page_id}/submissions",
        "summary": "List landing page submissions",
        "description": "Returns recent real submissions for one landing page, including the subscriber who submitted the landing page. Requires both `landing_pages:read` and `subscribers:read`.",
        "authRequired": true,
        "requiredScopes": [
          "landing_pages:submissions_read"
        ],
        "mcpToolName": "landing_pages_list_submissions",
        "risk": "read",
        "externalSideEffect": false,
        "sideEffectClass": "none",
        "retryMode": "safe",
        "idempotencyPolicy": "safe-read",
        "toolsets": [
          "reporting",
          "capture",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Reads a bounded page of Landing Page submissions and Subscriber data.",
        "pathParams": [
          "landing_page_id"
        ],
        "queryParams": [
          "limit",
          "starting_after"
        ],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      },
      {
        "namespace": "landingPages",
        "methodName": "update",
        "operationId": "updateLandingPage",
        "method": "PUT",
        "path": "/v1/landing-pages/{landing_page_id}",
        "summary": "Update a landing page",
        "description": "Updates an existing hosted landing page without creating a new landing page.",
        "authRequired": true,
        "requiredScopes": [
          "landing_pages:configure"
        ],
        "mcpToolName": "landing_pages_update",
        "risk": "draft",
        "externalSideEffect": true,
        "sideEffectClass": "workspace-change",
        "retryMode": "resource-state",
        "idempotencyPolicy": "resource-state",
        "toolsets": [
          "capture",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": true
        },
        "riskRationale": "Changes a publicly reachable hosted page.",
        "pathParams": [
          "landing_page_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": true,
        "requestBodyRequired": true
      },
      {
        "namespace": "landingPages",
        "methodName": "delete",
        "operationId": "deleteLandingPage",
        "method": "DELETE",
        "path": "/v1/landing-pages/{landing_page_id}",
        "summary": "Delete a landing page",
        "description": "Deletes a landing page from the authenticated workspace.",
        "authRequired": true,
        "requiredScopes": [
          "landing_pages:delete"
        ],
        "mcpToolName": "landing_pages_delete",
        "risk": "delete",
        "externalSideEffect": true,
        "sideEffectClass": "deletion",
        "retryMode": "resource-state",
        "idempotencyPolicy": "resource-state",
        "toolsets": [
          "capture",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": true,
          "idempotentHint": true,
          "openWorldHint": true
        },
        "riskRationale": "Removes a public hosted page.",
        "pathParams": [
          "landing_page_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      }
    ]
  },
  {
    "namespace": "sequences",
    "name": "Sequences",
    "description": "Create and manage onboarding or lifecycle sequences, including status, delivery settings, and definition payloads.",
    "operations": [
      {
        "namespace": "sequences",
        "methodName": "list",
        "operationId": "listSequences",
        "method": "GET",
        "path": "/v1/sequences",
        "summary": "List sequences",
        "description": "Returns sequences in the authenticated workspace.",
        "authRequired": true,
        "requiredScopes": [
          "sequences:read"
        ],
        "mcpToolName": "sequences_list",
        "risk": "read",
        "externalSideEffect": false,
        "sideEffectClass": "none",
        "retryMode": "safe",
        "idempotencyPolicy": "safe-read",
        "toolsets": [
          "reporting",
          "sequence_preparation",
          "sequence_operations",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Reads a bounded page of Sequences and aggregate results.",
        "pathParams": [],
        "queryParams": [
          "search",
          "limit",
          "starting_after"
        ],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      },
      {
        "namespace": "sequences",
        "methodName": "create",
        "operationId": "createSequence",
        "method": "POST",
        "path": "/v1/sequences",
        "summary": "Create a sequence",
        "description": "Creates a sequence in the authenticated workspace.",
        "authRequired": true,
        "requiredScopes": [
          "sequences:draft"
        ],
        "mcpToolName": "sequences_create",
        "risk": "draft",
        "externalSideEffect": false,
        "sideEffectClass": "workspace-change",
        "retryMode": "idempotency-key",
        "idempotencyPolicy": "idempotency-key",
        "toolsets": [
          "sequence_preparation",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": false,
          "idempotentHint": false,
          "openWorldHint": false
        },
        "riskRationale": "Creates a paused Sequence without starting delivery.",
        "pathParams": [],
        "queryParams": [],
        "headerParams": [
          "Idempotency-Key"
        ],
        "hasRequestBody": true,
        "requestBodyRequired": true
      },
      {
        "namespace": "sequences",
        "methodName": "get",
        "operationId": "getSequence",
        "method": "GET",
        "path": "/v1/sequences/{sequence_id}",
        "summary": "Get a sequence",
        "description": "Returns one sequence from the authenticated workspace.",
        "authRequired": true,
        "requiredScopes": [
          "sequences:read"
        ],
        "mcpToolName": "sequences_get",
        "risk": "read",
        "externalSideEffect": false,
        "sideEffectClass": "none",
        "retryMode": "safe",
        "idempotencyPolicy": "safe-read",
        "toolsets": [
          "reporting",
          "sequence_preparation",
          "sequence_operations",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Reads one Sequence definition and aggregate results.",
        "pathParams": [
          "sequence_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      },
      {
        "namespace": "sequences",
        "methodName": "update",
        "operationId": "updateSequence",
        "method": "PUT",
        "path": "/v1/sequences/{sequence_id}",
        "summary": "Update a sequence",
        "description": "Updates an existing sequence.",
        "authRequired": true,
        "requiredScopes": [
          "sequences:draft"
        ],
        "mcpToolName": "sequences_update",
        "risk": "draft",
        "externalSideEffect": false,
        "sideEffectClass": "workspace-change",
        "retryMode": "resource-state",
        "idempotencyPolicy": "resource-state",
        "toolsets": [
          "sequence_preparation",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Changes a paused Sequence without starting delivery.",
        "pathParams": [
          "sequence_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": true,
        "requestBodyRequired": true
      },
      {
        "namespace": "sequences",
        "methodName": "updateStatus",
        "operationId": "updateSequenceStatus",
        "method": "PUT",
        "path": "/v1/sequences/{sequence_id}/status",
        "summary": "Activate or pause a sequence",
        "description": "Starts or pauses one Sequence without changing its content or delivery settings.",
        "authRequired": true,
        "requiredScopes": [
          "sequences:activate"
        ],
        "mcpToolName": "sequences_update_status",
        "risk": "execute",
        "externalSideEffect": true,
        "sideEffectClass": "external-email",
        "retryMode": "resource-state",
        "idempotencyPolicy": "resource-state",
        "toolsets": [
          "sequence_operations",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": true
        },
        "riskRationale": "Starts or pauses a Sequence that can send email.",
        "pathParams": [
          "sequence_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": true,
        "requestBodyRequired": true
      },
      {
        "namespace": "sequences",
        "methodName": "delete",
        "operationId": "deleteSequence",
        "method": "DELETE",
        "path": "/v1/sequences/{sequence_id}",
        "summary": "Delete a sequence",
        "description": "Deletes an existing sequence from the authenticated workspace.",
        "authRequired": true,
        "requiredScopes": [
          "sequences:delete"
        ],
        "mcpToolName": "sequences_delete",
        "risk": "delete",
        "externalSideEffect": false,
        "sideEffectClass": "deletion",
        "retryMode": "resource-state",
        "idempotencyPolicy": "resource-state",
        "toolsets": [
          "sequence_preparation",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": true,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Permanently removes a lifecycle workflow.",
        "pathParams": [
          "sequence_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      }
    ]
  },
  {
    "namespace": "automations",
    "name": "Automations",
    "description": "Create and manage automations with explicit lifecycle states and normalized definition payloads.",
    "operations": [
      {
        "namespace": "automations",
        "methodName": "list",
        "operationId": "listAutomations",
        "method": "GET",
        "path": "/v1/automations",
        "summary": "List automations",
        "description": "Returns automations in the authenticated workspace.",
        "authRequired": true,
        "requiredScopes": [
          "automations:read"
        ],
        "mcpToolName": "automations_list",
        "risk": "read",
        "externalSideEffect": false,
        "sideEffectClass": "none",
        "retryMode": "safe",
        "idempotencyPolicy": "safe-read",
        "toolsets": [
          "reporting",
          "automations",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Reads a bounded page of Automation definitions and states.",
        "pathParams": [],
        "queryParams": [
          "limit",
          "starting_after"
        ],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      },
      {
        "namespace": "automations",
        "methodName": "create",
        "operationId": "createAutomation",
        "method": "POST",
        "path": "/v1/automations",
        "summary": "Create an automation",
        "description": "Creates an automation in the authenticated workspace.",
        "authRequired": true,
        "requiredScopes": [
          "automations:draft"
        ],
        "mcpToolName": "automations_create",
        "risk": "draft",
        "externalSideEffect": false,
        "sideEffectClass": "workspace-change",
        "retryMode": "idempotency-key",
        "idempotencyPolicy": "idempotency-key",
        "toolsets": [
          "automations",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": false,
          "idempotentHint": false,
          "openWorldHint": false
        },
        "riskRationale": "Creates an inactive Automation without running actions.",
        "pathParams": [],
        "queryParams": [],
        "headerParams": [
          "Idempotency-Key"
        ],
        "hasRequestBody": true,
        "requestBodyRequired": true
      },
      {
        "namespace": "automations",
        "methodName": "get",
        "operationId": "getAutomation",
        "method": "GET",
        "path": "/v1/automations/{automation_id}",
        "summary": "Get an automation",
        "description": "Returns one automation from the authenticated workspace.",
        "authRequired": true,
        "requiredScopes": [
          "automations:read"
        ],
        "mcpToolName": "automations_get",
        "risk": "read",
        "externalSideEffect": false,
        "sideEffectClass": "none",
        "retryMode": "safe",
        "idempotencyPolicy": "safe-read",
        "toolsets": [
          "reporting",
          "automations",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Reads one Automation definition and state.",
        "pathParams": [
          "automation_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      },
      {
        "namespace": "automations",
        "methodName": "update",
        "operationId": "updateAutomation",
        "method": "PUT",
        "path": "/v1/automations/{automation_id}",
        "summary": "Update an automation",
        "description": "Updates an existing automation.",
        "authRequired": true,
        "requiredScopes": [
          "automations:draft"
        ],
        "mcpToolName": "automations_update",
        "risk": "draft",
        "externalSideEffect": false,
        "sideEffectClass": "workspace-change",
        "retryMode": "resource-state",
        "idempotencyPolicy": "resource-state",
        "toolsets": [
          "automations",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Changes an inactive Automation without running actions.",
        "pathParams": [
          "automation_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": true,
        "requestBodyRequired": true
      },
      {
        "namespace": "automations",
        "methodName": "updateStatus",
        "operationId": "updateAutomationStatus",
        "method": "PUT",
        "path": "/v1/automations/{automation_id}/status",
        "summary": "Activate or pause an automation",
        "description": "Starts or pauses one Automation without changing its definition.",
        "authRequired": true,
        "requiredScopes": [
          "automations:activate"
        ],
        "mcpToolName": "automations_update_status",
        "risk": "execute",
        "externalSideEffect": true,
        "sideEffectClass": "external-email",
        "retryMode": "resource-state",
        "idempotencyPolicy": "resource-state",
        "toolsets": [
          "automations",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": true
        },
        "riskRationale": "Starts or pauses an Automation that can run external actions.",
        "pathParams": [
          "automation_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": true,
        "requestBodyRequired": true
      },
      {
        "namespace": "automations",
        "methodName": "delete",
        "operationId": "deleteAutomation",
        "method": "DELETE",
        "path": "/v1/automations/{automation_id}",
        "summary": "Delete an automation",
        "description": "Deletes an automation from the authenticated workspace.",
        "authRequired": true,
        "requiredScopes": [
          "automations:delete"
        ],
        "mcpToolName": "automations_delete",
        "risk": "delete",
        "externalSideEffect": false,
        "sideEffectClass": "deletion",
        "retryMode": "resource-state",
        "idempotencyPolicy": "resource-state",
        "toolsets": [
          "automations",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": true,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Permanently removes an Automation workflow.",
        "pathParams": [
          "automation_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      }
    ]
  },
  {
    "namespace": "magicLinks",
    "name": "Magic Links",
    "description": "Create and manage magic links with explicit targets, post-click actions, and a public execution URL.",
    "operations": [
      {
        "namespace": "magicLinks",
        "methodName": "list",
        "operationId": "listMagicLinks",
        "method": "GET",
        "path": "/v1/magic-links",
        "summary": "List magic links",
        "description": "Returns magic links in the authenticated workspace.",
        "authRequired": true,
        "requiredScopes": [
          "magic_links:read"
        ],
        "mcpToolName": "magic_links_list",
        "risk": "read",
        "externalSideEffect": false,
        "sideEffectClass": "none",
        "retryMode": "safe",
        "idempotencyPolicy": "safe-read",
        "toolsets": [
          "reporting",
          "capture",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Reads a bounded page of Magic Links.",
        "pathParams": [],
        "queryParams": [
          "limit",
          "starting_after"
        ],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      },
      {
        "namespace": "magicLinks",
        "methodName": "create",
        "operationId": "createMagicLink",
        "method": "POST",
        "path": "/v1/magic-links",
        "summary": "Create a magic link",
        "description": "Creates a magic link in the authenticated workspace.",
        "authRequired": true,
        "requiredScopes": [
          "magic_links:configure"
        ],
        "mcpToolName": "magic_links_create",
        "risk": "execute",
        "externalSideEffect": true,
        "sideEffectClass": "public-resource",
        "retryMode": "idempotency-key",
        "idempotencyPolicy": "idempotency-key",
        "toolsets": [
          "capture",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": false,
          "idempotentHint": false,
          "openWorldHint": true
        },
        "riskRationale": "Creates a public link that can change Subscriber state when used.",
        "pathParams": [],
        "queryParams": [],
        "headerParams": [
          "Idempotency-Key"
        ],
        "hasRequestBody": true,
        "requestBodyRequired": true
      },
      {
        "namespace": "magicLinks",
        "methodName": "get",
        "operationId": "getMagicLink",
        "method": "GET",
        "path": "/v1/magic-links/{magic_link_id}",
        "summary": "Get a magic link",
        "description": "Returns one magic link from the authenticated workspace.",
        "authRequired": true,
        "requiredScopes": [
          "magic_links:read"
        ],
        "mcpToolName": "magic_links_get",
        "risk": "read",
        "externalSideEffect": false,
        "sideEffectClass": "none",
        "retryMode": "safe",
        "idempotencyPolicy": "safe-read",
        "toolsets": [
          "reporting",
          "capture",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Reads one Magic Link definition.",
        "pathParams": [
          "magic_link_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      },
      {
        "namespace": "magicLinks",
        "methodName": "update",
        "operationId": "updateMagicLink",
        "method": "PUT",
        "path": "/v1/magic-links/{magic_link_id}",
        "summary": "Update a magic link",
        "description": "Updates an existing magic link.",
        "authRequired": true,
        "requiredScopes": [
          "magic_links:configure"
        ],
        "mcpToolName": "magic_links_update",
        "risk": "execute",
        "externalSideEffect": true,
        "sideEffectClass": "public-resource",
        "retryMode": "resource-state",
        "idempotencyPolicy": "resource-state",
        "toolsets": [
          "capture",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": true
        },
        "riskRationale": "Changes a public link that can change Subscriber state when used.",
        "pathParams": [
          "magic_link_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": true,
        "requestBodyRequired": true
      },
      {
        "namespace": "magicLinks",
        "methodName": "delete",
        "operationId": "deleteMagicLink",
        "method": "DELETE",
        "path": "/v1/magic-links/{magic_link_id}",
        "summary": "Delete a magic link",
        "description": "Deletes a magic link from the authenticated workspace.",
        "authRequired": true,
        "requiredScopes": [
          "magic_links:delete"
        ],
        "mcpToolName": "magic_links_delete",
        "risk": "delete",
        "externalSideEffect": true,
        "sideEffectClass": "deletion",
        "retryMode": "resource-state",
        "idempotencyPolicy": "resource-state",
        "toolsets": [
          "capture",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": true,
          "idempotentHint": true,
          "openWorldHint": true
        },
        "riskRationale": "Removes a public link and its configured action.",
        "pathParams": [
          "magic_link_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      }
    ]
  },
  {
    "namespace": "broadcasts",
    "name": "Broadcasts",
    "description": "Create and manage broadcast drafts, schedule future delivery, send test emails, and launch immediate sends.",
    "operations": [
      {
        "namespace": "broadcasts",
        "methodName": "list",
        "operationId": "listBroadcasts",
        "method": "GET",
        "path": "/v1/broadcasts",
        "summary": "List broadcasts",
        "description": "Returns broadcast drafts, scheduled sends, active sends, and completed sends.",
        "authRequired": true,
        "requiredScopes": [
          "broadcasts:read"
        ],
        "mcpToolName": "broadcasts_list",
        "risk": "read",
        "externalSideEffect": false,
        "sideEffectClass": "none",
        "retryMode": "safe",
        "idempotencyPolicy": "safe-read",
        "toolsets": [
          "reporting",
          "broadcast_preparation",
          "broadcast_sending",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Reads a bounded page of Broadcasts and aggregate results.",
        "pathParams": [],
        "queryParams": [
          "limit",
          "starting_after"
        ],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      },
      {
        "namespace": "broadcasts",
        "methodName": "create",
        "operationId": "createBroadcast",
        "method": "POST",
        "path": "/v1/broadcasts",
        "summary": "Create a broadcast",
        "description": "Creates a broadcast draft or scheduled broadcast in the authenticated workspace.",
        "authRequired": true,
        "requiredScopes": [
          "broadcasts:draft"
        ],
        "mcpToolName": "broadcasts_create",
        "risk": "draft",
        "externalSideEffect": false,
        "sideEffectClass": "workspace-change",
        "retryMode": "idempotency-key",
        "idempotencyPolicy": "idempotency-key",
        "toolsets": [
          "broadcast_preparation",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": false,
          "idempotentHint": false,
          "openWorldHint": false
        },
        "riskRationale": "Creates a Broadcast draft without scheduling or sending it.",
        "pathParams": [],
        "queryParams": [],
        "headerParams": [
          "Idempotency-Key"
        ],
        "hasRequestBody": true,
        "requestBodyRequired": true
      },
      {
        "namespace": "broadcasts",
        "methodName": "getSendProgress",
        "operationId": "getBroadcastSendProgress",
        "method": "GET",
        "path": "/v1/broadcasts/{broadcast_id}/progress",
        "summary": "Get broadcast send progress",
        "description": "Returns bounded delivery progress, current rates, timing, outcome counts, and pause state. Poll until terminal is true; use 5 to 10 second intervals while progress changes and back off to 30 seconds when unchanged.",
        "authRequired": true,
        "requiredScopes": [
          "broadcasts:read"
        ],
        "mcpToolName": "broadcasts_get_send_progress",
        "risk": "read",
        "externalSideEffect": false,
        "sideEffectClass": "none",
        "retryMode": "safe",
        "idempotencyPolicy": "safe-read",
        "toolsets": [
          "reporting",
          "broadcast_preparation",
          "broadcast_sending",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Reads bounded progress aggregates without scanning recipient delivery rows.",
        "pathParams": [
          "broadcast_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      },
      {
        "namespace": "broadcasts",
        "methodName": "listDeliveryErrors",
        "operationId": "listBroadcastDeliveryErrors",
        "method": "GET",
        "path": "/v1/broadcasts/{broadcast_id}/delivery-errors",
        "summary": "List broadcast delivery errors",
        "description": "Returns a cursor-paginated page of permanent failures and unknown delivery results.",
        "authRequired": true,
        "requiredScopes": [
          "broadcasts:read"
        ],
        "mcpToolName": "broadcasts_list_delivery_errors",
        "risk": "read",
        "externalSideEffect": false,
        "sideEffectClass": "none",
        "retryMode": "safe",
        "idempotencyPolicy": "safe-read",
        "toolsets": [
          "reporting",
          "broadcast_preparation",
          "broadcast_sending",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Reads a bounded, keyset-paginated page of delivery failures.",
        "pathParams": [
          "broadcast_id"
        ],
        "queryParams": [
          "cursor",
          "limit"
        ],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      },
      {
        "namespace": "broadcasts",
        "methodName": "get",
        "operationId": "getBroadcast",
        "method": "GET",
        "path": "/v1/broadcasts/{broadcast_id}",
        "summary": "Get a broadcast",
        "description": "Returns a broadcast draft, scheduled send, active send, or completed send.",
        "authRequired": true,
        "requiredScopes": [
          "broadcasts:read"
        ],
        "mcpToolName": "broadcasts_get",
        "risk": "read",
        "externalSideEffect": false,
        "sideEffectClass": "none",
        "retryMode": "safe",
        "idempotencyPolicy": "safe-read",
        "toolsets": [
          "reporting",
          "broadcast_preparation",
          "broadcast_sending",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Reads one Broadcast and aggregate results.",
        "pathParams": [
          "broadcast_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      },
      {
        "namespace": "broadcasts",
        "methodName": "update",
        "operationId": "updateBroadcast",
        "method": "PUT",
        "path": "/v1/broadcasts/{broadcast_id}",
        "summary": "Update a broadcast",
        "description": "Updates a broadcast draft or scheduled send in place.",
        "authRequired": true,
        "requiredScopes": [
          "broadcasts:draft"
        ],
        "mcpToolName": "broadcasts_update",
        "risk": "draft",
        "externalSideEffect": false,
        "sideEffectClass": "workspace-change",
        "retryMode": "resource-state",
        "idempotencyPolicy": "resource-state",
        "toolsets": [
          "broadcast_preparation",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Changes a Broadcast draft without scheduling or sending it.",
        "pathParams": [
          "broadcast_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": true,
        "requestBodyRequired": true
      },
      {
        "namespace": "broadcasts",
        "methodName": "delete",
        "operationId": "deleteBroadcast",
        "method": "DELETE",
        "path": "/v1/broadcasts/{broadcast_id}",
        "summary": "Delete a broadcast",
        "description": "Deletes a draft, scheduled, or failed broadcast from the authenticated workspace. Broadcasts cannot be deleted after they start sending.",
        "authRequired": true,
        "requiredScopes": [
          "broadcasts:delete"
        ],
        "mcpToolName": "broadcasts_delete",
        "risk": "delete",
        "externalSideEffect": false,
        "sideEffectClass": "deletion",
        "retryMode": "resource-state",
        "idempotencyPolicy": "resource-state",
        "toolsets": [
          "broadcast_preparation",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": true,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Permanently removes an eligible Broadcast.",
        "pathParams": [
          "broadcast_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      },
      {
        "namespace": "broadcasts",
        "methodName": "preflight",
        "operationId": "preflightBroadcast",
        "method": "GET",
        "path": "/v1/broadcasts/{broadcast_id}/preflight",
        "summary": "Inspect broadcast readiness",
        "description": "Optionally checks the current Subscriber estimate, provider capacity, sender setup, event tracking, and blocking issues. This diagnostic is not required before starting a durable send.",
        "authRequired": true,
        "requiredScopes": [
          "broadcasts:preflight"
        ],
        "mcpToolName": "broadcasts_preflight",
        "risk": "read",
        "externalSideEffect": false,
        "sideEffectClass": "none",
        "retryMode": "safe",
        "idempotencyPolicy": "safe-read",
        "toolsets": [
          "reporting",
          "broadcast_preparation",
          "broadcast_sending",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Runs bounded readiness checks and returns counts rather than Subscriber rows.",
        "pathParams": [
          "broadcast_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      },
      {
        "namespace": "broadcasts",
        "methodName": "send",
        "operationId": "sendBroadcast",
        "method": "POST",
        "path": "/v1/broadcasts/{broadcast_id}/send",
        "summary": "Send a broadcast now",
        "description": "Immediately creates durable preparation for a broadcast draft or scheduled send. Mailrith calculates the exact Subscriber total and checks provider readiness in the background before delivery. A 202 response means the durable send was accepted, not that provider delivery is complete. Reuse the same idempotency key if the response is lost.",
        "authRequired": true,
        "requiredScopes": [
          "broadcasts:send"
        ],
        "mcpToolName": "broadcasts_send",
        "risk": "execute",
        "externalSideEffect": true,
        "sideEffectClass": "external-email",
        "retryMode": "idempotency-key",
        "idempotencyPolicy": "idempotency-key",
        "toolsets": [
          "broadcast_sending",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": false,
          "idempotentHint": false,
          "openWorldHint": true
        },
        "riskRationale": "Starts durable delivery to real Subscribers.",
        "pathParams": [
          "broadcast_id"
        ],
        "queryParams": [],
        "headerParams": [
          "Idempotency-Key"
        ],
        "hasRequestBody": true,
        "requestBodyRequired": false
      },
      {
        "namespace": "broadcasts",
        "methodName": "cancel",
        "operationId": "cancelBroadcastSend",
        "method": "POST",
        "path": "/v1/broadcasts/{broadcast_id}/cancel",
        "summary": "Cancel a broadcast send",
        "description": "Requests cancellation for delivery work that has not reached the provider. Provider-accepted emails cannot be recalled. Repeat the same request with the same idempotency key when the response is lost.",
        "authRequired": true,
        "requiredScopes": [
          "broadcasts:cancel"
        ],
        "mcpToolName": "broadcasts_cancel",
        "risk": "execute",
        "externalSideEffect": true,
        "sideEffectClass": "external-email",
        "retryMode": "idempotency-key",
        "idempotencyPolicy": "idempotency-key",
        "toolsets": [
          "broadcast_sending",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": false,
          "idempotentHint": false,
          "openWorldHint": true
        },
        "riskRationale": "Stops remaining delivery work and must remain available as a safety action.",
        "pathParams": [
          "broadcast_id"
        ],
        "queryParams": [],
        "headerParams": [
          "Idempotency-Key"
        ],
        "hasRequestBody": false,
        "requestBodyRequired": false
      },
      {
        "namespace": "broadcasts",
        "methodName": "sendTest",
        "operationId": "testBroadcast",
        "method": "POST",
        "path": "/v1/broadcasts/{broadcast_id}/test",
        "summary": "Send a broadcast test email",
        "description": "Sends a test message from an existing broadcast to one recipient.",
        "authRequired": true,
        "requiredScopes": [
          "broadcasts:test"
        ],
        "mcpToolName": "broadcasts_send_test",
        "risk": "test",
        "externalSideEffect": true,
        "sideEffectClass": "external-email",
        "retryMode": "idempotency-key",
        "idempotencyPolicy": "idempotency-key",
        "toolsets": [
          "broadcast_sending",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": false,
          "idempotentHint": false,
          "openWorldHint": true
        },
        "riskRationale": "Sends one real test email to a controlled recipient.",
        "pathParams": [
          "broadcast_id"
        ],
        "queryParams": [],
        "headerParams": [
          "Idempotency-Key"
        ],
        "hasRequestBody": true,
        "requestBodyRequired": true
      }
    ]
  },
  {
    "namespace": "segments",
    "name": "Segments",
    "description": "Create and manage saved segments, and preview unsaved segment definitions before persisting them.",
    "operations": [
      {
        "namespace": "segments",
        "methodName": "list",
        "operationId": "listSegments",
        "method": "GET",
        "path": "/v1/segments",
        "summary": "List segments",
        "description": "Returns saved segments from the authenticated workspace.",
        "authRequired": true,
        "requiredScopes": [
          "segments:read"
        ],
        "mcpToolName": "segments_list",
        "risk": "read",
        "externalSideEffect": false,
        "sideEffectClass": "none",
        "retryMode": "safe",
        "idempotencyPolicy": "safe-read",
        "toolsets": [
          "reporting",
          "content_and_targeting",
          "broadcast_preparation",
          "broadcast_sending",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Reads a bounded page of saved Segments.",
        "pathParams": [],
        "queryParams": [
          "limit",
          "starting_after"
        ],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      },
      {
        "namespace": "segments",
        "methodName": "create",
        "operationId": "createSegment",
        "method": "POST",
        "path": "/v1/segments",
        "summary": "Create a segment",
        "description": "Creates a saved segment in the authenticated workspace.",
        "authRequired": true,
        "requiredScopes": [
          "segments:configure"
        ],
        "mcpToolName": "segments_create",
        "risk": "draft",
        "externalSideEffect": false,
        "sideEffectClass": "workspace-change",
        "retryMode": "idempotency-key",
        "idempotencyPolicy": "idempotency-key",
        "toolsets": [
          "content_and_targeting",
          "broadcast_preparation",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": false,
          "idempotentHint": false,
          "openWorldHint": false
        },
        "riskRationale": "Creates a saved Subscriber-selection definition.",
        "pathParams": [],
        "queryParams": [],
        "headerParams": [
          "Idempotency-Key"
        ],
        "hasRequestBody": true,
        "requestBodyRequired": true
      },
      {
        "namespace": "segments",
        "methodName": "get",
        "operationId": "getSegment",
        "method": "GET",
        "path": "/v1/segments/{segment_id}",
        "summary": "Get a segment",
        "description": "Returns one saved segment from the authenticated workspace.",
        "authRequired": true,
        "requiredScopes": [
          "segments:read"
        ],
        "mcpToolName": "segments_get",
        "risk": "read",
        "externalSideEffect": false,
        "sideEffectClass": "none",
        "retryMode": "safe",
        "idempotencyPolicy": "safe-read",
        "toolsets": [
          "reporting",
          "content_and_targeting",
          "broadcast_preparation",
          "broadcast_sending",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Reads one saved Segment definition.",
        "pathParams": [
          "segment_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      },
      {
        "namespace": "segments",
        "methodName": "update",
        "operationId": "updateSegment",
        "method": "PUT",
        "path": "/v1/segments/{segment_id}",
        "summary": "Update a segment",
        "description": "Updates a saved segment in the authenticated workspace.",
        "authRequired": true,
        "requiredScopes": [
          "segments:configure"
        ],
        "mcpToolName": "segments_update",
        "risk": "draft",
        "externalSideEffect": false,
        "sideEffectClass": "workspace-change",
        "retryMode": "resource-state",
        "idempotencyPolicy": "resource-state",
        "toolsets": [
          "content_and_targeting",
          "broadcast_preparation",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Changes a saved Subscriber-selection definition.",
        "pathParams": [
          "segment_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": true,
        "requestBodyRequired": true
      },
      {
        "namespace": "segments",
        "methodName": "delete",
        "operationId": "deleteSegment",
        "method": "DELETE",
        "path": "/v1/segments/{segment_id}",
        "summary": "Delete a segment",
        "description": "Deletes a saved segment from the authenticated workspace.",
        "authRequired": true,
        "requiredScopes": [
          "segments:delete"
        ],
        "mcpToolName": "segments_delete",
        "risk": "delete",
        "externalSideEffect": false,
        "sideEffectClass": "deletion",
        "retryMode": "resource-state",
        "idempotencyPolicy": "resource-state",
        "toolsets": [
          "content_and_targeting",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": true,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Permanently removes a saved Subscriber-selection definition.",
        "pathParams": [
          "segment_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      },
      {
        "namespace": "segments",
        "methodName": "preview",
        "operationId": "previewSegment",
        "method": "POST",
        "path": "/v1/segments/preview",
        "summary": "Preview a segment definition",
        "description": "Returns subscriber counts for an unsaved segment definition. Include `current_segment_id` when previewing edits to an existing segment so circular segment references are rejected before saving.",
        "authRequired": true,
        "requiredScopes": [
          "segments:read"
        ],
        "mcpToolName": "segments_preview",
        "risk": "read",
        "externalSideEffect": false,
        "sideEffectClass": "none",
        "retryMode": "safe",
        "idempotencyPolicy": "safe-read",
        "toolsets": [
          "reporting",
          "content_and_targeting",
          "broadcast_preparation",
          "broadcast_sending",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Returns bounded aggregate counts for an unsaved Segment definition.",
        "pathParams": [],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": true,
        "requestBodyRequired": true
      }
    ]
  },
  {
    "namespace": "webhookSubscriptions",
    "name": "Webhook Subscriptions",
    "description": "Create and manage signed outbound webhook subscriptions so agents can react to Mailrith events without polling.",
    "operations": [
      {
        "namespace": "webhookSubscriptions",
        "methodName": "list",
        "operationId": "listWebhookSubscriptions",
        "method": "GET",
        "path": "/v1/webhook-subscriptions",
        "summary": "List webhook subscriptions",
        "description": "Returns the outbound webhook subscriptions configured for the authenticated workspace.",
        "authRequired": true,
        "requiredScopes": [
          "webhooks:read"
        ],
        "mcpToolName": "webhook_subscriptions_list",
        "risk": "read",
        "externalSideEffect": false,
        "sideEffectClass": "none",
        "retryMode": "safe",
        "idempotencyPolicy": "safe-read",
        "toolsets": [
          "reporting",
          "webhooks",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Reads a bounded page of webhook destinations and delivery health.",
        "pathParams": [],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      },
      {
        "namespace": "webhookSubscriptions",
        "methodName": "create",
        "operationId": "createWebhookSubscription",
        "method": "POST",
        "path": "/v1/webhook-subscriptions",
        "summary": "Create a webhook subscription",
        "description": "Creates a signed outbound webhook subscription and returns the signing secret once. The caller must also have read scopes for the selected event families. A workspace can have up to 20 webhook subscriptions, including disabled subscriptions.",
        "authRequired": true,
        "requiredScopes": [
          "webhooks:write"
        ],
        "mcpToolName": "webhook_subscriptions_create",
        "risk": "admin",
        "externalSideEffect": true,
        "sideEffectClass": "external-webhook",
        "retryMode": "idempotency-key",
        "idempotencyPolicy": "idempotency-key",
        "toolsets": [
          "webhooks",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": false,
          "idempotentHint": false,
          "openWorldHint": true
        },
        "riskRationale": "Creates an outbound data destination and returns new secret material once.",
        "pathParams": [],
        "queryParams": [],
        "headerParams": [
          "Idempotency-Key"
        ],
        "hasRequestBody": true,
        "requestBodyRequired": true,
        "eventPatternScopeRequirements": {
          "requestField": "event_patterns",
          "description": "When creating or updating a webhook subscription, each selected event pattern requires these read scopes in addition to `webhooks:write`.",
          "requiredScopesByEventPattern": {
            "*": [
              "subscribers:read",
              "subscriptions:read",
              "forms:read",
              "landing_pages:read",
              "broadcasts:read",
              "automations:read"
            ],
            "subscriber.*": [
              "subscribers:read",
              "subscriptions:read"
            ],
            "form.*": [
              "subscribers:read",
              "forms:read"
            ],
            "landing_page.*": [
              "subscribers:read",
              "landing_pages:read"
            ],
            "broadcast.*": [
              "broadcasts:read"
            ],
            "automation.*": [
              "subscribers:read",
              "automations:read"
            ],
            "subscriber.created": [
              "subscribers:read"
            ],
            "subscriber.updated": [
              "subscribers:read"
            ],
            "subscriber.status_changed": [
              "subscriptions:read"
            ],
            "form.submitted": [
              "subscribers:read",
              "forms:read"
            ],
            "landing_page.submitted": [
              "subscribers:read",
              "landing_pages:read"
            ],
            "broadcast.state_changed": [
              "broadcasts:read"
            ],
            "automation.entered": [
              "subscribers:read",
              "automations:read"
            ],
            "automation.step_executed": [
              "subscribers:read",
              "automations:read"
            ],
            "automation.completed": [
              "subscribers:read",
              "automations:read"
            ]
          }
        }
      },
      {
        "namespace": "webhookSubscriptions",
        "methodName": "get",
        "operationId": "getWebhookSubscription",
        "method": "GET",
        "path": "/v1/webhook-subscriptions/{webhook_subscription_id}",
        "summary": "Get a webhook subscription",
        "description": "Returns one outbound webhook subscription configured for the authenticated workspace.",
        "authRequired": true,
        "requiredScopes": [
          "webhooks:read"
        ],
        "mcpToolName": "webhook_subscriptions_get",
        "risk": "read",
        "externalSideEffect": false,
        "sideEffectClass": "none",
        "retryMode": "safe",
        "idempotencyPolicy": "safe-read",
        "toolsets": [
          "reporting",
          "webhooks",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Reads one webhook destination and delivery health record.",
        "pathParams": [
          "webhook_subscription_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      },
      {
        "namespace": "webhookSubscriptions",
        "methodName": "update",
        "operationId": "updateWebhookSubscription",
        "method": "PUT",
        "path": "/v1/webhook-subscriptions/{webhook_subscription_id}",
        "summary": "Update a webhook subscription",
        "description": "Updates the destination URL, status, or event pattern set for an existing webhook subscription. The caller must also have read scopes for the subscription's event families.",
        "authRequired": true,
        "requiredScopes": [
          "webhooks:write"
        ],
        "mcpToolName": "webhook_subscriptions_update",
        "risk": "admin",
        "externalSideEffect": true,
        "sideEffectClass": "external-webhook",
        "retryMode": "resource-state",
        "idempotencyPolicy": "resource-state",
        "toolsets": [
          "webhooks",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": true
        },
        "riskRationale": "Changes an outbound data destination or subscribed events.",
        "pathParams": [
          "webhook_subscription_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": true,
        "requestBodyRequired": true,
        "eventPatternScopeRequirements": {
          "requestField": "event_patterns",
          "description": "When creating or updating a webhook subscription, each selected event pattern requires these read scopes in addition to `webhooks:write`.",
          "requiredScopesByEventPattern": {
            "*": [
              "subscribers:read",
              "subscriptions:read",
              "forms:read",
              "landing_pages:read",
              "broadcasts:read",
              "automations:read"
            ],
            "subscriber.*": [
              "subscribers:read",
              "subscriptions:read"
            ],
            "form.*": [
              "subscribers:read",
              "forms:read"
            ],
            "landing_page.*": [
              "subscribers:read",
              "landing_pages:read"
            ],
            "broadcast.*": [
              "broadcasts:read"
            ],
            "automation.*": [
              "subscribers:read",
              "automations:read"
            ],
            "subscriber.created": [
              "subscribers:read"
            ],
            "subscriber.updated": [
              "subscribers:read"
            ],
            "subscriber.status_changed": [
              "subscriptions:read"
            ],
            "form.submitted": [
              "subscribers:read",
              "forms:read"
            ],
            "landing_page.submitted": [
              "subscribers:read",
              "landing_pages:read"
            ],
            "broadcast.state_changed": [
              "broadcasts:read"
            ],
            "automation.entered": [
              "subscribers:read",
              "automations:read"
            ],
            "automation.step_executed": [
              "subscribers:read",
              "automations:read"
            ],
            "automation.completed": [
              "subscribers:read",
              "automations:read"
            ]
          }
        }
      },
      {
        "namespace": "webhookSubscriptions",
        "methodName": "delete",
        "operationId": "deleteWebhookSubscription",
        "method": "DELETE",
        "path": "/v1/webhook-subscriptions/{webhook_subscription_id}",
        "summary": "Delete a webhook subscription",
        "description": "Deletes an existing outbound webhook subscription from the authenticated workspace.",
        "authRequired": true,
        "requiredScopes": [
          "webhooks:write"
        ],
        "mcpToolName": "webhook_subscriptions_delete",
        "risk": "delete",
        "externalSideEffect": true,
        "sideEffectClass": "deletion",
        "retryMode": "resource-state",
        "idempotencyPolicy": "resource-state",
        "toolsets": [
          "webhooks",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": true,
          "idempotentHint": true,
          "openWorldHint": true
        },
        "riskRationale": "Removes an outbound event destination.",
        "pathParams": [
          "webhook_subscription_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      },
      {
        "namespace": "webhookSubscriptions",
        "methodName": "rotateSecret",
        "operationId": "rotateWebhookSubscriptionSecret",
        "method": "POST",
        "path": "/v1/webhook-subscriptions/{webhook_subscription_id}/rotate-secret",
        "summary": "Rotate a webhook signing secret",
        "description": "Invalidates the existing webhook signing secret and returns a replacement once.",
        "authRequired": true,
        "requiredScopes": [
          "webhooks:write"
        ],
        "mcpToolName": "webhook_subscriptions_rotate_secret",
        "risk": "admin",
        "externalSideEffect": true,
        "sideEffectClass": "secret-change",
        "retryMode": "resource-state",
        "idempotencyPolicy": "resource-state",
        "toolsets": [
          "webhooks",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": true
        },
        "riskRationale": "Invalidates the old webhook secret and reveals a replacement once.",
        "pathParams": [
          "webhook_subscription_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      }
    ]
  },
  {
    "namespace": "jobs",
    "name": "Import and Export Jobs",
    "description": "Queue asynchronous subscriber import and export jobs and poll them to completion.",
    "operations": [
      {
        "namespace": "jobs",
        "methodName": "createImport",
        "operationId": "createSubscriberImportJob",
        "method": "POST",
        "path": "/v1/jobs/subscriber-imports",
        "summary": "Create a subscriber import job",
        "description": "Queues an asynchronous import job that creates or updates subscribers from CSV text.",
        "authRequired": true,
        "requiredScopes": [
          "subscribers:bulk_import"
        ],
        "mcpToolName": "jobs_create_import",
        "risk": "bulk",
        "externalSideEffect": true,
        "sideEffectClass": "bulk-data",
        "retryMode": "idempotency-key",
        "idempotencyPolicy": "idempotency-key",
        "toolsets": [
          "data_transfer",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": false,
          "idempotentHint": false,
          "openWorldHint": true
        },
        "riskRationale": "Changes many Subscribers and can enroll them in running Sequences.",
        "pathParams": [],
        "queryParams": [],
        "headerParams": [
          "Idempotency-Key"
        ],
        "hasRequestBody": true,
        "requestBodyRequired": true
      },
      {
        "namespace": "jobs",
        "methodName": "getImport",
        "operationId": "getSubscriberImportJob",
        "method": "GET",
        "path": "/v1/jobs/subscriber-imports/{job_id}",
        "summary": "Get a subscriber import job",
        "description": "Returns the current state of a previously created import job.",
        "authRequired": true,
        "requiredScopes": [
          "subscribers:bulk_import"
        ],
        "mcpToolName": "jobs_get_import",
        "risk": "read",
        "externalSideEffect": false,
        "sideEffectClass": "none",
        "retryMode": "safe",
        "idempotencyPolicy": "safe-read",
        "toolsets": [
          "data_transfer",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Reads one bounded import summary.",
        "pathParams": [
          "job_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      },
      {
        "namespace": "jobs",
        "methodName": "createExport",
        "operationId": "createSubscriberExportJob",
        "method": "POST",
        "path": "/v1/jobs/subscriber-exports",
        "summary": "Create a subscriber export job",
        "description": "Queues an asynchronous Subscriber export for the authenticated workspace. Requires `subscribers:bulk_export` because the finished file contains bulk Subscriber data.",
        "authRequired": true,
        "requiredScopes": [
          "subscribers:bulk_export"
        ],
        "mcpToolName": "jobs_create_export",
        "risk": "bulk",
        "externalSideEffect": false,
        "sideEffectClass": "bulk-data",
        "retryMode": "idempotency-key",
        "idempotencyPolicy": "idempotency-key",
        "toolsets": [
          "data_transfer",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": false,
          "destructiveHint": false,
          "idempotentHint": false,
          "openWorldHint": false
        },
        "riskRationale": "Creates an export containing bulk Subscriber data.",
        "pathParams": [],
        "queryParams": [],
        "headerParams": [
          "Idempotency-Key"
        ],
        "hasRequestBody": true,
        "requestBodyRequired": false
      },
      {
        "namespace": "jobs",
        "methodName": "getExport",
        "operationId": "getSubscriberExportJob",
        "method": "GET",
        "path": "/v1/jobs/subscriber-exports/{job_id}",
        "summary": "Get a subscriber export job",
        "description": "Returns the current state of a previously created export job. Requires `subscribers:bulk_export` because completed jobs include a Subscriber CSV download URL.",
        "authRequired": true,
        "requiredScopes": [
          "subscribers:bulk_export"
        ],
        "mcpToolName": "jobs_get_export",
        "risk": "read",
        "externalSideEffect": false,
        "sideEffectClass": "none",
        "retryMode": "safe",
        "idempotencyPolicy": "safe-read",
        "toolsets": [
          "data_transfer",
          "administration"
        ],
        "annotations": {
          "readOnlyHint": true,
          "destructiveHint": false,
          "idempotentHint": true,
          "openWorldHint": false
        },
        "riskRationale": "Reads export status and a short-lived download location.",
        "pathParams": [
          "job_id"
        ],
        "queryParams": [],
        "headerParams": [],
        "hasRequestBody": false,
        "requestBodyRequired": false
      }
    ]
  }
] as const;
