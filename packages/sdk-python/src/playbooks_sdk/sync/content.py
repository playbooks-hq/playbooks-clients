from typing import Any

from playbooks_sdk.content_types import (
    ArtifactPrepareInput,
    ArtifactRegisterInput,
    ArtifactUpdateInput,
)
from playbooks_sdk.resource import ApiResponse, Data, Identifier, identifier
from playbooks_sdk.sync.core import Listing


class SourceCollection(Listing):
    def get(self, id: Identifier, *, version: str, conversation_id: str) -> Any:
        return self._get(
            f"{self._path}/{identifier(id)}",
            {"version": version, "conversationId": conversation_id},
        )

    def preview(self, id: Identifier, *, version: str, conversation_id: str) -> bytes:
        return self._source_bytes(id, "preview", version, conversation_id)

    def download(self, id: Identifier, *, version: str, conversation_id: str) -> bytes:
        return self._source_bytes(id, "download", version, conversation_id)

    def _source_bytes(
        self, id: Identifier, action: str, version: str, conversation_id: str
    ) -> bytes:
        result: bytes = self._transport.request(
            f"{self._path}/{identifier(id)}/{action}",
            params={"version": version, "conversationId": conversation_id},
            binary=True,
        )
        return result

    def copy_target(self, id: Identifier, *, version: str, conversation_id: str) -> Any:
        return self._get(
            f"{self._path}/{identifier(id)}/copy-to-file-system",
            {"version": version, "conversationId": conversation_id},
        )

    def _copy_to_file_system(
        self,
        id: Identifier,
        *,
        version: str,
        conversation_id: str,
        revision: str,
        path: str,
        activity_conversation_id: str | None,
        expected_branch_id: int | None = None,
    ) -> Any:
        data: Data = {
            "version": version,
            "conversationId": conversation_id,
            "revision": revision,
            "path": path,
        }
        if activity_conversation_id is not None:
            data["activityConversationId"] = activity_conversation_id
        if expected_branch_id is not None:
            data["expectedBranchId"] = expected_branch_id
        return self._action(f"{self._path}/{identifier(id)}/copy-to-file-system", "POST", data)


class Sources(SourceCollection):
    def copy_to_file_system(
        self,
        id: Identifier,
        *,
        version: str,
        conversation_id: str,
        revision: str,
        path: str,
        activity_conversation_id: str | None = None,
    ) -> Any:
        return self._copy_to_file_system(
            id,
            version=version,
            conversation_id=conversation_id,
            revision=revision,
            path=path,
            activity_conversation_id=activity_conversation_id,
        )


class ProjectSources(SourceCollection):
    def copy_to_file_system(
        self,
        id: Identifier,
        *,
        version: str,
        conversation_id: str,
        revision: str,
        path: str,
        expected_branch_id: int,
        activity_conversation_id: str | None = None,
    ) -> Any:
        return self._copy_to_file_system(
            id,
            version=version,
            conversation_id=conversation_id,
            revision=revision,
            path=path,
            expected_branch_id=expected_branch_id,
            activity_conversation_id=activity_conversation_id,
        )


class Artifacts(Listing):
    def get(self, id: Identifier, *, version: str | None = None) -> Any:
        return self._get(f"{self._path}/{identifier(id)}", {"version": version})

    def versions(self, id: Identifier, **options: Any) -> ApiResponse:
        return self._list(f"{self._path}/{identifier(id)}/versions", options)

    def open(self, id: Identifier, *, version: str | None = None) -> Any:
        return self._get(f"{self._path}/{identifier(id)}/open", {"version": version})

    def preview(self, id: Identifier, *, version: str | None = None) -> Any:
        return self._get(f"{self._path}/{identifier(id)}/preview", {"version": version})

    def export(self, id: Identifier, *, version: str | None = None) -> bytes:
        return self._artifact_bytes(id, "export", version)

    def download(self, id: Identifier, *, version: str | None = None) -> bytes:
        return self._artifact_bytes(id, "download", version)

    def _artifact_bytes(self, id: Identifier, action: str, version: str | None) -> bytes:
        result: bytes = self._transport.request(
            f"{self._path}/{identifier(id)}/{action}", params={"version": version}, binary=True
        )
        return result

    def register(self, data: ArtifactRegisterInput) -> Any:
        return self._action(self._path, "POST", dict(data))

    def prepare(self, data: ArtifactPrepareInput) -> Any:
        return self._action(f"{self._path}/prepare", "POST", dict(data))

    def update(self, id: Identifier, data: ArtifactUpdateInput) -> Any:
        return self._action(f"{self._path}/{identifier(id)}", "PUT", dict(data))
