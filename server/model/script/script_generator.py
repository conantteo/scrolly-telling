import io
from pathlib import Path

from server.model.page import Page
from server.model.script.script_constants import gsap_init_js
from server.model.script.script_processor import ScriptProcessor
from server.utilities.constants import BUCKET
from server.utilities.constants import LOCAL_OUTPUT_DIR
from server.utilities.constants import MINIO_CLIENT
from server.utilities.constants import MINIO_PRIVATE_ARTICLE_BUCKET
from server.utilities.constants import S3_BUCKET
from server.utilities.constants import S3_CLIENT


class ScriptGenerator:
    def __init__(self, pages: list[Page], article_id: str) -> None:
        self.article_id = article_id
        self.pages = pages

    def generate(self) -> str:
        string_builder = [gsap_init_js]
        script_processor = ScriptProcessor(string_builder)
        script_processor.process_pages(self.pages)
        return "".join(string_builder)

    def generate_and_export(self) -> None:
        scripts = self.generate()
        if BUCKET == "LOCAL":
            Path.mkdir(LOCAL_OUTPUT_DIR / self.article_id / "js", parents=True, exist_ok=True)
            Path(LOCAL_OUTPUT_DIR / self.article_id / "js" / "animation.js").write_bytes(scripts.encode())
        elif BUCKET == "MINIO":
            MINIO_CLIENT.put_object(
                MINIO_PRIVATE_ARTICLE_BUCKET,
                f"{self.article_id}/js/animation.js",
                io.BytesIO(scripts.encode()),
                length=len(scripts.encode()),
                content_type="text/javascript",
            )
        else:
            S3_CLIENT.put_object(
                Body=io.BytesIO(scripts.encode()),
                Bucket=S3_BUCKET,
                ServerSideEncryption="AES256",
                Key=f"private-articles/{self.article_id}/js/animation.js",
                ContentType="text/javascript",
            )
