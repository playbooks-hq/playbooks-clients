import re
from copy import deepcopy
from typing import Any, NotRequired, TypeAlias, TypedDict

from playbooks_sdk.error import PlaybooksError

Identifier: TypeAlias = str | int
Data: TypeAlias = dict[str, Any]


class ApiResponse(TypedDict):
    data: Any
    meta: NotRequired[Data]


def identifier(value: Identifier) -> str:
    if (
        isinstance(value, bool)
        or not isinstance(value, (str, int))
        or not re.fullmatch(r"[a-zA-Z0-9_-]+", str(value))
    ):
        raise PlaybooksError(422, "Provide a valid resource identifier.")
    return str(value)


def query_params(options: Data) -> Data:
    """Only Python keyword names are converted; payloads remain Server data."""
    result = {re.sub(r"_([a-z])", lambda m: m[1].upper(), k): v for k, v in options.items()}
    if "page" in result and (
        type(result["page"]) is not int or not 0 <= result["page"] <= 9007199254740991
    ):
        raise PlaybooksError(422, "Page must be a nonnegative integer.")
    return result


def succeeded(data: Any, source: str | None = None) -> Any:
    if isinstance(data, dict) and data.get("status") == "failed":
        raise PlaybooksError(
            422,
            "The operation failed. Inspect its receipt before retrying.",
            source,
            str(data.get("uuid", data.get("id", ""))),
        )
    return data


def check_identity(original: Data, updated: Data) -> None:
    for key in ("uuid", "id"):
        if key in original and original[key] != updated.get(key):
            raise PlaybooksError(502, "The updated resource identity did not match.")


class Resource:
    """A detached snapshot with read-only API fields and safe serialization."""

    def __init__(self, data: Data) -> None:
        object.__setattr__(self, "_snapshot", deepcopy(data))

    def __setattr__(self, name: str, value: Any) -> None:
        raise AttributeError("Resource fields are read-only; call update() to persist changes.")

    def __getattr__(self, name: str) -> Any:
        if name.startswith("_"):
            raise AttributeError(name)
        snapshot = object.__getattribute__(self, "_snapshot")
        if name not in snapshot:
            raise AttributeError(name)
        return deepcopy(snapshot[name])

    def to_dict(self) -> Data:
        return deepcopy(object.__getattribute__(self, "_snapshot"))

    def _replace(self, data: Data) -> None:
        check_identity(self.to_dict(), data)
        object.__setattr__(self, "_snapshot", deepcopy(data))


def record(data: Any) -> Any:
    return Resource(data) if isinstance(data, dict) else data
