from typing import Any, Literal, Self, cast
from urllib.parse import quote

from playbooks_sdk.asynchronous.agents import Agents
from playbooks_sdk.asynchronous.core import (
    EditableCollection,
    Endpoint,
    Listing,
    ReadCollection,
    ReadEndpoint,
    Settings,
)
from playbooks_sdk.asynchronous.files import Files
from playbooks_sdk.asynchronous.inbox import Inbox
from playbooks_sdk.asynchronous.operators import Conversations, Runs
from playbooks_sdk.asynchronous.project import Projects
from playbooks_sdk.asynchronous.resource_sharing import ResourceSharing
from playbooks_sdk.asynchronous.sites import Sites
from playbooks_sdk.asynchronous.subagents import Subagents
from playbooks_sdk.error import PlaybooksError
from playbooks_sdk.resource import ApiResponse, Data, Identifier, Resource, identifier
from playbooks_sdk.transport import AsyncTransport as Transport


class ConversationPlans(Endpoint):
    async def current(self) -> Any:
        return await self._get(f"{self._path}/current")

    async def get(self, id: Identifier, revision: str | None = None) -> Any:
        return await self._get(f"{self._path}/{identifier(id)}", {"revision": revision})

    async def create(self, data: Data) -> Any:
        return await self._action(self._path, "POST", data)

    async def revise(self, id: Identifier, data: Data) -> Any:
        return await self._action(f"{self._path}/{identifier(id)}", "PUT", data)

    async def save(self, id: Identifier, data: Data) -> Any:
        return await self._action(f"{self._path}/{identifier(id)}/save", "POST", data)


class Chats(Listing):
    async def template_setup(self, id: Identifier) -> Any:
        return await self._get(f"{self._path}/{identifier(id)}/template-setup")

    async def template_setup_item(self, id: Identifier, category: str, key: str) -> Any:
        path = f"{self._path}/{identifier(id)}/template-setup/items"
        return await self._get(f"{path}/{identifier(category)}/{quote(key, safe='')}")

    async def import_template_resources(self, id: Identifier, data: Data) -> Any:
        return await self._action(
            f"{self._path}/{identifier(id)}/template-setup/import", "POST", data
        )

    def subagents(self, id: Identifier) -> Subagents:
        return Subagents(self._transport, f"{self._path}/{identifier(id)}/subagents")

    def sites(self, id: Identifier) -> Listing:
        return Listing(self._transport, f"{self._path}/{identifier(id)}/sites")

    async def get(self, id: Identifier) -> Any:
        return await self._get(f"{self._path}/{identifier(id)}")

    async def create(self, data: Data) -> Any:
        return await self._action(self._path, "POST", data)

    async def update(self, id: Identifier, data: Data) -> Any:
        return await self._action(
            f"{self._path}/{identifier(id)}",
            "DELETE" if data.get("action") == "delete" else "PUT",
            data,
        )

    async def file_system(self, id: Identifier) -> Any:
        """Read working content, separate from background Files."""
        return await self._get(f"{self._path}/{identifier(id)}/file-system")

    async def download_file_system(self, id: Identifier) -> bytes:
        result: bytes = await self._transport.request(
            f"{self._path}/{identifier(id)}/file-system",
            params={"download": True},
            binary=True,
        )
        return result

    async def replace_file_system(self, id: Identifier, data: Data) -> Any:
        return await self._action(f"{self._path}/{identifier(id)}/file-system", "PUT", data)

    async def preview_file_system(self, id: Identifier, data: Data) -> Any:
        return await self._action(
            f"{self._path}/{identifier(id)}/file-system/preview", "POST", data
        )

    async def save_file_system(self, id: Identifier, data: Data) -> Any:
        return await self._action(f"{self._path}/{identifier(id)}/file-system/save", "POST", data)


class ChatSchedules(ReadCollection):
    async def create(self, data: Data) -> Any:
        return await self._action(self._path, "POST", data)

    async def preview(self, data: Data) -> Any:
        return await self._action(f"{self._path}/preview", "POST", data)

    async def update(self, id: Identifier, data: Data) -> Any:
        return await self._action(f"{self._path}/{identifier(id)}", "PUT", data)


class Templates(EditableCollection):
    update_method = "PATCH"

    async def create_from_chat(self, chat_id: Identifier) -> Any:
        return await self._action(f"/chats/{identifier(chat_id)}/template", "POST", {})

    async def draft_from_chat(self, chat_id: Identifier) -> Any:
        return await self._get(f"/chats/{identifier(chat_id)}/template")

    async def create_from_project(self, project_id: Identifier) -> Any:
        return await self._action(f"/projects/{identifier(project_id)}/template", "POST", {})

    async def draft_from_project(self, project_id: Identifier) -> Any:
        return await self._get(f"/projects/{identifier(project_id)}/template")

    async def create_from_agent(self, agent_id: Identifier) -> Any:
        return await self._action(f"/agents/{identifier(agent_id)}/template", "POST", {})

    async def draft_from_agent(self, agent_id: Identifier) -> Any:
        return await self._get(f"/agents/{identifier(agent_id)}/template")

    async def source(self, id: Identifier) -> Any:
        return await self._get(f"{self._path}/{identifier(id)}/source")

    async def publish(
        self,
        id: Identifier,
        *,
        notes: str | None = None,
        bump: Literal["patch", "minor", "major"] = "patch",
    ) -> Any:
        path = f"{self._path}/{identifier(id)}"
        review = await self._get(f"{path}/source")
        data: Data = {
            "acknowledgment": True,
            "expectedRevision": review.expectedRevision,
            "sourceRevision": review.sourceRevision,
            "bump": bump,
        }
        if notes is not None:
            data["notes"] = notes
        return await self._action(f"{path}/publish", "POST", data)

    async def remix(self, id: Identifier, data: Data) -> Any:
        return await self._action(f"/explore/templates/{identifier(id)}/remix", "POST", data)

    async def versions(self, id: Identifier, **options: Any) -> ApiResponse:
        return await self._list(f"{self._path}/{identifier(id)}/versions", options)


class Members(EditableCollection):
    def __init__(self, transport: Transport, workspace: str) -> None:
        super().__init__(transport, "/workspace/members")
        self._workspace = workspace

    async def list(self, **options: Any) -> ApiResponse:
        filters = {
            key: value
            for key, value in options.items()
            if key not in ("status", "role") or value != "all"
        }
        return await super().list(**filters)

    async def governance(self, id: Identifier) -> Resource:
        result: Resource = await self._get(
            f"/session/workspaces/{identifier(self._workspace)}/members/{identifier(id)}/governance"
        )
        return result

    async def deactivate(self, id: Identifier, revision: str) -> Any:
        return await self._action(
            self._governance_path(id, "deactivate"), "POST", {"revision": revision}
        )

    async def reactivate(self, id: Identifier, revision: str) -> Any:
        return await self._action(
            self._governance_path(id, "reactivate"), "POST", {"revision": revision}
        )

    async def reassign(self, id: Identifier, data: Data) -> Any:
        return await self._action(self._governance_path(id, "reassign"), "POST", data)

    async def remove(self, id: Identifier, data: Data) -> Any:
        return await self._action(self._governance_path(id, "remove"), "POST", data)

    def _governance_path(self, id: Identifier, action: str) -> str:
        return (
            f"/session/workspaces/{identifier(self._workspace)}/members/{identifier(id)}/{action}"
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


class RetainedResources(Endpoint):
    async def restore(self, type: str, resource_id: Identifier) -> Any:
        if type not in {"chat", "agent", "project", "site", "artifact"}:
            raise ValueError("Choose chat, agent, project, site, or artifact.")
        path = f"/workspace/retained-resources/{type}/{identifier(resource_id)}/restore"
        return await self._action(path, "POST", {})


class ResourceRetention(Endpoint):
    async def get(self) -> Resource:
        result: Resource = await self._get(self._path)
        return result

    async def update(self, retain_deleted_resources_30_days: bool) -> Any:
        return await self._action(
            self._path, "PUT", {"retainDeletedResources30Days": retain_deleted_resources_30_days}
        )


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
    def agents(self) -> Agents:
        return Agents(self._transport, "/agents")

    @property
    def sites(self) -> Sites:
        return Sites(self._transport)

    @property
    def projects(self) -> Projects:
        return Projects(self._transport)

    @property
    def conversations(self) -> Conversations:
        return Conversations(self._transport, "", self.id, False)

    @property
    def runs(self) -> Runs:
        return Runs(self._transport, "/chats/runs")

    @property
    def chats(self) -> Chats:
        return Chats(self._transport, "/chats")

    def conversation_plans(
        self, conversation_id: Identifier, project_id: Identifier | None = None
    ) -> ConversationPlans:
        root = f"/projects/{identifier(project_id)}" if project_id is not None else ""
        return ConversationPlans(
            self._transport, f"{root}/conversations/{identifier(conversation_id)}/plans"
        )

    @property
    def chat_schedules(self) -> ChatSchedules:
        return ChatSchedules(self._transport, "/chats/schedules")

    @property
    def files(self) -> Files:
        return Files(self._transport, "/files")

    @property
    def templates(self) -> Templates:
        return Templates(self._transport, "/templates")

    @property
    def retained_resources(self) -> RetainedResources:
        return RetainedResources(self._transport, "/workspace/retained-resources")

    @property
    def resource_retention(self) -> ResourceRetention:
        return ResourceRetention(self._transport, "/workspace/policies/resource-retention")

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
        return Listing(self._transport, "/workspace/designs")

    @property
    def skills(self) -> Listing:
        return Listing(self._transport, "/workspace/skills")

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


class WorkspaceReference:
    """Scoped resource operation handles without Workspace membership or metadata."""

    __slots__ = ("_transport",)

    def __init__(self, transport: Transport) -> None:
        self._transport = transport

    @property
    def agents(self) -> Agents:
        return Agents(self._transport, "/agents")

    @property
    def projects(self) -> Projects:
        return Projects(self._transport)

    @property
    def chats(self) -> Chats:
        return Chats(self._transport, "/chats")

    def resource_sharing(self, kind: str, id: Identifier) -> ResourceSharing:
        return ResourceSharing(self._transport, kind, id)  # type: ignore[arg-type]


class Workspaces(Endpoint):
    def __init__(self, transport: Transport) -> None:
        super().__init__(transport, "/session/workspaces")

    def reference(self, id: Identifier) -> WorkspaceReference:
        return WorkspaceReference(self._transport.scoped(identifier(id)))

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
