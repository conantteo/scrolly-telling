import io
import re
from pathlib import Path
from typing import List

from bs4 import BeautifulSoup
from jinja2 import Template

from server.model.component import Component
from server.model.frame import Frame
from server.model.layout import Layout
from server.utilities.constants import BUCKET
from server.utilities.constants import CDN_URL
from server.utilities.constants import LOCAL_OUTPUT_DIR
from server.utilities.constants import MINIO_CLIENT
from server.utilities.constants import MINIO_PREVIEW_ENDPOINT
from server.utilities.constants import MINIO_PRIVATE_ARTICLE_BUCKET
from server.utilities.constants import MINIO_SCHEME
from server.utilities.constants import S3_BUCKET
from server.utilities.constants import S3_CLIENT

#################################################################################################################
################################################ HTML ###########################################################
#################################################################################################################


def generate_component_html(component, position_class_name, article_id, frame_index):
    """Helper function to generate the HTML for components."""
    if component.type == "text":
        return generate_text_component_as_html(component, position_class_name)
    elif component.type == "image":
        return generate_image_component_as_html(component, position_class_name, article_id, frame_index)
    return ""


# Wrap each component with class <page>-<position>-component so that it is identifiable by JS
def generate_text_component_as_html(component: Component, class_name: str):
    div_wrapper = f'<div class="{class_name}" id="comp-{component.id}">'

    # Contains inline stylings provided by Rich Text Editor
    content_html = component.contentHtml
    text_component_html = f"{div_wrapper}{content_html}</div>"
    return text_component_html


# Wrap each component with class <page>-<position>-component so that it is identifiable by JS
def generate_image_component_as_html(component: Component, class_name: str, article_id: str, frame_index: int) -> str:
    # Indicate in class if image is in first frame with "first-image"
    additional_class = "first-image" if frame_index == 0 else ""
    div_wrapper = f'<figure class="{class_name} {additional_class}" id="comp-{component.id}" >'
    if BUCKET == "S3":
        minio_url = f"images/{component.image.data}"
    else:
        minio_url = f"{MINIO_SCHEME}://{MINIO_PREVIEW_ENDPOINT}/{MINIO_PRIVATE_ARTICLE_BUCKET}/{article_id}/images/{component.image.data}"
    div_wrapper += f'<img src="{minio_url}" alt="Image" />'
    if component.image.caption:
        div_wrapper += f"<figcaption>{component.image.caption}</figcaption>"
    div_wrapper += "</figure>"

    return div_wrapper


def prettify_except(soup_obj: BeautifulSoup, tag_name: str) -> str:
    regex_string = f"<{tag_name}>.*?</{tag_name}>"
    regex = re.compile(regex_string, re.DOTALL)
    prettified_text = soup_obj.prettify()
    to_replace = re.findall(regex, prettified_text)
    for txt in to_replace:
        prettified_text = re.sub(
            txt,
            f"<{tag_name}>{txt.replace(f'<{tag_name}>', '').replace(f'</{tag_name}>', '').strip()}</{tag_name}>",
            prettified_text,
        )
    return prettified_text


def generate_html(article_id: str, body_content: str, title: str) -> str:
    # Load HTML template
    with Path.open(Path(__file__).parent / "templates" / "index.html", encoding="utf-8") as file:
        html_template = file.read()
        if CDN_URL:
            html_template = html_template.replace("https://cdn.jsdelivr.net", f"{CDN_URL}/cdn.jsdelivr.net")
            html_template = html_template.replace("https://cdnjs.cloudflare.com", f"{CDN_URL}/cdnjs.cloudflare.com")

    # Render HTML template with provided data
    html_content = Template(html_template).render(title=title, scroll_trigger=True, body_content=body_content)

    # Use BeautifulSoup to pretty-print the HTML content
    soup = BeautifulSoup(html_content, "html.parser")
    formatted_html_content = prettify_except(soup, "u")

    if BUCKET == "LOCAL":
        Path.mkdir(LOCAL_OUTPUT_DIR / article_id, parents=True, exist_ok=True)
        Path(LOCAL_OUTPUT_DIR / article_id / "index.html").write_bytes(formatted_html_content.encode())
        return str(Path(LOCAL_OUTPUT_DIR / article_id / "index.html"))
    if BUCKET == "MINIO":
        MINIO_CLIENT.put_object(
            MINIO_PRIVATE_ARTICLE_BUCKET,
            f"{article_id}/index.html",
            io.BytesIO(formatted_html_content.encode()),
            length=len(formatted_html_content.encode()),
            content_type="text/html",
        )
        return f"{MINIO_SCHEME}://{MINIO_PREVIEW_ENDPOINT}/{MINIO_PRIVATE_ARTICLE_BUCKET}/{article_id}/index.html"
    S3_CLIENT.put_object(
        Body=io.BytesIO(formatted_html_content.encode()),
        Bucket=S3_BUCKET,
        ServerSideEncryption="AES256",
        Key=f"private-articles/{article_id}/index.html",
        ContentType="text/html",
    )
    return None


#################################################################################################################
################################################ CSS STYLING ####################################################
#################################################################################################################


def generate_css_id_block(tag_class: str, rules: dict) -> str:
    """Helper function to generate CSS blocks dynamically."""
    css = f"#{tag_class} {{\n"
    for property_name, value in rules.items():
        css += f"    {property_name}: {value};\n"
    css += "}\n"
    return css


def generate_css_class_block(tag_id: str, rules: dict) -> str:
    """Helper function to generate CSS blocks dynamically."""
    css = f".{tag_id} {{\n"
    for property_name, value in rules.items():
        css += f"    {property_name}: {value};\n"
    css += "}\n"
    return css


def generate_left_right_css(tag_id: str, layout: Layout) -> str:
    """Generate CSS for left-right template."""
    left_width = layout.widthLeft if layout.widthLeft else "50%"
    right_width = layout.widthRight if layout.widthRight else "50%"
    css = ""

    # Parent container
    css += generate_css_id_block(
        f"page-{tag_id}",
        {
            "display": "flex",
            "justify-content": "space-around",
            "align-items": "center",
            "height": "100vh",
            # "background-color": "#fff",
            "padding-left": "40px",
            "padding-right": "40px",
            "max-width": "60%",
            "margin-left": "auto",
            "margin-right": "auto",
        },
    )

    # Left section
    css += generate_css_id_block(
        f"page-{tag_id}-left",
        {
            "display": "flex",
            "flex-direction": "column",
            "justify-content": "center",
            "align-items": "center",
            "position": "relative",
            "width": left_width,
            "height": "100vh",
            "margin-right": "10px",
        },
    )

    # Right section
    css += generate_css_id_block(
        f"page-{tag_id}-right",
        {
            "display": "flex",
            "flex-direction": "column",
            "justify-content": "center",
            "align-items": "center",
            "position": "relative",
            "width": right_width,
            "height": "100vh",
            "margin-left": "10px",
        },
    )

    return css


def generate_top_bottom_css(page_id: str, layout: Layout) -> str:
    """Generate CSS for top-bottom template."""
    top_height = layout.heightTop if layout.heightTop else "20%"
    bottom_height = layout.heightBottom if layout.heightBottom else "80%"
    css = ""

    # Parent container
    css += generate_css_id_block(
        f"page-{page_id}",
        {
            "display": "flex",
            "flex-direction": "column",
            "justify-content": "center",
            "align-items": "center",
            "height": "100vh",
            # "background-color": "#fff",
            "padding-left": "40px",
            "padding-right": "40px",
        },
    )

    # Top section
    css += generate_css_id_block(
        f"page-{page_id}-top",
        {
            "display": "flex",
            "justify-content": "center",
            "align-items": "flex-end",
            "width": "60%",
            "height": top_height,
            "background-color": "transparent",
            "position": "relative",
        },
    )

    # Bottom section
    css += generate_css_id_block(
        f"page-{page_id}-bottom",
        {
            "display": "flex",
            "justify-content": "center",
            "align-items": "flex-start",
            "width": "60%",
            "height": bottom_height,
            "background-color": "transparent",
            "position": "relative",
            "padding-top": "40px",
        },
    )

    return css


def generate_single_css(page_id: str) -> str:
    """Generate CSS for single template."""
    return generate_css_id_block(
        f"page-{page_id}",
        {
            "display": "flex",
            "justify-content": "center",
            "align-items": "center",
            "height": "100vh",
            # "background-color": "#fff",
            "padding-left": "40px",
            "padding-right": "40px",
        },
    )


def inject_pinned_page_css(layout: Layout, page_id: str) -> str:
    """Main function to generate CSS based on layout template."""
    template = layout.template

    if template == "left-right":
        return generate_left_right_css(page_id, layout)
    elif template == "top-bottom":
        return generate_top_bottom_css(page_id, layout)
    elif template == "single":
        return generate_single_css(page_id)
    else:
        return ""


def inject_page_css(layout: Layout, page_id: str) -> str:
    """Main function to generate CSS based on layout template."""
    template = layout.template

    if template == "left-right":
        return generate_left_right_css(page_id, layout)
    elif template == "top-bottom":
        return generate_top_bottom_css(page_id, layout)
    elif template == "single":
        return generate_single_css(page_id)
    else:
        return ""


def generate_left_right_component_css(page_id: str, first_frame_components: List[Component]):
    css = ""

    # Assume there is always a pair of text and image in opposing sides
    for component in first_frame_components:
        if component.type == "text":
            css += generate_css_class_block(
                f"page-{page_id}-{component.position}-component",
                {
                    "position": "absolute",
                    "width": "100%",
                    "max-width": "500px",
                    "height": "100%",
                    "text-align": "left",
                    "opacity": "1",
                    "z-index": "1",
                    "background-color": "transparent",
                    "display": "flex",  # Ensure it's a flex container
                    "justify-content": "center",
                    "align-items": "flex-start",
                    "flex-direction": "column",
                },
            )
        else:
            css += generate_css_class_block(
                f"page-{page_id}-{component.position}-component",
                {
                    "position": "absolute",
                    "width": "100%",
                    "height": "100%",
                    "display": "flex",
                    "justify-content": "center",
                    "align-items": "center",
                    "opacity": "1",
                    "flex-direction": "column",
                },
            )

    return css


def generate_top_bottom_component_css(page_id: str, first_frame_components: List[Component]):
    css = ""

    # Assume there is always a pair of text and image in opposing sides
    for component in first_frame_components:
        if component.type == "text":
            css += generate_css_class_block(
                f"page-{page_id}-{component.position}-component",
                {
                    "text-align": "left",
                    "line-height": "1.5",
                    "position": "absolute",
                    "width": "100%",
                    "height": "100%",
                    "display": "flex",
                    "justify-content": "end",
                    "flex-direction": "column",
                    "padding-top": "25px",
                },
            )
        else:
            css += generate_css_class_block(
                f"page-{page_id}-{component.position}-component",
                {
                    "position": "absolute",
                    "width": "100%",
                    "height": "80%",
                    "display": "flex",
                    "justify-content": "flex-start" if component.position == "bottom" else "flex-end",
                    "align-items": "center",
                    "opacity": "1",
                    "flex-direction": "column",
                },
            )

    return css


def generate_center_component_css(page_id: str, first_frame_components: List[Component], pinnable: bool):
    css = ""

    # Assume there is only one image per frame for each page, hard code width to 60%
    for component in first_frame_components:
        if component.type == "image":
            if pinnable:
                if component.image.isDisplayFullscreen:
                    # Set max width/height to image
                    css += generate_css_class_block(
                        f"page-{page_id}-center-component img",
                        {"width": "100%", "height": "100%", "object-fit": "cover"},
                    )
                    css += generate_css_class_block(
                        f"page-{page_id}-center-component",
                        {
                            "position": "absolute",
                            "justify-content": "center",
                            "align-items": "center",
                            "display": "flex",
                        },
                    )
                else:
                    # Set default max width to image
                    css += generate_css_class_block(
                        f"page-{page_id}-center-component img",
                        {
                            "max-width": "100%",
                            "height": "auto",
                        },
                    )

                    css += generate_css_class_block(
                        f"page-{page_id}-center-component",
                        {
                            "position": "absolute",
                            "justify-content": "center",
                            "align-items": "center",
                            "display": "flex",
                            "max-width": "60%",
                        },
                    )
            elif component.image.isDisplayFullscreen:
                css += generate_css_id_block(
                    f"page-{page_id}",
                    {"max-width": "100%", "height": "100%", "padding": "0px"},
                )
                css += generate_css_class_block(
                    f"page-{page_id}-center-component",
                    {"justify-content": "center", "align-items": "center", "height": "100%", "width": "100%"},
                )

                css += generate_css_class_block(
                    f"page-{page_id}-center-component img",
                    {"width": "100%", "height": "100%", "object-fit": "cover"},
                )
            else:
                css += generate_css_class_block(
                    f"page-{page_id}-center-component",
                    {"justify-content": "center", "align-items": "center", "max-width": "60%"},
                )

                css += generate_css_class_block(
                    f"page-{page_id}-center-component img",
                    {
                        "width": "100%",
                        "height": "100%",
                    },
                )
        else:
            css += generate_css_class_block(
                f"page-{page_id}-center-component",
                {
                    "justify-content": "center",
                    "display": "flex",
                    "flex-direction": "column",
                    "text-align": "left",
                    "max-width": "60%",
                },
            )
    return css


# Assumes in left-right / top-bottom template, there will always be one image and one text in either section for each frame
def inject_component_css(layout: Layout, frames: List[Frame], page_id: str, pinnable: bool):
    template = layout.template

    # Check first frame to identify which position is image and text
    first_frame_components = frames[0].components
    if template == "left-right":
        return generate_left_right_component_css(page_id, first_frame_components)

    elif template == "top-bottom":
        return generate_top_bottom_component_css(page_id, first_frame_components)
    elif template == "single":
        return generate_center_component_css(page_id, first_frame_components, pinnable)
    else:
        return ""


def generate_css(article_id: str, styling_content: str) -> None:
    # Load existing CSS content from the template file
    css_template_path = Path(__file__).parent / "templates" / "css" / "styles.css"
    with css_template_path.open(encoding="utf-8") as file:
        template_css_content = file.read()

    # Concatenate the template CSS content with the provided styling content
    combined_css_content = f"{template_css_content.strip()}\n\n{styling_content.strip()}"

    if BUCKET == "LOCAL":
        Path.mkdir(LOCAL_OUTPUT_DIR / article_id / "css", parents=True, exist_ok=True)
        Path(LOCAL_OUTPUT_DIR / article_id / "css" / "styles.css").write_bytes(combined_css_content.encode())
    elif BUCKET == "MINIO":
        MINIO_CLIENT.put_object(
            MINIO_PRIVATE_ARTICLE_BUCKET,
            f"{article_id}/css/styles.css",
            io.BytesIO(combined_css_content.encode()),
            length=len(combined_css_content.encode()),
            content_type="text/css",
        )
    else:
        S3_CLIENT.put_object(
            Body=io.BytesIO(combined_css_content.encode()),
            Bucket=S3_BUCKET,
            ServerSideEncryption="AES256",
            Key=f"private-articles/{article_id}/css/styles.css",
            ContentType="text/css",
        )
