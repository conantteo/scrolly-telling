import shutil
import tempfile
from pathlib import Path

from bs4 import BeautifulSoup

from server.model.component import Component
from jinja2 import Template


# Local output directory
LOCAL_OUTPUT_DIR = Path(__file__).parent / 'output'
LOCAL_OUTPUT_JS_DIR = Path(LOCAL_OUTPUT_DIR) / 'js'
LOCAL_OUTPUT_GSAP_DIR = Path(LOCAL_OUTPUT_DIR) / 'js' / 'gsap'
LOCAL_OUTPUT_CSS_DIR = Path(LOCAL_OUTPUT_DIR) / 'css'
LOCAL_OUTPUT_IMAGE_DIR = Path(LOCAL_OUTPUT_DIR) / 'images'

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