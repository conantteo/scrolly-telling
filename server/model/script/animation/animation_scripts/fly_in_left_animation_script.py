from server.model.script.animation.animation_scripts.animation_script import AnimationScript

class FlyInLeftAnimationScript(AnimationScript):
    def get_enter_js(self, component_id):
        return f"""gsap.to("#{component_id}", {{opacity: 1, x: 0, duration: 0.33}});"""

    def get_exit_js(self, component_id):
        return f"""gsap.to("#{component_id}", {{opacity: 0, x: -500, duration: 0.33}});"""

    def get_init_js(self, component_id):
        if self.start_as_visible:
            return f"""gsap.set("#{component_id}", {{opacity: 1, x: 0}});"""
        else:
            return f"""gsap.set("#{component_id}", {{opacity: 0, x: -500}});"""

    @staticmethod
    def builder():
        return AnimationScript.Builder()

    class Builder:
        def __init__(self):
            self._start_as_visible = True

        def set_initial_visibility(self, initial_visibility: bool):
            self._start_as_visible = initial_visibility
            return self

        def build(self):
            return FlyInLeftAnimationScript(self._start_as_visible)
