from server.model.component import Component

class ComponentGroups:
    def __init__(self):
        self.groups = {}

    def add_component(self, component: Component):
        component_group = component.position
        if component_group in self.groups:
            self.groups[component_group].append(component)
        else:
            self.groups[component_group] = [component]

    def get_biggest_group_size(self):
        if not self.groups:
            return 0
        return max(len(components) for components in self.groups.values())

    def get_component_end_length(self, component_id: str):
        for group, components in self.groups.items():
            for index, component in enumerate(components):
                if component_id == component.id:
                    is_last_index = index == len(components) - 1
                    if not is_last_index:
                        return 1
                    else:
                        return 1 if index == self.get_biggest_group_size() - 1 else self.get_biggest_group_size() - index
