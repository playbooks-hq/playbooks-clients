from typing import Any, NotRequired, TypedDict


class AgentCreateInput(TypedDict):
    idempotencyKey: str
    name: str
    description: NotRequired[str]
    integrationId: NotRequired[str]
    ownerKey: NotRequired[str]
    # Integrated Agents require an explicit private-content Owner.
    contentOwnerUserId: NotRequired[str]
    configuration: NotRequired[dict[str, Any]]
