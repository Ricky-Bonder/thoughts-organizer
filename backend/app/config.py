import os

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "thoughts_organizer")
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
