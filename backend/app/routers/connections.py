from fastapi import APIRouter, HTTPException

from app.models.connection import ConnectionCreate, ConnectionUpdate, ConnectionResponse
from app.services import connection_service

router = APIRouter(tags=["connections"])


@router.post("/boards/{board_id}/connections", response_model=ConnectionResponse)
async def create_connection(board_id: str, data: ConnectionCreate):
    if data.source_card_id == data.target_card_id:
        raise HTTPException(status_code=400, detail="Cannot connect a card to itself")
    return await connection_service.create_connection(board_id, data.model_dump())


@router.get("/boards/{board_id}/connections", response_model=list[ConnectionResponse])
async def list_connections(board_id: str):
    return await connection_service.list_connections(board_id)


@router.patch("/connections/{connection_id}", response_model=ConnectionResponse)
async def update_connection(connection_id: str, data: ConnectionUpdate):
    conn = await connection_service.update_connection(
        connection_id, data.model_dump(exclude_none=True)
    )
    if not conn:
        raise HTTPException(status_code=404, detail="Connection not found")
    return conn


@router.delete("/connections/{connection_id}")
async def delete_connection(connection_id: str):
    deleted = await connection_service.delete_connection(connection_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Connection not found")
    return {"ok": True}
