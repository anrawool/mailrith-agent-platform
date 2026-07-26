# Agent Integration Privacy Disclosure

Mailrith agent integrations connect to one Mailrith workspace selected during
OAuth. Tools can return the connected workspace, permissions, sender identity
metadata, aggregate reports, and the specific bounded Subscriber, Tag, Segment,
Broadcast, Sequence, Automation, or email Template information requested by
the user.

Mailrith tools never return saved delivery-provider credentials, OAuth tokens,
API keys, reviewer passwords, or internal diagnostic payloads. Subscriber
lists are cursor-paginated, and tools should request only the page or record
needed for the task.

The plugin and connector packages add no database tables, activity copies, or
message archives. Mailrith stores the normal product records created by a user,
the existing OAuth authorization records needed to manage and revoke a
connection, and existing delivery or workflow state needed to run the product.
Operational logs use request IDs and must not store bearer tokens or complete
tool payloads.

Users can revoke an individual connection in Mailrith under
**Integrations → Authorized Apps**. The platform that initiated the connection
may retain conversation content under its own published policy.
