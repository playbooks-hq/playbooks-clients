from typing import Any

from playbooks_sdk.asynchronous.core import Listing
from playbooks_sdk.content_types import (
    ArtifactPrepareInput,
    ArtifactRegisterInput,
    ArtifactUpdateInput,
)
from playbooks_sdk.resource import ApiResponse, Data, Identifier, identifier


class SourceCollection(Listing):
    async def get(self, id: Identifier, *, version: str, conversation_id: str) -> Any:
        return await self._get(
            f"{self._path}/{identifier(id)}",
            {"version": version, "conversationId": conversation_id},
        )

    async def preview(self, id: Identifier, *, version: str, conversation_id: str) -> bytes:
        return await self._source_bytes(id, "preview", version, conversation_id)

    async def download(self, id: Identifier, *, version: str, conversation_id: str) -> bytes:
        return await self._source_bytes(id, "download", version, conversation_id)

    async def _source_bytes(
        self, id: Identifier, action: str, version: str, conversation_id: str
    ) -> bytes:
        result: bytes = await self._transport.request(
            f"{self._path}/{identifier(id)}/{action}",
            params={"version": version, "conversationId": conversation_id},
            binary=True,
        )
        return result

    async def copy_target(self, id: Identifier, *, version: str, conversation_id: str) -> Any:
        return await self._get(
            f"{self._path}/{identifier(id)}/copy-to-file-system",
            {"version": version, "conversationId": conversation_id},
        )

    async def _copy_to_file_system(
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
        return await self._action(
            f"{self._path}/{identifier(id)}/copy-to-file-system", "POST", data
        )


class Sources(SourceCollection):
    async def copy_to_file_system(
        self,
        id: Identifier,
        *,
        version: str,
        conversation_id: str,
        revision: str,
        path: str,
        activity_conversation_id: str | None = None,
    ) -> Any:
        return await self._copy_to_file_system(
            id,
            version=version,
            conversation_id=conversation_id,
            revision=revision,
            path=path,
            activity_conversation_id=activity_conversation_id,
        )


class ProjectSources(SourceCollection):
    async def copy_to_file_system(
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
        return await self._copy_to_file_system(
            id,
            version=version,
            conversation_id=conversation_id,
            revision=revision,
            path=path,
            expected_branch_id=expected_branch_id,
            activity_conversation_id=activity_conversation_id,
        )


class Artifacts(Listing):
    async def get(self, id: Identifier, *, version: str | None = None) -> Any:
        return await self._get(f"{self._path}/{identifier(id)}", {"version": version})

    async def versions(self, id: Identifier, **options: Any) -> ApiResponse:
        return await self._list(f"{self._path}/{identifier(id)}/versions", options)

    async def open(self, id: Identifier, *, version: str | None = None) -> Any:
        return await self._get(f"{self._path}/{identifier(id)}/open", {"version": version})

    async def preview(self, id: Identifier, *, version: str | None = None) -> Any:
        return await self._get(f"{self._path}/{identifier(id)}/preview", {"version": version})

    async def export(self, id: Identifier, *, version: str | None = None) -> bytes:
        return await self._artifact_bytes(id, "export", version)

    async def download(self, id: Identifier, *, version: str | None = None) -> bytes:
        return await self._artifact_bytes(id, "download", version)

    async def _artifact_bytes(self, id: Identifier, action: str, version: str | None) -> bytes:
        result: bytes = await self._transport.request(
            f"{self._path}/{identifier(id)}/{action}", params={"version": version}, binary=True
        )
        return result

    async def register(self, data: ArtifactRegisterInput) -> Any:
        return await self._action(self._path, "POST", dict(data))

    async def prepare(self, data: ArtifactPrepareInput) -> Any:
        return await self._action(f"{self._path}/prepare", "POST", dict(data))

    async def update(self, id: Identifier, data: ArtifactUpdateInput) -> Any:
        return await self._action(f"{self._path}/{identifier(id)}", "PUT", dict(data))
