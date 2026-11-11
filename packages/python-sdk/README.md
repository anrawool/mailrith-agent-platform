# Mailrith Python SDK

Official Python SDK for Mailrith's public API.

This package is generated from Mailrith's versioned OpenAPI-derived SDK manifest and provides
resource namespaces such as `client.subscribers.list()` and `client.broadcasts.send()`.

```py
from mailrith_sdk import MailrithClient

client = MailrithClient(api_key="mrk_example_secret_key")

capabilities = client.discovery.get_capabilities()
subscribers = client.subscribers.list(query={"limit": 25})
```

Agents can discover a bounded set of operations from ordinary task language,
then load the exact generated descriptor before acting:

```py
result = client.search_operations("add the VIP tag to this subscriber", limit=3)
operation_id = result["selection"]["recommended_operation_id"]
operation = client.get_operation(operation_id)
```

Search reads the packaged operation catalog in memory, returns at most 25
matches, and does not send or store the query.

Python uses the same generated resource aliases, action vocabulary,
relationship intents, plural handling, ranking, and ambiguity rules as the
TypeScript SDK, MCP server, and CLI. Narrow a search with `resource` or with
`category="read"`, `"write"`, `"delete"`, or `"live"`.

## Safe Retries

The SDK automatically gives idempotent write operations one key and retries short network interruptions or an interrupted successful response body with that same key. It does not retry a confirmed server failure. The defaults are three attempts with a 0.25 second base delay and can be changed with `idempotent_retry_max_attempts` and `idempotent_retry_delay_seconds`.

Operations marked as `resource-state` are not retried automatically. If their response is lost, read the affected resource first and retry only when its current state shows that the requested change did not happen.

If your process may restart before it receives a response, save your own key and pass it as `idempotency_key` when retrying the same request. Do not reuse that key with different request data.

## Official Builds And Forks

Modified public versions must use distinct package and service names and
clearly say that they are unofficial. See the
[Mailrith Trademark And Unofficial Fork Policy](https://github.com/anrawool/mailrith-agent-platform/blob/main/TRADEMARKS.md).
