from typing import Any, Self, cast

from playbooks_sdk.asynchronous.core import (
    Collection,
    Endpoint,
    Library,
    Listing,
    ReadEndpoint,
    Settings,
)
from playbooks_sdk.asynchronous.files import Files
from playbooks_sdk.asynchronous.operators import ProjectConversations, Runs
from playbooks_sdk.asynchronous.subagents import Subagents
from playbooks_sdk.error import PlaybooksError
from playbooks_sdk.resource import (
    ApiResponse,
    Data,
    Identifier,
    Resource,
    identifier,
    record,
    succeeded,
)
from playbooks_sdk.transport import AsyncTransport as Transport


class ProjectTests(Endpoint):
    async def list(self, **options: Any) -> Resource:
        from playbooks_sdk.resource import query_params

        result: Resource = await self._get(self._path, query_params(options))
        return result

    async def get(self, id: Identifier) -> Resource:
        result: Resource = await self._get(f"{self._path}/{identifier(id)}")
        return result

    async def create(self, data: Data) -> Any:
        return await self._action(self._path, "POST", data)

    async def operation(self, id: Identifier, operation_id: Identifier) -> Resource:
        result: Resource = await self._get(
            f"{self._path}/{identifier(id)}/operations/{identifier(operation_id)}"
        )
        return result

    async def action(self, id: Identifier, name: str, data: Data) -> Any:
        return await self._action(f"{self._path}/{identifier(id)}/{identifier(name)}", "POST", data)


class ProjectSandbox(ReadEndpoint):
    def __init__(self, transport: Transport, path: str, *, test: bool = False) -> None:
        super().__init__(transport, path)
        self._test = test

    async def configure(self, data: Data) -> Any:
        if self._test:
            raise PlaybooksError(422, "Test Projects do not support Sandbox service configuration.")
        return await self._action(self._path, "PUT", data)


class ProjectSettings(Settings):
    async def get(self) -> Resource:
        response = await self._transport.request(self._path)
        result: Resource = record({**response["data"], **(response.get("meta") or {})})
        return result

    async def update(self, data: Data) -> Any:
        response = await self._transport.request(self._path, "PUT", data)
        return {**succeeded(response["data"], self._path), **(response.get("meta") or {})}


class ProjectResources(Settings):
    async def state(self) -> Resource:
        result: Resource = await self._get(
            self._path.removesuffix("/resources") + "/resource-state"
        )
        return result


class Collaborators(Listing):
    async def add(self, data: Data) -> Any:
        return await self._action(self._path, "POST", data)

    async def update(self, id: Identifier, data: Data) -> Any:
        return await self._action(f"{self._path}/{identifier(id)}", "PUT", data)


class Logs(Endpoint):
    async def list(self, **options: Any) -> ApiResponse:
        from playbooks_sdk.resource import query_params

        response: ApiResponse = await self._transport.request(
            self._path, params=query_params(options)
        )
        return response


class Source(Endpoint):
    async def status(self) -> Resource:
        result: Resource = await self._get(f"{self._path}/git-panel")
        return result

    async def connect(self, data: Data) -> Any:
        return await self._action(f"{self._path}/source-control/connect", "PUT", data)

    async def disconnect(self) -> Any:
        return (
            await self._transport.request(
                f"{self._path}/source-control/disconnect", read_only=False
            )
        )["data"]

    async def sync(self, data: Data) -> Any:
        return await self._action(f"{self._path}/git-panel/sync", "POST", data)

    async def import_(self, *, name: str, content: bytes) -> Any:
        return (
            await self._transport.request(
                f"{self._path}/upload",
                "POST",
                files={"project": (name, content, "application/octet-stream")},
            )
        )["data"]

    async def export(self) -> bytes:
        result: bytes = await self._transport.request(
            f"{self._path}/download", read_only=False, binary=True
        )
        return result


class Branches(Listing):
    async def create(self, data: Data) -> Any:
        return await self._action(
            self._path.removesuffix("/branches") + "/git-panel/branches", "POST", data
        )


class Checkpoints(Listing):
    async def rename(self, id: Identifier, data: Data) -> Any:
        return await self._action(f"{self._path}/{identifier(id)}", "PUT", data)

    async def restore(self, id: Identifier) -> Any:
        return await self._action(f"{self._path}/{identifier(id)}/restore", "POST")


class Ownership(ReadEndpoint):
    async def transfer(self, data: Data) -> Any:
        return await self._action(self._path, "POST", data)

    async def accept(self, id: Identifier) -> Any:
        return await self._action(f"{self._path}/{identifier(id)}/accept", "POST")

    async def decline(self, id: Identifier) -> Any:
        return await self._action(f"{self._path}/{identifier(id)}/decline", "POST")

    async def cancel(self, id: Identifier) -> Any:
        return await self._action(f"{self._path}/{identifier(id)}/cancel", "POST")


class Schedules(Collection):
    async def run(self, id: Identifier, data: Data) -> Any:
        return await self._action(f"{self._path}/{identifier(id)}/runs", "POST", data)

    async def delete(self, id: Identifier, data: Data) -> Any:
        return await self._action(f"{self._path}/{identifier(id)}", "DELETE", data)

    async def runs(self, id: Identifier, **options: Any) -> ApiResponse:
        return await self._list(f"{self._path}/{identifier(id)}/runs", options)

    async def occurrences(self, id: Identifier, **options: Any) -> ApiResponse:
        return await self._list(f"{self._path}/{identifier(id)}/occurrences", options)

    async def get_run(self, id: Identifier, run_id: Identifier) -> Resource:
        result: Resource = await self._get(
            f"{self._path}/{identifier(id)}/runs/{identifier(run_id)}"
        )
        return result


class Project(Resource):
    @property
    def subagents(self) -> Subagents:
        return Subagents(self._transport, f"{self._path}/subagents")

    _transport: Transport
    _path: str

    def __init__(self, transport: Transport, data: Data, path: str | None = None) -> None:
        super().__init__(data)
        object.__setattr__(self, "_transport", transport)
        object.__setattr__(self, "_path", path or f"/projects/{identifier(data['uuid'])}")

    @property
    def id(self) -> int:
        return cast(int, self.to_dict()["id"])

    @property
    def uuid(self) -> str:
        return cast(str, self.to_dict()["uuid"])

    @property
    def name(self) -> str:
        return cast(str, self.to_dict()["name"])

    async def agent_access(self) -> Any:
        return await Endpoint(self._transport, self._path)._get(f"{self._path}/agent-access")

    async def update_agent_access(self, *, enabled: bool) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/agent-access", "PUT", {"enabled": enabled}
        )

    async def rotate_agent_access(self) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/agent-access/rotate", "POST", {}
        )

    async def update(self, data: Data) -> Self:
        updated = await Endpoint(self._transport, self._path)._action(self._path, "PUT", data)
        if updated.get("id") != self.id or updated.get("uuid") != self.uuid:
            raise PlaybooksError(502, "The updated Project identity did not match.")
        self._replace(updated)
        return self

    async def archive(self, data: Data) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/lifecycle/archive", "POST", data
        )

    async def restore(self, data: Data) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/lifecycle/restore", "POST", data
        )

    async def delete(self, data: Data) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/lifecycle/delete", "POST", data
        )

    @property
    def lifecycle(self) -> ReadEndpoint:
        return ReadEndpoint(self._transport, f"{self._path}/lifecycle")

    @property
    def publication(self) -> ReadEndpoint:
        return ReadEndpoint(self._transport, f"{self._path}/publication")

    @property
    def usage(self) -> ReadEndpoint:
        return ReadEndpoint(self._transport, f"{self._path}/usage")

    @property
    def budget(self) -> Settings:
        return Settings(self._transport, f"{self._path}/budget")

    @property
    def settings(self) -> ProjectSettings:
        return ProjectSettings(self._transport, f"{self._path}/preferences")

    @property
    def resources(self) -> ProjectResources:
        return ProjectResources(self._transport, f"{self._path}/resources")

    @property
    def collaborators(self) -> Collaborators:
        return Collaborators(self._transport, f"{self._path}/collaborators")

    @property
    def agents(self) -> Collection:
        return Collection(self._transport, f"{self._path}/agents")

    @property
    def tests(self) -> ProjectTests:
        return ProjectTests(self._transport, f"{self._path}/tests")

    @property
    def designs(self) -> Library:
        return Library(self._transport, f"{self._path}/resources/library/designs")

    @property
    def skills(self) -> Library:
        return Library(self._transport, f"{self._path}/resources/library/skills")

    @property
    def mcps(self) -> Listing:
        return Listing(self._transport, f"{self._path}/resource-mcps")

    @property
    def connectors(self) -> Listing:
        return Listing(self._transport, f"{self._path}/connectors")

    @property
    def channels(self) -> Listing:
        return Listing(self._transport, f"{self._path}/channels")

    @property
    def files(self) -> Files:
        return Files(self._transport, f"{self._path}/files")

    @property
    def conversations(self) -> ProjectConversations:
        return ProjectConversations(self._transport, self._path, self.id, True)

    @property
    def runs(self) -> Runs:
        return Runs(self._transport, f"{self._path}/operator/runs")

    @property
    def sandbox(self) -> ProjectSandbox:
        test = self.to_dict().get("executionProfile") == "test"
        suffix = "health" if test else "config"
        return ProjectSandbox(self._transport, f"{self._path}/sandbox/{suffix}", test=test)

    @property
    def logs(self) -> Logs:
        return Logs(self._transport, f"{self._path}/logs")

    @property
    def source(self) -> Source:
        return Source(self._transport, self._path)

    @property
    def branches(self) -> Branches:
        return Branches(self._transport, f"{self._path}/branches")

    @property
    def checkpoints(self) -> Checkpoints:
        return Checkpoints(self._transport, f"{self._path}/checkpoints")

    @property
    def ownership(self) -> Ownership:
        return Ownership(self._transport, f"{self._path}/ownership-request")

    @property
    def schedules(self) -> Schedules:
        return Schedules(self._transport, f"{self._path}/schedules")

    @property
    def sites(self) -> Listing:
        return Listing(self._transport, f"{self._path}/sites")


class Projects(Endpoint):
    def __init__(self, transport: Transport) -> None:
        super().__init__(transport, "/projects")

    async def list(self, **options: Any) -> ApiResponse:
        response = await self._list(self._path, options)
        return {
            **response,
            "data": [Project(self._transport, item.to_dict()) for item in response["data"]],
        }

    async def get(
        self,
        id: Identifier,
        *,
        include: str | None = None,
        agent_id: Identifier | None = None,
        test_id: Identifier | None = None,
    ) -> Project:
        if agent_id is not None and test_id is not None:
            raise PlaybooksError(422, "Choose either an Agent or a Test.")
        path = f"{self._path}/{identifier(id)}"
        if agent_id is not None:
            path += f"/agents/{identifier(agent_id)}/execution"
        if test_id is not None:
            path += f"/tests/{identifier(test_id)}/execution"
        data = (await self._transport.request(path, params={"include": include}))["data"]
        child_id = agent_id if agent_id is not None else test_id
        child = data.get("childContext") or {}
        matches = (
            data.get("uuid") == str(id)
            if child_id is None
            else (
                child.get("parentId") == str(id)
                and data.get("executionProfile")
                == ("operational" if agent_id is not None else "test")
                and child.get("agentId" if agent_id is not None else "testId") == str(child_id)
            )
        )
        if not matches:
            raise PlaybooksError(502, "The Project identity did not match.")
        return Project(self._transport, data, path)

    async def create(self, data: Data) -> Project:
        return Project(self._transport, await self._action(self._path, "POST", data))

    async def update(self, id: Identifier, data: Data) -> Project:
        updated = await self._action(f"{self._path}/{identifier(id)}", "PUT", data)
        if updated.get("uuid") != str(id):
            raise PlaybooksError(502, "The updated Project identity did not match.")
        return Project(self._transport, updated)
