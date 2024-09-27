from pydantic import BaseModel


class Article(BaseModel):
    title: str
    scroll_trigger: bool
