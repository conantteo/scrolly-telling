from typing import Literal

from pydantic import BaseModel


class ErrorResponse(BaseModel):
    error: str
    status_code: Literal[400, 404, 500]
