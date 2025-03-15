from pydantic import BaseModel


class Payload(BaseModel):
    article_id: str
    payload: str
