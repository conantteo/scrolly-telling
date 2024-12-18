class ComponentIdParser:
    @staticmethod
    def parse(component_id: str):
        ids = component_id.split('-')
        page_id = ids[0]
        frame_id = ids[1]
        return page_id, frame_id, component_id
