from typing import Any, Self

from playbooks_sdk.resource import (
    ApiResponse,
    Data,
    Identifier,
    Resource,
    identifier,
    query_params,
    record,
    succeeded,
)
from playbooks_sdk.transport import AsyncTransport as Transport


class Endpoint:
    def __init__(self, transport: Transport, path: str) -> None:
        self._transport = transport
        self._path = path

    async def _get(self, path: str, params: Data | None = None, read_only: bool = True) -> Any:
        return record(
            (await self._transport.request(path, params=params, read_only=read_only))["data"]
        )

    async def _action(self, path: str, method: str, data: Data | None = None) -> Any:
        return succeeded(
            (await self._transport.request(path, method, data, read_only=False))["data"], path
        )

    async def _list(self, path: str, options: Data, read_only: bool = True) -> ApiResponse:
        response: ApiResponse = await self._transport.request(
            path, params=query_params(options), read_only=read_only
        )
        return {**response, "data": [record(data) for data in response["data"]]}


class ReadEndpoint(Endpoint):
    async def get(self) -> Resource:
        result: Resource = await self._get(self._path)
        return result


class Settings(ReadEndpoint):
    async def update(self, data: Data) -> Any:
        return await self._action(self._path, "PUT", data)


class Listing(Endpoint):
    async def list(self, **options: Any) -> ApiResponse:
        return await self._list(self._path, options)


class ReadCollection(Listing):
    async def get(self, id: Identifier, *, include: str | None = None) -> Resource:
        result: Resource = await self._get(f"{self._path}/{identifier(id)}", {"include": include})
        return result


class EditableResource(Resource):
    _transport: Transport
    _path: str

    def __init__(self, transport: Transport, path: str, data: Data) -> None:
        super().__init__(data)
        object.__setattr__(self, "_transport", transport)
        object.__setattr__(self, "_path", path)

    async def update(self, data: Data) -> Self:
        updated = succeeded(
            (await self._transport.request(self._path, "PUT", data))["data"], self._path
        )
        self._replace(updated)
        return self


class EditableCollection(ReadCollection):
    def _wrap(self, data: Data) -> EditableResource:
        id = identifier(data["uuid"] if data.get("uuid") is not None else data["id"])
        return EditableResource(self._transport, f"{self._path}/{id}", data)

    async def list(self, **options: Any) -> ApiResponse:
        response = await self._list(self._path, options)
        return {**response, "data": [self._wrap(item.to_dict()) for item in response["data"]]}

    async def get(self, id: Identifier, *, include: str | None = None) -> EditableResource:
        return self._wrap(
            (await self._get(f"{self._path}/{identifier(id)}", {"include": include})).to_dict()
        )

    async def update(self, id: Identifier, data: Data) -> EditableResource:
        return self._wrap(await self._action(f"{self._path}/{identifier(id)}", "PUT", data))


class Collection(EditableCollection):
    async def create(self, data: Data) -> EditableResource:
        return self._wrap(await self._action(self._path, "POST", data))


class Library(Listing):
    def _wrap(self, data: Data) -> EditableResource:
        id = identifier(data["uuid"] if data.get("uuid") is not None else data["id"])
        return EditableResource(self._transport, f"{self._path}/{id}", data)

    async def list(self, **options: Any) -> ApiResponse:
        response = await self._list(self._path, options)
        return {**response, "data": [self._wrap(item.to_dict()) for item in response["data"]]}

    async def create(self, data: Data) -> EditableResource:
        return self._wrap(await self._action(self._path, "POST", data))

    async def update(self, id: Identifier, data: Data) -> EditableResource:
        return self._wrap(await self._action(f"{self._path}/{identifier(id)}", "PUT", data))
