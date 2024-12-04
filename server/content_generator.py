import shutil
import tempfile
import io
from pathlib import Path

from bs4 import BeautifulSoup

from server.model.component import Component
from jinja2 import Template

from server.utilities.constants import (
    IS_LOCAL,
    LOCAL_OUTPUT_CSS_DIR, 
    LOCAL_OUTPUT_DIR, 
    LOCAL_OUTPUT_IMAGE_DIR,
    MINIO_ARTICLE_BUCKET
)

# Local output directory

def handle_pinned_component_content(component: Component, class_name: str):
    soup = BeautifulSoup(component.content, "html.parser")
    body_content = soup.body
    wrapper_div = soup.new_tag("div", id=component.id, class_=class_name)

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

    # Handle css for making it pinned


    return str(wrapper_div), str(css_output)


def handle_pinned_component_image(component: Component, class_name: str):
    image = component.image
    image_filename = f"{component.id}-{image.filename}"
    local_image_path = LOCAL_OUTPUT_IMAGE_DIR / image_filename

    # Save the image to the local directory
    with local_image_path.open("wb") as image_file:
        shutil.copyfileobj(image.file, image_file)  # Ensure image is saved in binary mode

    # Add the image HTML tag
    img_tag = (
        f'<div class="{class_name}">'
        f'<img id="{component.id}" class="image" src="{local_image_path}" alt="Uploaded Image">'
        f'</div>'
    )

    # Handle css for making it pinned

    return img_tag

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


def generate_html(minio_client, article_id: str, body_content: str, title: str):
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



def generate_css(minio_client, article_id: str, styling_content: str):
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
