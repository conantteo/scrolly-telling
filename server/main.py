import logging
import shutil
import tempfile
import typing
import io
from pathlib import Path

import uvicorn
from bs4 import BeautifulSoup
from fastapi import FastAPI, UploadFile
from fastapi.responses import JSONResponse, FileResponse
from jinja2 import Template
from minio import Minio
from minio.error import S3Error

from server.model.article import Article
from server.model.component import Component
from server.model.plugin_registration import PluginRegistration
from server.utilities.utils import generate_js_function, stage_file
from server.utilities.constants import (
    GSAP_LOCAL_PATH, 
    IS_LOCAL, 
    LOCAL_OUTPUT_CSS_DIR, 
    LOCAL_OUTPUT_DIR, 
    LOCAL_OUTPUT_GSAP_DIR, 
    LOCAL_OUTPUT_IMAGE_DIR, 
    LOCAL_OUTPUT_JS_DIR, 
    MINIO_ACCESS_KEY, 
    MINIO_ARTICLE_BUCKET,
    MINIO_ENDPOINT, 
    MINIO_SECRET_KEY, 
    MINIO_SECURE, 
    REGISTER_PLUGIN_TEMPLATE_PATH
)

logger = logging.getLogger(__name__)

# Create local output directory if it doesn't exist
# if IS_LOCAL:
Path.mkdir(LOCAL_OUTPUT_DIR, parents=True, exist_ok=True)
Path.mkdir(LOCAL_OUTPUT_JS_DIR, parents=True, exist_ok=True)
Path.mkdir(LOCAL_OUTPUT_GSAP_DIR, parents=True, exist_ok=True)
Path.mkdir(LOCAL_OUTPUT_CSS_DIR, parents=True, exist_ok=True)

# MinIO client setup (only if not local)
if not IS_LOCAL:
    minio_client = Minio(
        endpoint=MINIO_ENDPOINT,
        access_key=MINIO_ACCESS_KEY,
        secret_key=MINIO_SECRET_KEY,
        secure=MINIO_SECURE,
    )

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


@app.post("/api/generate-website")
async def generate_website(request_body: Article) -> typing.Dict[str, str]:
    try:
        # Extract the values from the request body
        title = request_body.title if request_body.title is not None else 'My Animated Website'
        scroll_trigger = request_body.scroll_trigger
        components = request_body.components

        # Process the components and generate HTML content
        parse_components(request_body.article_id, components, title)
        if IS_LOCAL:
            return {"message": "Look for index.html file in the output folder"}
        else:
            return {"message": f"The article can be found in {MINIO_ENDPOINT}/{MINIO_ARTICLE_BUCKET}/{request_body.article_id}/index.html"}

    except Exception as e:
        # Handle the exception and log the error
        print(f"Error occurred: {e}")
        # You can return an appropriate error message or raise a custom exception
        return {"error": "An error occurred while processing the request."}

@app.post("/api/upload-image")
async def upload_file(file: UploadFile, article_id: str):
    stage_file(minio_client, article_id, file.file, file.filename, file.size)

def generate_html(article_id: str, body_content: str, title: str):
    # Load HTML template
    with Path.open(Path(__file__).parent / 'templates' / 'index.html', encoding='utf-8') as file:
        html_template = file.read()

    # Render HTML template with provided data
    html_content = Template(html_template).render(title=title, scroll_trigger=True, body_content=body_content)

    # Use BeautifulSoup to pretty-print the HTML content
    soup = BeautifulSoup(html_content, "html.parser")
    formatted_html_content = soup.prettify()

    if IS_LOCAL:
        with open(Path(LOCAL_OUTPUT_DIR) / 'index.html', "wb") as f:
            f.write(formatted_html_content.encode())
    else:
        minio_client.put_object(MINIO_ARTICLE_BUCKET, f"{article_id}/index.html", io.BytesIO(formatted_html_content.encode()), length=len(formatted_html_content), content_type="text/html")


def generate_css(article_id: str, styling_content: str):
    # Load existing CSS content from the template file
    css_template_path = Path(__file__).parent / 'templates' / 'css' / 'styles.css'
    with css_template_path.open(encoding='utf-8') as file:
        template_css_content = file.read()

    # Concatenate the template CSS content with the provided styling content
    combined_css_content = f"{template_css_content.strip()}\n\n{styling_content.strip()}"

    if IS_LOCAL:
        with open(Path(LOCAL_OUTPUT_CSS_DIR) / 'styles.css', "wb") as f:
            f.write(combined_css_content.encode())
    else:
        minio_client.put_object(MINIO_ARTICLE_BUCKET, f"{article_id}/css/styles.css", io.BytesIO(combined_css_content.encode()), length=len(combined_css_content.encode()), content_type="text/css")

def generate_js(js_content: str):
    return 0


def handle_component_image(component: Component):
    image = component.image
    image_filename = f"{component.id}-{image.filename}"
    local_image_path = LOCAL_OUTPUT_IMAGE_DIR / image_filename

    # Save the image to the local directory
    with local_image_path.open("wb") as image_file:
        shutil.copyfileobj(image.file, image_file)  # Ensure image is saved in binary mode

    # Add the image HTML tag
    img_tag = f'<img id="{component.id}" class="image" src="{local_image_path}" alt="Uploaded Image">'

    return img_tag

# Returns html and css
def handle_component_content(component: Component):
    soup = BeautifulSoup(component.content, "html.parser")
    body_content = soup.body
    wrapper_div = soup.new_tag("div", id=component.id)

    for element in body_content.find_all(string=True):  # Find all text nodes inside body
        element.replace_with(element.strip())  # Strip leading/trailing whitespace

    if body_content:
        # Move all non-empty children of body into the new section
        for child in body_content.children:
            if isinstance(child, str) and child.strip() == "":  # Skip empty string nodes (newlines)
                continue
            wrapper_div.append(child.extract())

    # Extract style content if it exists
    style_content = soup.style
    css_output = style_content.string.strip() if style_content else ""

    return str(wrapper_div), str(css_output)


def parse_pinned_components(components: list[Component], index_start: int, section_index_id: int):
    pinned_html_section = ""
    pinned_css = ""

    pinned_section_id = components[index_start].animation.pinnedSectionId
    pinned_html_section += f'<section class="pinned-{section_index_id}" id="{pinned_section_id}">\n'

    pinned_left_content = ""
    pinned_right_content = ""
    pinned_center_content = ""

    break_index = -1

    for i in range(index_start, len(components)):
        component = components[i]
        if component.animation.pin:
            # Handle content and images for left and right positions
            if component.position == "left":
                if component.content:
                    left_content, left_content_css = handle_component_content(component)
                    pinned_left_content += left_content
                    pinned_css += left_content_css
                if component.image:
                    pinned_left_content += handle_component_image(component)

            if component.position == "right":
                if component.content:
                    right_content, right_content_css = handle_component_content(component)
                    pinned_right_content += right_content
                    pinned_css += right_content_css
                if component.image:
                    pinned_right_content += handle_component_image(component)

            if component.position == "center":
                if component.content:
                    center_content, center_content_css = handle_component_content(component)
                    pinned_center_content +=  center_content
                    pinned_css += center_content_css
                if component.image:
                    pinned_center_content += handle_component_image(component)
        else:
            break_index = i
            break

    if break_index == -1:
        break_index = len(components)

    if pinned_left_content != "":
        pinned_html_section += f'<div class="pinned-{section_index_id}-left">{pinned_left_content}</div>\n'

    if pinned_right_content != "":
        pinned_html_section += f'<div class="pinned-{section_index_id}-right">{pinned_right_content}</div>\n'

    if pinned_center_content != "":
        pinned_html_section += f'<div class="pinned-{section_index_id}-center">{pinned_center_content}</div>\n'

    pinned_html_section += '</section>\n'

    return pinned_html_section, pinned_css, break_index

def parse_components(article_id: str, components: list[Component], title: str):
    html_output = ""
    css_output = ""
    pinned_sections_count = 0
    index = 0

    while index < len(components):
        component = components[index]

        if component.animation.pin:
           pinned_html_section, pinned_css, break_at = parse_pinned_components(components, index_start=index, section_index_id=pinned_sections_count)
           pinned_sections_count += 1
           html_output += pinned_html_section + "\n"
           css_output += pinned_css + "\n"

           if break_at != -1:
               # Continue loop at next component in list that is not pinned
               index = break_at - 1
        else:
            if component.content:
                component_content, component_css = handle_component_content(component)
                html_output += component_content + "\n"
                css_output += component_css + "\n"

            if component.image:
                img_tag = handle_component_image(component)
                html_output += img_tag + "\n"

        index += 1
    
    generate_html(article_id, html_output, title)
    generate_css(article_id, css_output)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
