from server.model.component import Component
from server.model.script.animation.animation_script_factory import AnimationScriptFactory
from server.model.script.animation.animation_scripts.animation_script import AnimationScript
from server.model.script.animation.animation_scroll_trigger import AnimationScrollTrigger
from server.model.script.animation.util.component_groups import ComponentGroups
from server.model.script.animation.util.component_id_parser import ComponentIdParser

class AnimationScriptProcessor:
    @staticmethod
    def process_animation_scripts(component_groups: ComponentGroups, string_builder: []):
        for components in component_groups.groups.values():
            AnimationScriptProcessor.__build_components_scripts(
                components,
                component_groups,
                string_builder
            )

    @staticmethod
    def __build_components_scripts(components, component_groups, string_builder: []):
        for index, component in enumerate(components):
            should_start_as_visible = (AnimationScriptProcessor
                                       .get_should_start_as_visible(component.id))
            animation_script = (
                AnimationScriptFactory.construct_animation_script(component.animation, should_start_as_visible)
            )
            scroll_trigger = (
                AnimationScriptProcessor
                .__build_component_scroll_trigger(
                    index,
                    component,
                    component_groups,
                    animation_script
                )
            )
            string_builder.append(scroll_trigger.get_trigger_js())

    @staticmethod
    def get_should_start_as_visible(component_id: str):
        page_id, frame_id, component_id = ComponentIdParser.parse(component_id)
        return page_id == "001" and frame_id == "1"

    @staticmethod
    def __build_component_scroll_trigger(
            index: int,
            component: Component,
            component_groups: ComponentGroups,
            animation_script: AnimationScript
    ) -> AnimationScrollTrigger:
        page_id, frame_id, component_id = ComponentIdParser.parse(component.id)
        start_length = index
        end_length = component_groups.get_component_end_length(component_id)
        return AnimationScrollTrigger(component.id, start_length, end_length, animation_script)
