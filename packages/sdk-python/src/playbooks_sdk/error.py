from typing import Any


class PlaybooksError(Exception):
    """An API failure, including the Server's structured error fields."""

    def __init__(
        self,
        status: int,
        message: str,
        source: Any = None,
        debug: Any = None,
        title: Any = None,
    ) -> None:
        super().__init__(message)
        self.status = status
        self.message = message
        self.source = source
        self.debug = debug
        self.title = title
