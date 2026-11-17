from typing import Literal, NotRequired, TypedDict


class ArtifactOrigin(TypedDict):
    conversationId: int
    chatId: NotRequired[int]
    projectId: NotRequired[int]


class ArtifactSourceReceipt(TypedDict):
    sourceType: Literal["workspace", "project"]
    sourceId: str
    sourceRevisionId: str


class _ArtifactSourceLocation(TypedDict):
    id: str
    revisionId: str
    entrypoint: str


class ArtifactEditingSource(_ArtifactSourceLocation):
    type: Literal["chat-tree", "project-branch", "submitted-content"]


class ArtifactPreparationSource(_ArtifactSourceLocation):
    type: Literal["chat-tree", "project-branch"]


class _ArtifactRequest(TypedDict):
    origin: ArtifactOrigin
    requestId: str
    name: str
    type: NotRequired[str]


class ArtifactRegisterInput(_ArtifactRequest):
    sourceReceipt: NotRequired[ArtifactSourceReceipt]
    editingSource: NotRequired[ArtifactEditingSource | None]


class ArtifactPrepareInput(_ArtifactRequest):
    artifactId: NotRequired[str]
    editingSource: ArtifactPreparationSource
    paths: list[str]
    routingMode: NotRequired[Literal["files", "spa"]]


class ArtifactUpdateInput(TypedDict, total=False):
    name: str
    description: str
    activityConversationId: str
