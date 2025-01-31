from server.model.script.animation.animation_scripts.animation_script import AnimationScript
from server.model.script.animation.util.component_id_parser import ComponentIdParser


class AnimationScrollTrigger:
    def __init__(
        self, component_id: str, start_length: int, end_length: int, animation_script: AnimationScript
    ) -> None:
        self.page_id, self.frame_id, self.component_id = ComponentIdParser.parse(component_id)
        self.start_length = start_length
        self.end_left = end_length
        self.animation_script = animation_script

    def get_start_trigger(self) -> str:
        return f"top+={self.start_length * 100}% top"

    def get_end_trigger(self) -> str:
        return f"+={100 * self.end_left}%"

    def get_trigger_js(self) -> str:
        return f"""
        {self.animation_script.get_init_js("comp-" + self.component_id)}
        gsap.timeline({{
            scrollTrigger: {{
                trigger: "#page-{self.page_id}",
                start: () => "{self.get_start_trigger()}",
                end: () => "{self.get_end_trigger()}",
                scrub: true,
                scroller: ".scroller",
                onEnter: () => {{
                    console.log("Entering {self.page_id}-{self.frame_id}");
                    {self.animation_script.get_enter_js("comp-" + self.component_id)}
                }},
                onLeave: () => {{
                    console.log("Leaving {self.page_id}-{self.frame_id}");
                    {self.animation_script.get_exit_js("comp-" + self.component_id)}
                }},
                onEnterBack: () => {{
                    console.log("Entering back {self.page_id}-{self.frame_id}");
                    {self.animation_script.get_enter_back_js("comp-" + self.component_id)}
                }},
                onLeaveBack: () => {{
                    console.log("Leaving back {self.page_id}-{self.frame_id}");
                    {self.animation_script.get_exit_back_js("comp-" + self.component_id)}
                }},
                toggleActions: "play none reverse none",
                invalidateOnRefresh: true,
            }}
        }});\n
        """
