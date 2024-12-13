# Page model
from typing import List

from pydantic import BaseModel

from server.model.frame import Frame
from server.model.layout import Layout


class Page(BaseModel):
    id: str
    pinnable: bool
    layout: Layout
    frames: List[Frame]