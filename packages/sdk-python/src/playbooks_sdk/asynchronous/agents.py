from typing import Any, Self

from playbooks_sdk.asynchronous.core import Endpoint
from playbooks_sdk.error import PlaybooksError
from playbooks_sdk.resource import ApiResponse, Data, Identifier, Resource, identifier
from playbooks_sdk.transport import AsyncTransport as Transport


class Agent(Resource):
    _transport: Transport
    _path: str

    def __init__(self, transport: Transport, data: Data) -> None:
        super().__init__(data)
        object.__setattr__(self, "_transport", transport)
        object.__setattr__(self, "_path", f"/agents/{identifier(data['uuid'])}")

    async def update(self, data: Data) -> Self:
        updated = await Endpoint(self._transport, self._path)._action(self._path, "PATCH", data)
        if updated["uuid"] != self.to_dict()["uuid"]:
            raise PlaybooksError(502, "The updated Agent identity did not match.")
        self._replace(updated)
        return self

    async def archive(self, revision: int) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/archive", "POST", {"revision": revision}
        )

    async def restore(self, revision: int) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/restore", "POST", {"revision": revision}
        )

    async def delete(self, revision: int) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            self._path, "DELETE", {"revision": revision}
        )

    async def conversations(self, **options: Any) -> ApiResponse:
        return await Endpoint(self._transport, self._path)._list(
            f"{self._path}/conversations", options
        )

    async def create_conversation(
        self, *, idempotency_key: str, title: str = "New conversation"
    ) -> Any:
        response = await self._transport.request(
            f"{self._path}/conversations",
            "POST",
            {"title": title},
            extra_headers={"Idempotency-Key": idempotency_key},
        )
        return response["data"]

    async def conversation(self, id: Identifier) -> Any:
        return await Endpoint(self._transport, self._path)._get(
            f"{self._path}/conversations/{identifier(id)}"
        )

    async def update_conversation(self, id: Identifier, *, title: str) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/conversations/{identifier(id)}", "PATCH", {"title": title}
        )

    async def archive_conversation(self, conversation_id: Identifier) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/conversations/{identifier(conversation_id)}/archive", "POST"
        )

    async def restore_conversation(self, conversation_id: Identifier) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/conversations/{identifier(conversation_id)}/restore", "POST"
        )

    async def delete_conversation(self, conversation_id: Identifier) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/conversations/{identifier(conversation_id)}", "DELETE"
        )

    async def mark_conversation_read(self, conversation_id: Identifier) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/conversations/{identifier(conversation_id)}/read", "PUT"
        )

    async def answer_conversation(
        self,
        conversation_id: Identifier,
        execution_id: Identifier,
        responses: list[Data],
        *,
        idempotency_key: str,
    ) -> Any:
        response = await self._transport.request(
            f"{self._path}/conversations/{identifier(conversation_id)}/executions/{identifier(execution_id)}/answers",
            "POST",
            {"responses": responses},
            extra_headers={"Idempotency-Key": idempotency_key},
        )
        return response["data"]

    async def cancel_conversation_execution(
        self, conversation_id: Identifier, execution_id: Identifier
    ) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/conversations/{identifier(conversation_id)}/executions/{identifier(execution_id)}/cancel",
            "POST",
        )

    async def messages(self, conversation_id: Identifier, **options: Any) -> ApiResponse:
        return await Endpoint(self._transport, self._path)._list(
            f"{self._path}/conversations/{identifier(conversation_id)}/messages", options
        )

    async def send_message(
        self,
        conversation_id: Identifier,
        text: str,
        *,
        idempotency_key: str,
        attachments: list[Data] | None = None,
    ) -> Any:
        response = await self._transport.request(
            f"{self._path}/conversations/{identifier(conversation_id)}/messages",
            "POST",
            {"text": text, **({"attachments": attachments} if attachments is not None else {})},
            extra_headers={"Idempotency-Key": idempotency_key},
        )
        return response["data"]

    async def executions(
        self, *, page: int | None = None, page_size: int | None = None, **options: Any
    ) -> ApiResponse:
        params = dict(options)
        if page is not None:
            params["page"] = page
        if page_size is not None:
            params["page_size"] = page_size
        return await Endpoint(self._transport, self._path)._list(f"{self._path}/executions", params)

    async def execution(self, id: Identifier) -> Any:
        return await Endpoint(self._transport, self._path)._get(
            f"{self._path}/executions/{identifier(id)}"
        )

    async def invoke(self, instruction: str, *, idempotency_key: str) -> Any:
        response = await self._transport.request(
            f"{self._path}/executions",
            "POST",
            {"instruction": instruction},
            extra_headers={"Idempotency-Key": idempotency_key},
        )
        return response["data"]

    async def cancel_execution(self, id: Identifier) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/executions/{identifier(id)}/cancel", "POST", {}
        )

    async def budget(self) -> Any:
        return await Endpoint(self._transport, self._path)._get(f"{self._path}/budget")

    async def update_budget(self, data: Data) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/budget", "PUT", data
        )

    async def credentials(self) -> ApiResponse:
        return await Endpoint(self._transport, self._path)._list(f"{self._path}/credentials", {})

    async def create_credential(self, data: Data) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/credentials", "POST", data
        )

    async def revoke_credential(self, id: Identifier) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/credentials/{identifier(id)}", "DELETE"
        )

    async def grants(self) -> ApiResponse:
        return await Endpoint(self._transport, self._path)._list(f"{self._path}/grants", {})

    async def put_grant(self, data: Data) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/grants", "PUT", data
        )

    async def externals(self) -> ApiResponse:
        return await Endpoint(self._transport, self._path)._list(
            f"{self._path}/external-assignments", {}
        )

    async def external_options(self, **options: Any) -> ApiResponse:
        return await Endpoint(self._transport, self._path)._list(
            f"{self._path}/external-options", options
        )

    async def create_external(self, data: Data) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/external-assignments", "POST", data
        )

    async def update_external(self, id: Identifier, data: Data) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/external-assignments/{identifier(id)}", "PUT", data
        )

    async def revoke_external(self, id: Identifier, revision: int) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/external-assignments/{identifier(id)}", "DELETE", {"revision": revision}
        )

    async def resources(self) -> ApiResponse:
        return await Endpoint(self._transport, self._path)._list(f"{self._path}/resources", {})

    async def resource_options(self, **options: Any) -> ApiResponse:
        return await Endpoint(self._transport, self._path)._list(
            f"{self._path}/resource-options", options
        )

    async def put_resource(self, data: Data) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/resources", "PUT", data
        )

    async def delete_resource(self, kind: str, resource_id: Identifier) -> Any:
        if kind not in ("skill", "design", "reference"):
            raise ValueError("Invalid Agent resource kind.")
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/resources/{kind}/{identifier(resource_id)}", "DELETE"
        )

    async def working_files(self) -> Any:
        return await Endpoint(self._transport, self._path)._get(f"{self._path}/working-files")

    async def update_working_files(self, data: Data) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/working-files", "PUT", data
        )

    async def outputs(self) -> ApiResponse:
        return await Endpoint(self._transport, self._path)._list(f"{self._path}/outputs", {})

    async def output(self, id: Identifier) -> Any:
        return await Endpoint(self._transport, self._path)._get(
            f"{self._path}/outputs/{identifier(id)}"
        )

    async def schedules(
        self, *, page: int | None = None, page_size: int | None = None, **options: Any
    ) -> ApiResponse:
        params = dict(options)
        if page is not None:
            params["page"] = page
        if page_size is not None:
            params["page_size"] = page_size
        return await Endpoint(self._transport, self._path)._list(f"{self._path}/schedules", params)

    async def create_schedule(self, data: Data) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/schedules", "POST", data
        )

    async def update_schedule(self, id: Identifier, data: Data) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/schedules/{identifier(id)}", "PATCH", data
        )

    async def usage(self) -> Any:
        return await Endpoint(self._transport, self._path)._get(f"{self._path}/usage")


class Agents(Endpoint):
    async def integration_facets(self, **options: Any) -> ApiResponse:
        return await self._list("/agents/integration-facets", options)

    async def integrations(self) -> ApiResponse:
        return await self._list("/agent-integrations", {})

    async def create_integration(self, data: Data) -> Any:
        return await self._action("/agent-integrations", "POST", data)

    async def list(self, **options: Any) -> ApiResponse:
        return await self._list("/agents", options)

    async def get(self, id: Identifier) -> Agent:
        result = await self._get(f"/agents/{identifier(id)}")
        return Agent(self._transport, result.to_dict())

    async def create(self, data: Data) -> Agent:
        result = await self._action("/agents", "POST", data)
        return Agent(self._transport, result)

    async def update(self, id: Identifier, data: Data) -> Agent:
        result = await self._action(f"/agents/{identifier(id)}", "PATCH", data)
        return Agent(self._transport, result)
