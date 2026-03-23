from datetime import datetime
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
    color: str = "#FFEB3B"
    font_size: int = 14
    position: Position = Position()
    size: Size = Size()


class CardUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    color: str | None = None
    font_size: int | None = None
    position: Position | None = None
    size: Size | None = None


class CardResponse(BaseModel):
    id: str
    board_id: str
    title: str
    content: str
    color: str
    font_size: int
    position: Position
    size: Size
    attachments: list[Attachment] = []
    created_at: datetime
    updated_at: datetime


class CardPositionItem(BaseModel):
    id: str
    position: Position


class BatchPositionUpdate(BaseModel):
    updates: list[CardPositionItem]
