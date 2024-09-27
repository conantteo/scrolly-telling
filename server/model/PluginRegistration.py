from pathlib import Path

from pydantic import BaseModel


class PluginRegistration(BaseModel):
    plugin_name: str
    bucket_js_path: str
    bucket_register_path: str
    local_register_path: Path
    local_js_path: Path
    source_path: Path
