import logging
import os
import shutil
from pathlib import Path
from typing import Any

from jinja2 import Environment
from jinja2 import FileSystemLoader
from minio.commonconfig import CopySource
from minio.error import S3Error

from server.utilities.constants import IS_LOCAL
from server.utilities.constants import LOCAL_OUTPUT_DIR
from server.utilities.constants import MINIO_CLIENT
from server.utilities.constants import MINIO_UI_ENDPOINT
from server.utilities.constants import MINIO_PRIVATE_ARTICLE_BUCKET
from server.utilities.constants import MINIO_PUBLIC_ARTICLE_BUCKET
from server.utilities.constants import MINIO_SCHEME

logger = logging.getLogger(__name__)


def generate_js_function(template_path: Path, output_file: Path, **kwargs: Any) -> None:
    # Get the directory and filename from the full path
    template_dir, template_file = os.path.split(template_path)

    # Set up the Jinja2 environment
    env = Environment(loader=FileSystemLoader(template_dir), autoescape=True)

    # Load the template
    template = env.get_template(template_file)

    # Render the template with the provided variables
    rendered_js = template.render(**kwargs)

    # Write the rendered JavaScript to the output file
    Path(output_file).write_text(rendered_js, encoding="utf-8")

    logger.info(f"JavaScript function generated in {output_file}")


def stage_file(article_id: str, file_content: bytes, filename: str, file_size: int, file_content_type: str) -> None:
    if IS_LOCAL:
        Path.mkdir(LOCAL_OUTPUT_DIR / article_id / "images", parents=True, exist_ok=True)
        if Path.is_file(LOCAL_OUTPUT_DIR / article_id / "images" / filename):
            raise FileExistsError("An image with the same name exists, please upload with a different name.")
        Path(LOCAL_OUTPUT_DIR / article_id / "images" / filename).write_bytes(file_content.read())
        return str(LOCAL_OUTPUT_DIR / article_id / "images" / filename)
    if not MINIO_CLIENT.bucket_exists(MINIO_PRIVATE_ARTICLE_BUCKET):
        MINIO_CLIENT.make_bucket(MINIO_PRIVATE_ARTICLE_BUCKET)
    try:
        MINIO_CLIENT.stat_object(MINIO_PRIVATE_ARTICLE_BUCKET, f"{article_id}/images/{filename}")
        raise FileExistsError("An image with the same name exists, please upload with a different name.")
    except S3Error as e:
        if e.code == "NoSuchKey":
            MINIO_CLIENT.put_object(
                MINIO_PRIVATE_ARTICLE_BUCKET,
                f"{article_id}/images/{filename}",
                file_content,
                length=file_size,
                content_type=file_content_type,
            )
            return f"{MINIO_UI_ENDPOINT.replace('minio', 'localhost')}/{MINIO_PRIVATE_ARTICLE_BUCKET}/{article_id}/images/{filename}"  # noqa: E501
        raise


def copy_files(
    src_obj: str,
    src_bucket: str = MINIO_PRIVATE_ARTICLE_BUCKET,
    dest_bucket: str = MINIO_PUBLIC_ARTICLE_BUCKET,
) -> str:
    if IS_LOCAL:
        return str(Path(LOCAL_OUTPUT_DIR / src_obj / "index.html"))
    objs = MINIO_CLIENT.list_objects(src_bucket, src_obj, True)  # noqa: FBT003
    for obj in objs:
        MINIO_CLIENT.copy_object(dest_bucket, obj.object_name, CopySource(src_bucket, obj.object_name))
    return f"{MINIO_SCHEME}://{MINIO_UI_ENDPOINT.replace('minio', 'localhost')}/{dest_bucket}/{src_obj}/index.html"

def download_files(src_obj: str, src_bucket: str = MINIO_PRIVATE_ARTICLE_BUCKET) -> str:
    if not IS_LOCAL:
        Path.mkdir(LOCAL_OUTPUT_DIR / src_obj, parents=True, exist_ok=True)
        objs = MINIO_CLIENT.list_objects(src_bucket, src_obj, True)  # noqa: FBT003
        for obj in objs:
            MINIO_CLIENT.fget_object(src_bucket, obj.object_name, str(LOCAL_OUTPUT_DIR / obj.object_name))
    shutil.make_archive(LOCAL_OUTPUT_DIR / src_obj, "zip", LOCAL_OUTPUT_DIR / src_obj)
    return f"{LOCAL_OUTPUT_DIR / src_obj}.zip"
