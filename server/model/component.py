from typing import Optional

from pydantic import BaseModel

from server.model.image import Image


class Component(BaseModel):
    id: str
    type: str
    position: str
    animation: Optional[str] = None
    contentHtml: Optional[str] = None
    image: Optional[Image] = None


component_data = {
    "id": "comp-1",
    "contentHtml": "This is a component with an animation",
    "position": "left",
    "animation": "fade",
    "type": "text",
    "image": None,
}

# Creating an instance of the Component model
component_instance = Component(**component_data)

# Printing the component instance
# print(component_instance)
