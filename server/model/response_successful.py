from typing import Literal

from pydantic import BaseModel


class SuccessfulResponse(BaseModel):
    message: str
    status_code: Literal[200, 201]
