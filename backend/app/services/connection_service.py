from datetime import datetime, timezone

from bson import ObjectId

from app.database import get_db


def _doc_to_connection(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "board_id": doc["board_id"],
        "source_card_id": doc["source_card_id"],
        "target_card_id": doc["target_card_id"],
        "direction": doc.get("direction", "forward"),
        "style": doc.get("style", {"color": "#555555", "stroke_width": 2, "line_type": "solid"}),
        "created_at": doc["created_at"],
    }


async def create_connection(board_id: str, data: dict) -> dict:
    db = get_db()
    now = datetime.now(timezone.utc)
    doc = {
        "board_id": board_id,
        "source_card_id": data["source_card_id"],
        "target_card_id": data["target_card_id"],
        "direction": data.get("direction", "forward"),
        "style": data.get("style", {"color": "#555555", "stroke_width": 2, "line_type": "solid"}),
        "created_at": now,
    }
    result = await db.connections.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _doc_to_connection(doc)


async def list_connections(board_id: str) -> list[dict]:
    db = get_db()
    cursor = db.connections.find({"board_id": board_id})
    return [_doc_to_connection(doc) async for doc in cursor]


async def update_connection(connection_id: str, data: dict) -> dict | None:
    db = get_db()
    update_fields = {k: v for k, v in data.items() if v is not None}
    if not update_fields:
        doc = await db.connections.find_one({"_id": ObjectId(connection_id)})
        return _doc_to_connection(doc) if doc else None
    await db.connections.update_one(
        {"_id": ObjectId(connection_id)}, {"$set": update_fields}
    )
    doc = await db.connections.find_one({"_id": ObjectId(connection_id)})
    return _doc_to_connection(doc) if doc else None


async def delete_connection(connection_id: str) -> bool:
    db = get_db()
    result = await db.connections.delete_one({"_id": ObjectId(connection_id)})
    return result.deleted_count > 0
