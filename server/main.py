import logging
import os
import shutil
import tempfile
import typing
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from jinja2 import Template
from minio import Minio
from minio.error import S3Error

from server.model.article import Article
from server.model.plugin_registration import PluginRegistration
from server.utilities.utils import generate_js_function

logger = logging.getLogger(__name__)

IS_LOCAL = os.environ.get('FLASK_ENV') == 'development'

# Local output directory
LOCAL_OUTPUT_DIR = Path(__file__).parent / 'output'
LOCAL_OUTPUT_JS_DIR = Path(LOCAL_OUTPUT_DIR) / 'js'
LOCAL_OUTPUT_GSAP_DIR = Path(LOCAL_OUTPUT_DIR) / 'js' / 'gsap'
LOCAL_OUTPUT_CSS_DIR = Path(LOCAL_OUTPUT_DIR) / 'css'

# Create local output directory if it doesn't exist
if IS_LOCAL:
    Path.mkdir(LOCAL_OUTPUT_DIR, parents=True, exist_ok=True)
    Path.mkdir(LOCAL_OUTPUT_JS_DIR, parents=True, exist_ok=True)
    Path.mkdir(LOCAL_OUTPUT_GSAP_DIR, parents=True, exist_ok=True)
    Path.mkdir(LOCAL_OUTPUT_CSS_DIR, parents=True, exist_ok=True)

# MinIO client setup (only if not local)
if not IS_LOCAL:
    minio_client = Minio(
        "play.min.io",  # Replace with your MinIO server URL
        access_key="minioadmin",  # Replace with your access key
        secret_key=os.environ['SECRET_KEY'],  # Replace with your secret key
        secure=True  # Set to False if not using HTTPS
    )

# Template files
GSAP_LOCAL_PATH = Path(__file__).parent / 'templates' / 'js' / 'gsap.min.js'
REGISTER_PLUGIN_TEMPLATE_PATH = Path(__file__).parent / 'templates' / 'js' / 'gsap' / 'registerPlugin.js'

app = FastAPI()


@app.post("/api/generate-website")
async def root(request_body: Article) -> typing.Dict[str, str]:
    title = request_body.title if request_body.title is not None else 'My Animated Website'
    scroll_trigger = request_body.scroll_trigger

    # Load HTML template
    with Path.open(Path(__file__).parent / 'templates' / 'index.html', encoding='utf-8') as file:
        html_template = file.read()

    # Render HTML template with provided data
    html_content = Template(html_template).render(title=title, scroll_trigger=scroll_trigger)

    # Load CSS content
    with Path.open(Path(__file__).parent / 'templates' / 'css' / 'styles.css', encoding='utf-8') as file:
        css_content = file.read()

    # Load JS content
    with Path.open(Path(__file__).parent / 'templates' / 'js' / 'animation.js', encoding='utf-8') as file:
        js_template = file.read()

    # Render JS template with provided data
    js_content = Template(js_template).render()

    # Create temporary files
    with tempfile.NamedTemporaryFile(delete=False, suffix='.html') as html_file, \
         tempfile.NamedTemporaryFile(delete=False, suffix='.css') as css_file, \
         tempfile.NamedTemporaryFile(delete=False, suffix='.js') as js_file:
        html_file.write(html_content.encode())
        css_file.write(css_content.encode())
        js_file.write(js_content.encode())
        html_filename = html_file.name
        css_filename = css_file.name
        js_filename = js_file.name

    plugins: list = []

    if scroll_trigger:
        plugin = PluginRegistration(plugin_name='ScrollTrigger',
                                    bucket_js_path='js/ScrollTrigger.min.js',
                                    bucket_register_path='js/gsap/registerScrollTrigger.js',
                                    local_register_path=Path(LOCAL_OUTPUT_GSAP_DIR) / 'registerScrollTrigger.js',
                                    local_js_path=Path(LOCAL_OUTPUT_JS_DIR) / 'ScrollTrigger.min.js',
                                    source_path=Path(__file__).parent / 'templates' / 'js' / 'ScrollTrigger.min.js')
        plugins.append(plugin)

    for plugin in plugins:
        generate_js_function(
            REGISTER_PLUGIN_TEMPLATE_PATH,
            plugin.local_register_path,
            plugin_name=plugin.plugin_name
        )
        logger.info(f'Generated plugin: {plugin.plugin_name}')

    if IS_LOCAL:
        # Write files to local directory
        shutil.copy(html_filename, Path(LOCAL_OUTPUT_DIR) / 'index.html')
        shutil.copy(css_filename, Path(LOCAL_OUTPUT_CSS_DIR) / 'styles.css')
        shutil.copy(js_filename, Path(LOCAL_OUTPUT_JS_DIR) / 'animation.js')
        shutil.copy(GSAP_LOCAL_PATH, Path(LOCAL_OUTPUT_JS_DIR) / 'gsap.min.js')
        for plugin in plugins:
            shutil.copy(plugin.source_path, plugin.local_js_path)
        response = {
            "message": "Website with GSAP animation generated and saved locally",
        }
    else:
        try:
            # Upload files to MinIO
            bucket_name = "websites"
            minio_client.make_bucket(bucket_name)
        except S3Error:
            # Bucket already exists
            pass

        try:
            minio_client.fput_object(bucket_name, "index.html", html_filename)
            minio_client.fput_object(bucket_name, "css/styles.css", css_filename)
            minio_client.fput_object(bucket_name, "js/animation.js", js_filename)
            minio_client.fput_object(bucket_name, "js/gsap.min.js", GSAP_LOCAL_PATH)
            for plugin in plugins:
                minio_client.fput_object(bucket_name, plugin.bucket_js_path, plugin.source_path)
                minio_client.fput_object(bucket_name, plugin.bucket_register_path, plugin.local_register_path)
        except S3Error as err:
            return JSONResponse(status_code=500, content={"error": f"Error uploading files: {err}"})

        response = {
            "message": "Website with GSAP animation generated and uploaded successfully",
            "url": "to be generated"
        }

    # Clean up temporary files
    Path.unlink(html_filename)
    Path.unlink(css_filename)
    Path.unlink(js_filename)
    return response
