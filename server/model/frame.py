from typing import List

from pydantic import BaseModel

from server.model.component import Component


class Frame(BaseModel):
    id: str
    components: List[Component]