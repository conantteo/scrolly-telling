from typing import Optional

from pydantic import BaseModel


class Image(BaseModel):
    data: Optional[str] = None
    caption: Optional[str] = None
    isDisplayFullscreen: Optional[bool] = False
