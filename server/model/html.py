from typing import Optional

from pydantic import BaseModel


class Html(BaseModel):
    data: Optional[str] = None
