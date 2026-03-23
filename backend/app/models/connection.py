from datetime import datetime
from typing import Literal
from pydantic import BaseModel


class ConnectionStyle(BaseModel):
    color: str = "#555555"
    stroke_width: int = 2
    line_type: Literal["solid", "dashed", "dotted"] = "solid"


class ConnectionCreate(BaseModel):
    source_card_id: str
    target_card_id: str
    direction: Literal["forward", "reverse", "both"] = "forward"
    style: ConnectionStyle = ConnectionStyle()


class ConnectionUpdate(BaseModel):
    direction: Literal["forward", "reverse", "both"] | None = None
    style: ConnectionStyle | None = None


class ConnectionResponse(BaseModel):
    id: str
    board_id: str
    source_card_id: str
    target_card_id: str
    direction: str
    style: ConnectionStyle
    created_at: datetime
