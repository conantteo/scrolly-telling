from server.model.script.animation.animation_scripts.animation_script import AnimationScript

class FadeAnimationScript(AnimationScript):
    def __init__(self, start_as_visible: bool):
        self.start_as_visible = start_as_visible

    def get_enter_js(self, component_id):
        return f"""gsap.to("#{component_id}", {{opacity: 1, duration: 0.33}});"""

    def get_exit_js(self, component_id):
        return f"""gsap.to("#{component_id}", {{opacity: 0, duration: 0.33}});"""

    def get_init_js(self, component_id):
        if self.start_as_visible:
            return f"""gsap.set("#{component_id}", {{opacity: 1}});"""
        else:
            return f"""gsap.set("#{component_id}", {{opacity: 0}});"""