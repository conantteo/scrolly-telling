class AnimationScript:
    def __init__(self, start_as_visible: bool):
        self.start_as_visible = start_as_visible

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
            return AnimationScript(self._start_as_visible)
