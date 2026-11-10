from typing import Any, Literal

from playbooks_sdk.asynchronous.core import Endpoint
from playbooks_sdk.resource import Data, Identifier, identifier
from playbooks_sdk.transport import AsyncTransport as Transport


class ResourceInvitations(Endpoint):
    async def list(self) -> Any:
        return await self._get(self._path)

    async def create(self, data: Data) -> Any:
        return await self._action(self._path, "POST", data)

    async def resend(self, id: Identifier) -> Any:
        return await self._action(f"{self._path}/{identifier(id)}/resend", "POST")

    async def revoke(self, id: Identifier) -> Any:
        return await self._action(f"{self._path}/{identifier(id)}", "DELETE")


class ResourceSharing(Endpoint):
    def __init__(
        self, transport: Transport, kind: Literal["chats", "agents", "projects"], id: Identifier
    ) -> None:
        if kind not in ("chats", "agents", "projects"):
            raise ValueError("Select chats, agents, or projects.")
        super().__init__(transport, f"/{kind}/{identifier(id)}")
        self._kind = kind

    async def set_visibility(
        self, visibility: Literal["workspace", "private"], revision: int
    ) -> Any:
        return await self._action(
            f"{self._path}/visibility", "PATCH", {"visibility": visibility, "revision": revision}
        )

    async def members(self) -> Any:
        part = "collaborators" if self._kind == "projects" else "members"
        return await self._get(f"{self._path}/{part}")

    async def grant(self, id: Identifier, role: Literal["viewer", "editor", "admin"]) -> Any:
        if self._kind == "projects":
            if not str(id).isdigit() or int(id) < 1:
                raise ValueError("Project grants require a numeric User ID.")
            return await self._action(
                f"{self._path}/collaborators", "POST", {"userId": int(id), "role": role}
            )
        return await self._action(f"{self._path}/members/{identifier(id)}", "PUT", {"role": role})

    async def update_grant(self, id: Identifier, role: Literal["viewer", "editor", "admin"]) -> Any:
        part = "collaborators" if self._kind == "projects" else "members"
        return await self._action(f"{self._path}/{part}/{identifier(id)}", "PUT", {"role": role})

    async def revoke(self, id: Identifier) -> Any:
        part = "collaborators" if self._kind == "projects" else "members"
        return await self._action(f"{self._path}/{part}/{identifier(id)}", "DELETE")

    @property
    def invitations(self) -> ResourceInvitations:
        return ResourceInvitations(self._transport, f"{self._path}/access-invitations")
