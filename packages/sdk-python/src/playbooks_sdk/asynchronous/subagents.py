from typing import Any

from playbooks_sdk.asynchronous.core import Endpoint
from playbooks_sdk.resource import ApiResponse, Data, Identifier, identifier


class Subagents(Endpoint):
    async def list(self, **options: Any) -> ApiResponse:
        return await self._list(self._path, options)

    async def get(self, id: Identifier) -> Any:
        return await self._get(f"{self._path}/{identifier(id)}")

    async def create(self, data: Data) -> Any:
        return await self._action(self._path, "POST", data)

    async def update(self, id: Identifier, data: Data) -> Any:
        return await self._action(f"{self._path}/{identifier(id)}", "PUT", data)

    async def delete(self, id: Identifier, revision: int) -> Any:
        return await self._action(
            f"{self._path}/{identifier(id)}", "DELETE", {"revision": revision}
        )

    async def tasks(self, id: Identifier, **options: Any) -> ApiResponse:
        return await self._list(f"{self._path}/{identifier(id)}/tasks", options)

    async def cancel_task(self, id: Identifier, task_id: Identifier) -> Any:
        return await self._action(
            f"{self._path}/{identifier(id)}/tasks/{identifier(task_id)}/cancel", "POST", {}
        )
