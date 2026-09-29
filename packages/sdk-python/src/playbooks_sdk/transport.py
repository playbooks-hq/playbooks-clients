import asyncio
import math
import re
import time
from dataclasses import dataclass, replace
from importlib.metadata import version
from typing import Any
from urllib.parse import urlsplit

import httpx

from .error import PlaybooksError
from .resource import Data


@dataclass(frozen=True)
class Config:
    api_key: str | None = None
    base_url: str = "https://api.playbooks.ai"
    workspace: str | None = None

    def url(self, path: str) -> str:
        base = urlsplit(self.base_url)
        if base.username or base.password or base.query or base.fragment:
            raise PlaybooksError(
                400, "The API origin must not contain credentials, query or fragment."
            )
        if base.scheme not in ("http", "https") or not base.hostname:
            raise PlaybooksError(400, "Provide an HTTP(S) API endpoint.")
        if base.scheme != "https" and base.hostname not in ("localhost", "127.0.0.1", "::1"):
            raise PlaybooksError(400, "The API endpoint must use HTTPS.")
        if not path.startswith("/") or path.startswith("//") or "#" in path or "?" in path:
            raise PlaybooksError(400, "Provide an API path without query or fragment.")
        if self.api_key and not re.fullmatch(r"[\x21-\x7e]+", self.api_key):
            raise PlaybooksError(401, "The credential contains invalid characters.")
        return self.base_url.rstrip("/") + path

    def headers(self, accept: str = "application/json") -> dict[str, str]:
        headers = {"client": f"playbooks-sdk@{version('playbooks-sdk')}", "accept": accept}
        if self.api_key:
            headers["authorization"] = self.api_key
        if self.workspace:
            headers["workspace"] = self.workspace
        return headers


def response_data(response: httpx.Response, method: str, binary: bool, raw: bool) -> Any:
    if binary and response.is_success:
        return response.content
    if response.status_code == 204:
        return {"data": None}
    try:
        body = response.json()
    except ValueError:
        body = None
    if not response.is_success:
        error = body.get("error", {}) if isinstance(body, dict) else {}
        if not isinstance(error, dict):
            error = {}
        raise PlaybooksError(
            response.status_code,
            error.get("description") or f"HTTP {response.status_code}: {response.reason_phrase}",
            error.get("source"),
            error.get("debug"),
            error.get("title"),
        )
    if raw:
        return {"data": body}
    if method != "GET" and body == {}:
        return {"data": None}
    if not isinstance(body, dict) or "data" not in body:
        raise PlaybooksError(502, "The server returned an invalid response envelope.")
    return body


def retry_delay(response: httpx.Response, attempt: int, read_only: bool) -> float | None:
    if not read_only or attempt >= 2 or response.status_code not in (429, 502, 503, 504):
        return None
    try:
        seconds = float(response.headers.get("retry-after", str(attempt + 1)))
    except ValueError:
        seconds = math.inf
    if not math.isfinite(seconds) or seconds > 10:
        raise PlaybooksError(response.status_code, "Server is busy. Retry later.")
    return max(0, seconds)


def request_kwargs(
    config: Config, data: Any, params: Data | None, binary: bool, files: Any
) -> Data:
    return {
        "headers": config.headers("application/octet-stream" if binary else "application/json"),
        "params": {
            k: str(v).lower() if isinstance(v, bool) else str(v)
            for k, v in (params or {}).items()
            if v is not None
        },
        **({"files": files, "data": data} if files is not None else {"json": data}),
    }


def network_error(read_only: bool) -> PlaybooksError:
    return PlaybooksError(
        503,
        "The API request could not complete. Check connectivity and try again."
        if read_only
        else (
            "The request could not complete. The server may have accepted it; "
            "inspect state before retrying."
        ),
    )


class Transport:
    def __init__(self, client: httpx.Client, config: Config) -> None:
        self.client = client
        self.config = config

    def scoped(self, workspace: str) -> "Transport":
        return Transport(self.client, replace(self.config, workspace=workspace))

    def request(
        self,
        path: str,
        method: str = "GET",
        data: Any = None,
        params: Data | None = None,
        read_only: bool | None = None,
        binary: bool = False,
        raw: bool = False,
        files: Any = None,
    ) -> Any:
        url = self.config.url(path)
        read_only = method == "GET" if read_only is None else read_only
        for attempt in range(3):
            try:
                response = self.client.request(
                    method, url, **request_kwargs(self.config, data, params, binary, files)
                )
            except httpx.HTTPError:
                raise network_error(read_only) from None
            delay = retry_delay(response, attempt, read_only)
            if delay is not None:
                time.sleep(delay)
                continue
            return response_data(response, method, binary, raw)
        raise AssertionError("Unreachable retry state")


class AsyncTransport:
    def __init__(self, client: httpx.AsyncClient, config: Config) -> None:
        self.client = client
        self.config = config

    def scoped(self, workspace: str) -> "AsyncTransport":
        return AsyncTransport(self.client, replace(self.config, workspace=workspace))

    async def request(
        self,
        path: str,
        method: str = "GET",
        data: Any = None,
        params: Data | None = None,
        read_only: bool | None = None,
        binary: bool = False,
        raw: bool = False,
        files: Any = None,
    ) -> Any:
        url = self.config.url(path)
        read_only = method == "GET" if read_only is None else read_only
        for attempt in range(3):
            try:
                response = await self.client.request(
                    method, url, **request_kwargs(self.config, data, params, binary, files)
                )
            except httpx.HTTPError:
                raise network_error(read_only) from None
            delay = retry_delay(response, attempt, read_only)
            if delay is not None:
                await asyncio.sleep(delay)
                continue
            return response_data(response, method, binary, raw)
        raise AssertionError("Unreachable retry state")
