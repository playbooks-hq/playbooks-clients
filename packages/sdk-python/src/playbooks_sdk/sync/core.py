from typing import Any, Self

from ..resource import (
    ApiResponse,
    Data,
    Identifier,
    Resource,
    identifier,
    query_params,
    record,
    succeeded,
)
from ..transport import Transport


class Endpoint:
    def __init__(self, transport: Transport, path: str) -> None:
        self._transport = transport
        self._path = path

    def _get(self, path: str, params: Data | None = None, read_only: bool = True) -> Any:
        return record(self._transport.request(path, params=params, read_only=read_only)["data"])

    def _action(self, path: str, method: str, data: Data | None = None) -> Any:
        return succeeded(self._transport.request(path, method, data, read_only=False)["data"], path)

    def _list(self, path: str, options: Data, read_only: bool = True) -> ApiResponse:
        response: ApiResponse = self._transport.request(
            path, params=query_params(options), read_only=read_only
        )
        return {**response, "data": [record(data) for data in response["data"]]}


class ReadEndpoint(Endpoint):
    def get(self) -> Resource:
        result: Resource = self._get(self._path)
        return result


class Settings(ReadEndpoint):
    def update(self, data: Data) -> Any:
        return self._action(self._path, "PUT", data)


class Listing(Endpoint):
    def list(self, **options: Any) -> ApiResponse:
        return self._list(self._path, options)


class ReadCollection(Listing):
    def get(self, id: Identifier, *, include: str | None = None) -> Resource:
        result: Resource = self._get(f"{self._path}/{identifier(id)}", {"include": include})
        return result


class EditableResource(Resource):
    _transport: Transport
    _path: str

    def __init__(self, transport: Transport, path: str, data: Data) -> None:
        super().__init__(data)
        object.__setattr__(self, "_transport", transport)
        object.__setattr__(self, "_path", path)

    def update(self, data: Data) -> Self:
        updated = succeeded(self._transport.request(self._path, "PUT", data)["data"], self._path)
        self._replace(updated)
        return self


class EditableCollection(ReadCollection):
    def _wrap(self, data: Data) -> EditableResource:
        id = identifier(data["uuid"] if data.get("uuid") is not None else data["id"])
        return EditableResource(self._transport, f"{self._path}/{id}", data)

    def list(self, **options: Any) -> ApiResponse:
        response = self._list(self._path, options)
        return {**response, "data": [self._wrap(item.to_dict()) for item in response["data"]]}

    def get(self, id: Identifier, *, include: str | None = None) -> EditableResource:
        return self._wrap(
            self._get(f"{self._path}/{identifier(id)}", {"include": include}).to_dict()
        )

    def update(self, id: Identifier, data: Data) -> EditableResource:
        return self._wrap(self._action(f"{self._path}/{identifier(id)}", "PUT", data))


class Collection(EditableCollection):
    def create(self, data: Data) -> EditableResource:
        return self._wrap(self._action(self._path, "POST", data))


class Library(Listing):
    def _wrap(self, data: Data) -> EditableResource:
        id = identifier(data["uuid"] if data.get("uuid") is not None else data["id"])
        return EditableResource(self._transport, f"{self._path}/{id}", data)

    def list(self, **options: Any) -> ApiResponse:
        response = self._list(self._path, options)
        return {**response, "data": [self._wrap(item.to_dict()) for item in response["data"]]}

    def create(self, data: Data) -> EditableResource:
        return self._wrap(self._action(self._path, "POST", data))

    def update(self, id: Identifier, data: Data) -> EditableResource:
        return self._wrap(self._action(f"{self._path}/{identifier(id)}", "PUT", data))
