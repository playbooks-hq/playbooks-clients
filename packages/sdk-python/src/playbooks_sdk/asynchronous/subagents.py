from typing import Any

from playbooks_sdk.asynchronous.core import Endpoint
from playbooks_sdk.resource import ApiResponse, Data, Identifier, identifier


class Subagents(Endpoint):
    async def list(self, *, conversation_id: int, **options: Any) -> ApiResponse:
        return await self._list(self._path, {**options, "conversationId": conversation_id})

    async def get(self, id: Identifier, *, conversation_id: int) -> Any:
        return await self._get(
            f"{self._path}/{identifier(id)}", {"conversationId": conversation_id}
        )

    async def create(self, data: Data, *, conversation_id: int) -> Any:
        return await self._action(self._path, "POST", {**data, "conversationId": conversation_id})

    async def update(self, id: Identifier, data: Data, *, conversation_id: int) -> Any:
        return await self._action(
            f"{self._path}/{identifier(id)}", "PUT", {**data, "conversationId": conversation_id}
        )

    async def delete(self, id: Identifier, revision: int, *, conversation_id: int) -> Any:
        return await self._action(
            f"{self._path}/{identifier(id)}",
            "DELETE",
            {"revision": revision, "conversationId": conversation_id},
        )

    async def tasks(self, id: Identifier, *, conversation_id: int, **options: Any) -> ApiResponse:
        return await self._list(
            f"{self._path}/{identifier(id)}/tasks", {**options, "conversationId": conversation_id}
        )

    async def cancel_task(
        self, id: Identifier, task_id: Identifier, *, conversation_id: int
    ) -> Any:
        return await self._action(
            f"{self._path}/{identifier(id)}/tasks/{identifier(task_id)}/cancel",
            "POST",
            {"conversationId": conversation_id},
        )
