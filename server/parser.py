from typing import List
from typing import Tuple

from server.content_generator import generate_component_html
from server.content_generator import generate_css
from server.content_generator import generate_html
from server.content_generator import inject_component_css
from server.content_generator import inject_pinned_page_css
from server.model.component import Component
from server.model.page import Page
from server.model.script.script_generator import ScriptGenerator


def process_pages(article_id: str, pages: list[Page], title: str) -> str:
    html_output = ""
    css_output = ""

    for page in pages:
        pinnable = page.pinnable
        if pinnable:
            html_page = parse_pinned_page_to_html(page, article_id)
            html_output += html_page + "\n"
            css_output += inject_pinned_page_css(page.layout, page.id) + "\n"
            css_output += inject_component_css(page.layout, page.frames, page.id, pinnable) + "\n"

        else:
            html_page = parse_page_to_html(page, article_id)
            html_output += html_page + "\n"
            css_output += inject_component_css(page.layout, page.frames, page.id, pinnable) + "\n"

    message = generate_html(article_id, html_output, title)
    generate_css(article_id, css_output)
    script_generator = ScriptGenerator(pages, article_id)
    script_generator.generate_and_export()
    return message


def parse_pinned_page_to_html(page: Page, article_id: str) -> str:
    pinned_section_wrapper = f'<section id="page-{page.id}">'

    # left-right, top-bottom, single
    layout_template = page.layout.template
    components_by_position = {"left": [], "right": [], "top": [], "bottom": [], "center": []}

    # Map components by their position
    for frame_index, frame in enumerate(page.frames):
        for component in frame.components:
            if component.position in components_by_position:
                components_by_position[component.position].append((component, frame_index))

    # Helper function to build div HTML for left-right and top-bottom templates
    def build_section_html(position: str, position_components: List[Tuple[Component, int]]) -> str:
        div_wrapper = f'<div id="page-{page.id}-{position}">'
        component_class_name = "page-" + page.id + "-" + position + "-component"
        for component, frame_index in position_components:
            div_wrapper += generate_component_html(component, component_class_name, article_id, frame_index)
        div_wrapper += "</div>"
        return div_wrapper

    if layout_template == "left-right":
        # Build left and right sections
        pinned_section_wrapper += build_section_html("left", components_by_position["left"])
        pinned_section_wrapper += build_section_html("right", components_by_position["right"])

    elif layout_template == "top-bottom":
        # Build top and bottom sections
        pinned_section_wrapper += build_section_html("top", components_by_position["top"])
        pinned_section_wrapper += build_section_html("bottom", components_by_position["bottom"])

    elif layout_template == "single":
        position_components = components_by_position["center"]
        component_class_name = "page-" + page.id + "-center-component"
        for component, frame_index in position_components:
            pinned_section_wrapper += generate_component_html(component, component_class_name, article_id, frame_index)

    pinned_section_wrapper += "</section>"
    return pinned_section_wrapper


def parse_page_to_html(page: Page, article_id: str) -> str:
    section_wrapper = f'<section id="page-{page.id}" class="page-center">'

    for frame_index, frame in enumerate(page.frames):
        component_class_name = "page-" + page.id + "-center-component"
        for component in frame.components:
            section_wrapper += generate_component_html(component, component_class_name, article_id, frame_index)
    section_wrapper += "</section>"
    return section_wrapper
