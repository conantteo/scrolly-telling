import io
import shutil
from pathlib import Path

from bs4 import BeautifulSoup
from jinja2 import Template

from server.model.component import Component
from server.utilities.constants import IS_LOCAL
from server.utilities.constants import LOCAL_OUTPUT_DIR
from server.utilities.constants import MINIO_PRIVATE_ARTICLE_BUCKET
from server.utilities.constants import MINIO_CLIENT
from server.utilities.constants import MINIO_ENDPOINT

def generate_component_html(component, position_class_name, article_id, frame_index):
    """Helper function to generate the HTML for components."""
    if component.type == "text":
        return generate_text_component_as_html(component, position_class_name)
    elif component.type == "image":
        return generate_image_component_as_html(component, position_class_name, article_id, frame_index)
    return ""



# Wrap each component with class <page>-<position>-component so that it is identifiable by JS
def generate_text_component_as_html(component: Component, class_name: str):
    div_wrapper = f'<div class="{class_name}" id="{component.id}">'

    # Contains inline stylings provided by Rich Text Editor
    content_html = component.contentHtml
    text_component_html = f"{div_wrapper}{content_html}</div>"
    return text_component_html


# Wrap each component with class <page>-<position>-component so that it is identifiable by JS

def generate_image_component_as_html(component: Component, class_name: str, article_id: str, frame_index: int):
    # Indicate in class if image is in first frame with "first-image"
    additional_class = "first-image" if frame_index == 0 else ""
    div_wrapper = f'<div class="{class_name} {additional_class}" id="{component.id}" >'
    minio_url = "http://minio-url/articleId/1.png"
    div_wrapper += f'<img src="{minio_url}" alt="Image" />'
    div_wrapper += '</div>'

    return div_wrapper


# def handle_pinned_component_content(component: Component, class_name: str) -> tuple[str, str]:
#     soup = BeautifulSoup(component.content, "html.parser")
#     body_content = soup.body
#     wrapper_div = soup.new_tag("div", id=component.id, class_=class_name)
#
#     for element in body_content.find_all(string=True):  # Find all text nodes inside body
#         element.replace_with(element.strip())  # Strip leading/trailing whitespace
#
#     if body_content:
#         # Move all non-empty children of body into the new section
#         for child in body_content.children:
#             if isinstance(child, str) and not child.strip():  # Skip empty string nodes (newlines)
#                 continue
#             wrapper_div.append(child.extract())
#
#     # Extract style content if it exists
#     style_content = soup.style
#     css_output = style_content.string.strip() if style_content else ""
#
#     # Handle css for making it pinned
#
#     return str(wrapper_div), str(css_output)
#
#
# def handle_pinned_component_image(article_id: str, component: Component, class_name: str) -> str:
#     image = component.image
#     image_filename = f"{component.id}-{image.filename}"
#     local_image_path = LOCAL_OUTPUT_DIR / article_id / "image" / image_filename
#
#     # Save the image to the local directory
#     with local_image_path.open("wb") as image_file:
#         shutil.copyfileobj(image.file, image_file)  # Ensure image is saved in binary mode
#
#     # Add the image HTML tag
#     return (
#         f'<div class="{class_name}">'
#         f'<img id="{component.id}" class="image" src="{local_image_path}" alt="Uploaded Image">'
#         f"</div>"
#     )
#
#
# def handle_component_image(article_id: str, component: Component) -> str:
#     image = component.image
#     image_filename = f"{component.id}-{image.filename}"
#     local_image_path = LOCAL_OUTPUT_DIR / article_id / "image" / image_filename
#
#     # Save the image to the local directory
#     with local_image_path.open("wb") as image_file:
#         shutil.copyfileobj(image.file, image_file)  # Ensure image is saved in binary mode
#
#     # Add the image HTML tag
#     return f'<img id="{component.id}" class="image" src="{local_image_path}" alt="Uploaded Image">'
#
#
# # Returns html and css
# def handle_component_content(component: Component) -> tuple[str, str]:
#     soup = BeautifulSoup(component.content, "html.parser")
#     body_content = soup.body
#     wrapper_div = soup.new_tag("div", id=component.id)
#
#     for element in body_content.find_all(string=True):  # Find all text nodes inside body
#         element.replace_with(element.strip())  # Strip leading/trailing whitespace
#
#     if body_content:
#         # Move all non-empty children of body into the new section
#         for child in body_content.children:
#             if isinstance(child, str) and not child.strip():  # Skip empty string nodes (newlines)
#                 continue
#             wrapper_div.append(child.extract())
#
#     # Extract style content if it exists
#     style_content = soup.style
#     css_output = style_content.string.strip() if style_content else ""
#
#     return str(wrapper_div), str(css_output)
#

def generate_html(article_id: str, body_content: str, title: str) -> str:
    # Load HTML template
    with Path.open(Path(__file__).parent / "templates" / "index.html", encoding="utf-8") as file:
        html_template = file.read()

    # Render HTML template with provided data
    html_content = Template(html_template).render(title=title, scroll_trigger=True, body_content=body_content)

    # Use BeautifulSoup to pretty-print the HTML content
    soup = BeautifulSoup(html_content, "html.parser")
    formatted_html_content = soup.prettify()

    if IS_LOCAL:
        Path.mkdir(LOCAL_OUTPUT_DIR / article_id, parents=True, exist_ok=True)
        Path(LOCAL_OUTPUT_DIR / article_id / "index.html").write_bytes(formatted_html_content.encode())
        return str(Path(LOCAL_OUTPUT_DIR / article_id / "index.html"))
    MINIO_CLIENT.put_object(
        MINIO_PRIVATE_ARTICLE_BUCKET,
        f"{article_id}/index.html",
        io.BytesIO(formatted_html_content.encode()),
        length=len(formatted_html_content),
        content_type="text/html",
    )
    return f"{MINIO_ENDPOINT.replace('minio', 'localhost')}/{MINIO_PRIVATE_ARTICLE_BUCKET}/{article_id}/index.html"
#
#
# def generate_css(article_id: str, styling_content: str) -> None:
#     # Load existing CSS content from the template file
#     css_template_path = Path(__file__).parent / "templates" / "css" / "styles.css"
#     with css_template_path.open(encoding="utf-8") as file:
#         template_css_content = file.read()
#
#     # Concatenate the template CSS content with the provided styling content
#     combined_css_content = f"{template_css_content.strip()}\n\n{styling_content.strip()}"
#
#     if IS_LOCAL:
#         Path.mkdir(LOCAL_OUTPUT_DIR / article_id / "css", parents=True, exist_ok=True)
#         Path(LOCAL_OUTPUT_DIR / article_id / "css" / "styles.css").write_bytes(combined_css_content.encode())
#     else:
#         MINIO_CLIENT.put_object(
#             MINIO_PRIVATE_ARTICLE_BUCKET,
#             f"{article_id}/css/styles.css",
#             io.BytesIO(combined_css_content.encode()),
#             length=len(combined_css_content.encode()),
#             content_type="text/css",
#         )
