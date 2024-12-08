import logging

import uvicorn
from fastapi import FastAPI
from fastapi import UploadFile
from fastapi import status
from fastapi.responses import JSONResponse

from server.model.article import Article
from server.model.response_error import ErrorResponse
from server.model.response_successful import SuccessfulResponse
from server.parser import parse_components
from server.utilities.constants import MINIO_ARTICLE_BUCKET
from server.utilities.constants import MINIO_ENDPOINT
from server.utilities.utils import stage_file

logger = logging.getLogger(__name__)

app = FastAPI(title="ScrollyTelling server", version="0.0.1")


@app.post(
    "/api/upload-image",
    status_code=status.HTTP_201_CREATED,
    responses={
        status.HTTP_201_CREATED: {"model": SuccessfulResponse},
        status.HTTP_400_BAD_REQUEST: {"model": ErrorResponse},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"model": ErrorResponse},
    },
)
async def upload_file(file: UploadFile, article_id: str) -> JSONResponse:
    try:
        path = stage_file(article_id, file.file, file.filename, file.size, file.content_type)
        print({"message": f"{file.filename} uploaded successfully", "path": path})
        return JSONResponse(
            content={"message": f"{file.filename} uploaded successfully", "path": path},
            status_code=status.HTTP_201_CREATED,
        )
    except FileExistsError as fee:
        logger.exception("File exists")
        return JSONResponse(content={"error": f"File exists: {fee}"}, status_code=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.exception("Unexpected error occurred")
        return JSONResponse(
            content={"error": f"An unexpected error occurred while processing the request: {e}"},
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@app.get("/test")
async def test() -> str:
    return "ok"


@app.post(
    "/api/generate-website",
    responses={
        status.HTTP_201_CREATED: {"model": SuccessfulResponse},
        status.HTTP_400_BAD_REQUEST: {"model": ErrorResponse},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"model": ErrorResponse},
    },
)
async def generate_website(request_body: Article) -> JSONResponse:
    try:
        # Extract the values from the request body
        title = request_body.title if request_body.title is not None else "My Animated Website"
        scroll_trigger = request_body.scroll_trigger
        components = request_body.components
        article_id = request_body.article_id

        # Parse components to generate website
        message = parse_components(article_id, components, title)
        return JSONResponse(
            content={"message": f"Website generated successfully. The article can be found in {message}"},
            status_code=status.HTTP_201_CREATED,
        )

    except ValueError as ve:
        logger.exception("ValueError occurred")
        return JSONResponse(content={"error": f"Invalid data: {ve}"}, status_code=status.HTTP_400_BAD_REQUEST)

    except FileNotFoundError as fnf:
        logger.exception("FileNotFoundError occurred")
        return JSONResponse(content={"error": f"File not found: {fnf}"}, status_code=status.HTTP_404_NOT_FOUND)

    except Exception as e:
        logger.exception("Unexpected error occurred")
        return JSONResponse(
            content={"error": f"An unexpected error occurred while processing the request: {e}"},
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)  # noqa: S104
