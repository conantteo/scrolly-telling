import logging
import shutil
import tempfile
import typing
import io
from pathlib import Path

import uvicorn
from fastapi import FastAPI, UploadFile
from fastapi.responses import JSONResponse
from minio import Minio
from minio.error import S3Error

from server.model.article import Article
from server.model.plugin_registration import PluginRegistration
from server.utilities.utils import generate_js_function, stage_file
from server.utilities.constants import (
    GSAP_LOCAL_PATH, 
    IS_LOCAL, 
    LOCAL_OUTPUT_CSS_DIR, 
    LOCAL_OUTPUT_DIR, 
    LOCAL_OUTPUT_GSAP_DIR,  
    LOCAL_OUTPUT_JS_DIR, 
    MINIO_ACCESS_KEY, 
    MINIO_ARTICLE_BUCKET,
    MINIO_ENDPOINT, 
    MINIO_SECRET_KEY, 
    MINIO_SECURE, 
    REGISTER_PLUGIN_TEMPLATE_PATH
)
from server.parser import parse_components
from server.utilities.utils import generate_js_function

logger = logging.getLogger(__name__)

# Create local output directory if it doesn't exist
# if IS_LOCAL:
Path.mkdir(LOCAL_OUTPUT_DIR, parents=True, exist_ok=True)
Path.mkdir(LOCAL_OUTPUT_JS_DIR, parents=True, exist_ok=True)
Path.mkdir(LOCAL_OUTPUT_GSAP_DIR, parents=True, exist_ok=True)
Path.mkdir(LOCAL_OUTPUT_CSS_DIR, parents=True, exist_ok=True)

# MinIO client setup (only if not local)
if IS_LOCAL:
    minio_client = None
else:
    minio_client = Minio(
        endpoint=MINIO_ENDPOINT,
        access_key=MINIO_ACCESS_KEY,
        secret_key=MINIO_SECRET_KEY,
        secure=MINIO_SECURE,
    )

# if IS_LOCAL:
#     minio_client = Undefined

app = FastAPI()


# @app.post("/api/generate-website")
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
        bucket_name = "websites"
        if not minio_client.bucket_exists(bucket_name):
            minio_client.make_bucket(bucket_name)
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

@app.post("/api/upload-image")
async def upload_file(file: UploadFile, article_id: str):
    stage_file(minio_client, article_id, file.file, file.filename, file.size)

@app.get("/test")
async def test():
    return "ok"

@app.post("/api/generate-website")
async def generate_website(request_body: Article) -> JSONResponse:
    try:
        # Extract the values from the request body
        title = request_body.title if request_body.title is not None else 'My Animated Website'
        scroll_trigger = request_body.scroll_trigger
        components = request_body.components
        article_id = request_body.article_id

        # Parse components to generate website
        parse_components(minio_client, article_id, components, title)
        return JSONResponse(content={"message": f"Website generated successfully. The article can be found in {'localhost:9000' if MINIO_ENDPOINT == 'minio:9000' else MINIO_ENDPOINT}/{MINIO_ARTICLE_BUCKET}/{request_body.article_id}/index.html"}, status_code=200)

    except ValueError as ve:
        logger.error(f"ValueError occurred: {ve}")
        return JSONResponse(content={"error": f"Invalid data: {ve}"}, status_code=400)

    except FileNotFoundError as fnf:
        logger.error(f"FileNotFoundError occurred: {fnf}")
        return JSONResponse(content={"error": f"File not found: {fnf}"}, status_code=404)

    except Exception as e:
        logger.error(f"Unexpected error occurred: {e}", exc_info=True)
        return JSONResponse(content={"error": "An unexpected error occurred while processing the request."},
                            status_code=500)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
