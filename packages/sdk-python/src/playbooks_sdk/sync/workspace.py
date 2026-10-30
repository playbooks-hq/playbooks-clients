from typing import Any, Self

from playbooks_sdk.error import PlaybooksError
from playbooks_sdk.resource import ApiResponse, Data, Identifier, Resource, identifier
from playbooks_sdk.sync.core import (
    EditableCollection,
    Endpoint,
    Listing,
    ReadCollection,
    ReadEndpoint,
    Settings,
)
from playbooks_sdk.sync.inbox import Inbox
from playbooks_sdk.sync.operators import Conversations, Runs
from playbooks_sdk.sync.project import Projects
from playbooks_sdk.sync.references import References
from playbooks_sdk.transport import Transport


class ConversationPlans(Endpoint):
    def current(self) -> Any:
        return self._get(f"{self._path}/current")

    def get(self, id: Identifier, revision: str | None = None) -> Any:
        return self._get(f"{self._path}/{identifier(id)}", {"revision": revision})

    def create(self, data: Data) -> Any:
        return self._action(self._path, "POST", data)

    def revise(self, id: Identifier, data: Data) -> Any:
        return self._action(f"{self._path}/{identifier(id)}", "PUT", data)

    def save(self, id: Identifier, data: Data) -> Any:
        return self._action(f"{self._path}/{identifier(id)}/save", "POST", data)


class Agents(Listing):
    def get(
        self, id: Identifier, *, conversation_id: str | None = None, configuration: bool = False
    ) -> Any:
        return self._get(
            f"{self._path}/{identifier(id)}",
            {"conversationId": conversation_id, "configuration": configuration},
        )

    def create(self, data: Data) -> Any:
        return self._action(self._path, "POST", data)

    def update(self, id: Identifier, data: Data) -> Any:
        return self._action(f"{self._path}/{identifier(id)}", "PUT", data)

    def conversations(self, id: Identifier) -> ApiResponse:
        return self._list(f"{self._path}/{identifier(id)}/conversations", {})

    def create_conversation(self, id: Identifier, data: Data) -> Any:
        return self._action(f"{self._path}/{identifier(id)}/conversations", "POST", data)

    def channels(self, id: Identifier) -> Listing:
        """Inspect inbound channel assignments; credentials remain in secure setup."""
        return Listing(self._transport, f"{self._path}/{identifier(id)}/channels")

    def working_files(self, id: Identifier) -> Any:
        """Read working content, separate from background References."""
        return self._get(f"{self._path}/{identifier(id)}/working-files")

    def download_working_files(self, id: Identifier) -> bytes:
        result: bytes = self._transport.request(
            f"{self._path}/{identifier(id)}/working-files",
            params={"download": True},
            binary=True,
        )
        return result

    def replace_working_files(self, id: Identifier, data: Data) -> Any:
        return self._action(f"{self._path}/{identifier(id)}/working-files", "PUT", data)

    def preview_working_files(self, id: Identifier, data: Data) -> Any:
        return self._action(f"{self._path}/{identifier(id)}/working-files/preview", "POST", data)

    def save_working_files(self, id: Identifier, data: Data) -> Any:
        return self._action(f"{self._path}/{identifier(id)}/working-files/save", "POST", data)

    def references(self, id: Identifier) -> References:
        return References(self._transport, f"{self._path}/{identifier(id)}/references")


class AgentSchedules(ReadCollection):
    def create(self, data: Data) -> Any:
        return self._action(self._path, "POST", data)

    def preview(self, data: Data) -> Any:
        return self._action(f"{self._path}/preview", "POST", data)

    def update(self, id: Identifier, data: Data) -> Any:
        return self._action(f"{self._path}/{identifier(id)}", "PUT", data)


class Templates(EditableCollection):
    update_method = "PATCH"

    def publish(self, id: Identifier, data: Data) -> Any:
        return self._action(f"{self._path}/{identifier(id)}/publish", "POST", data)

    def versions(self, id: Identifier, **options: Any) -> ApiResponse:
        return self._list(f"{self._path}/{identifier(id)}/versions", options)


class Members(EditableCollection):
    def __init__(self, transport: Transport, workspace: str) -> None:
        super().__init__(transport, "/workspace/members")
        self._workspace = workspace

    def preview_departure(self, id: Identifier) -> Resource:
        result: Resource = self._get(
            f"/session/workspaces/{identifier(self._workspace)}/members/{identifier(id)}/departure"
        )
        return result

    def depart(self, id: Identifier, data: Data) -> Any:
        return self._action(
            f"/session/workspaces/{identifier(self._workspace)}/members/{identifier(id)}/departure",
            "POST",
            data,
        )


class Invitations(Listing):
    def create(self, data: Data) -> Any:
        return self._action(self._path, "POST", data)

    def revoke(self, id: Identifier) -> Any:
        return self._action(f"{self._path}/{identifier(id)}", "DELETE")


class DnsRecords(Listing):
    def create(self, data: Data) -> Any:
        return self._action(self._path, "POST", data)

    def update(self, id: Identifier, data: Data) -> Any:
        return self._action(f"{self._path}/{identifier(id)}", "PUT", data)

    def delete(self, id: Identifier) -> Any:
        return self._action(f"{self._path}/{identifier(id)}", "DELETE")


class Domains(ReadCollection):
    def add(self, data: Data) -> Any:
        return self._action(self._path, "POST", data)

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
        return self.to_dict()["id"]  # type: ignore[no-any-return]

    @property
    def uuid(self) -> str:
        return self.to_dict()["uuid"]  # type: ignore[no-any-return]

    @property
    def name(self) -> str:
        return self.to_dict()["name"]  # type: ignore[no-any-return]

    def update(self, data: Data) -> Self:
        updated = Endpoint(self._transport, "/workspace")._action("/workspace", "PUT", data)
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
        return Runs(self._transport, "/agents/runs")

    @property
    def agents(self) -> Agents:
        return Agents(self._transport, "/agents")

    def conversation_plans(
        self, conversation_id: Identifier, project_id: Identifier | None = None
    ) -> ConversationPlans:
        root = f"/projects/{identifier(project_id)}" if project_id is not None else ""
        return ConversationPlans(
            self._transport, f"{root}/conversations/{identifier(conversation_id)}/plans"
        )

    @property
    def agent_schedules(self) -> AgentSchedules:
        return AgentSchedules(self._transport, "/agents/schedules")

    @property
    def references(self) -> References:
        return References(self._transport, "/references")

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

    def list(self, **options: Any) -> ApiResponse:
        response = self._list(self._path, options)
        return {
            **response,
            "data": [
                Workspace(self._transport.scoped(item.uuid), item.to_dict())
                for item in response["data"]
            ],
        }

    def get(self, id: Identifier) -> Workspace:
        transport = self._transport.scoped(identifier(id))
        data = transport.request("/workspace")["data"]
        if data.get("uuid") != str(id):
            raise PlaybooksError(403, "The server did not resolve the requested workspace.")
        return Workspace(transport, data)

    def update(self, id: Identifier, data: Data) -> Workspace:
        transport = self._transport.scoped(identifier(id))
        updated = Endpoint(transport, "/workspace")._action("/workspace", "PUT", data)
        if updated.get("uuid") != str(id):
            raise PlaybooksError(502, "The updated Workspace identity did not match.")
        return Workspace(transport, updated)
