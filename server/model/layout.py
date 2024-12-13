from typing import Optional

from pydantic import BaseModel


class Layout(BaseModel):
    template: str
    heightTop: Optional[str] = None
    widthLeft: Optional[str] = None
    heightBottom: Optional[str] = None
    widthRight: Optional[str] = None