import re
from typing import Any, Self
from urllib.parse import quote

from playbooks_sdk.agent_types import AgentCreateInput
from playbooks_sdk.asynchronous.core import Endpoint, Listing
from playbooks_sdk.asynchronous.subagents import Subagents
from playbooks_sdk.error import PlaybooksError
from playbooks_sdk.resource import ApiResponse, Data, Identifier, Resource, identifier
from playbooks_sdk.transport import AsyncTransport as Transport


class AgentReference:
    @property
    def subagents(self) -> Subagents:
        return Subagents(self._transport, f"{self._path}/subagents")

    """Operations for a known Agent identifier without a metadata snapshot."""

    __slots__ = ("_transport", "_path")

    _transport: Transport
    _path: str

    def __init__(self, transport: Transport, id: Identifier) -> None:
        object.__setattr__(self, "_transport", transport)
        object.__setattr__(self, "_path", f"/agents/{identifier(id)}")

    async def application_grants(self) -> Any:
        return await Endpoint(self._transport, self._path)._get(f"{self._path}/application-grants")

    async def application_grant_candidates(self, **options: Any) -> ApiResponse:
        return await Endpoint(self._transport, self._path)._list(
            f"{self._path}/application-grant-candidates", options
        )

    async def update_application_grants(self, data: Data) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/application-grants", "PUT", data
        )

    async def remove_application_grant(
        self, kind: str, resource_id: Identifier, revision: int
    ) -> Any:
        if kind not in ("project", "site"):
            raise PlaybooksError(422, "Choose project or site.")
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/application-grants/{kind}/{identifier(resource_id)}",
            "DELETE",
            {"revision": revision},
        )

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

    async def mentions(self, **options: Any) -> ApiResponse:
        return await Endpoint(self._transport, self._path)._list(f"{self._path}/mentions", options)

    def channels(self) -> Listing:
        """Inspect channels with signed-in user authority, not Agent credentials."""
        return Listing(self._transport, f"{self._path}/channels")

    async def artifacts(self, **options: Any) -> ApiResponse:
        return await Endpoint(self._transport, self._path)._list(f"{self._path}/artifacts", options)

    async def artifact(self, artifact_id: Identifier, *, version: str | None = None) -> Any:
        response = await self._transport.request(
            f"{self._path}/artifacts/{identifier(artifact_id)}", params={"version": version}
        )
        return response["data"]

    async def artifact_versions(self, artifact_id: Identifier, **options: Any) -> ApiResponse:
        return await Endpoint(self._transport, self._path)._list(
            f"{self._path}/artifacts/{identifier(artifact_id)}/versions", options
        )

    async def prepare_artifact(self, data: Data) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/artifacts/prepare", "POST", data
        )

    async def update_artifact(self, artifact_id: Identifier, data: Data) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/artifacts/{identifier(artifact_id)}", "PUT", data
        )

    async def export_artifact(
        self, artifact_id: Identifier, *, version: str | None = None
    ) -> bytes:
        result: bytes = await self._transport.request(
            f"{self._path}/artifacts/{identifier(artifact_id)}/export",
            params={"version": version},
            binary=True,
        )
        return result

    async def delete_artifact(self, artifact_id: Identifier, *, confirmation: str) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/artifacts/{identifier(artifact_id)}",
            "DELETE",
            {"confirmation": confirmation},
        )

    async def sources(self, **options: Any) -> ApiResponse:
        return await Endpoint(self._transport, self._path)._list(f"{self._path}/sources", options)

    async def source(self, source_id: Identifier, *, version: str, conversation_id: str) -> Any:
        response = await self._transport.request(
            f"{self._path}/sources/{identifier(source_id)}",
            params={"version": version, "conversationId": conversation_id},
        )
        return response["data"]

    async def download_source(
        self, source_id: Identifier, *, version: str, conversation_id: str
    ) -> bytes:
        result: bytes = await self._transport.request(
            f"{self._path}/sources/{identifier(source_id)}/download",
            params={"version": version, "conversationId": conversation_id},
            binary=True,
        )
        return result

    async def preview_source(
        self, source_id: Identifier, *, version: str, conversation_id: str
    ) -> bytes:
        result: bytes = await self._transport.request(
            f"{self._path}/sources/{identifier(source_id)}/preview",
            params={"version": version, "conversationId": conversation_id},
            binary=True,
        )
        return result

    async def rename_source(self, source_id: Identifier, data: Data) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/sources/{identifier(source_id)}/rename", "POST", data
        )

    async def duplicate_source(self, source_id: Identifier, data: Data) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/sources/{identifier(source_id)}/duplicate", "POST", data
        )

    async def delete_source(self, source_id: Identifier, data: Data) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/sources/{identifier(source_id)}/delete", "POST", data
        )

    async def conversations(self, **options: Any) -> ApiResponse:
        return await Endpoint(self._transport, self._path)._list(
            f"{self._path}/conversations", options
        )

    async def conversation_utility(self, conversation_id: Identifier) -> Any:
        return await Endpoint(self._transport, self._path)._get(
            f"{self._path}/conversations/{identifier(conversation_id)}/utility"
        )

    async def conversation_utility_items(
        self, conversation_id: Identifier, *, kind: str, **options: Any
    ) -> ApiResponse:
        return await Endpoint(self._transport, self._path)._list(
            f"{self._path}/conversations/{identifier(conversation_id)}/utility",
            {**options, "kind": kind},
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

    async def download_conversation_attachment(
        self, conversation_id: Identifier, attachment_id: Identifier
    ) -> bytes:
        result: bytes = await self._transport.request(
            f"{self._path}/conversations/{identifier(conversation_id)}/attachments/{identifier(attachment_id)}/download",
            binary=True,
        )
        return result

    async def preview_conversation_attachment(
        self, conversation_id: Identifier, attachment_id: Identifier
    ) -> bytes:
        result: bytes = await self._transport.request(
            f"{self._path}/conversations/{identifier(conversation_id)}/attachments/{identifier(attachment_id)}/preview",
            binary=True,
        )
        return result

    async def fork_conversation(
        self,
        conversation_id: Identifier,
        *,
        submission_key: str,
        through_message_id: int | None = None,
    ) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/conversations/{identifier(conversation_id)}/fork",
            "POST",
            {
                "submissionKey": submission_key,
                **(
                    {"throughMessageId": through_message_id}
                    if through_message_id is not None
                    else {}
                ),
            },
        )

    async def conversation_run_control(
        self, conversation_id: Identifier, execution_id: Identifier
    ) -> Any:
        return await Endpoint(self._transport, self._path)._get(
            f"{self._path}/conversations/{identifier(conversation_id)}/executions/{identifier(execution_id)}/control"
        )

    async def retry_conversation_execution(
        self, conversation_id: Identifier, execution_id: Identifier
    ) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/conversations/{identifier(conversation_id)}/executions/{identifier(execution_id)}/retry",
            "POST",
        )

    async def continue_conversation_queue(
        self, conversation_id: Identifier, execution_id: Identifier, *, hold_id: str
    ) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/conversations/{identifier(conversation_id)}/executions/{identifier(execution_id)}/continue",
            "POST",
            {"holdId": hold_id},
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

    async def delete_conversation(self, conversation_id: Identifier, *, confirmation: str) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/conversations/{identifier(conversation_id)}",
            "DELETE",
            {"confirmation": confirmation},
        )

    async def mark_conversation_read(
        self, conversation_id: Identifier, *, through_message_id: int
    ) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/conversations/{identifier(conversation_id)}/read",
            "PUT",
            {"throughMessageId": through_message_id},
        )

    async def mark_conversation_unread(self, conversation_id: Identifier) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/conversations/{identifier(conversation_id)}/unread", "PUT"
        )

    async def conversation_queue(self, conversation_id: Identifier, **options: Any) -> ApiResponse:
        return await Endpoint(self._transport, self._path)._list(
            f"{self._path}/conversations/{identifier(conversation_id)}/messages/queue", options
        )

    async def reorder_conversation_queue(
        self, conversation_id: Identifier, message_ids: list[int]
    ) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/conversations/{identifier(conversation_id)}/messages/queue",
            "PUT",
            {"messageIds": message_ids},
        )

    async def steer_conversation(self, conversation_id: Identifier, message_id: Identifier) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/conversations/{identifier(conversation_id)}/messages/{identifier(message_id)}/steer",
            "POST",
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

    async def edit_queued_message(
        self,
        conversation_id: Identifier,
        message_id: Identifier,
        text: str,
        *,
        expected_edit_revision: str,
        attachments: list[Data] | None = None,
        targets: list[Data] | None = None,
        model_id: int | None = None,
        mode: str | None = None,
        delivery_mode: str | None = None,
        permissions: str | None = None,
    ) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/conversations/{identifier(conversation_id)}/messages/{identifier(message_id)}",
            "PUT",
            {
                "text": text,
                "expectedEditRevision": expected_edit_revision,
                **({"modelId": model_id} if model_id is not None else {}),
                **({"mode": mode} if mode is not None else {}),
                **({"deliveryMode": delivery_mode} if delivery_mode is not None else {}),
                **({"permissions": permissions} if permissions is not None else {}),
                **({"targets": targets} if targets is not None else {}),
                **({"attachments": attachments} if attachments is not None else {}),
            },
        )

    async def cancel_queued_message(
        self, conversation_id: Identifier, message_id: Identifier
    ) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/conversations/{identifier(conversation_id)}/messages/{identifier(message_id)}",
            "DELETE",
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
        targets: list[Data] | None = None,
        model_id: int | None = None,
        mode: str | None = None,
        delivery_mode: str | None = None,
        permissions: str | None = None,
        replace_run_id: int | None = None,
    ) -> Any:
        response = await self._transport.request(
            f"{self._path}/conversations/{identifier(conversation_id)}/messages",
            "POST",
            {
                "text": text,
                **({"modelId": model_id} if model_id is not None else {}),
                **({"mode": mode} if mode is not None else {}),
                **({"deliveryMode": delivery_mode} if delivery_mode is not None else {}),
                **({"permissions": permissions} if permissions is not None else {}),
                **({"targets": targets} if targets is not None else {}),
                **({"attachments": attachments} if attachments is not None else {}),
                **({"replaceRunId": replace_run_id} if replace_run_id is not None else {}),
            },
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

    async def execution_tool_evidence(self, id: Identifier, part_id: str) -> Any:
        if not re.fullmatch(r"[A-Za-z0-9_.:-]{1,512}", part_id):
            raise PlaybooksError(422, "Provide a valid Agent tool part identifier.")
        return await Endpoint(self._transport, self._path)._get(
            f"{self._path}/executions/{identifier(id)}/tools/{quote(part_id, safe='')}"
        )

    async def execution_progress(self, id: Identifier, *, after: str = "0") -> Any:
        return await Endpoint(self._transport, self._path)._get(
            f"{self._path}/executions/{identifier(id)}/progress", {"after": after}
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
        if kind not in ("skill", "design", "file"):
            raise ValueError("Invalid Agent resource kind.")
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/resources/{kind}/{identifier(resource_id)}", "DELETE"
        )

    async def file_system(self) -> Any:
        return await Endpoint(self._transport, self._path)._get(f"{self._path}/file-system")

    async def file_system_revision(self, revision: str) -> Any:
        return await Endpoint(self._transport, self._path)._get(
            f"{self._path}/file-system/revisions/{identifier(revision)}"
        )

    async def update_file_system(self, data: Data) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/file-system", "PUT", data
        )

    async def preview_file_system(self, data: Data) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/file-system/preview", "POST", data
        )

    async def results(self, **options: Any) -> ApiResponse:
        return await Endpoint(self._transport, self._path)._list(f"{self._path}/results", options)

    async def result(self, id: Identifier) -> Any:
        return await Endpoint(self._transport, self._path)._get(
            f"{self._path}/results/{identifier(id)}"
        )

    async def download_result(self, id: Identifier) -> bytes:
        result: bytes = await self._transport.request(
            f"{self._path}/results/{identifier(id)}/download", binary=True
        )
        return result

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

    async def schedule_occurrences(
        self, id: Identifier, *, page: int | None = None, page_size: int | None = None
    ) -> ApiResponse:
        params: Data = {}
        if page is not None:
            params["page"] = page
        if page_size is not None:
            params["page_size"] = page_size
        return await Endpoint(self._transport, self._path)._list(
            f"{self._path}/schedules/{identifier(id)}/occurrences", params
        )

    async def update_schedule(self, id: Identifier, data: Data) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/schedules/{identifier(id)}", "PATCH", data
        )

    async def delete_schedule(self, id: Identifier, revision: int) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/schedules/{identifier(id)}", "DELETE", {"revision": revision}
        )

    async def sites(self, **options: Any) -> ApiResponse:
        return await Endpoint(self._transport, self._path)._list(f"{self._path}/sites", options)

    async def usage(self) -> Any:
        return await Endpoint(self._transport, self._path)._get(f"{self._path}/usage")


class Agent(AgentReference, Resource):
    def __init__(self, transport: Transport, data: Data) -> None:
        Resource.__init__(self, data)
        AgentReference.__init__(self, transport, data["uuid"])

    async def update(self, data: Data) -> Self:
        updated = await Endpoint(self._transport, self._path)._action(self._path, "PATCH", data)
        if updated["uuid"] != self.to_dict()["uuid"]:
            raise PlaybooksError(502, "The updated Agent identity did not match.")
        self._replace(updated)
        return self


class Agents(Endpoint):
    def reference(self, id: Identifier) -> AgentReference:
        return AgentReference(self._transport, id)

    async def list(self, **options: Any) -> ApiResponse:
        return await self._list("/agents", options)

    async def get(self, id: Identifier) -> Agent:
        result = await self._get(f"/agents/{identifier(id)}")
        return Agent(self._transport, result.to_dict())

    async def create(self, data: AgentCreateInput | Data) -> Agent:
        result = await self._action("/agents", "POST", dict(data))
        return Agent(self._transport, result)

    async def update(self, id: Identifier, data: Data) -> Agent:
        result = await self._action(f"/agents/{identifier(id)}", "PATCH", data)
        return Agent(self._transport, result)
