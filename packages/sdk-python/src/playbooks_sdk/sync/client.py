from types import TracebackType
from typing import Any, Self

import httpx

from ..resource import Data, identifier
from ..transport import Config, Transport
from .core import Listing, ReadCollection, ReadEndpoint
from .workspace import Workspaces


class PlaybooksSDK:
    def __init__(
        self, *, api_key: str | None = None, base_url: str = "https://api.playbooks.ai"
    ) -> None:
        config = Config(api_key=api_key, base_url=base_url)
        config.url("/session")
        self._http = httpx.Client(timeout=30, follow_redirects=False)
        self._public_http = httpx.Client(timeout=30, follow_redirects=False)
        self._transport = Transport(self._http, config)
        self._public_transport = Transport(self._public_http, Config(base_url=base_url))

    def __enter__(self) -> Self:
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        traceback: TracebackType | None,
    ) -> None:
        self.close()

    def close(self) -> None:
        try:
            self._http.close()
        finally:
            self._public_http.close()

    @property
    def session(self) -> ReadEndpoint:
        return ReadEndpoint(self._transport, "/session")

    @property
    def workspaces(self) -> Workspaces:
        return Workspaces(self._transport)

    @property
    def templates(self) -> ReadCollection:
        return ReadCollection(self._public_transport, "/templates")

    @property
    def categories(self) -> Listing:
        return Listing(self._public_transport, "/categories")

    @property
    def collections(self) -> Listing:
        return Listing(self._public_transport, "/collections")

    @property
    def creators(self) -> Listing:
        return Listing(self._public_transport, "/workspaces")

    @property
    def types(self) -> Listing:
        return Listing(self._public_transport, "/project-types")

    def request(
        self,
        path: str,
        *,
        workspace: str | None = None,
        method: str = "GET",
        data: Data | None = None,
        params: Data | None = None,
        read_only: bool | None = None,
        binary: bool = False,
        raw: bool = False,
    ) -> Any:
        transport = (
            self._transport if workspace is None else self._transport.scoped(identifier(workspace))
        )
        return transport.request(path, method, data, params, read_only, binary, raw)
