import json
from typing import Any

from playbooks_sdk.error import PlaybooksError
from playbooks_sdk.resource import Identifier, identifier
from playbooks_sdk.sync.core import Listing


class Files(Listing):
    def upload(self, *, name: str, content: bytes, expected_revision: str | None = None) -> Any:
        if (
            not name
            or "\\" in name
            or name.startswith("/")
            or any(part in ("", ".", "..") for part in name.split("/"))
        ):
            raise PlaybooksError(422, "Provide a safe relative Agent File name.")
        if len(content) > 20 * 1024 * 1024:
            raise PlaybooksError(422, "Agent Files must not exceed 20 MB.")
        return self._transport.request(
            self._path,
            "POST",
            {
                "paths": json.dumps([name]),
                "expectedRevisions": json.dumps({name: expected_revision}),
            },
            files={"file": (name.split("/")[-1], content, "application/octet-stream")},
        )["data"]

    def download(self, id: Identifier) -> bytes:
        result: bytes = self._transport.request(
            f"{self._path}/{identifier(id)}/download", binary=True
        )
        return result
