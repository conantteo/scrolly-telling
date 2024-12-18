class PinScriptBuilder:
    @staticmethod
    def build_pin_js(page_id: str, pin_length: int):
        return f"""
        ScrollTrigger.create({{
          trigger: '#page-{page_id}',
          start: 'top top',
          end: () => "+={100 * pin_length}%",
          pin: true,
          pinSpacing: true,
          scrub: true,
          scroller: ".scroller",
        }});
        """
