from motor.motor_asyncio import AsyncIOMotorClient
from app.config import MONGODB_URL, DATABASE_NAME

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    global client, db
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    # Create indexes
    await db.cards.create_index("board_id")
    await db.connections.create_index("board_id")
    await db.connections.create_index("source_card_id")
    await db.connections.create_index("target_card_id")


async def close_db():
    global client
    if client:
        client.close()


def get_db():
    return db
