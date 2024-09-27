import logging
import os
from pathlib import Path
from typing import Any

from jinja2 import Environment
from jinja2 import FileSystemLoader

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
