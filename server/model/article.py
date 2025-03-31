from typing import List

from pydantic import BaseModel

from server.model.page import Page


class Article(BaseModel):
    articleId: str
    title: str
    pages: List[Page]  # List of Page models


# Example usage
article_data = {
    "articleId": "123-abc",
    "title": "Sample Article",
    "pages": [
        {
            "id": "001",
            "pinnable": True,
            "layout": {
                "template": "top-bottom",
                "heightTop": "30%",
                "widthLeft": None,
                "heightBottom": "70%",
                "widthRight": None,
            },
            "frames": [
                {
                    "id": "001-1",
                    "components": [
                        {
                            "id": "001-1-1",
                            "type": "text",
                            "position": "top",
                            "animation": "fade",
                            "contentHtml": "<html>Welcome to Page 1</html>",
                        },
                        {
                            "id": "001-1-2",
                            "type": "image",
                            "position": "bottom",
                            "animation": "zoom",
                            "image": "image1.png",
                        },
                    ],
                },
                {
                    "id": "001-2",
                    "components": [
                        {
                            "id": "001-2-1",
                            "type": "text",
                            "position": "top",
                            "animation": "fade",
                            "contentHtml": "<html>Welcome to Page 2</html>",
                        },
                        {
                            "id": "001-2-2",
                            "type": "image",
                            "position": "bottom",
                            "animation": "zoom",
                            "image": "image1.png",
                        },
                    ],
                },
            ],
        },
        {
            "id": "002",
            "pinnable": False,
            "layout": {
                "template": "left-right",
                "heightTop": None,
                "widthLeft": "50%",
                "heightBottom": None,
                "widthRight": "50%",
            },
            "frames": [
                {
                    "id": "002-1",
                    "components": [
                        {
                            "id": "002-1-1",
                            "type": "text",
                            "position": "left",
                            "animation": "slide-in",
                            "contentHtml": "<html>Page 2 Text</html>",
                        },
                        {
                            "id": "002-1-2",
                            "type": "image",
                            "position": "right",
                            "animation": "fade",
                            "image": "image2.png",
                        },
                    ],
                }
            ],
        },
    ],
}

# Create an instance of Article
# article_instance = Article(**article_data)

# Print the Article instance
# print(article_instance)
