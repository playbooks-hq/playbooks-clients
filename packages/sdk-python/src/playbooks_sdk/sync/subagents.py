from typing import Any

from playbooks_sdk.resource import ApiResponse, Data, Identifier, identifier
from playbooks_sdk.sync.core import Endpoint


class Subagents(Endpoint):
    def list(self, **options: Any) -> ApiResponse:
        return self._list(self._path, options)

    def get(self, id: Identifier) -> Any:
        return self._get(f"{self._path}/{identifier(id)}")

    def create(self, data: Data) -> Any:
        return self._action(self._path, "POST", data)

    def update(self, id: Identifier, data: Data) -> Any:
        return self._action(f"{self._path}/{identifier(id)}", "PUT", data)

    def delete(self, id: Identifier, revision: int) -> Any:
        return self._action(f"{self._path}/{identifier(id)}", "DELETE", {"revision": revision})

    def tasks(self, id: Identifier, **options: Any) -> ApiResponse:
        return self._list(f"{self._path}/{identifier(id)}/tasks", options)

    def cancel_task(self, id: Identifier, task_id: Identifier) -> Any:
        return self._action(
            f"{self._path}/{identifier(id)}/tasks/{identifier(task_id)}/cancel", "POST", {}
        )
