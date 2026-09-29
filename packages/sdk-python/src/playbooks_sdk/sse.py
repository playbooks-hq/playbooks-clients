import codecs
import json
from typing import Any

from .error import PlaybooksError
from .resource import Data


class EventParser:
    """Incremental UTF-8 SSE parser shared by both transports."""

    def __init__(self) -> None:
        self._decoder = codecs.getincrementaldecoder("utf-8")("strict")
        self._pending = ""
        self._event = ""
        self._data: list[str] = []
        self._size = 0

    def feed(self, chunk: bytes, *, final: bool = False) -> list[Data]:
        try:
            self._pending += self._decoder.decode(chunk, final=final)
        except UnicodeDecodeError:
            raise PlaybooksError(502, "The server returned malformed event UTF-8.") from None
        if len(self._pending) + self._size > 8 * 1024 * 1024:
            raise PlaybooksError(502, "The server event exceeds 8 MB.")
        events = []
        while True:
            positions = [p for p in (self._pending.find("\r"), self._pending.find("\n")) if p >= 0]
            if not positions:
                break
            end = min(positions)
            if not final and self._pending[end:] == "\r":
                break
            width = 2 if self._pending[end : end + 2] == "\r\n" else 1
            line, self._pending = self._pending[:end], self._pending[end + width :]
            if not line:
                if self._data:
                    text = "\n".join(self._data)
                    try:
                        data: Any = text if text == "[DONE]" else json.loads(text)
                    except ValueError:
                        raise PlaybooksError(
                            502, "The server returned malformed event JSON."
                        ) from None
                    events.append({"event": self._event or "message", "data": data})
                self._event, self._data, self._size = "", [], 0
                continue
            field, sep, value = line.partition(":")
            if value.startswith(" "):
                value = value[1:]
            if field == "event":
                self._event = value if sep else ""
            elif field == "data":
                self._data.append(value if sep else "")
                self._size += len(value)
        if final and (self._pending.strip() or self._data):
            raise PlaybooksError(502, "The server closed an incomplete event.")
        return events
