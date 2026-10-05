from collections.abc import Callable, Iterator
from contextlib import contextmanager
from typing import Any

import httpx

from playbooks_sdk.error import PlaybooksError
from playbooks_sdk.resource import (
    ApiResponse,
    Data,
    Identifier,
    Resource,
    identifier,
    query_params,
    record,
)
from playbooks_sdk.sse import EventParser
from playbooks_sdk.sync.core import Endpoint, ReadCollection
from playbooks_sdk.transport import Transport, network_error, response_data


class Runs(ReadCollection):
    def control(self, id: Identifier) -> Resource:
        result: Resource = self._get(f"{self._path}/{identifier(id)}/control")
        return result

    def cancel(self, id: Identifier) -> Any:
        return self._action(f"{self._path}/{identifier(id)}/cancel", "POST")

    def replace(self, id: Identifier, data: Data) -> Any:
        return self._action(f"{self._path}/{identifier(id)}/replace", "POST", data)

    @contextmanager
    def stream(
        self,
        id: Identifier,
        *,
        on_activity: Callable[[], None] | None = None,
        timeout: float | None = None,
    ) -> Iterator[Iterator[Data]]:
        config = self._transport.config
        url = config.url(f"{self._path}/{identifier(id)}/stream")
        try:
            with self._transport.client.stream(
                "GET", url, headers=config.headers("text/event-stream"), timeout=timeout
            ) as response:
                if not response.is_success:
                    response.read()
                    response_data(response, "GET", False, False)
                if (
                    response.headers.get("content-type", "").split(";")[0].strip()
                    != "text/event-stream"
                ):
                    raise PlaybooksError(502, "The server did not return an event stream.")
                if on_activity:
                    on_activity()

                def events() -> Iterator[Data]:
                    parser = EventParser()
                    for chunk in response.iter_bytes():
                        if on_activity:
                            on_activity()
                        yield from parser.feed(chunk)
                    yield from parser.feed(b"", final=True)

                yield events()
        except httpx.HTTPError:
            raise network_error(True) from None


class Messages(Endpoint):
    def __init__(
        self, transport: Transport, path: str, conversation_id: Identifier, sandbox: bool
    ) -> None:
        super().__init__(transport, path)
        self._conversation_id = conversation_id
        self._sandbox = sandbox

    def _params(self) -> Data:
        return {"environment": "sandbox"} if self._sandbox else {}

    def list(self, **options: Any) -> ApiResponse:
        response: ApiResponse = self._transport.request(
            self._path, params={**query_params(options), **self._params()}
        )
        return {**response, "data": [record(data) for data in response["data"]]}

    def get(self, id: Identifier) -> Resource:
        result: Resource = self._get(f"{self._path}/{identifier(id)}", self._params())
        data = result.to_dict()
        if self._sandbox and (
            str(data.get("conversationId")) != str(self._conversation_id)
            or data.get("environment") != "sandbox"
        ):
            raise PlaybooksError(403, "The message does not belong to this sandbox conversation.")
        return result

    def create(self, data: Data) -> Resource:
        result: Resource = record(
            self._transport.request(self._path, "POST", {**data, **self._params()})["data"]
        )
        return result

    def update(self, id: Identifier, data: Data) -> Resource:
        if self._sandbox:
            self.get(id)
        result: Resource = record(
            self._transport.request(
                f"{self._path}/{identifier(id)}", "PUT", data, self._params(), False
            )["data"]
        )
        return result

    def respond(self, id: Identifier, data: Data) -> Any:
        if self._sandbox:
            self.get(id)
        return self._action(f"{self._path}/{identifier(id)}/responses", "POST", data)

    def delete(self, id: Identifier) -> Any:
        if self._sandbox:
            self.get(id)
        return self._transport.request(
            f"{self._path}/{identifier(id)}", "DELETE", params=self._params(), read_only=False
        )["data"]


class ConversationBranch(Resource):
    _messages: Messages

    def __init__(self, data: Data, messages: Messages) -> None:
        super().__init__(data)
        object.__setattr__(self, "_messages", messages)

    @property
    def messages(self) -> Messages:
        return self._messages


class ConversationBranches(Endpoint):
    def __init__(
        self, transport: Transport, path: str, conversation_id: Identifier, sandbox: bool
    ) -> None:
        super().__init__(transport, path)
        self._conversation_id = conversation_id
        self._sandbox = sandbox

    def get(self, id: Identifier) -> ConversationBranch:
        if not self._sandbox:
            raise PlaybooksError(422, "Workspace Operator messages are not branch-scoped.")
        path = f"{self._path}/{identifier(id)}"
        data = self._get(path).to_dict()
        return ConversationBranch(
            data, Messages(self._transport, f"{path}/messages", self._conversation_id, True)
        )


class Conversation(Resource):
    _sandbox: bool
    _transport: Transport
    _path: str

    def __init__(self, transport: Transport, data: Data, sandbox: bool) -> None:
        super().__init__(data)
        object.__setattr__(self, "_transport", transport)
        object.__setattr__(self, "_sandbox", sandbox)
        object.__setattr__(self, "_path", f"/conversations/{identifier(data['uuid'])}")

    @property
    def messages(self) -> Messages:
        if self._sandbox:
            raise PlaybooksError(
                422, "Select a conversation branch before accessing Project messages."
            )
        return Messages(self._transport, f"{self._path}/messages", self.id, False)

    @property
    def branches(self) -> ConversationBranches:
        return ConversationBranches(
            self._transport, f"{self._path}/branches", self.id, self._sandbox
        )


class Conversations(Endpoint):
    def __init__(
        self, transport: Transport, path: str, owner_id: Identifier, project: bool
    ) -> None:
        super().__init__(transport, path)
        self._owner_id = owner_id
        self._project = project

    def _fetch(self, path: str, selected: Identifier | None = None) -> Conversation:
        data = self._transport.request(path, read_only=False)["data"]
        wrong_owner = (
            str(data.get("projectId")) != str(self._owner_id)
            if self._project
            else str(data.get("workspaceId")) != str(self._owner_id)
            or data.get("projectId")
            or data.get("folderId")
        )
        if wrong_owner:
            raise PlaybooksError(403, "The conversation does not belong to the requested Operator.")
        if selected is not None and data.get("uuid") != str(selected):
            raise PlaybooksError(403, "The conversation does not match the requested identifier.")
        return Conversation(self._transport, data, self._project)

    def resolve(self) -> Conversation:
        return self._fetch(f"{self._path}/conversation")

    def get(self, id: Identifier) -> Conversation:
        return self._fetch(f"/conversations/{identifier(id)}", id)


class ProjectConversations(Conversations):
    def create(self, data: Data) -> Conversation:
        result = self._action(f"{self._path}/conversations", "POST", data)
        return Conversation(self._transport, result, True)

    def fork(self, id: Identifier, data: Data) -> Conversation:
        result = self._action(f"{self._path}/conversations/{identifier(id)}/fork", "POST", data)
        return Conversation(self._transport, result, True)

    def list(self) -> ApiResponse:
        response: ApiResponse = self._transport.request(
            f"{self._path}/conversations", read_only=False
        )
        return {
            **response,
            "data": [Conversation(self._transport, data, True) for data in response["data"]],
        }
