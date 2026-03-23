from datetime import datetime, timezone

from bson import ObjectId

from app.database import get_db


def _doc_to_board(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "name": doc["name"],
        "created_at": doc["created_at"],
        "updated_at": doc["updated_at"],
    }


async def create_board(name: str) -> dict:
    db = get_db()
    now = datetime.now(timezone.utc)
    doc = {"name": name, "created_at": now, "updated_at": now}
    result = await db.boards.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _doc_to_board(doc)


async def list_boards() -> list[dict]:
    db = get_db()
    cursor = db.boards.find().sort("created_at", -1)
    return [_doc_to_board(doc) async for doc in cursor]


async def get_board(board_id: str) -> dict | None:
    db = get_db()
    doc = await db.boards.find_one({"_id": ObjectId(board_id)})
    return _doc_to_board(doc) if doc else None


async def delete_board(board_id: str) -> bool:
    db = get_db()
    oid = ObjectId(board_id)
    # Cascade: delete all cards and connections for this board
    await db.connections.delete_many({"board_id": board_id})
    await db.cards.delete_many({"board_id": board_id})
    result = await db.boards.delete_one({"_id": oid})
    return result.deleted_count > 0
