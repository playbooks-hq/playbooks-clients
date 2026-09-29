from typing import Any

from ..inbox_types import InboxReadInput, InboxType, InboxView
from ..resource import ApiResponse, Resource, identifier
from .core import Endpoint


class Inbox(Endpoint):
    def list(
        self,
        *,
        page: int | None = None,
        page_size: int | None = None,
        view: InboxView | None = None,
        scope: str | None = None,
        type: InboxType | None = None,
        search: str | None = None,
        conversation: str | None = None,
    ) -> ApiResponse:
        options = {
            "page": page,
            "page_size": page_size,
            "view": view,
            "scope": scope,
            "type": type,
            "search": search,
            "conversation": conversation,
        }
        return self._list(
            self._path, {key: value for key, value in options.items() if value is not None}
        )

    def count(self) -> Resource:
        result: Resource = self._get(f"{self._path}/count")
        return result

    def mark_read(self, conversation_id: str, data: InboxReadInput) -> Any:
        return self._action(
            f"{self._path}/conversations/{identifier(conversation_id)}/read", "PUT", dict(data)
        )

    def mark_all_read(self) -> Any:
        return self._action(f"{self._path}/read", "PUT")
