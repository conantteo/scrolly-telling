from server.content_generator import handle_component_content, handle_component_image, generate_html, generate_css, \
    handle_pinned_component_content, handle_pinned_component_image
from server.model.component import Component


def parse_components(components: list[Component], title: str):
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

    generate_html(html_output, title)
    generate_css(css_output)


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
                    left_content, left_content_css = handle_pinned_component_content(component, f'pinned-{section_index_id}-left-component')
                    pinned_left_content += left_content
                    pinned_css += left_content_css
                if component.image:
                    pinned_left_content += handle_pinned_component_image(component, f'pinned-{section_index_id}-left-component')

            if component.position == "right":
                if component.content:
                    right_content, right_content_css = handle_pinned_component_content(component, f'pinned-{section_index_id}-right-component')
                    pinned_right_content += right_content
                    pinned_css += right_content_css
                if component.image:
                    pinned_right_content += handle_pinned_component_image(component, f'pinned-{section_index_id}-right-component')

            if component.position == "center":
                if component.content:
                    center_content, center_content_css = handle_pinned_component_content(component, f'pinned-{section_index_id}-center-component')
                    pinned_center_content +=  center_content
                    pinned_css += center_content_css
                if component.image:
                    pinned_center_content += handle_pinned_component_image(component, f'pinned-{section_index_id}-center-component')
        else:
            break_index = i
            break

    if break_index == -1:
        break_index = len(components)

    if pinned_left_content != "":
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

    if pinned_right_content != "":
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

    if pinned_center_content != "":
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

    pinned_html_section += '</section>\n'

    return pinned_html_section, pinned_css, break_index