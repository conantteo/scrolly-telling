from pydantic import BaseModel

class Article(BaseModel):
    title: str
    scrollTrigger: bool