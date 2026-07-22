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
