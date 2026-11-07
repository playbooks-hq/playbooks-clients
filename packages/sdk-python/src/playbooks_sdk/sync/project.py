from typing import Any, Self

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
from playbooks_sdk.sync.core import (
    Collection,
    Endpoint,
    Library,
    Listing,
    ReadEndpoint,
    Settings,
)
from playbooks_sdk.sync.files import Files
from playbooks_sdk.sync.operators import ProjectConversations, Runs
from playbooks_sdk.sync.subagents import Subagents
from playbooks_sdk.transport import Transport


class ProjectTests(Endpoint):
    def list(self, **options: Any) -> Resource:
        from playbooks_sdk.resource import query_params

        result: Resource = self._get(self._path, query_params(options))
        return result

    def get(self, id: Identifier) -> Resource:
        result: Resource = self._get(f"{self._path}/{identifier(id)}")
        return result

    def create(self, data: Data) -> Any:
        return self._action(self._path, "POST", data)

    def operation(self, id: Identifier, operation_id: Identifier) -> Resource:
        result: Resource = self._get(
            f"{self._path}/{identifier(id)}/operations/{identifier(operation_id)}"
        )
        return result

    def action(self, id: Identifier, name: str, data: Data) -> Any:
        return self._action(f"{self._path}/{identifier(id)}/{identifier(name)}", "POST", data)


class ProjectSandbox(ReadEndpoint):
    def __init__(self, transport: Transport, path: str, *, test: bool = False) -> None:
        super().__init__(transport, path)
        self._test = test

    def configure(self, data: Data) -> Any:
        if self._test:
            raise PlaybooksError(422, "Test Projects do not support Sandbox service configuration.")
        return self._action(self._path, "PUT", data)


class ProjectSettings(Settings):
    def get(self) -> Resource:
        response = self._transport.request(self._path)
        result: Resource = record({**response["data"], **(response.get("meta") or {})})
        return result

    def update(self, data: Data) -> Any:
        response = self._transport.request(self._path, "PUT", data)
        return {**succeeded(response["data"], self._path), **(response.get("meta") or {})}


class ProjectResources(Settings):
    def state(self) -> Resource:
        result: Resource = self._get(self._path.removesuffix("/resources") + "/resource-state")
        return result


class Collaborators(Listing):
    def add(self, data: Data) -> Any:
        return self._action(self._path, "POST", data)

    def update(self, id: Identifier, data: Data) -> Any:
        return self._action(f"{self._path}/{identifier(id)}", "PUT", data)


class Logs(Endpoint):
    def list(self, **options: Any) -> ApiResponse:
        from playbooks_sdk.resource import query_params

        response: ApiResponse = self._transport.request(self._path, params=query_params(options))
        return response


class Source(Endpoint):
    def status(self) -> Resource:
        result: Resource = self._get(f"{self._path}/git-panel")
        return result

    def connect(self, data: Data) -> Any:
        return self._action(f"{self._path}/source-control/connect", "PUT", data)

    def disconnect(self) -> Any:
        return self._transport.request(f"{self._path}/source-control/disconnect", read_only=False)[
            "data"
        ]

    def sync(self, data: Data) -> Any:
        return self._action(f"{self._path}/git-panel/sync", "POST", data)

    def import_(self, *, name: str, content: bytes) -> Any:
        return self._transport.request(
            f"{self._path}/upload",
            "POST",
            files={"project": (name, content, "application/octet-stream")},
        )["data"]

    def export(self) -> bytes:
        result: bytes = self._transport.request(
            f"{self._path}/download", read_only=False, binary=True
        )
        return result


class Branches(Listing):
    def create(self, data: Data) -> Any:
        return self._action(
            self._path.removesuffix("/branches") + "/git-panel/branches", "POST", data
        )


class Checkpoints(Listing):
    def rename(self, id: Identifier, data: Data) -> Any:
        return self._action(f"{self._path}/{identifier(id)}", "PUT", data)

    def restore(self, id: Identifier) -> Any:
        return self._action(f"{self._path}/{identifier(id)}/restore", "POST")


class Ownership(ReadEndpoint):
    def transfer(self, data: Data) -> Any:
        return self._action(self._path, "POST", data)

    def accept(self, id: Identifier) -> Any:
        return self._action(f"{self._path}/{identifier(id)}/accept", "POST")

    def decline(self, id: Identifier) -> Any:
        return self._action(f"{self._path}/{identifier(id)}/decline", "POST")

    def cancel(self, id: Identifier) -> Any:
        return self._action(f"{self._path}/{identifier(id)}/cancel", "POST")


class Schedules(Collection):
    def run(self, id: Identifier, data: Data) -> Any:
        return self._action(f"{self._path}/{identifier(id)}/runs", "POST", data)

    def delete(self, id: Identifier, data: Data) -> Any:
        return self._action(f"{self._path}/{identifier(id)}", "DELETE", data)

    def runs(self, id: Identifier, **options: Any) -> ApiResponse:
        return self._list(f"{self._path}/{identifier(id)}/runs", options)

    def occurrences(self, id: Identifier, **options: Any) -> ApiResponse:
        return self._list(f"{self._path}/{identifier(id)}/occurrences", options)

    def get_run(self, id: Identifier, run_id: Identifier) -> Resource:
        result: Resource = self._get(f"{self._path}/{identifier(id)}/runs/{identifier(run_id)}")
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
        return self.to_dict()["id"]  # type: ignore[no-any-return]

    @property
    def uuid(self) -> str:
        return self.to_dict()["uuid"]  # type: ignore[no-any-return]

    @property
    def name(self) -> str:
        return self.to_dict()["name"]  # type: ignore[no-any-return]

    def agent_access(self) -> Any:
        return Endpoint(self._transport, self._path)._get(f"{self._path}/agent-access")

    def update_agent_access(self, *, enabled: bool) -> Any:
        return Endpoint(self._transport, self._path)._action(
            f"{self._path}/agent-access", "PUT", {"enabled": enabled}
        )

    def rotate_agent_access(self) -> Any:
        return Endpoint(self._transport, self._path)._action(
            f"{self._path}/agent-access/rotate", "POST", {}
        )

    def update(self, data: Data) -> Self:
        updated = Endpoint(self._transport, self._path)._action(self._path, "PUT", data)
        if updated.get("id") != self.id or updated.get("uuid") != self.uuid:
            raise PlaybooksError(502, "The updated Project identity did not match.")
        self._replace(updated)
        return self

    def archive(self, data: Data) -> Any:
        return Endpoint(self._transport, self._path)._action(
            f"{self._path}/lifecycle/archive", "POST", data
        )

    def restore(self, data: Data) -> Any:
        return Endpoint(self._transport, self._path)._action(
            f"{self._path}/lifecycle/restore", "POST", data
        )

    def delete(self, data: Data) -> Any:
        return Endpoint(self._transport, self._path)._action(
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

    def list(self, **options: Any) -> ApiResponse:
        response = self._list(self._path, options)
        return {
            **response,
            "data": [Project(self._transport, item.to_dict()) for item in response["data"]],
        }

    def get(
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
        data = (self._transport.request(path, params={"include": include}))["data"]
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

    def create(self, data: Data) -> Project:
        return Project(self._transport, self._action(self._path, "POST", data))

    def update(self, id: Identifier, data: Data) -> Project:
        updated = self._action(f"{self._path}/{identifier(id)}", "PUT", data)
        if updated.get("uuid") != str(id):
            raise PlaybooksError(502, "The updated Project identity did not match.")
        return Project(self._transport, updated)
