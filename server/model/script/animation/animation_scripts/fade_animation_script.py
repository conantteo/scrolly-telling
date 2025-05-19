from server.model.script.animation.animation_scripts.animation_script import AnimationScript


class FadeAnimationScript(AnimationScript):
    def get_enter_js(self, component_id) -> str:
        return f"""gsap.to("#{component_id}", {{opacity: 1, duration: 0.33, zIndex: 1000}});"""

    def get_exit_js(self, component_id) -> str:
        return f"""gsap.to("#{component_id}", {{opacity: 0, duration: 0.33, zIndex: 0}});"""

    def get_init_js(self, component_id) -> str:
        if self.start_as_visible:
            return f"""gsap.set("#{component_id}", {{opacity: 1}});"""
        return f"""gsap.set("#{component_id}", {{opacity: 0}});"""

    @staticmethod
    def builder():
        return FadeAnimationScript.Builder()

    class Builder:
        def __init__(self) -> None:
            self._start_as_visible = True

        def set_initial_visibility(self, initial_visibility: bool):
            self._start_as_visible = initial_visibility
            return self

        def build(self):
            return FadeAnimationScript(self._start_as_visible)
