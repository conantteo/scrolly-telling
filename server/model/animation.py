from typing import Optional
from typing import Literal

from pydantic import BaseModel


class Animation(BaseModel):
    transition: Literal["fade-in", "slide-up"]  # Transition type (e.g., 'fade-in', etc.)
    duration: float  # Duration of the animation in milliseconds
    pin: bool  # Pin the element during animation (True/False)
    pinnedSectionId: Optional[str] = None


# Example of using the Animation model
animation_data = {"transition": "fade-in", "duration": 300, "pin": True, "pinnedSectionId": "section-1"}

# Creating an instance of the Animation model
animation_instance = Animation(**animation_data)

# Printing the model instance
print(animation_instance)
