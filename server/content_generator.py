import io
import shutil
from pathlib import Path
from typing import Literal

from bs4 import BeautifulSoup
from jinja2 import Template

from server.model.component import Component
from server.utilities.constants import IS_LOCAL
from server.utilities.constants import LOCAL_OUTPUT_DIR
from server.utilities.constants import MINIO_ARTICLE_BUCKET
from server.utilities.constants import MINIO_CLIENT
from server.utilities.constants import MINIO_ENDPOINT

# Local output directory


def handle_pinned_component_content(component: Component, class_name: str) -> tuple[str, str]:
    soup = BeautifulSoup(component.content, "html.parser")
    body_content = soup.body
    wrapper_div = soup.new_tag("div", id=component.id, class_=class_name)

    for element in body_content.find_all(string=True):  # Find all text nodes inside body
        element.replace_with(element.strip())  # Strip leading/trailing whitespace

    if body_content:
        # Move all non-empty children of body into the new section
        for child in body_content.children:
            if isinstance(child, str) and not child.strip():  # Skip empty string nodes (newlines)
                continue
            wrapper_div.append(child.extract())

    # Extract style content if it exists
    style_content = soup.style
    css_output = style_content.string.strip() if style_content else ""

    # Handle css for making it pinned

    return str(wrapper_div), str(css_output)


def handle_pinned_component_image(article_id: str, component: Component, class_name: str) -> str:
    image = component.image
    # image_filename = f"{component.id}-{image.filename}"
    # local_image_path = LOCAL_OUTPUT_DIR / article_id / "image" / image_filename

    # # Save the image to the local directory
    # with local_image_path.open("wb") as image_file:
    #     shutil.copyfileobj(image.file, image_file)  # Ensure image is saved in binary mode

    # Add the image HTML tag
    return (
        f'<div class="{class_name}">'
        # f'<img id="{component.id}" class="image" src="{local_image_path}" alt="Uploaded Image">'
        f"</div>"
    )


def handle_component_image(article_id: str, component: Component) -> str:
    image = component.image
    # image_filename = f"{component.id}-{image.filename}"
    # local_image_path = LOCAL_OUTPUT_DIR / article_id / "image" / image_filename

    # # Save the image to the local directory
    # with local_image_path.open("wb") as image_file:
    #     shutil.copyfileobj(image.file, image_file)  # Ensure image is saved in binary mode

    # Add the image HTML tag
    # return f'<img id="{component.id}" class="image" src="{local_image_path}" alt="Uploaded Image">'
    return "ok"


# Returns html and css
def handle_component_content(component: Component) -> tuple[str, str]:
    soup = BeautifulSoup(component.content, "html.parser")
    body_content = soup.body
    wrapper_div = soup.new_tag("div", id=component.id)

    for element in body_content.find_all(string=True):  # Find all text nodes inside body
        element.replace_with(element.strip())  # Strip leading/trailing whitespace

    if body_content:
        # Move all non-empty children of body into the new section
        for child in body_content.children:
            if isinstance(child, str) and not child.strip():  # Skip empty string nodes (newlines)
                continue
            wrapper_div.append(child.extract())

    # Extract style content if it exists
    style_content = soup.style
    css_output = style_content.string.strip() if style_content else ""

    return str(wrapper_div), str(css_output)


def handle_component_js(
    component_type: Literal["image", "text"],
    component_position: Literal["left", "right", "center"],
    component_transition: Literal["fade-in", "overlap"],
    section_index_id: int,
) -> str:
    js_image_output = f'gsap.set(".pinned-{section_index_id}-{component_position}-component", {{zIndex: (i, target, targets) => targets.length - i}});\n'  # noqa: E501
    js_image_output += f"var images{section_index_id} = gsap.utils.toArray('.pinned-{section_index_id}-{component_position}-component');\n"  # noqa: E501
    js_image_output += f"""
        images{section_index_id}.forEach((image, i) => {{
            var t{section_index_id} = gsap.timeline({{

                scrollTrigger: {{
                    trigger: "section.pinned-{section_index_id}",
                    scroller: ".scroller",
                    start: () => "top -" + (window.innerHeight * i),
                    end: () => "+=" + window.innerHeight,
                    scrub: true,
                    toggleActions: "play none reverse none",
                    invalidateOnRefresh: true,
                }}

            }})\n
    """
    if component_transition == "fade-in":
        js_image_output += f"""
            t{section_index_id}.to(image, {{opacity: 1, autoAlpha: 1, duration: 0.33}})
              .to(image, {{opacity: 0, duration: 0.33}});
        }});\n
        """

    js_image_output += f"""
        ScrollTrigger.create({{
            trigger: "section.pinned-{section_index_id}",
            scroller: ".scroller",
            scrub: true,
            markers: true,
            pin: true,
            start: () => "top top",
            end: () => "+=" + ((images{section_index_id}.length) * window.innerHeight),
            invalidateOnRefresh: true,
        }});\n
        """
    js_text_output = f'gsap.set(".pinned-{section_index_id}-left-component", {{zIndex: (i, target, targets) => targets.length - i}});\n'  # noqa: E501
    js_text_output += f"var texts = gsap.utils.toArray('.pinned-{section_index_id}-left-component');\n"
    js_text_output += f"""
        texts.forEach((text, i) => {{
            var t{section_index_id} = gsap.timeline({{

                scrollTrigger: {{
                    trigger: "section.pinned-{section_index_id}",
                    scroller: ".scroller",
                    start: () => "top -" + (window.innerHeight * i),
                    end: () => "+=" + window.innerHeight,
                    scrub: true,
                    toggleActions: "play none reverse none",
                    invalidateOnRefresh: true,
                }}

            }})

            t{section_index_id}.to(text, {{ duration: 0.33, opacity: 1, y: "30%" }})
            .to(text, {{ duration: 0.33, opacity: 0, y: "0%" }}, 0.66);

        }});\n
    """
    if component_position == "center" and component_type == "image":
        return js_image_output
    if component_position == "center" and component_type == "text":
        return js_text_output
    if component_position != "center" and component_type == "image":
        return js_image_output
    return js_text_output


def generate_html(article_id: str, body_content: str, title: str) -> None:
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
        MINIO_ARTICLE_BUCKET,
        f"{article_id}/index.html",
        io.BytesIO(formatted_html_content.encode()),
        length=len(formatted_html_content),
        content_type="text/html",
    )
    return f"{MINIO_ENDPOINT.replace('minio', 'localhost')}/{MINIO_ARTICLE_BUCKET}/{article_id}/index.html"


def generate_css(article_id: str, styling_content: str) -> None:
    # Load existing CSS content from the template file
    css_template_path = Path(__file__).parent / "templates" / "css" / "styles.css"
    with css_template_path.open(encoding="utf-8") as file:
        template_css_content = file.read()

    # Concatenate the template CSS content with the provided styling content
    combined_css_content = f"{template_css_content.strip()}\n\n{styling_content.strip()}"

    if IS_LOCAL:
        Path.mkdir(LOCAL_OUTPUT_DIR / article_id / "css", parents=True, exist_ok=True)
        Path(LOCAL_OUTPUT_DIR / article_id / "css" / "styles.css").write_bytes(combined_css_content.encode())
    else:
        MINIO_CLIENT.put_object(
            MINIO_ARTICLE_BUCKET,
            f"{article_id}/css/styles.css",
            io.BytesIO(combined_css_content.encode()),
            length=len(combined_css_content.encode()),
            content_type="text/css",
        )


def generate_js(article_id: str, js_content: str) -> None:
    # Load existing JS content from the template file
    js_template_path = Path(__file__).parent / "templates" / "js" / "animation.js"
    with js_template_path.open(encoding="utf-8") as file:
        template_js_content = file.read()

    combined_js_content = f"{template_js_content.strip()}\n{js_content.strip()}"

    if IS_LOCAL:
        Path.mkdir(LOCAL_OUTPUT_DIR / article_id / "js", parents=True, exist_ok=True)
        Path(LOCAL_OUTPUT_DIR / article_id / "js" / "animation.js").write_bytes(combined_js_content.encode())
    else:
        MINIO_CLIENT.put_object(
            MINIO_ARTICLE_BUCKET,
            f"{article_id}/js/animation.js",
            io.BytesIO(combined_js_content.encode()),
            length=len(combined_js_content.encode()),
            content_type="text/javascript",
        )
