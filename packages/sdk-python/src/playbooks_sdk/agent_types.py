from typing import Any, NotRequired, TypedDict


class AgentCreateInput(TypedDict):
    idempotencyKey: str
    name: str
    description: NotRequired[str]
    projectId: NotRequired[str | None]
    siteId: NotRequired[str | None]
    configuration: NotRequired[dict[str, Any]]
