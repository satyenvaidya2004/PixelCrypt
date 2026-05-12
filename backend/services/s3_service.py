# backend/services/s3_service.py
import os
import boto3
from botocore.exceptions import ClientError
from fastapi import HTTPException
from dotenv import load_dotenv
from pathlib import Path

# Need to load env if it's not already loaded
PROJECT_ROOT = Path(__file__).resolve().parents[2]
ENV_PATH = PROJECT_ROOT / ".env"
load_dotenv(ENV_PATH)

AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_KEY")
AWS_REGION = os.getenv("AWS_REGION")
AWS_BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")

s3_client = boto3.client(
    "s3",
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY,
    region_name=AWS_REGION
)

def upload_to_s3(file_bytes: bytes, filename: str, content_type: str, prefix: str = "") -> str:
    """
    Uploads file to S3 and returns the S3 key.
    """
    s3_key = f"{prefix}/{filename}" if prefix else filename
    
    try:
        s3_client.put_object(
            Bucket=AWS_BUCKET_NAME,
            Key=s3_key,
            Body=file_bytes,
            ContentType=content_type
        )
        return s3_key
    except ClientError as e:
        print(f"Error uploading to S3: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload image to S3.")

def get_from_s3(s3_key: str):
    """
    Fetches file from S3. Returns file_bytes and content_type.
    """
    try:
        response = s3_client.get_object(Bucket=AWS_BUCKET_NAME, Key=s3_key)
        return response['Body'].read(), response['ContentType']
    except ClientError as e:
        print(f"Error downloading from S3: {e}")
        raise HTTPException(status_code=404, detail="Image not found in S3.")

def generate_presigned_url(s3_key: str, expiration: int = 3600) -> str:
    """
    Generates a secure presigned URL so the image can actually be displayed.
    """
    try:
        url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': AWS_BUCKET_NAME, 'Key': s3_key},
            ExpiresIn=expiration
        )
        return url
    except ClientError as e:
        print(f"Error generating presigned URL: {e}")
        return ""

def delete_from_s3(s3_key: str):
    """
    Deletes file from S3.
    """
    try:
        s3_client.delete_object(Bucket=AWS_BUCKET_NAME, Key=s3_key)
    except ClientError as e:
        print(f"Error deleting from S3: {e}")
