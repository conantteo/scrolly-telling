from typing import List
from pydantic import BaseModel

from server.model.component import Component

class Article(BaseModel):
    title: str
    scroll_trigger: bool
    components: List[Component]  # List of Component models

# Example usage
article_data = {
    "title": "1234567890",
    "scroll_trigger": True,
    "components": [
        {
            "id": "comp-1",
            "content": "This is the first component",
            "position": "center",
            "animation": {
                "transition": "fade-in",
                "duration": 300,
                "pin": True,
                "pinnedSectionId": "section-1"
            }
        },
        {
            "id": "comp-2",
            "content": "This is the second component",
            "position": "center",
            "animation": {
                "transition": "slide-up",
                "duration": 500,
                "pin": False,
                "pinnedSectionId": ""
            }
        }
    ]
}

# Create an instance of Article
article_instance = Article(**article_data)

# Print the Article instance
print(article_instance)