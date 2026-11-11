# Mailrith TypeScript SDK

Official TypeScript SDK for Mailrith's public API.

The SDK is generated from Mailrith's versioned public contract and exposes resource
namespaces such as `client.subscribers.list()` and `client.broadcasts.send()`.

```ts
import { createMailrithClient } from "@mailrith/sdk";

const client = createMailrithClient({
  apiKey: process.env.MAILRITH_API_KEY,
});

const capabilities = await client.discovery.getCapabilities();
const subscriber = await client.subscribers.upsert({
  body: {
    email: "ada@example.com",
    name: "Ada Lovelace",
  },
});
```

## Safe Retries

The SDK automatically gives idempotent write operations one key and retries short network interruptions or an interrupted successful response body with that same key. It does not retry a confirmed server failure. The defaults are three attempts with a 250 ms base delay and can be changed with `idempotentRetryMaxAttempts` and `idempotentRetryDelayMs`.

Operations marked as `resource-state` are not retried automatically. If their response is lost, read the affected resource first and retry only when its current state shows that the requested change did not happen.

If your process may restart before it receives a response, save your own key and pass it as `idempotencyKey` when retrying the same request. Do not reuse that key with different request data.

## Official Builds And Forks

Modified public versions must use distinct package and service names and
clearly say that they are unofficial. See the
[Mailrith Trademark And Unofficial Fork Policy](https://github.com/anrawool/mailrith-agent-platform/blob/main/TRADEMARKS.md).
