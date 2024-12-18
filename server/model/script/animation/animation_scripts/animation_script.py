class AnimationScript:
    def get_enter_js(self, component_id):
        return ""

    def get_exit_js(self, component_id):
        return ""

    def get_enter_back_js(self, component_id):
        return self.get_enter_js(component_id)

    def get_exit_back_js(self, component_id):
        return self.get_exit_js(component_id)

    def get_init_js(self, component_id):
        return ""
