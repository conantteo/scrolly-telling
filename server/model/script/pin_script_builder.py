class PinScriptBuilder:
    @staticmethod
    def build_pin_js(page_id: str, pin_length: int, scroll_speed: int = 50) -> str:
        return f"""
        ScrollTrigger.create({{
          trigger: '#page-{page_id}',
          start: 'top top',
          end: () => "+={scroll_speed * pin_length}%",
          pin: true,
          pinSpacing: true,
          scrub: true,
          scroller: ".scroller",
        }});
        """
