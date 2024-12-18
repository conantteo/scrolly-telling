from server.model.page import Page
from server.model.script.script_constants import gsap_init_js
from server.model.script.script_processor import ScriptProcessor
from pathlib import Path
from server.utilities.constants import LOCAL_OUTPUT_DIR

class ScriptGenerator:
    def __init__(self, pages: list[Page], article_id: str):
        self.article_id = article_id
        self.pages = pages

    def generate(self) -> str:
        string_builder = [gsap_init_js]
        script_processor = ScriptProcessor(string_builder)
        script_processor.process_pages(self.pages)
        return ''.join(string_builder)

    def generate_and_export(self):
        scripts = self.generate()
        Path.mkdir(LOCAL_OUTPUT_DIR / self.article_id / "js", parents=True, exist_ok=True)
        Path(LOCAL_OUTPUT_DIR / self.article_id / "js" / "animation.js").write_bytes(scripts.encode())
