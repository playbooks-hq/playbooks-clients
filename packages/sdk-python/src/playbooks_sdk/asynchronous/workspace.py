from typing import Any, Self, cast

from ..error import PlaybooksError
from ..resource import ApiResponse, Data, Identifier, Resource, identifier
from ..transport import AsyncTransport as Transport
from .core import (
    Collection,
    EditableCollection,
    Endpoint,
    Listing,
    ReadCollection,
    ReadEndpoint,
    Settings,
)
from .files import Files
from .inbox import Inbox
from .operators import Conversations, Runs
from .project import Projects


class Templates(EditableCollection):
    async def publish(self, id: Identifier) -> Any:
        return await self._action(f"{self._path}/{identifier(id)}/publish", "POST", {})

    async def versions(self, id: Identifier, **options: Any) -> ApiResponse:
        return await self._list(f"{self._path}/{identifier(id)}/versions", options)


class Members(EditableCollection):
    def __init__(self, transport: Transport, workspace: str) -> None:
        super().__init__(transport, "/workspace/members")
        self._workspace = workspace

    async def preview_departure(self, id: Identifier) -> Resource:
        result: Resource = await self._get(
            f"/session/workspaces/{identifier(self._workspace)}/members/{identifier(id)}/departure"
        )
        return result

    async def depart(self, id: Identifier, data: Data) -> Any:
        return await self._action(
            f"/session/workspaces/{identifier(self._workspace)}/members/{identifier(id)}/departure",
            "POST",
            data,
        )


class Invitations(Listing):
    async def create(self, data: Data) -> Any:
        return await self._action(self._path, "POST", data)

    async def revoke(self, id: Identifier) -> Any:
        return await self._action(f"{self._path}/{identifier(id)}", "DELETE")


class DnsRecords(Listing):
    async def create(self, data: Data) -> Any:
        return await self._action(self._path, "POST", data)

    async def update(self, id: Identifier, data: Data) -> Any:
        return await self._action(f"{self._path}/{identifier(id)}", "PUT", data)

    async def delete(self, id: Identifier) -> Any:
        return await self._action(f"{self._path}/{identifier(id)}", "DELETE")


class Domains(ReadCollection):
    async def add(self, data: Data) -> Any:
        return await self._action(self._path, "POST", data)

    def records(self, domain_id: Identifier) -> DnsRecords:
        return DnsRecords(self._transport, f"{self._path}/{identifier(domain_id)}/dns-records")


class Workspace(Resource):
    _transport: Transport
    _path: str

    def __init__(self, transport: Transport, data: Data) -> None:
        super().__init__(data)
        object.__setattr__(self, "_transport", transport)

    @property
    def id(self) -> int:
        return cast(int, self.to_dict()["id"])

    @property
    def uuid(self) -> str:
        return cast(str, self.to_dict()["uuid"])

    @property
    def name(self) -> str:
        return cast(str, self.to_dict()["name"])

    async def update(self, data: Data) -> Self:
        updated = await Endpoint(self._transport, "/workspace")._action("/workspace", "PUT", data)
        self._replace(updated)
        return self

    @property
    def projects(self) -> Projects:
        return Projects(self._transport)

    @property
    def conversations(self) -> Conversations:
        return Conversations(self._transport, "", self.id, False)

    @property
    def runs(self) -> Runs:
        return Runs(self._transport, "/operator/runs")

    @property
    def files(self) -> Files:
        return Files(self._transport, "/files")

    @property
    def folders(self) -> Collection:
        return Collection(self._transport, "/project-folders")

    @property
    def templates(self) -> Templates:
        return Templates(self._transport, "/templates")

    @property
    def members(self) -> Members:
        return Members(self._transport, self.uuid)

    @property
    def invitations(self) -> Invitations:
        return Invitations(self._transport, "/workspace/access-invitations")

    @property
    def settings(self) -> Settings:
        return Settings(self._transport, "/workspace/preferences")

    @property
    def designs(self) -> Listing:
        return Listing(self._transport, "/designs")

    @property
    def skills(self) -> Listing:
        return Listing(self._transport, "/skills")

    @property
    def mcps(self) -> Listing:
        return Listing(self._transport, "/mcps")

    @property
    def connectors(self) -> Listing:
        return Listing(self._transport, "/connectors")

    @property
    def secrets(self) -> Listing:
        return Listing(self._transport, "/secrets")

    @property
    def inbox(self) -> Inbox:
        return Inbox(self._transport, "/inbox")

    @property
    def activity(self) -> Listing:
        return Listing(self._transport, "/activities")

    @property
    def usage(self) -> ReadEndpoint:
        return ReadEndpoint(self._transport, "/workspace/usage")

    @property
    def budget(self) -> Settings:
        return Settings(self._transport, "/workspace/budget")

    @property
    def credits(self) -> Listing:
        return Listing(self._transport, "/workspace/credits")

    @property
    def invoices(self) -> Listing:
        return Listing(self._transport, "/workspace/invoices")

    @property
    def settlements(self) -> ReadCollection:
        return ReadCollection(self._transport, "/workspace/settlements")

    @property
    def transfers(self) -> Listing:
        return Listing(self._transport, "/workspace/transfers")

    @property
    def domains(self) -> Domains:
        return Domains(self._transport, "/domains")


class Workspaces(Endpoint):
    def __init__(self, transport: Transport) -> None:
        super().__init__(transport, "/session/workspaces")

    async def list(self, **options: Any) -> ApiResponse:
        response = await self._list(self._path, options)
        return {
            **response,
            "data": [
                Workspace(self._transport.scoped(item.uuid), item.to_dict())
                for item in response["data"]
            ],
        }

    async def get(self, id: Identifier) -> Workspace:
        transport = self._transport.scoped(identifier(id))
        data = (await transport.request("/workspace"))["data"]
        if data.get("uuid") != str(id):
            raise PlaybooksError(403, "The server did not resolve the requested workspace.")
        return Workspace(transport, data)

    async def update(self, id: Identifier, data: Data) -> Workspace:
        transport = self._transport.scoped(identifier(id))
        updated = await Endpoint(transport, "/workspace")._action("/workspace", "PUT", data)
        if updated.get("uuid") != str(id):
            raise PlaybooksError(502, "The updated Workspace identity did not match.")
        return Workspace(transport, updated)
