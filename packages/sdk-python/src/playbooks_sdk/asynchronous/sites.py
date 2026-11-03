import asyncio
import time
from typing import Any, Self, cast

from playbooks_sdk.asynchronous.core import Endpoint, ReadCollection, ReadEndpoint
from playbooks_sdk.error import PlaybooksError
from playbooks_sdk.resource import ApiResponse, Data, Identifier, Resource, identifier
from playbooks_sdk.transport import AsyncTransport as Transport


class SiteSource(ReadEndpoint):
    async def connect(self, data: Data) -> Any:
        return await self._action(self._path, "PUT", {"source": data})

    async def disconnect(self) -> Any:
        return await self._action(self._path, "DELETE")


class SiteReleases(ReadCollection):
    async def create(self, data: Data, *, request_id: str | None = None) -> Any:
        payload = {**data, **({"requestId": request_id} if request_id is not None else {})}
        return await self._action(self._path, "POST", payload)

    async def wait(self, id: Identifier, *, timeout_ms: float = 300_000) -> Resource:
        deadline = time.monotonic() + timeout_ms / 1000
        while True:
            result = await self.get(id)
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
            await asyncio.sleep(2)


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

    async def update(self, data: Data) -> Self:
        result = await Endpoint(self._transport, self._path)._action(self._path, "PATCH", data)
        if result.get("uuid") != self.to_dict()["uuid"]:
            raise PlaybooksError(502, "The updated Site identity did not match.")
        self._replace(result)
        return self

    async def release_options(self) -> Any:
        return await Endpoint(self._transport, self._path)._get(f"{self._path}/release-options")

    async def preflight(self, data: Data) -> Data:
        result: Data = (await self._transport.request(f"{self._path}/preflight", "POST", data))[
            "data"
        ]
        return result

    async def redeploy(self, data: Data, *, request_id: str | None = None) -> Any:
        payload = {**data, **({"requestId": request_id} if request_id is not None else {})}
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/redeploy", "POST", payload
        )

    async def rollback(self, data: Data) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/rollback", "POST", data
        )

    async def _site_get(self, suffix: str) -> Any:
        return await Endpoint(self._transport, self._path)._get(f"{self._path}/{suffix}")

    async def _site_action(self, suffix: str, method: str, data: Data | None = None) -> Any:
        return await Endpoint(self._transport, self._path)._action(
            f"{self._path}/{suffix}", method, data
        )

    async def config(self) -> Any:
        return await self._site_get("config")

    async def update_config(self, data: Data) -> Any:
        return await self._site_action("config", "PATCH", data)

    async def visitor_policy(self) -> Any:
        return await self._site_get("visitor-policy")

    async def update_visitor_policy(self, data: Data) -> Any:
        return await self._site_action("visitor-policy", "PATCH", data)

    async def credentials(self) -> Any:
        return await self._site_get("credentials")

    async def put_credential(self, key: str, data: Data) -> Any:
        return await self._site_action(f"credentials/{identifier(key)}", "PUT", data)

    async def delete_credential(self, key: str, data: Data) -> Any:
        return await self._site_action(f"credentials/{identifier(key)}", "DELETE", data)

    async def domains(self) -> Any:
        return await self._site_get("domains")

    async def bind_domain(self, data: Data) -> Any:
        return await self._site_action("domains", "POST", data)

    async def unbind_domain(self, id: Identifier) -> Any:
        return await self._site_action(f"domains/{identifier(id)}", "DELETE")

    async def recheck_domain(self, id: Identifier) -> Any:
        return await self._site_action(f"domains/{identifier(id)}/recheck", "POST", {})

    async def collaborators(self) -> Any:
        return await self._site_get("collaborators")

    async def put_collaborator(self, data: Data) -> Any:
        return await self._site_action("collaborators", "PUT", data)

    async def delete_collaborator(self, id: Identifier) -> Any:
        return await self._site_action(f"collaborators/{identifier(id)}", "DELETE")

    async def invitations(self) -> Any:
        return await self._site_get("access-invitations")

    async def create_invitation(self, data: Data) -> Any:
        return await self._site_action("access-invitations", "POST", data)

    async def resend_invitation(self, id: Identifier) -> Any:
        return await self._site_action(f"access-invitations/{identifier(id)}/resend", "POST", {})

    async def revoke_invitation(self, id: Identifier) -> Any:
        return await self._site_action(f"access-invitations/{identifier(id)}", "DELETE")

    async def connections(self) -> Any:
        return await self._site_get("connections")

    async def create_connection(self, data: Data) -> Any:
        return await self._site_action("connections", "POST", data)

    async def update_connection(self, id: Identifier, data: Data) -> Any:
        return await self._site_action(f"connections/{identifier(id)}", "PUT", data)

    async def delete_connection(self, id: Identifier) -> Any:
        return await self._site_action(f"connections/{identifier(id)}", "DELETE")

    async def database(self) -> Any:
        return await self._site_get("database")

    async def storage(self) -> Any:
        return await self._site_get("storage")

    async def logs(self) -> Any:
        return await self._site_get("logs")

    async def monitoring(self) -> Any:
        return await self._site_get("monitoring")

    async def monitoring_config(self) -> Any:
        return await self._site_get("monitoring/config")

    async def configure_monitoring(self, data: Data) -> Any:
        return await self._site_action("monitoring/config", "PUT", data)

    async def synchronize_monitoring(self) -> Any:
        return await self._site_action("monitoring/synchronize", "POST", {})

    async def monitoring_overview(self, **options: Any) -> Any:
        return await Endpoint(self._transport, self._path)._get(
            f"{self._path}/monitoring/overview", options
        )

    async def monitoring_issues(self, **options: Any) -> ApiResponse:
        return await Endpoint(self._transport, self._path)._list(
            f"{self._path}/monitoring/issues", options
        )

    async def monitoring_issue(self, id: Identifier) -> Any:
        return await self._site_get(f"monitoring/issues/{identifier(id)}")

    async def resolve_monitoring_issue(self, id: Identifier) -> Any:
        return await self._site_action(f"monitoring/issues/{identifier(id)}/resolve", "POST", {})

    async def analytics(self) -> Any:
        return await self._site_get("analytics")

    async def jobs(self, **options: Any) -> ApiResponse:
        return await Endpoint(self._transport, self._path)._list(f"{self._path}/jobs", options)

    async def job(self, id: Identifier) -> Any:
        return await self._site_get(f"jobs/{identifier(id)}")

    async def retry_job(self, id: Identifier) -> Any:
        return await self._site_action(f"jobs/{identifier(id)}/retry", "POST", {})

    async def cancel_job(self, id: Identifier) -> Any:
        return await self._site_action(f"jobs/{identifier(id)}", "DELETE")

    async def schedules(self) -> Any:
        return await self._site_get("jobs/schedules")

    async def activate_schedule(self, id: Identifier, active: bool) -> Any:
        return await self._site_action(
            f"jobs/schedules/{identifier(id)}/activation", "PUT", {"active": active}
        )

    async def auth(self) -> Any:
        return await self._site_get("auth")

    async def configure_auth(self, data: Data) -> Any:
        return await self._site_action("auth", "PUT", data)

    async def connect_clerk(self, data: Data) -> Any:
        return await self._site_action("auth/clerk", "POST", data)

    async def verify_auth(self, data: Data) -> Any:
        return await self._site_action("auth/verify", "POST", data)

    async def lifecycle(self) -> Any:
        return await self._site_get("lifecycle")

    async def start(self) -> Any:
        return await self._site_action("start", "POST", {})

    async def stop(self) -> Any:
        return await self._site_action("stop", "POST", {})

    async def archive(self) -> Any:
        return await self._site_action("archive", "POST", {})

    async def restore(self) -> Any:
        return await self._site_action("restore", "POST", {})

    async def delete_site(self) -> Any:
        return await Endpoint(self._transport, self._path)._action(self._path, "DELETE")

    async def provision_database(self, data: Data) -> Any:
        return await self._site_action("database", "POST", data)

    async def provision_storage(self, data: Data) -> Any:
        return await self._site_action("storage", "POST", data)

    async def maps(self) -> Any:
        return await self._site_get("maps")

    async def set_map(self, capability: Identifier, data: Data) -> Any:
        return await self._site_action(f"maps/{identifier(capability)}", "PUT", data)

    async def database_tables(self) -> Any:
        return await self._site_get("database/tables")

    async def create_database_table(self, data: Data) -> Any:
        return await self._site_action("database/tables", "POST", data)

    async def database_table(self, table: Identifier) -> Any:
        return await self._site_get(f"database/tables/{identifier(table)}")

    async def update_database_table(self, table: Identifier, data: Data) -> Any:
        return await self._site_action(f"database/tables/{identifier(table)}", "PATCH", data)

    async def delete_database_table(self, table: Identifier) -> Any:
        return await self._site_action(f"database/tables/{identifier(table)}", "DELETE", {})

    async def database_rows(self, table: Identifier, **options: Any) -> Any:
        return await self._transport.request(
            f"{self._path}/database/tables/{identifier(table)}/rows", "GET", params=options
        )

    async def create_database_row(self, table: Identifier, data: Data) -> Any:
        return await self._site_action(f"database/tables/{identifier(table)}/rows", "POST", data)

    async def update_database_rows(self, table: Identifier, data: Data) -> Any:
        return await self._site_action(f"database/tables/{identifier(table)}/rows", "PUT", data)

    async def delete_database_rows(self, table: Identifier, data: Data) -> Any:
        return await self._site_action(f"database/tables/{identifier(table)}/rows", "DELETE", data)

    async def inspect_database_query(self, data: Data) -> Any:
        return await self._site_action("database/inspect-query", "POST", data)

    async def execute_database_query(self, data: Data) -> Any:
        return await self._site_action("database/query", "POST", data)

    async def database_migrations(self) -> Any:
        return await self._site_get("database/migrations")

    async def storage_files(self, **options: Any) -> Any:
        return await self._transport.request(f"{self._path}/storage/files", "GET", params=options)

    async def storage_file_metadata(self, path: str) -> Any:
        return await self._transport.request(
            f"{self._path}/storage/files/metadata", "GET", params={"path": path}
        )

    async def storage_file_content(self, path: str) -> bytes:
        return cast(
            bytes,
            await self._transport.request(
                f"{self._path}/storage/files/content", "GET", params={"path": path}, binary=True
            ),
        )

    async def download_storage_file(self, path: str) -> bytes:
        return cast(
            bytes,
            await self._transport.request(
                f"{self._path}/storage/files/download", "GET", params={"path": path}, binary=True
            ),
        )

    async def upload_storage_file(self, data: Data) -> Any:
        return await self._site_action("storage/files", "POST", data)

    async def rename_storage_file(self, data: Data) -> Any:
        return await self._site_action("storage/files", "PATCH", data)

    async def delete_storage_file(self, data: Data) -> Any:
        return await self._site_action("storage/files", "DELETE", data)

    async def create_storage_folder(self, data: Data) -> Any:
        return await self._site_action("storage/folders", "POST", data)

    async def storage_usage(self) -> Any:
        return await self._site_get("storage/usage")

    async def analytics_config(self) -> Any:
        return await self._site_get("analytics/config")

    async def set_analytics_config(self, data: Data) -> Any:
        return await self._site_action("analytics/config", "PUT", data)

    async def rotate_analytics_source(self) -> Any:
        return await self._site_action("analytics/source/rotate", "POST", {})

    async def analytics_providers(self) -> Any:
        return await self._site_get("analytics/providers")

    async def create_analytics_provider(self, data: Data) -> Any:
        return await self._site_action("analytics/providers", "POST", data)

    async def analytics_provider(self, provider: Identifier) -> Any:
        return await self._site_get(f"analytics/providers/{identifier(provider)}")

    async def update_analytics_provider(self, provider: Identifier, data: Data) -> Any:
        return await self._site_action(f"analytics/providers/{identifier(provider)}", "PUT", data)

    async def delete_analytics_provider(self, provider: Identifier) -> Any:
        return await self._site_action(f"analytics/providers/{identifier(provider)}", "DELETE", {})

    async def analytics_events(self, **options: Any) -> Any:
        return await self._transport.request(
            f"{self._path}/analytics/events", "GET", params=options
        )

    async def analytics_event(self, event: Identifier) -> Any:
        return await self._site_get(f"analytics/events/{identifier(event)}")

    async def analytics_deliveries(self, **options: Any) -> Any:
        return await self._transport.request(
            f"{self._path}/analytics/deliveries", "GET", params=options
        )

    async def analytics_delivery(self, delivery: Identifier) -> Any:
        return await self._site_get(f"analytics/deliveries/{identifier(delivery)}")


class Sites(Endpoint):
    def __init__(self, transport: Transport) -> None:
        super().__init__(transport, "/sites")

    async def list(self, **options: Any) -> ApiResponse:
        response = await self._list(self._path, options)
        return {
            **response,
            "data": [Site(self._transport, item.to_dict()) for item in response["data"]],
        }

    async def get(self, id: Identifier) -> Site:
        data = (await self._get(f"{self._path}/{identifier(id)}")).to_dict()
        if data.get("uuid") != str(id):
            raise PlaybooksError(502, "The Site identity did not match.")
        return Site(self._transport, data)

    async def create(self, data: Data) -> Site:
        result = await self._action(self._path, "POST", data)
        return Site(self._transport, result)
