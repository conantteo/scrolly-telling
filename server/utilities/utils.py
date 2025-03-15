import io
import logging
import os
import re
import shutil
from pathlib import Path
from typing import Any

import boto3
from jinja2 import Environment
from jinja2 import FileSystemLoader
from minio.commonconfig import CopySource
from minio.error import S3Error

from server.utilities.constants import BUCKET
from server.utilities.constants import GSAP_LOCAL_PATH
from server.utilities.constants import LOCAL_OUTPUT_DIR
from server.utilities.constants import MINIO_CLIENT
from server.utilities.constants import MINIO_PREVIEW_ENDPOINT
from server.utilities.constants import MINIO_PRIVATE_ARTICLE_BUCKET
from server.utilities.constants import MINIO_PUBLIC_ARTICLE_BUCKET
from server.utilities.constants import MINIO_SCHEME
from server.utilities.constants import S3_BUCKET
from server.utilities.constants import S3_CLIENT
from server.utilities.constants import SCROLLTRIGGER_LOCAL_PATH
from server.utilities.constants import SMOOTH_SCROLLBAR_LOCAL_PATH

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
    if BUCKET == "LOCAL":
        Path.mkdir(LOCAL_OUTPUT_DIR / article_id / "images", parents=True, exist_ok=True)
        if Path.is_file(LOCAL_OUTPUT_DIR / article_id / "images" / filename):
            raise FileExistsError("An image with the same name exists, please upload with a different name.")
        Path(LOCAL_OUTPUT_DIR / article_id / "images" / filename).write_bytes(file_content.read())
        return str(LOCAL_OUTPUT_DIR / article_id / "images" / filename)
    elif BUCKET == "MINIO":
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
                return f"{MINIO_PREVIEW_ENDPOINT}/{MINIO_PRIVATE_ARTICLE_BUCKET}/{article_id}/images/{filename}"  # noqa: E501
            raise
    else:
        S3_CLIENT.put_object(
            Body=file_content,
            Bucket=S3_BUCKET,
            ServerSideEncryption="AES256",
            Key=f"private-articles/{article_id}/images/{filename}",
            ContentType=file_content_type,
        )
        return f"{MINIO_PREVIEW_ENDPOINT}/{article_id}/images/{filename}"


def copy_files(
    src_obj: str,
    src_bucket: str = MINIO_PRIVATE_ARTICLE_BUCKET,
    dest_bucket: str = MINIO_PUBLIC_ARTICLE_BUCKET,
) -> str:
    if BUCKET == "LOCAL":
        return str(Path(LOCAL_OUTPUT_DIR / src_obj / "index.html"))
    if BUCKET == "MINIO":
        objs = MINIO_CLIENT.list_objects(src_bucket, src_obj, True)  # noqa: FBT003
        for obj in objs:
            if obj.object_name.endswith("index.html"):
                Path.mkdir(LOCAL_OUTPUT_DIR / src_obj, parents=True, exist_ok=True)
                MINIO_CLIENT.fget_object(src_bucket, obj.object_name, str(LOCAL_OUTPUT_DIR / obj.object_name))
                with Path.open(LOCAL_OUTPUT_DIR / obj.object_name, encoding="utf-8") as file:
                    html_template = file.read()
                    html_template = html_template.replace(MINIO_PRIVATE_ARTICLE_BUCKET, MINIO_PUBLIC_ARTICLE_BUCKET)
                    MINIO_CLIENT.put_object(
                        MINIO_PUBLIC_ARTICLE_BUCKET,
                        f"{src_obj}/index.html",
                        io.BytesIO(html_template.encode()),
                        length=len(html_template.encode()),
                        content_type="text/html",
                    )
                shutil.rmtree(LOCAL_OUTPUT_DIR / src_obj)
            else:
                MINIO_CLIENT.copy_object(dest_bucket, obj.object_name, CopySource(src_bucket, obj.object_name))
        return f"{MINIO_SCHEME}://{MINIO_PREVIEW_ENDPOINT}/{dest_bucket}/{src_obj}/index.html"
    return f"{MINIO_SCHEME}://{MINIO_PREVIEW_ENDPOINT}/{src_obj}/index.html"


def download_files(src_obj: str, src_bucket: str = MINIO_PRIVATE_ARTICLE_BUCKET) -> str:
    if BUCKET == "S3":
        Path.mkdir(LOCAL_OUTPUT_DIR / src_obj, parents=True, exist_ok=True)
        s3 = boto3.resource("s3")
        s3_bucket_client = s3.Bucket(S3_BUCKET)
        objs = list(s3_bucket_client.objects.filter(Prefix=f"private-articles/{src_obj}"))
        for obj in objs:
            obj_path = os.path.dirname(obj.key).replace("private-articles", str(LOCAL_OUTPUT_DIR))
            Path(obj_path).mkdir(parents=True, exist_ok=True)
            s3_bucket_client.download_file(obj.key, f"{obj_path}/{os.path.basename(obj.key)}")
    elif BUCKET == "MINIO":
        Path.mkdir(LOCAL_OUTPUT_DIR / src_obj, parents=True, exist_ok=True)
        objs = MINIO_CLIENT.list_objects(src_bucket, src_obj, True)  # noqa: FBT003
        for obj in objs:
            MINIO_CLIENT.fget_object(src_bucket, obj.object_name, str(LOCAL_OUTPUT_DIR / obj.object_name))
    tmp = Path(str(LOCAL_OUTPUT_DIR / src_obj / "index.html")).read_text(encoding="utf-8")
    tmp = tmp.replace(f"{MINIO_SCHEME}://{MINIO_PREVIEW_ENDPOINT}/{MINIO_PRIVATE_ARTICLE_BUCKET}/{src_obj}", ".")
    shutil.copy(SMOOTH_SCROLLBAR_LOCAL_PATH, LOCAL_OUTPUT_DIR / src_obj / "js" / "smooth-scrollbar.js")
    shutil.copy(GSAP_LOCAL_PATH, LOCAL_OUTPUT_DIR / src_obj / "js" / "gsap.min.js")
    shutil.copy(SCROLLTRIGGER_LOCAL_PATH, LOCAL_OUTPUT_DIR / src_obj / "js" / "ScrollTrigger.min.js")
    js_files = re.findall("https://.*.js", tmp)
    for js_file in js_files:
        tmp = tmp.replace(js_file, f"js/{Path(js_file).name}")
    Path(str(LOCAL_OUTPUT_DIR / src_obj / "index.html")).write_text(tmp, encoding="utf-8")
    shutil.make_archive(LOCAL_OUTPUT_DIR / src_obj, "zip", LOCAL_OUTPUT_DIR / src_obj)
    return f"{LOCAL_OUTPUT_DIR / src_obj}.zip"
