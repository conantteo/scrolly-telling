import logging
import os
from pathlib import Path
from typing import Any

from jinja2 import Environment
from jinja2 import FileSystemLoader
from server.utilities.constants import LOCAL_PARENT_DIR, IS_LOCAL

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
    Path(output_file).write_text(rendered_js, encoding='utf-8')

    logger.info(f"JavaScript function generated in {output_file}")

def stage_file(minio_client, article_id, file_content: bytes, filename: str, file_size: int, tmp_bucket: str = "tmp") -> None:
    if IS_LOCAL:
        Path.mkdir(LOCAL_PARENT_DIR / tmp_bucket / article_id, parents=True, exist_ok=True)
        with open(LOCAL_PARENT_DIR / tmp_bucket / article_id / filename, "wb") as f:
            f.write(file_content.read())
    else:
        if not minio_client.bucket_exists(tmp_bucket):
            minio_client.make_bucket(tmp_bucket)
        minio_client.put_object(tmp_bucket, f"{article_id}/{filename}", file_content, length=file_size)