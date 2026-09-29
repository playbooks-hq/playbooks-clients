from typing import Literal, NotRequired, TypedDict

InboxView = Literal["attention", "mentions", "all"]
InboxType = Literal[
    "all", "approval", "question", "review", "failure", "mention", "reply", "report"
]


class InboxReadInput(TypedDict):
    throughMessageId: int
    branchId: NotRequired[int | None]
