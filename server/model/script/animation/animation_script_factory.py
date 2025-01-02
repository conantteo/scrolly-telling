from typing import Dict, List
from server.model.script.animation.animation_scripts.animation_script import AnimationScript
from server.model.script.animation.animation_scripts.fade_animation_script import FadeAnimationScript
from server.model.script.animation.animation_scripts.fly_in_bottom_animation_script import FlyInBottomAnimationScript
from server.model.script.animation.animation_scripts.fly_in_left_animation_script import FlyInLeftAnimationScript
from server.model.script.animation.animation_scripts.fly_in_right_animation_script import FlyInRightAnimationScript
from server.model.script.animation.animation_scripts.overlap_animation_script import OverlapAnimationScript
from server.model.script.animation.animation_scripts.zoom_animation_script import ZoomAnimationScript

class AnimationScriptFactory:
    @staticmethod
    def __get_animation_builder_hash_map() -> Dict[str, lambda: AnimationScript]:
        hash_map: Dict[str: AnimationScript] = {
            "fade": lambda: FadeAnimationScript.Builder(),
            "zoom": lambda: ZoomAnimationScript.Builder(),
            "fly-in-bottom": lambda: FlyInBottomAnimationScript.Builder(),
            "fly-in-left": lambda: FlyInLeftAnimationScript.Builder(),
            "fly-in-right": lambda: FlyInRightAnimationScript.Builder(),
            "overlap": lambda: OverlapAnimationScript.Builder(),
        }
        return hash_map

    @staticmethod
    def construct_animation_script(animation_name: str, start_as_visible) -> AnimationScript:
        animation_builder_hash_map = AnimationScriptFactory.__get_animation_builder_hash_map()
        animation_builder = animation_builder_hash_map[animation_name]()
        return animation_builder.set_initial_visibility(start_as_visible).build()

    @staticmethod
    def get_animation_name_list() -> List[str]:
        animation_builder_hash_map = AnimationScriptFactory.__get_animation_builder_hash_map()
        return list(animation_builder_hash_map.keys())
