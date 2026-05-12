from fastapi import APIRouter, UploadFile, File, Depends
from auth.utils import get_current_user
from services.s3_service import upload_to_s3, generate_presigned_url
import uuid

router = APIRouter()

@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    prefix: str = "original",
):
    """
    Standalone API to upload an image directly to S3.
    """
    image_bytes = await file.read()
    unique_prefix = str(uuid.uuid4())[:8]
    
    filename = f"{unique_prefix}_{file.filename}"
    
    s3_key = upload_to_s3(
        image_bytes,
        filename=filename,
        content_type=file.content_type or "image/jpeg",
        prefix=prefix
    )
    
    s3_url = generate_presigned_url(s3_key)

    return {"status": "success", "s3_key": s3_key, "filename": filename, "s3_url": s3_url}
