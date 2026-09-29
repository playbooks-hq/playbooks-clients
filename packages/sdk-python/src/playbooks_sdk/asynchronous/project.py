import asyncio
import time
from typing import Any, Self, cast

from ..error import PlaybooksError
from ..resource import ApiResponse, Data, Identifier, Resource, identifier
from ..transport import AsyncTransport as Transport
from .core import Collection, Endpoint, Library, Listing, ReadCollection, ReadEndpoint, Settings
from .files import Files
from .operators import ProjectConversations, Runs


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
        from ..resource import query_params

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


class Workflows(Collection):
    async def schedule(self, id: Identifier, data: Data) -> Any:
        return await self._action(f"{self._path}/{identifier(id)}/schedule", "PUT", data)

    async def run(self, id: Identifier) -> Any:
        return await self._action(f"{self._path}/{identifier(id)}/runs", "POST")


class Releases(ReadCollection):
    async def list(self, **options: Any) -> ApiResponse:
        if "query" in options:
            options["search"] = options.pop("query")
        return await self._list(self._path, options)

    async def rollback(self, id: Identifier, data: Data) -> Any:
        return await self._action(f"{self._path}/{identifier(id)}/rollback", "POST", data)

    async def wait(self, id: Identifier, *, timeout_ms: float = 300000) -> Resource:
        deadline = time.monotonic() + timeout_ms / 1000
        while True:
            result = await self.get(id)
            status = result.to_dict().get("status")
            if status not in ("pending", "draft"):
                if status != "succeeded":
                    raise PlaybooksError(
                        422,
                        "Publication did not succeed. Inspect the release for failure details.",
                        "release",
                        str(id),
                    )
                return result
            if time.monotonic() >= deadline:
                raise PlaybooksError(
                    408,
                    "Publication is still pending. Inspect the release to resume observation.",
                    "release",
                    str(id),
                )
            await asyncio.sleep(2)


class Project(Resource):
    _transport: Transport
    _path: str

    def __init__(self, transport: Transport, data: Data) -> None:
        super().__init__(data)
        object.__setattr__(self, "_transport", transport)
        object.__setattr__(self, "_path", f"/workspace/projects/{identifier(data['uuid'])}")

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
        updated = await Endpoint(self._transport, self._path)._action(self._path, "PUT", data)
        self._replace(updated)
        return self

    async def move(self, data: Data) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/folder", "PUT", data
        )

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
    def settings(self) -> Settings:
        return Settings(self._transport, f"{self._path}/preferences")

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
    def files(self) -> Files:
        return Files(self._transport, f"{self._path}/files")

    @property
    def conversations(self) -> ProjectConversations:
        return ProjectConversations(self._transport, self._path, self.id, True)

    @property
    def runs(self) -> Runs:
        return Runs(self._transport, f"{self._path}/operator/runs")

    @property
    def sandbox(self) -> ReadEndpoint:
        return ReadEndpoint(self._transport, f"{self._path}/sandbox/config")

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
    def workflows(self) -> Workflows:
        return Workflows(self._transport, f"{self._path}/workflows")

    @property
    def releases(self) -> Releases:
        return Releases(self._transport, f"{self._path}/releases")

    async def _deploy_path(self) -> str:
        data = (await self._transport.request(self._path, params={"include": "deploy"}))["data"]
        if not (data.get("deploy") or {}).get("uuid"):
            raise PlaybooksError(422, "Configure Production for this Project before publishing.")
        return f"/deploys/{identifier(data['deploy']['uuid'])}/release"

    async def preflight(self, data: Data | None = None) -> Data:
        result: Data = (
            await self._transport.request(
                f"{await self._deploy_path()}/preflight",
                "POST",
                {} if data is None else data,
                raw=True,
            )
        )["data"]
        return result

    async def publish(self, data: Data) -> Data:
        if not data.get("expectedRevision"):
            raise PlaybooksError(
                422, "Review preflight and provide expectedRevision before publishing."
            )
        result: Data = (await self._transport.request(await self._deploy_path(), "POST", data))[
            "data"
        ]
        return result


class Projects(Endpoint):
    def __init__(self, transport: Transport) -> None:
        super().__init__(transport, "/workspace/projects")

    async def list(self, **options: Any) -> ApiResponse:
        response = await self._list(self._path, options)
        return {
            **response,
            "data": [Project(self._transport, item.to_dict()) for item in response["data"]],
        }

    async def get(self, id: Identifier, *, include: str | None = None) -> Project:
        data = (
            await self._transport.request(
                f"{self._path}/{identifier(id)}", params={"include": include}
            )
        )["data"]
        if data.get("uuid") != str(id):
            raise PlaybooksError(502, "The Project identity did not match.")
        return Project(self._transport, data)

    async def create(self, data: Data) -> Project:
        return Project(self._transport, await self._action(self._path, "POST", data))

    async def update(self, id: Identifier, data: Data) -> Project:
        updated = await self._action(f"{self._path}/{identifier(id)}", "PUT", data)
        if updated.get("uuid") != str(id):
            raise PlaybooksError(502, "The updated Project identity did not match.")
        return Project(self._transport, updated)
