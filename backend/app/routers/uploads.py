import os
import uuid
from datetime import datetime, timezone

import aiofiles
from fastapi import APIRouter, UploadFile, File

from app.config import UPLOAD_DIR

router = APIRouter(tags=["uploads"])


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename or "")[1]
    file_id = str(uuid.uuid4())
    stored_name = f"{file_id}{ext}"
    file_path = os.path.join(UPLOAD_DIR, stored_name)

    async with aiofiles.open(file_path, "wb") as f:
        content = await file.read()
        await f.write(content)

    return {
        "id": file_id,
        "filename": file.filename,
        "url": f"/uploads/{stored_name}",
        "mime_type": file.content_type or "application/octet-stream",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
