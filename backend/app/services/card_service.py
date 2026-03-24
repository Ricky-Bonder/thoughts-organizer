from datetime import datetime, timezone

from bson import ObjectId
from pymongo import UpdateOne

from app.database import get_db


def _doc_to_card(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "board_id": doc["board_id"],
        "title": doc.get("title", ""),
        "content": doc.get("content", ""),
        "color": doc.get("color", "#FFEB3B"),
        "text_color": doc.get("text_color", "#000000"),
        "font_size": doc.get("font_size", 14),
        "position": doc.get("position", {"x": 100, "y": 100}),
        "size": doc.get("size", {"width": 200, "height": 150}),
        "card_type": doc.get("card_type", "card"),
        "attachments": doc.get("attachments", []),
        "created_at": doc["created_at"],
        "updated_at": doc["updated_at"],
    }


async def create_card(board_id: str, data: dict) -> dict:
    db = get_db()
    now = datetime.now(timezone.utc)
    doc = {
        "board_id": board_id,
        "title": data.get("title", ""),
        "content": data.get("content", ""),
        "color": data.get("color", "#FFEB3B"),
        "text_color": data.get("text_color", "#000000"),
        "font_size": data.get("font_size", 14),
        "position": data.get("position", {"x": 100, "y": 100}),
        "size": data.get("size", {"width": 200, "height": 150}),
        "card_type": data.get("card_type", "card"),
        "attachments": [],
        "created_at": now,
        "updated_at": now,
    }
    result = await db.cards.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _doc_to_card(doc)


async def list_cards(board_id: str) -> list[dict]:
    db = get_db()
    cursor = db.cards.find({"board_id": board_id})
    return [_doc_to_card(doc) async for doc in cursor]


async def get_card(card_id: str) -> dict | None:
    db = get_db()
    doc = await db.cards.find_one({"_id": ObjectId(card_id)})
    return _doc_to_card(doc) if doc else None


async def update_card(card_id: str, data: dict) -> dict | None:
    db = get_db()
    update_fields = {k: v for k, v in data.items() if v is not None}
    if not update_fields:
        return await get_card(card_id)
    update_fields["updated_at"] = datetime.now(timezone.utc)
    await db.cards.update_one(
        {"_id": ObjectId(card_id)}, {"$set": update_fields}
    )
    return await get_card(card_id)


async def delete_card(card_id: str) -> bool:
    db = get_db()
    # Delete connections referencing this card
    await db.connections.delete_many(
        {"$or": [{"source_card_id": card_id}, {"target_card_id": card_id}]}
    )
    result = await db.cards.delete_one({"_id": ObjectId(card_id)})
    return result.deleted_count > 0


async def batch_update_positions(board_id: str, updates: list[dict]) -> int:
    db = get_db()
    now = datetime.now(timezone.utc)
    ops = [
        UpdateOne(
            {"_id": ObjectId(item["id"]), "board_id": board_id},
            {"$set": {"position": item["position"], "updated_at": now}},
        )
        for item in updates
    ]
    if not ops:
        return 0
    result = await db.cards.bulk_write(ops)
    return result.modified_count


async def add_attachment(card_id: str, attachment: dict) -> dict | None:
    db = get_db()
    now = datetime.now(timezone.utc)
    await db.cards.update_one(
        {"_id": ObjectId(card_id)},
        {
            "$push": {"attachments": attachment},
            "$set": {"updated_at": now},
        },
    )
    return await get_card(card_id)


async def remove_attachment(card_id: str, attachment_id: str) -> dict | None:
    db = get_db()
    now = datetime.now(timezone.utc)
    await db.cards.update_one(
        {"_id": ObjectId(card_id)},
        {
            "$pull": {"attachments": {"id": attachment_id}},
            "$set": {"updated_at": now},
        },
    )
    return await get_card(card_id)
