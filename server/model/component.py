from typing import Optional
from fastapi import UploadFile
from pydantic import BaseModel

from server.model.animation import Animation

class Component(BaseModel):
    id: str
    content:  Optional[str] = None # HTML string
    image: Optional[UploadFile] = None
    animation: Animation
    position: str  # Position as a string (e.g., 'center', 'left', 'right')

component_data = {
    "id": "comp-1",
    "content": "This is a component with an animation",
    "position": "left",
    "animation": {
        "transition": "fade-in",
        "duration": 300,
        "pin": True,
        "pinnedSectionId": "section-1"
    }
}

# Creating an instance of the Component model
component_instance = Component(**component_data)

# Printing the component instance
print(component_instance)