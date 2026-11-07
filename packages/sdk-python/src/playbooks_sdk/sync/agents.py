import re
from typing import Any, Self
from urllib.parse import quote

from playbooks_sdk.agent_types import AgentCreateInput
from playbooks_sdk.error import PlaybooksError
from playbooks_sdk.resource import ApiResponse, Data, Identifier, Resource, identifier
from playbooks_sdk.sync.core import Endpoint, Listing
from playbooks_sdk.sync.subagents import Subagents
from playbooks_sdk.transport import Transport


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

    def application_grants(self) -> Any:
        return Endpoint(self._transport, self._path)._get(f"{self._path}/application-grants")

    def application_grant_candidates(self, **options: Any) -> ApiResponse:
        return Endpoint(self._transport, self._path)._list(
            f"{self._path}/application-grant-candidates", options
        )

    def update_application_grants(self, data: Data) -> Any:
        return Endpoint(self._transport, self._path)._action(
            f"{self._path}/application-grants", "PUT", data
        )

    def remove_application_grant(self, kind: str, resource_id: Identifier, revision: int) -> Any:
        if kind not in ("project", "site"):
            raise PlaybooksError(422, "Choose project or site.")
        return Endpoint(self._transport, self._path)._action(
            f"{self._path}/application-grants/{kind}/{identifier(resource_id)}",
            "DELETE",
            {"revision": revision},
        )

    def archive(self, revision: int) -> Any:
        return Endpoint(self._transport, self._path)._action(
            f"{self._path}/archive", "POST", {"revision": revision}
        )

    def restore(self, revision: int) -> Any:
        return Endpoint(self._transport, self._path)._action(
            f"{self._path}/restore", "POST", {"revision": revision}
        )

    def delete(self, revision: int) -> Any:
        return Endpoint(self._transport, self._path)._action(
            self._path, "DELETE", {"revision": revision}
        )

    def mentions(self, **options: Any) -> ApiResponse:
        return Endpoint(self._transport, self._path)._list(f"{self._path}/mentions", options)

    def channels(self) -> Listing:
        """Inspect channels with signed-in user authority, not Agent credentials."""
        return Listing(self._transport, f"{self._path}/channels")

    def artifacts(self, **options: Any) -> ApiResponse:
        return Endpoint(self._transport, self._path)._list(f"{self._path}/artifacts", options)

    def artifact(self, artifact_id: Identifier, *, version: str | None = None) -> Any:
        response = self._transport.request(
            f"{self._path}/artifacts/{identifier(artifact_id)}", params={"version": version}
        )
        return response["data"]

    def artifact_versions(self, artifact_id: Identifier, **options: Any) -> ApiResponse:
        return Endpoint(self._transport, self._path)._list(
            f"{self._path}/artifacts/{identifier(artifact_id)}/versions", options
        )

    def prepare_artifact(self, data: Data) -> Any:
        return Endpoint(self._transport, self._path)._action(
            f"{self._path}/artifacts/prepare", "POST", data
        )

    def update_artifact(self, artifact_id: Identifier, data: Data) -> Any:
        return Endpoint(self._transport, self._path)._action(
            f"{self._path}/artifacts/{identifier(artifact_id)}", "PUT", data
        )

    def export_artifact(self, artifact_id: Identifier, *, version: str | None = None) -> bytes:
        result: bytes = self._transport.request(
            f"{self._path}/artifacts/{identifier(artifact_id)}/export",
            params={"version": version},
            binary=True,
        )
        return result

    def delete_artifact(self, artifact_id: Identifier, *, confirmation: str) -> Any:
        return Endpoint(self._transport, self._path)._action(
            f"{self._path}/artifacts/{identifier(artifact_id)}",
            "DELETE",
            {"confirmation": confirmation},
        )

    def sources(self, **options: Any) -> ApiResponse:
        return Endpoint(self._transport, self._path)._list(f"{self._path}/sources", options)

    def source(self, source_id: Identifier, *, version: str, conversation_id: str) -> Any:
        response = self._transport.request(
            f"{self._path}/sources/{identifier(source_id)}",
            params={"version": version, "conversationId": conversation_id},
        )
        return response["data"]

    def download_source(
        self, source_id: Identifier, *, version: str, conversation_id: str
    ) -> bytes:
        result: bytes = self._transport.request(
            f"{self._path}/sources/{identifier(source_id)}/download",
            params={"version": version, "conversationId": conversation_id},
            binary=True,
        )
        return result

    def preview_source(self, source_id: Identifier, *, version: str, conversation_id: str) -> bytes:
        result: bytes = self._transport.request(
            f"{self._path}/sources/{identifier(source_id)}/preview",
            params={"version": version, "conversationId": conversation_id},
            binary=True,
        )
        return result

    def rename_source(self, source_id: Identifier, data: Data) -> Any:
        return Endpoint(self._transport, self._path)._action(
            f"{self._path}/sources/{identifier(source_id)}/rename", "POST", data
        )

    def duplicate_source(self, source_id: Identifier, data: Data) -> Any:
        return Endpoint(self._transport, self._path)._action(
            f"{self._path}/sources/{identifier(source_id)}/duplicate", "POST", data
        )

    def delete_source(self, source_id: Identifier, data: Data) -> Any:
        return Endpoint(self._transport, self._path)._action(
            f"{self._path}/sources/{identifier(source_id)}/delete", "POST", data
        )

    def conversations(self, **options: Any) -> ApiResponse:
        return Endpoint(self._transport, self._path)._list(f"{self._path}/conversations", options)

    def conversation_utility(self, conversation_id: Identifier) -> Any:
        return Endpoint(self._transport, self._path)._get(
            f"{self._path}/conversations/{identifier(conversation_id)}/utility"
        )

    def conversation_utility_items(
        self, conversation_id: Identifier, *, kind: str, **options: Any
    ) -> ApiResponse:
        return Endpoint(self._transport, self._path)._list(
            f"{self._path}/conversations/{identifier(conversation_id)}/utility",
            {**options, "kind": kind},
        )

    def create_conversation(self, *, idempotency_key: str, title: str = "New conversation") -> Any:
        response = self._transport.request(
            f"{self._path}/conversations",
            "POST",
            {"title": title},
            extra_headers={"Idempotency-Key": idempotency_key},
        )
        return response["data"]

    def conversation(self, id: Identifier) -> Any:
        return Endpoint(self._transport, self._path)._get(
            f"{self._path}/conversations/{identifier(id)}"
        )

    def download_conversation_attachment(
        self, conversation_id: Identifier, attachment_id: Identifier
    ) -> bytes:
        result: bytes = self._transport.request(
            f"{self._path}/conversations/{identifier(conversation_id)}/attachments/{identifier(attachment_id)}/download",
            binary=True,
        )
        return result

    def preview_conversation_attachment(
        self, conversation_id: Identifier, attachment_id: Identifier
    ) -> bytes:
        result: bytes = self._transport.request(
            f"{self._path}/conversations/{identifier(conversation_id)}/attachments/{identifier(attachment_id)}/preview",
            binary=True,
        )
        return result

    def fork_conversation(
        self,
        conversation_id: Identifier,
        *,
        submission_key: str,
        through_message_id: int | None = None,
    ) -> Any:
        return Endpoint(self._transport, self._path)._action(
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

    def conversation_run_control(
        self, conversation_id: Identifier, execution_id: Identifier
    ) -> Any:
        return Endpoint(self._transport, self._path)._get(
            f"{self._path}/conversations/{identifier(conversation_id)}/executions/{identifier(execution_id)}/control"
        )

    def retry_conversation_execution(
        self, conversation_id: Identifier, execution_id: Identifier
    ) -> Any:
        return Endpoint(self._transport, self._path)._action(
            f"{self._path}/conversations/{identifier(conversation_id)}/executions/{identifier(execution_id)}/retry",
            "POST",
        )

    def continue_conversation_queue(
        self, conversation_id: Identifier, execution_id: Identifier, *, hold_id: str
    ) -> Any:
        return Endpoint(self._transport, self._path)._action(
            f"{self._path}/conversations/{identifier(conversation_id)}/executions/{identifier(execution_id)}/continue",
            "POST",
            {"holdId": hold_id},
        )

    def update_conversation(self, id: Identifier, *, title: str) -> Any:
        return Endpoint(self._transport, self._path)._action(
            f"{self._path}/conversations/{identifier(id)}", "PATCH", {"title": title}
        )

    def archive_conversation(self, conversation_id: Identifier) -> Any:
        return Endpoint(self._transport, self._path)._action(
            f"{self._path}/conversations/{identifier(conversation_id)}/archive", "POST"
        )

    def restore_conversation(self, conversation_id: Identifier) -> Any:
        return Endpoint(self._transport, self._path)._action(
            f"{self._path}/conversations/{identifier(conversation_id)}/restore", "POST"
        )

    def delete_conversation(self, conversation_id: Identifier, *, confirmation: str) -> Any:
        return Endpoint(self._transport, self._path)._action(
            f"{self._path}/conversations/{identifier(conversation_id)}",
            "DELETE",
            {"confirmation": confirmation},
        )

    def mark_conversation_read(
        self, conversation_id: Identifier, *, through_message_id: int
    ) -> Any:
        return Endpoint(self._transport, self._path)._action(
            f"{self._path}/conversations/{identifier(conversation_id)}/read",
            "PUT",
            {"throughMessageId": through_message_id},
        )

    def mark_conversation_unread(self, conversation_id: Identifier) -> Any:
        return Endpoint(self._transport, self._path)._action(
            f"{self._path}/conversations/{identifier(conversation_id)}/unread", "PUT"
        )

    def conversation_queue(self, conversation_id: Identifier, **options: Any) -> ApiResponse:
        return Endpoint(self._transport, self._path)._list(
            f"{self._path}/conversations/{identifier(conversation_id)}/messages/queue", options
        )

    def reorder_conversation_queue(
        self, conversation_id: Identifier, message_ids: list[int]
    ) -> Any:
        return Endpoint(self._transport, self._path)._action(
            f"{self._path}/conversations/{identifier(conversation_id)}/messages/queue",
            "PUT",
            {"messageIds": message_ids},
        )

    def steer_conversation(self, conversation_id: Identifier, message_id: Identifier) -> Any:
        return Endpoint(self._transport, self._path)._action(
            f"{self._path}/conversations/{identifier(conversation_id)}/messages/{identifier(message_id)}/steer",
            "POST",
        )

    def answer_conversation(
        self,
        conversation_id: Identifier,
        execution_id: Identifier,
        responses: list[Data],
        *,
        idempotency_key: str,
    ) -> Any:
        response = self._transport.request(
            f"{self._path}/conversations/{identifier(conversation_id)}/executions/{identifier(execution_id)}/answers",
            "POST",
            {"responses": responses},
            extra_headers={"Idempotency-Key": idempotency_key},
        )
        return response["data"]

    def cancel_conversation_execution(
        self, conversation_id: Identifier, execution_id: Identifier
    ) -> Any:
        return Endpoint(self._transport, self._path)._action(
            f"{self._path}/conversations/{identifier(conversation_id)}/executions/{identifier(execution_id)}/cancel",
            "POST",
        )

    def edit_queued_message(
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
        return Endpoint(self._transport, self._path)._action(
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

    def cancel_queued_message(self, conversation_id: Identifier, message_id: Identifier) -> Any:
        return Endpoint(self._transport, self._path)._action(
            f"{self._path}/conversations/{identifier(conversation_id)}/messages/{identifier(message_id)}",
            "DELETE",
        )

    def messages(self, conversation_id: Identifier, **options: Any) -> ApiResponse:
        return Endpoint(self._transport, self._path)._list(
            f"{self._path}/conversations/{identifier(conversation_id)}/messages", options
        )

    def send_message(
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
        response = self._transport.request(
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

    def executions(
        self, *, page: int | None = None, page_size: int | None = None, **options: Any
    ) -> ApiResponse:
        params = dict(options)
        if page is not None:
            params["page"] = page
        if page_size is not None:
            params["page_size"] = page_size
        return Endpoint(self._transport, self._path)._list(f"{self._path}/executions", params)

    def execution(self, id: Identifier) -> Any:
        return Endpoint(self._transport, self._path)._get(
            f"{self._path}/executions/{identifier(id)}"
        )

    def execution_tool_evidence(self, id: Identifier, part_id: str) -> Any:
        if not re.fullmatch(r"[A-Za-z0-9_.:-]{1,512}", part_id):
            raise PlaybooksError(422, "Provide a valid Agent tool part identifier.")
        return Endpoint(self._transport, self._path)._get(
            f"{self._path}/executions/{identifier(id)}/tools/{quote(part_id, safe='')}"
        )

    def execution_progress(self, id: Identifier, *, after: str = "0") -> Any:
        return Endpoint(self._transport, self._path)._get(
            f"{self._path}/executions/{identifier(id)}/progress", {"after": after}
        )

    def invoke(self, instruction: str, *, idempotency_key: str) -> Any:
        return self._transport.request(
            f"{self._path}/executions",
            "POST",
            {"instruction": instruction},
            extra_headers={"Idempotency-Key": idempotency_key},
        )["data"]

    def cancel_execution(self, id: Identifier) -> Any:
        return Endpoint(self._transport, self._path)._action(
            f"{self._path}/executions/{identifier(id)}/cancel", "POST", {}
        )

    def budget(self) -> Any:
        return Endpoint(self._transport, self._path)._get(f"{self._path}/budget")

    def update_budget(self, data: Data) -> Any:
        return Endpoint(self._transport, self._path)._action(f"{self._path}/budget", "PUT", data)

    def credentials(self) -> ApiResponse:
        return Endpoint(self._transport, self._path)._list(f"{self._path}/credentials", {})

    def create_credential(self, data: Data) -> Any:
        return Endpoint(self._transport, self._path)._action(
            f"{self._path}/credentials", "POST", data
        )

    def revoke_credential(self, id: Identifier) -> Any:
        return Endpoint(self._transport, self._path)._action(
            f"{self._path}/credentials/{identifier(id)}", "DELETE"
        )

    def externals(self) -> ApiResponse:
        return Endpoint(self._transport, self._path)._list(f"{self._path}/external-assignments", {})

    def external_options(self, **options: Any) -> ApiResponse:
        return Endpoint(self._transport, self._path)._list(
            f"{self._path}/external-options", options
        )

    def create_external(self, data: Data) -> Any:
        return Endpoint(self._transport, self._path)._action(
            f"{self._path}/external-assignments", "POST", data
        )

    def update_external(self, id: Identifier, data: Data) -> Any:
        return Endpoint(self._transport, self._path)._action(
            f"{self._path}/external-assignments/{identifier(id)}", "PUT", data
        )

    def revoke_external(self, id: Identifier, revision: int) -> Any:
        return Endpoint(self._transport, self._path)._action(
            f"{self._path}/external-assignments/{identifier(id)}", "DELETE", {"revision": revision}
        )

    def resources(self) -> ApiResponse:
        return Endpoint(self._transport, self._path)._list(f"{self._path}/resources", {})

    def resource_options(self, **options: Any) -> ApiResponse:
        return Endpoint(self._transport, self._path)._list(
            f"{self._path}/resource-options", options
        )

    def put_resource(self, data: Data) -> Any:
        return Endpoint(self._transport, self._path)._action(f"{self._path}/resources", "PUT", data)

    def delete_resource(self, kind: str, resource_id: Identifier) -> Any:
        if kind not in ("skill", "design", "file"):
            raise ValueError("Invalid Agent resource kind.")
        return Endpoint(self._transport, self._path)._action(
            f"{self._path}/resources/{kind}/{identifier(resource_id)}", "DELETE"
        )

    def file_system(self) -> Any:
        return Endpoint(self._transport, self._path)._get(f"{self._path}/file-system")

    def file_system_revision(self, revision: str) -> Any:
        return Endpoint(self._transport, self._path)._get(
            f"{self._path}/file-system/revisions/{identifier(revision)}"
        )

    def update_file_system(self, data: Data) -> Any:
        return Endpoint(self._transport, self._path)._action(
            f"{self._path}/file-system", "PUT", data
        )

    def preview_file_system(self, data: Data) -> Any:
        return Endpoint(self._transport, self._path)._action(
            f"{self._path}/file-system/preview", "POST", data
        )

    def results(self, **options: Any) -> ApiResponse:
        return Endpoint(self._transport, self._path)._list(f"{self._path}/results", options)

    def result(self, id: Identifier) -> Any:
        return Endpoint(self._transport, self._path)._get(f"{self._path}/results/{identifier(id)}")

    def download_result(self, id: Identifier) -> bytes:
        result: bytes = self._transport.request(
            f"{self._path}/results/{identifier(id)}/download", binary=True
        )
        return result

    def schedules(
        self, *, page: int | None = None, page_size: int | None = None, **options: Any
    ) -> ApiResponse:
        params = dict(options)
        if page is not None:
            params["page"] = page
        if page_size is not None:
            params["page_size"] = page_size
        return Endpoint(self._transport, self._path)._list(f"{self._path}/schedules", params)

    def create_schedule(self, data: Data) -> Any:
        return Endpoint(self._transport, self._path)._action(
            f"{self._path}/schedules", "POST", data
        )

    def schedule_occurrences(
        self, id: Identifier, *, page: int | None = None, page_size: int | None = None
    ) -> ApiResponse:
        params: Data = {}
        if page is not None:
            params["page"] = page
        if page_size is not None:
            params["page_size"] = page_size
        return Endpoint(self._transport, self._path)._list(
            f"{self._path}/schedules/{identifier(id)}/occurrences", params
        )

    def update_schedule(self, id: Identifier, data: Data) -> Any:
        return Endpoint(self._transport, self._path)._action(
            f"{self._path}/schedules/{identifier(id)}", "PATCH", data
        )

    def sites(self, **options: Any) -> ApiResponse:
        return Endpoint(self._transport, self._path)._list(f"{self._path}/sites", options)

    def usage(self) -> Any:
        return Endpoint(self._transport, self._path)._get(f"{self._path}/usage")


class Agent(AgentReference, Resource):
    def __init__(self, transport: Transport, data: Data) -> None:
        Resource.__init__(self, data)
        AgentReference.__init__(self, transport, data["uuid"])

    def update(self, data: Data) -> Self:
        updated = Endpoint(self._transport, self._path)._action(self._path, "PATCH", data)
        if updated["uuid"] != self.to_dict()["uuid"]:
            raise PlaybooksError(502, "The updated Agent identity did not match.")
        self._replace(updated)
        return self


class Agents(Endpoint):
    def reference(self, id: Identifier) -> AgentReference:
        return AgentReference(self._transport, id)

    def list(self, **options: Any) -> ApiResponse:
        return self._list("/agents", options)

    def get(self, id: Identifier) -> Agent:
        result = self._get(f"/agents/{identifier(id)}")
        return Agent(self._transport, result.to_dict())

    def create(self, data: AgentCreateInput | Data) -> Agent:
        result = self._action("/agents", "POST", dict(data))
        return Agent(self._transport, result)

    def update(self, id: Identifier, data: Data) -> Agent:
        result = self._action(f"/agents/{identifier(id)}", "PATCH", data)
        return Agent(self._transport, result)
