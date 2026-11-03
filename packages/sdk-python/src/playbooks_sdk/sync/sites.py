import time
from typing import Any, Self, cast

from playbooks_sdk.error import PlaybooksError
from playbooks_sdk.resource import ApiResponse, Data, Identifier, Resource, identifier, query_params
from playbooks_sdk.sync.core import Endpoint, ReadCollection, ReadEndpoint
from playbooks_sdk.transport import Transport


def _normalize_expected_source(data: Data) -> Data:
    if "expectedSource" not in data or not isinstance(data["expectedSource"], dict):
        return data
    source = data["expectedSource"]
    return {
        **data,
        "expectedSource": {
            key: source[key] for key in ("type", "id", "componentKey") if key in source
        },
    }


class SiteSource(ReadEndpoint):
    def connect(self, data: Data, *, expected_source: Data | None) -> Any:
        return self._action(
            self._path,
            "PUT",
            _normalize_expected_source({"source": data, "expectedSource": expected_source}),
        )

    def disconnect(self, *, expected_source: Data | None) -> Any:
        return self._action(
            self._path, "DELETE", _normalize_expected_source({"expectedSource": expected_source})
        )


class SiteReleases(ReadCollection):
    def create(self, data: Data, *, request_id: str | None = None) -> Any:
        payload = {**data, **({"requestId": request_id} if request_id is not None else {})}
        return self._action(self._path, "POST", _normalize_expected_source(payload))

    def wait(self, id: Identifier, *, timeout_ms: float = 300_000) -> Resource:
        deadline = time.monotonic() + timeout_ms / 1000
        while True:
            result = self.get(id)
            status = result.to_dict().get("status")
            if status == "succeeded":
                return result
            if status in ("failed", "cancelled", "canceled"):
                raise PlaybooksError(
                    422,
                    "The Site release did not succeed. Inspect its details.",
                    "release",
                    str(id),
                )
            if time.monotonic() >= deadline:
                raise PlaybooksError(
                    408,
                    "The Site release is still pending. Resume observation using its identifier.",
                    "release",
                    str(id),
                )
            time.sleep(2)


class Site(Resource):
    _transport: Transport
    _path: str

    def __init__(self, transport: Transport, data: Data) -> None:
        super().__init__(data)
        object.__setattr__(self, "_transport", transport)
        object.__setattr__(self, "_path", f"/sites/{identifier(data['uuid'])}")

    @property
    def source_connection(self) -> SiteSource:
        return SiteSource(self._transport, f"{self._path}/source")

    @property
    def releases(self) -> SiteReleases:
        return SiteReleases(self._transport, f"{self._path}/releases")

    def update(self, data: Data) -> Self:
        result = Endpoint(self._transport, self._path)._action(self._path, "PATCH", data)
        if result.get("uuid") != self.to_dict()["uuid"]:
            raise PlaybooksError(502, "The updated Site identity did not match.")
        self._replace(result)
        return self

    def release_options(self) -> Any:
        return Endpoint(self._transport, self._path)._get(f"{self._path}/release-options")

    def preflight(self, data: Data) -> Data:
        result: Data = self._transport.request(
            f"{self._path}/preflight", "POST", _normalize_expected_source(data)
        )["data"]
        return result

    def redeploy(self, data: Data, *, request_id: str | None = None) -> Any:
        payload = {**data, **({"requestId": request_id} if request_id is not None else {})}
        return Endpoint(self._transport, self._path)._action(
            f"{self._path}/redeploy", "POST", payload
        )

    def rollback(self, data: Data) -> Any:
        return Endpoint(self._transport, self._path)._action(f"{self._path}/rollback", "POST", data)

    def _site_get(self, suffix: str) -> Any:
        return Endpoint(self._transport, self._path)._get(f"{self._path}/{suffix}")

    def _site_action(self, suffix: str, method: str, data: Data | None = None) -> Any:
        return Endpoint(self._transport, self._path)._action(f"{self._path}/{suffix}", method, data)

    def config(self) -> Any:
        return self._site_get("config")

    def update_config(self, data: Data) -> Any:
        return self._site_action("config", "PATCH", data)

    def visitor_policy(self) -> Any:
        return self._site_get("visitor-policy")

    def update_visitor_policy(self, data: Data) -> Any:
        return self._site_action("visitor-policy", "PATCH", data)

    def credentials(self) -> Any:
        return self._site_get("credentials")

    def put_credential(self, key: str, data: Data) -> Any:
        return self._site_action(f"credentials/{identifier(key)}", "PUT", data)

    def delete_credential(self, key: str, data: Data) -> Any:
        return self._site_action(f"credentials/{identifier(key)}", "DELETE", data)

    def domains(self) -> Any:
        return self._site_get("domains")

    def bind_domain(self, data: Data) -> Any:
        return self._site_action("domains", "POST", data)

    def unbind_domain(self, id: Identifier) -> Any:
        return self._site_action(f"domains/{identifier(id)}", "DELETE")

    def recheck_domain(self, id: Identifier) -> Any:
        return self._site_action(f"domains/{identifier(id)}/recheck", "POST", {})

    def collaborators(self) -> Any:
        return self._site_get("collaborators")

    def put_collaborator(self, data: Data) -> Any:
        return self._site_action("collaborators", "PUT", data)

    def delete_collaborator(self, id: Identifier) -> Any:
        return self._site_action(f"collaborators/{identifier(id)}", "DELETE")

    def invitations(self) -> Any:
        return self._site_get("access-invitations")

    def create_invitation(self, data: Data) -> Any:
        return self._site_action("access-invitations", "POST", data)

    def resend_invitation(self, id: Identifier) -> Any:
        return self._site_action(f"access-invitations/{identifier(id)}/resend", "POST", {})

    def revoke_invitation(self, id: Identifier) -> Any:
        return self._site_action(f"access-invitations/{identifier(id)}", "DELETE")

    def connections(self) -> Any:
        return self._site_get("connections")

    def create_connection(self, data: Data) -> Any:
        return self._site_action("connections", "POST", data)

    def update_connection(self, id: Identifier, data: Data) -> Any:
        return self._site_action(f"connections/{identifier(id)}", "PUT", data)

    def delete_connection(self, id: Identifier) -> Any:
        return self._site_action(f"connections/{identifier(id)}", "DELETE")

    def database(self) -> Any:
        return self._site_get("database")

    def storage(self) -> Any:
        return self._site_get("storage")

    def logs(self, **options: Any) -> ApiResponse:
        response: ApiResponse = self._transport.request(
            f"{self._path}/logs", "GET", params=query_params(options)
        )
        return response

    def log(self, id: Identifier, **options: Any) -> Any:
        return Endpoint(self._transport, self._path)._get(
            f"{self._path}/logs/{identifier(id)}", query_params(options)
        )

    def monitoring(self) -> Any:
        return self._site_get("monitoring")

    def monitoring_config(self) -> Any:
        return self._site_get("monitoring/config")

    def configure_monitoring(self, data: Data) -> Any:
        return self._site_action("monitoring/config", "PUT", data)

    def synchronize_monitoring(self) -> Any:
        return self._site_action("monitoring/synchronize", "POST", {})

    def monitoring_overview(self, **options: Any) -> Any:
        return Endpoint(self._transport, self._path)._get(
            f"{self._path}/monitoring/overview", options
        )

    def monitoring_issues(self, **options: Any) -> ApiResponse:
        return Endpoint(self._transport, self._path)._list(
            f"{self._path}/monitoring/issues", options
        )

    def monitoring_issue(self, id: Identifier) -> Any:
        return self._site_get(f"monitoring/issues/{identifier(id)}")

    def resolve_monitoring_issue(self, id: Identifier) -> Any:
        return self._site_action(f"monitoring/issues/{identifier(id)}/resolve", "POST", {})

    def analytics(self, *, days: int | None = None, path: str | None = None) -> Any:
        options = {
            **({"days": days} if days is not None else {}),
            **({"path": path} if path is not None else {}),
        }
        return Endpoint(self._transport, self._path)._get(f"{self._path}/analytics", options)

    def jobs(self, **options: Any) -> ApiResponse:
        return Endpoint(self._transport, self._path)._list(f"{self._path}/jobs", options)

    def job(self, id: Identifier) -> Any:
        return self._site_get(f"jobs/{identifier(id)}")

    def retry_job(self, id: Identifier) -> Any:
        return self._site_action(f"jobs/{identifier(id)}/retry", "POST", {})

    def cancel_job(self, id: Identifier) -> Any:
        return self._site_action(f"jobs/{identifier(id)}", "DELETE")

    def schedules(self) -> Any:
        return self._site_get("jobs/schedules")

    def activate_schedule(self, id: Identifier, active: bool) -> Any:
        return self._site_action(
            f"jobs/schedules/{identifier(id)}/activation", "PUT", {"active": active}
        )

    def auth(self) -> Any:
        return self._site_get("auth")

    def configure_auth(self, data: Data) -> Any:
        return self._site_action("auth", "PUT", data)

    def connect_clerk(self, data: Data) -> Any:
        return self._site_action("auth/clerk", "POST", data)

    def verify_auth(self, data: Data) -> Any:
        return self._site_action("auth/verify", "POST", data)

    def lifecycle(self) -> Any:
        return self._site_get("lifecycle")

    def start(self) -> Any:
        return self._site_action("start", "POST", {})

    def stop(self) -> Any:
        return self._site_action("stop", "POST", {})

    def archive(self) -> Any:
        return self._site_action("archive", "POST", {})

    def restore(self) -> Any:
        return self._site_action("restore", "POST", {})

    def delete_site(self) -> Any:
        return Endpoint(self._transport, self._path)._action(self._path, "DELETE")

    def provision_database(self, data: Data) -> Any:
        return self._site_action("database", "POST", data)

    def provision_storage(self, data: Data) -> Any:
        return self._site_action("storage", "POST", data)

    def maps(self) -> Any:
        return self._site_get("maps")

    def set_map(self, capability: Identifier, data: Data) -> Any:
        return self._site_action(f"maps/{identifier(capability)}", "PUT", data)

    def database_tables(self) -> Any:
        return self._site_get("database/tables")

    def create_database_table(self, data: Data) -> Any:
        return self._site_action("database/tables", "POST", data)

    def database_table(self, table: Identifier) -> Any:
        return self._site_get(f"database/tables/{identifier(table)}")

    def update_database_table(self, table: Identifier, data: Data) -> Any:
        return self._site_action(f"database/tables/{identifier(table)}", "PATCH", data)

    def delete_database_table(self, table: Identifier) -> Any:
        return self._site_action(f"database/tables/{identifier(table)}", "DELETE", {})

    def database_rows(self, table: Identifier, **options: Any) -> Any:
        return self._transport.request(
            f"{self._path}/database/tables/{identifier(table)}/rows", "GET", params=options
        )

    def create_database_row(self, table: Identifier, data: Data) -> Any:
        return self._site_action(f"database/tables/{identifier(table)}/rows", "POST", data)

    def update_database_rows(self, table: Identifier, data: Data) -> Any:
        return self._site_action(f"database/tables/{identifier(table)}/rows", "PUT", data)

    def delete_database_rows(self, table: Identifier, data: Data) -> Any:
        return self._site_action(f"database/tables/{identifier(table)}/rows", "DELETE", data)

    def inspect_database_query(self, data: Data) -> Any:
        return self._site_action("database/inspect-query", "POST", data)

    def execute_database_query(self, data: Data) -> Any:
        return self._site_action("database/query", "POST", data)

    def database_migrations(self) -> Any:
        return self._site_get("database/migrations")

    def storage_files(self, **options: Any) -> Any:
        return self._transport.request(f"{self._path}/storage/files", "GET", params=options)

    def storage_file_metadata(self, path: str) -> Any:
        return self._transport.request(
            f"{self._path}/storage/files/metadata", "GET", params={"path": path}
        )

    def storage_file_content(self, path: str) -> bytes:
        return cast(
            bytes,
            self._transport.request(
                f"{self._path}/storage/files/content", "GET", params={"path": path}, binary=True
            ),
        )

    def download_storage_file(self, path: str) -> bytes:
        return cast(
            bytes,
            self._transport.request(
                f"{self._path}/storage/files/download", "GET", params={"path": path}, binary=True
            ),
        )

    def upload_storage_file(self, data: Data) -> Any:
        return self._site_action("storage/files", "POST", data)

    def rename_storage_file(self, data: Data) -> Any:
        return self._site_action("storage/files", "PATCH", data)

    def delete_storage_file(self, data: Data) -> Any:
        return self._site_action("storage/files", "DELETE", data)

    def create_storage_folder(self, data: Data) -> Any:
        return self._site_action("storage/folders", "POST", data)

    def storage_usage(self) -> Any:
        return self._site_get("storage/usage")

    def analytics_config(self) -> Any:
        return self._site_get("analytics/config")

    def set_analytics_config(self, data: Data) -> Any:
        return self._site_action("analytics/config", "PUT", data)

    def rotate_analytics_source(self) -> Any:
        return self._site_action("analytics/source/rotate", "POST", {})

    def analytics_providers(self) -> Any:
        return self._site_get("analytics/providers")

    def create_analytics_provider(self, data: Data) -> Any:
        return self._site_action("analytics/providers", "POST", data)

    def analytics_provider(self, provider: Identifier) -> Any:
        return self._site_get(f"analytics/providers/{identifier(provider)}")

    def update_analytics_provider(self, provider: Identifier, data: Data) -> Any:
        return self._site_action(f"analytics/providers/{identifier(provider)}", "PUT", data)

    def delete_analytics_provider(self, provider: Identifier) -> Any:
        return self._site_action(f"analytics/providers/{identifier(provider)}", "DELETE", {})

    def analytics_events(self, **options: Any) -> Any:
        return self._transport.request(f"{self._path}/analytics/events", "GET", params=options)

    def analytics_event(self, event: Identifier) -> Any:
        return self._site_get(f"analytics/events/{identifier(event)}")

    def analytics_deliveries(self, **options: Any) -> Any:
        return self._transport.request(f"{self._path}/analytics/deliveries", "GET", params=options)

    def analytics_delivery(self, delivery: Identifier) -> Any:
        return self._site_get(f"analytics/deliveries/{identifier(delivery)}")


class Sites(Endpoint):
    def __init__(self, transport: Transport) -> None:
        super().__init__(transport, "/sites")

    def list(self, **options: Any) -> ApiResponse:
        response = self._list(self._path, options)
        return {
            **response,
            "data": [Site(self._transport, item.to_dict()) for item in response["data"]],
        }

    def get(self, id: Identifier) -> Site:
        data = self._get(f"{self._path}/{identifier(id)}").to_dict()
        if data.get("uuid") != str(id):
            raise PlaybooksError(502, "The Site identity did not match.")
        return Site(self._transport, data)

    def create(self, data: Data) -> Site:
        result = self._action(self._path, "POST", data)
        return Site(self._transport, result)
