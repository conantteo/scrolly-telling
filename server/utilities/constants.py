import os
from pathlib import Path

from minio import Minio

LOCAL_PARENT_DIR = Path(__file__).parent.parent

IS_LOCAL = os.getenv("IS_LOCAL", "True").lower() == "true"

LOCAL_OUTPUT_DIR = LOCAL_PARENT_DIR / "output"

MINIO_ENDPOINT = os.getenv("S3_ENDPOINT", "localhost:9000")
MINIO_ACCESS_KEY = os.getenv("S3_ACCESS_KEY", "minio")
MINIO_SECRET_KEY = os.getenv("S3_SECRET_KEY", "minio123")
MINIO_SECURE = os.getenv("S3_SECURE", "False").lower == "false"
MINIO_ARTICLE_BUCKET = "articles"
MINIO_CLIENT = None

if IS_LOCAL:
    Path.mkdir(LOCAL_OUTPUT_DIR, parents=True, exist_ok=True)
else:
    MINIO_CLIENT = Minio(
        endpoint=MINIO_ENDPOINT,
        access_key=MINIO_ACCESS_KEY,
        secret_key=MINIO_SECRET_KEY,
        secure=MINIO_SECURE,
    )

GSAP_LOCAL_PATH = LOCAL_PARENT_DIR / "templates" / "js" / "gsap.min.js"
REGISTER_PLUGIN_TEMPLATE_PATH = LOCAL_PARENT_DIR / "templates" / "js" / "gsap" / "registerPlugin.js"
