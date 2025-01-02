from server.model.script.animation.animation_scripts.animation_script import AnimationScript

class ZoomAnimationScript(AnimationScript):
    def get_enter_js(self, component_id):
        return f"""gsap.to("#{component_id}", {{scale: 1, duration: 0.33}});"""

    def get_exit_js(self, component_id):
        return f"""gsap.to("#{component_id}", {{scale: 0, duration: 0.33}});"""

    def get_init_js(self, component_id):
        if self.start_as_visible:
            return f"""gsap.set("#{component_id}", {{scale: 1}});"""
        else:
            return f"""gsap.set("#{component_id}", {{scale: 0}});"""
