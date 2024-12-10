from server.content_generator import generate_css
from server.content_generator import generate_html
from server.content_generator import generate_js
from server.content_generator import handle_component_content
from server.content_generator import handle_component_image
from server.content_generator import handle_component_js
from server.content_generator import handle_pinned_component_content
from server.content_generator import handle_pinned_component_image
from server.model.component import Component


def parse_components(article_id: str, components: list[Component], title: str) -> str:
    html_output = ""
    css_output = ""
    js_output = ""
    pinned_sections_count = 0
    index = 0

    while index < len(components):
        component = components[index]

        if component.animation.pin:
            pinned_html_section, pinned_css, pinned_js, break_at = parse_pinned_components(
                article_id, components, index_start=index, section_index_id=pinned_sections_count
            )
            pinned_sections_count += 1
            html_output += pinned_html_section + "\n"
            css_output += pinned_css + "\n"
            js_output += pinned_js + "\n"

            if break_at != -1:
                # Continue loop at next component in list that is not pinned
                index = break_at - 1
        else:
            if component.content:
                component_content, component_css = handle_component_content(component)
                html_output += component_content + "\n"
                css_output += component_css + "\n"

            if component.image:
                img_tag = handle_component_image(article_id, component)
                html_output += img_tag + "\n"

        index += 1

    # message = generate_html(article_id, html_output, title)
    # generate_css(article_id, css_output)
    generate_js(article_id, js_output)
    # return "message"
    return "ok"


def parse_pinned_components(
    article_id: str, components: list[Component], index_start: int, section_index_id: int
) -> tuple[str, str, str, int]:
    pinned_html_section = ""
    pinned_css = ""
    image_position = ""
    js_output = ""

    pinned_section_id = components[index_start].animation.pinnedSectionId
    pinned_html_section += f'<section class="pinned-{section_index_id}" id="{pinned_section_id}">\n'

    pinned_left_content = ""
    pinned_right_content = ""
    pinned_center_content = ""
    left_animation_transition = ""
    right_animation_transition = ""
    center_animation_transition = ""

    break_index = -1

    for i in range(index_start, len(components)):
        component = components[i]
        if component.animation.pin:
            # Handle content and images for left and right positions
            if component.position == "left":
                left_animation_transition = component.animation.transition
                if component.content:
                    left_content, left_content_css = handle_pinned_component_content(
                        component, f"pinned-{section_index_id}-left-component"
                    )
                    pinned_left_content += left_content
                    pinned_css += left_content_css
                if component.image:
                    pinned_left_content += handle_pinned_component_image(
                        article_id, component, f"pinned-{section_index_id}-left-component"
                    )
                    image_position = "left"

            if component.position == "right":
                right_animation_transition = component.animation.transition
                if component.content:
                    right_content, right_content_css = handle_pinned_component_content(
                        component, f"pinned-{section_index_id}-right-component"
                    )
                    pinned_right_content += right_content
                    pinned_css += right_content_css
                if component.image:
                    pinned_right_content += handle_pinned_component_image(
                        article_id, component, f"pinned-{section_index_id}-right-component"
                    )
                    image_position = "right"

            if component.position == "center":
                center_animation_transition = component.animation.transition
                if component.content:
                    center_content, center_content_css = handle_pinned_component_content(
                        component, f"pinned-{section_index_id}-center-component"
                    )
                    pinned_center_content += center_content
                    pinned_css += center_content_css
                if component.image:
                    pinned_center_content += handle_pinned_component_image(
                        article_id, component, f"pinned-{section_index_id}-center-component"
                    )
                    image_position = "center"
        else:
            break_index = i
            break

    if break_index == -1:
        break_index = len(components)

    if pinned_left_content:
        pinned_html_section += f'<div class="pinned-{section_index_id}-left">{pinned_left_content}</div>\n'
        # Assume that if left section is present, right is present as well
        pinned_css += f"""
        .pinned-{section_index_id} {{
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }}"""

        pinned_css += f"""
               .pinned-{section_index_id}-left {{
                   display: flex;
                   justify-content: center;
                   align-items: center;
                   position: relative;
                   width: 50%;
                   height: 100vh;
                   z-index: 1;
               }}"""

        pinned_css += f"""
              .pinned-{section_index_id}-left-component {{
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    background-size: cover;
                    background-repeat: no-repeat;
                    z-index: auto;
                    display: flex;
                    justify-content: center;
                    align-items: center;
              }}"""

        # Generate js
        if image_position == "left":
            js_output += handle_component_js("image", "left", left_animation_transition, section_index_id)
        else:
            js_output += handle_component_js("text", "left", left_animation_transition, section_index_id)

    if pinned_right_content:
        pinned_html_section += f'<div class="pinned-{section_index_id}-right">{pinned_right_content}</div>\n'
        pinned_css += f"""
                   .pinned-{section_index_id}-right {{
                       display: flex;
                       justify-content: center;
                       align-items: center;
                       position: relative;
                       width: 50%;
                       height: 100vh;
                       z-index: 2;
                   }}"""
        pinned_css += f"""
                     .pinned-{section_index_id}-right-component {{
                          position: absolute;
                          width: 100%;
                          height: 100%;
                          font-size: 40px;
                          text-transform: uppercase;
                          font-weight: 900;
                          text-align: center;
                          transform: translateY(100%);
                          opacity: 0;
                          z-index: 1;
                     }}"""

        # Generate js
        if image_position == "right":
            js_output += handle_component_js("image", "right", right_animation_transition, section_index_id)
        else:
            js_output += handle_component_js("text", "right", right_animation_transition, section_index_id)

    if pinned_center_content:
        pinned_html_section += f'<div class="pinned-{section_index_id}-center">{pinned_center_content}</div>\n'
        pinned_css += f"""
       .pinned-{section_index_id} {{
              position: relative;
              height: 100%;
       }}"""

        pinned_css += f"""
                        .pinned-{section_index_id}-center-component {{
                              position: absolute;
                              width: 100%;
                              height: 100%;
                              display: flex;
                              justify-content: center;
                              align-items: center;
                              opacity: 0;
                              visibility: hidden;
                              transition: opacity 0.2s ease, visibility 0.2s ease;
                        }}"""

        # Generate js
        if image_position == "center":
            js_output += handle_component_js("image", "center", center_animation_transition, section_index_id)
        else:
            js_output += handle_component_js("text", "center", center_animation_transition, section_index_id)

    pinned_html_section += "</section>\n"

    return pinned_html_section, pinned_css, js_output, break_index
