import logging
import os
import shutil
import tempfile
import typing
from pathlib import Path
import uvicorn

from bs4 import BeautifulSoup
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from jinja2 import Template
from minio import Minio
from minio.error import S3Error

from server.model.article import Article
from server.model.component import Component
from server.model.plugin_registration import PluginRegistration
from server.utilities.utils import generate_js_function

from server.test_minio import test

logger = logging.getLogger(__name__)

IS_LOCAL = os.environ.get('FLASK_ENV') == 'development'

# Local output directory
LOCAL_OUTPUT_DIR = Path(__file__).parent / 'output'
LOCAL_OUTPUT_JS_DIR = Path(LOCAL_OUTPUT_DIR) / 'js'
LOCAL_OUTPUT_GSAP_DIR = Path(LOCAL_OUTPUT_DIR) / 'js' / 'gsap'
LOCAL_OUTPUT_CSS_DIR = Path(LOCAL_OUTPUT_DIR) / 'css'
LOCAL_OUTPUT_IMAGE_DIR = Path(LOCAL_OUTPUT_DIR) / 'images'

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

@app.post("/api/generate-website")
async def generate_website(request_body: Article) -> str:
    try:
        # Extract the values from the request body
        title = request_body.title if request_body.title is not None else 'My Animated Website'
        scroll_trigger = request_body.scroll_trigger
        components = request_body.components

        # Print the values for debugging
        print(title)
        print(scroll_trigger)

        # Process the components and generate HTML content
        parse_components(components, title)
        return "ok"

    except Exception as e:
        # Handle the exception and log the error
        print(f"Error occurred: {e}")
        # You can return an appropriate error message or raise a custom exception
        return {"error": "An error occurred while processing the request."}


def generate_html(body_content: str, title: str):
    # Load HTML template
    with Path.open(Path(__file__).parent / 'templates' / 'index.html', encoding='utf-8') as file:
        html_template = file.read()

    # Render HTML template with provided data
    html_content = Template(html_template).render(title=title, scroll_trigger=True, body_content=body_content)

    # Use BeautifulSoup to pretty-print the HTML content
    soup = BeautifulSoup(html_content, "html.parser")
    formatted_html_content = soup.prettify()

    # Write to local temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix='.html') as html_file:
        html_file.write(formatted_html_content.encode())
        html_filename = html_file.name
     # Write to local file directory
    shutil.copy(html_filename, Path(LOCAL_OUTPUT_DIR) / 'index.html')


def generate_css(styling_content: str):
    # Load existing CSS content from the template file
    css_template_path = Path(__file__).parent / 'templates' / 'css' / 'styles.css'
    with css_template_path.open(encoding='utf-8') as file:
        template_css_content = file.read()

    # Concatenate the template CSS content with the provided styling content
    combined_css_content = f"{template_css_content.strip()}\n\n{styling_content.strip()}"

    # Create temporary CSS file with the combined content
    with tempfile.NamedTemporaryFile(delete=False, suffix='.css') as css_file:
        css_file.write(combined_css_content.encode())
        css_filename = css_file.name

    # Copy the temporary CSS file to the desired output directory
    output_css_path = Path(LOCAL_OUTPUT_CSS_DIR) / 'styles.css'
    shutil.copy(css_filename, output_css_path)


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

    return str(wrapper_div)

def parse_pinned_components(components: list[Component], index_start: int, section_index_id: int):
    pinned_html_section = ""
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
                    pinned_left_content += handle_component_content(component)
                if component.image:
                    pinned_left_content += handle_component_image(component)

            if component.position == "right":
                if component.content:
                    pinned_right_content += handle_component_content(component)
                if component.image:
                    pinned_right_content += handle_component_image(component)

            if component.position == "center":
                if component.content:
                    pinned_center_content += handle_component_content(component)
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

    return pinned_html_section, break_index


def parse_components(components: list[Component], title: str):
    html_output = ""
    css_output = ""
    pinned_sections_count = 0
    index = 0

    while index < len(components):
        component = components[index]

        if component.animation.pin:
           pinned_html_section, break_at = parse_pinned_components(components, index_start=index, section_index_id=pinned_sections_count)
           pinned_sections_count += 1
           html_output += pinned_html_section + "\n"

           if break_at != -1:
               index = break_at - 1

        else:
            if component.content:  # If content is not empty
                component_content = handle_component_content(component)
                html_output += component_content + "\n"

                # Extract the style content
                soup = BeautifulSoup(component.content, "html.parser")
                style_content = soup.style
                if style_content:
                    css_output += style_content.string + "\n"

            if component.image:
                img_tag = handle_component_image(component)
                html_output += img_tag + "\n"

        index += 1

    generate_html(html_output, title)
    generate_css(css_output)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
    test()