from fastapi import APIRouter, HTTPException

from app.models.board import BoardCreate, BoardResponse
from app.services import board_service, card_service, connection_service

router = APIRouter(tags=["boards"])


@router.post("/boards", response_model=BoardResponse)
async def create_board(data: BoardCreate):
    return await board_service.create_board(data.name)


@router.get("/boards", response_model=list[BoardResponse])
async def list_boards():
    return await board_service.list_boards()


@router.get("/boards/{board_id}")
async def get_board(board_id: str):
    board = await board_service.get_board(board_id)
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    cards = await card_service.list_cards(board_id)
    connections = await connection_service.list_connections(board_id)
    return {"board": board, "cards": cards, "connections": connections}


@router.delete("/boards/{board_id}")
async def delete_board(board_id: str):
    deleted = await board_service.delete_board(board_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Board not found")
    return {"ok": True}
