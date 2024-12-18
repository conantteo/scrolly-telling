from server.model.script.animation.animation_scripts.animation_script import AnimationScript
from server.model.script.animation.animation_scripts.fade_animation_script import FadeAnimationScript
from server.model.script.animation.animation_scripts.fly_in_bottom_animation_script import FlyInBottomAnimationScript
from server.model.script.animation.animation_scripts.fly_in_left_animation_script import FlyInLeftAnimationScript
from server.model.script.animation.animation_scripts.fly_in_right_animation_script import FlyInRightAnimationScript
from server.model.script.animation.animation_scripts.zoom_animation_script import ZoomAnimationScript


class AnimationScriptFactory:
    @staticmethod
    def construct_animation_script(animation_name: str, start_as_visible) -> AnimationScript:
        if animation_name == "fade":
            return FadeAnimationScript(start_as_visible)
        if animation_name == "zoom":
            return ZoomAnimationScript(start_as_visible)
        if animation_name == "fly-in-bottom":
            return FlyInBottomAnimationScript(start_as_visible)
        if animation_name == "fly-in-left":
            return FlyInLeftAnimationScript(start_as_visible)
        if animation_name == "fly-in-right":
            return FlyInRightAnimationScript(start_as_visible)

        return AnimationScript()
