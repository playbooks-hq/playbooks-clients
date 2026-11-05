from typing import Any, Self

from playbooks_sdk.error import PlaybooksError
from playbooks_sdk.resource import ApiResponse, Data, Identifier, Resource, identifier
from playbooks_sdk.sync.core import Endpoint
from playbooks_sdk.transport import Transport


class Agent(Resource):
    _transport: Transport
    _path: str

    def __init__(self, transport: Transport, data: Data) -> None:
        super().__init__(data)
        object.__setattr__(self, "_transport", transport)
        object.__setattr__(self, "_path", f"/agents/{identifier(data['uuid'])}")

    def update(self, data: Data) -> Self:
        updated = Endpoint(self._transport, self._path)._action(self._path, "PATCH", data)
        if updated["uuid"] != self.to_dict()["uuid"]:
            raise PlaybooksError(502, "The updated Agent identity did not match.")
        self._replace(updated)
        return self

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

    def grants(self) -> ApiResponse:
        return Endpoint(self._transport, self._path)._list(f"{self._path}/grants", {})

    def put_grant(self, data: Data) -> Any:
        return Endpoint(self._transport, self._path)._action(f"{self._path}/grants", "PUT", data)

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
        if kind not in ("skill", "design", "reference"):
            raise ValueError("Invalid Agent resource kind.")
        return Endpoint(self._transport, self._path)._action(
            f"{self._path}/resources/{kind}/{identifier(resource_id)}", "DELETE"
        )

    def working_files(self) -> Any:
        return Endpoint(self._transport, self._path)._get(f"{self._path}/working-files")

    def update_working_files(self, data: Data) -> Any:
        return Endpoint(self._transport, self._path)._action(
            f"{self._path}/working-files", "PUT", data
        )

    def outputs(self) -> ApiResponse:
        return Endpoint(self._transport, self._path)._list(f"{self._path}/outputs", {})

    def output(self, id: Identifier) -> Any:
        return Endpoint(self._transport, self._path)._get(f"{self._path}/outputs/{identifier(id)}")

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

    def update_schedule(self, id: Identifier, data: Data) -> Any:
        return Endpoint(self._transport, self._path)._action(
            f"{self._path}/schedules/{identifier(id)}", "PATCH", data
        )

    def usage(self) -> Any:
        return Endpoint(self._transport, self._path)._get(f"{self._path}/usage")


class Agents(Endpoint):
    def integration_facets(self, **options: Any) -> ApiResponse:
        return self._list("/agents/integration-facets", options)

    def integrations(self) -> ApiResponse:
        return self._list("/agent-integrations", {})

    def create_integration(self, data: Data) -> Any:
        return self._action("/agent-integrations", "POST", data)

    def list(self, **options: Any) -> ApiResponse:
        return self._list("/agents", options)

    def get(self, id: Identifier) -> Agent:
        result = self._get(f"/agents/{identifier(id)}")
        return Agent(self._transport, result.to_dict())

    def create(self, data: Data) -> Agent:
        result = self._action("/agents", "POST", data)
        return Agent(self._transport, result)

    def update(self, id: Identifier, data: Data) -> Agent:
        result = self._action(f"/agents/{identifier(id)}", "PATCH", data)
        return Agent(self._transport, result)
