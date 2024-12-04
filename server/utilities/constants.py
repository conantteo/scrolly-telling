import os
from pathlib import Path

LOCAL_PARENT_DIR = Path(__file__).parent.parent

IS_LOCAL = os.getenv("IS_LOCAL", "True").lower() == "true"

LOCAL_OUTPUT_DIR = LOCAL_PARENT_DIR / 'output'
LOCAL_OUTPUT_JS_DIR = Path(LOCAL_OUTPUT_DIR) / 'js'
LOCAL_OUTPUT_GSAP_DIR = Path(LOCAL_OUTPUT_DIR) / 'js' / 'gsap'
LOCAL_OUTPUT_CSS_DIR = Path(LOCAL_OUTPUT_DIR) / 'css'
LOCAL_OUTPUT_IMAGE_DIR = Path(LOCAL_OUTPUT_DIR) / 'images'

MINIO_ENDPOINT = os.getenv("S3_ENDPOINT", "localhost:9000")
MINIO_ACCESS_KEY = os.getenv("S3_ACCESS_KEY", "minio")
MINIO_SECRET_KEY = os.getenv("S3_SECRET_KEY", "minio123")
MINIO_SECURE = os.getenv("S3_SECURE", "False").lower == "false"
MINIO_ARTICLE_BUCKET = "articles"

GSAP_LOCAL_PATH = LOCAL_PARENT_DIR / 'templates' / 'js' / 'gsap.min.js'
REGISTER_PLUGIN_TEMPLATE_PATH = LOCAL_PARENT_DIR / 'templates' / 'js' / 'gsap' / 'registerPlugin.js'