from fastapi import APIRouter, HTTPException

from app.models.card import CardCreate, CardUpdate, CardResponse, BatchPositionUpdate
from app.services import card_service

router = APIRouter(tags=["cards"])


@router.post("/boards/{board_id}/cards", response_model=CardResponse)
async def create_card(board_id: str, data: CardCreate):
    return await card_service.create_card(board_id, data.model_dump())


@router.get("/boards/{board_id}/cards", response_model=list[CardResponse])
async def list_cards(board_id: str):
    return await card_service.list_cards(board_id)


@router.patch("/cards/{card_id}", response_model=CardResponse)
async def update_card(card_id: str, data: CardUpdate):
    card = await card_service.update_card(card_id, data.model_dump(exclude_none=True))
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    return card


@router.delete("/cards/{card_id}")
async def delete_card(card_id: str):
    deleted = await card_service.delete_card(card_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Card not found")
    return {"ok": True}


@router.patch("/boards/{board_id}/cards/batch-position")
async def batch_update_positions(board_id: str, data: BatchPositionUpdate):
    count = await card_service.batch_update_positions(
        board_id, [item.model_dump() for item in data.updates]
    )
    return {"modified_count": count}


@router.post("/cards/{card_id}/attachments", response_model=CardResponse)
async def add_attachment(card_id: str, attachment: dict):
    card = await card_service.add_attachment(card_id, attachment)
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    return card


@router.delete("/cards/{card_id}/attachments/{attachment_id}", response_model=CardResponse)
async def remove_attachment(card_id: str, attachment_id: str):
    card = await card_service.remove_attachment(card_id, attachment_id)
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    return card
