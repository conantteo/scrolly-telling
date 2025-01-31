from typing import List

from server.model.frame import Frame
from server.model.page import Page
from server.model.script.animation.animation_script_processor import AnimationScriptProcessor
from server.model.script.animation.util.component_groups import ComponentGroups
from server.model.script.pin_script_builder import PinScriptBuilder


class ScriptProcessor:
    def __init__(self, string_builder: List[str]) -> None:
        self.string_builder = string_builder

    def process_pages(self, pages: list[Page]) -> None:
        for page in pages:
            frames = page.frames
            component_groups = ComponentGroups()
            self.__process_frames(frames, component_groups)
            self.__append_animation_scripts(component_groups)
            self.__append_page_pinning_script(page, component_groups)

    def __append_page_pinning_script(self, page: Page, component_groups: ComponentGroups) -> None:
        pin_js = PinScriptBuilder.build_pin_js(page.id, component_groups.get_biggest_group_size())
        self.string_builder.append(pin_js)

    def __append_animation_scripts(self, component_groups: ComponentGroups) -> None:
        AnimationScriptProcessor.process_animation_scripts(component_groups, self.string_builder)

    def __process_frames(self, frames: list[Frame], component_groups: ComponentGroups) -> None:
        for frame in frames:
            for component in frame.components:
                component_groups.add_component(component)
