from collections.abc import Callable, Iterator
from contextlib import contextmanager
from typing import Any
from urllib.parse import quote

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
            raise PlaybooksError(422, "Agent messages are not branch-scoped.")
        path = f"{self._path}/{identifier(id)}"
        data = self._get(path).to_dict()
        return ConversationBranch(
            data, Messages(self._transport, f"{path}/messages", self._conversation_id, True)
        )


class ConversationPlans(Endpoint):
    def current(self) -> Resource | None:
        result: Resource | None = self._get(f"{self._path}/current")
        return result

    def get(self, id: Identifier, revision: str | None = None) -> Any:
        return self._get(f"{self._path}/{identifier(id)}", {"revision": revision})

    def create(self, data: Data) -> Any:
        return self._action(self._path, "POST", data)

    def revise(self, id: Identifier, data: Data) -> Any:
        return self._action(f"{self._path}/{identifier(id)}", "PUT", data)

    def source(self, message_id: Identifier, part_id: str) -> Any:
        if part_id in ("", ".", ".."):
            raise PlaybooksError(422, "Provide a valid message part identifier.")
        return self._get(f"{self._path}/source/{identifier(message_id)}/{quote(part_id, safe='')}")


class Conversation(Resource):
    _sandbox: bool
    _transport: Transport
    _path: str
    _project_plan_path: str | None

    def __init__(
        self, transport: Transport, data: Data, sandbox: bool, project_plan_path: str | None = None
    ) -> None:
        super().__init__(data)
        object.__setattr__(self, "_transport", transport)
        object.__setattr__(self, "_sandbox", sandbox)
        object.__setattr__(self, "_project_plan_path", project_plan_path)
        object.__setattr__(self, "_path", f"/conversations/{identifier(data['uuid'])}")

    def utility(self) -> Any:
        return Endpoint(self._transport, self._path)._get(f"{self._path}/utility")

    def utility_items(self, *, kind: str, **options: Any) -> ApiResponse:
        return Endpoint(self._transport, self._path)._list(
            f"{self._path}/utility", {**options, "kind": kind}
        )

    @property
    def messages(self) -> Messages:
        if self._sandbox:
            raise PlaybooksError(
                422, "Select a conversation branch before accessing Project messages."
            )
        return Messages(self._transport, f"{self._path}/messages", self.id, False)

    @property
    def plans(self) -> ConversationPlans:
        if self._sandbox and not self._project_plan_path:
            raise PlaybooksError(422, "Use the Project scope to access this conversation Plan.")
        root = self._project_plan_path or ""
        return ConversationPlans(self._transport, f"{root}{self._path}/plans")

    def mark_read(self, *, through_message_id: int, observed_at: str | None = None) -> Any:
        if self._sandbox:
            raise PlaybooksError(422, "This operation requires a Chat conversation.")
        if type(through_message_id) is not int or not 0 <= through_message_id <= 9007199254740991:
            raise PlaybooksError(422, "Provide a nonnegative message ID.")
        data: Data = {"action": "read", "messageId": through_message_id}
        if observed_at is not None:
            data["observedAt"] = observed_at
        return Endpoint(self._transport, self._path)._action(self._path, "PUT", data)

    @property
    def branches(self) -> ConversationBranches:
        return ConversationBranches(
            self._transport, f"{self._path}/branches", self.id, self._sandbox
        )


class ChatConversations(Endpoint):
    def get(self, id: Identifier) -> Conversation:
        data: Data = self._transport.request(f"{self._path}/{identifier(id)}", read_only=False)[
            "data"
        ]
        source = data.get("source")
        workspace = self._transport.config.workspace
        if (
            not workspace
            or data.get("uuid") != str(id)
            or data.get("projectId")
            or not isinstance(source, dict)
            or source.get("uuid") != workspace
        ):
            raise PlaybooksError(
                403,
                "The conversation could not be verified for this Workspace. "
                "Use chats.conversation() with its Chat ID.",
            )
        return Conversation(self._transport, data, False)


class Conversations(Endpoint):
    def __init__(
        self,
        transport: Transport,
        path: str,
        owner_id: Identifier,
        project: bool,
        project_plan_path: str | None = None,
    ) -> None:
        super().__init__(transport, path)
        self._owner_id = owner_id
        self._project = project
        self._project_plan_path = project_plan_path

    def _wrap(self, data: Data) -> Conversation:
        return Conversation(self._transport, data, self._project, self._project_plan_path)

    def _fetch(self, path: str, selected: Identifier | None = None) -> Conversation:
        data = self._transport.request(path, read_only=False)["data"]
        wrong_owner = (
            str(data.get("projectId")) != str(self._owner_id)
            if self._project
            else str(data.get("workspaceId")) != str(self._owner_id) or data.get("projectId")
        )
        if wrong_owner:
            raise PlaybooksError(403, "The conversation does not belong to the requested Operator.")
        if selected is not None and data.get("uuid") != str(selected):
            raise PlaybooksError(403, "The conversation does not match the requested identifier.")
        return self._wrap(data)

    def get(self, id: Identifier) -> Conversation:
        return self._fetch(f"/conversations/{identifier(id)}", id)


class ProjectConversations(Conversations):
    def create(self, data: Data) -> Conversation:
        result = self._action(f"{self._path}/conversations", "POST", data)
        return self._wrap(result)

    def fork(self, id: Identifier, data: Data) -> Conversation:
        result = self._action(f"{self._path}/conversations/{identifier(id)}/fork", "POST", data)
        return self._wrap(result)

    def list(self) -> ApiResponse:
        response: ApiResponse = self._transport.request(
            f"{self._path}/conversations", read_only=False
        )
        return {
            **response,
            "data": [self._wrap(data) for data in response["data"]],
        }
