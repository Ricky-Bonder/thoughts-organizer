from datetime import datetime
from typing import Literal
from pydantic import BaseModel


class Position(BaseModel):
    x: float = 100.0
    y: float = 100.0


class Size(BaseModel):
    width: float = 200.0
    height: float = 150.0


class Attachment(BaseModel):
    id: str
    filename: str
    url: str
    mime_type: str
    created_at: datetime


class CardCreate(BaseModel):
    title: str = ""
    content: str = ""
    color: str = "#FFF9C4"
    text_color: str = "#000000"
    font_size: int = 14
    position: Position = Position()
    size: Size = Size()
    card_type: Literal["card", "text_label"] = "card"


class CardUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    color: str | None = None
    text_color: str | None = None
    font_size: int | None = None
    position: Position | None = None
    size: Size | None = None
    card_type: Literal["card", "text_label"] | None = None


class CardResponse(BaseModel):
    id: str
    board_id: str
    title: str
    content: str
    color: str
    text_color: str = "#000000"
    font_size: int
    position: Position
    size: Size
    card_type: Literal["card", "text_label"] = "card"
    attachments: list[Attachment] = []
    created_at: datetime
    updated_at: datetime


class CardPositionItem(BaseModel):
    id: str
    position: Position


class BatchPositionUpdate(BaseModel):
    updates: list[CardPositionItem]
