import boto3
import os
from pathlib import Path

from minio import Minio

LOCAL_PARENT_DIR = Path(__file__).parent.parent

BUCKET = os.getenv("BUCKET", "LOCAL")

LOCAL_OUTPUT_DIR = LOCAL_PARENT_DIR / "output"

CDN_URL = os.getenv("CDN_URL", None)
MINIO_SCHEME = os.getenv("S3_SCHEME", "http")
MINIO_API_ENDPOINT = os.getenv("S3_API_ENDPOINT", "localhost:9000")
MINIO_PREVIEW_ENDPOINT = os.getenv("S3_PREVIEW_ENDPOINT", "localhost:9001")
MINIO_ACCESS_KEY = os.getenv("S3_ACCESS_KEY", "minio")
MINIO_SECRET_KEY = os.getenv("S3_SECRET_KEY", "minio123")
MINIO_SECURE = os.getenv("S3_SECURE", "False").lower == "false"
MINIO_PUBLIC_ARTICLE_BUCKET = "public-articles"
MINIO_PRIVATE_ARTICLE_BUCKET = "private-articles"
S3_BUCKET = "t-stg-scrollytelling-s3"
MINIO_CLIENT = None
S3_CLIENT = None

if BUCKET == "LOCAL":
    Path.mkdir(LOCAL_OUTPUT_DIR, parents=True, exist_ok=True)
elif BUCKET == "MINIO":
    MINIO_CLIENT = Minio(
        endpoint=MINIO_API_ENDPOINT,
        access_key=MINIO_ACCESS_KEY,
        secret_key=MINIO_SECRET_KEY,
        secure=MINIO_SECURE,
    )
else:
    S3_CLIENT = boto3.client('s3')

GSAP_LOCAL_PATH = LOCAL_PARENT_DIR / "templates" / "js" / "gsap.min.js"
SMOOTH_SCROLLBAR_LOCAL_PATH = LOCAL_PARENT_DIR / "templates" / "js" / "smooth-scrollbar.js"
SCROLLTRIGGER_LOCAL_PATH = LOCAL_PARENT_DIR / "templates" / "js" / "ScrollTrigger.min.js"
REGISTER_PLUGIN_TEMPLATE_PATH = LOCAL_PARENT_DIR / "templates" / "js" / "gsap" / "registerPlugin.js"
