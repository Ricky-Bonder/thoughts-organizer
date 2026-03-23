from datetime import datetime
from pydantic import BaseModel, Field


class BoardCreate(BaseModel):
    name: str


class BoardUpdate(BaseModel):
    name: str | None = None


class BoardResponse(BaseModel):
    id: str
    name: str
    created_at: datetime
    updated_at: datetime
