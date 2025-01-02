import logging
from pathlib import Path
from typing import Annotated
from typing import Union

import uvicorn
from fastapi import FastAPI
from fastapi import Form
from fastapi import UploadFile
from fastapi import status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.responses import FileResponse
from fastapi.responses import JSONResponse

from server.model.article import Article
from server.model.response_error import ErrorResponse
from server.model.response_successful import SuccessfulResponse
from server.model.script.animation.animation_script_factory import AnimationScriptFactory
from server.parser import process_pages
from server.utilities.utils import copy_files
from server.utilities.utils import download_files
from server.utilities.utils import stage_file
from server.utilities.constants import CDN_URL

logger = logging.getLogger(__name__)

app = FastAPI(title="ScrollyTelling server", 
              version="0.0.1", 
              docs_url=None,  # disable so that our override (below) will work
              redoc_url=None,  # disable
              root_path="/api"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:4173", "http://localhost:4174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get('/docs', include_in_schema=False)
async def custom_docs():
    return get_swagger_ui_html(
        openapi_url=f"/api{app.openapi_url}",
        title=app.title,
        # warning: newer versions of swagger require chrome>=93
        swagger_js_url=f'{CDN_URL}/cdn.jsdelivr.net/npm/swagger-ui-dist@5.0.0-alpha.6/swagger-ui-bundle.js',
        swagger_css_url=f'{CDN_URL}/cdn.jsdelivr.net/npm/swagger-ui-dist@5.0.0-alpha.6/swagger-ui.css',
        swagger_favicon_url='/static/logo.png',  # this can also be '/static/favicon.ico'
    )


@app.post(
    "/upload-image",
    status_code=status.HTTP_201_CREATED,
    responses={
        status.HTTP_201_CREATED: {"model": SuccessfulResponse},
        status.HTTP_400_BAD_REQUEST: {"model": ErrorResponse},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"model": ErrorResponse},
    },
)
async def upload_image(file: UploadFile, article_id: Annotated[str, Form()]) -> JSONResponse:
    try:
        path = stage_file(article_id, file.file, file.filename, file.size, file.content_type)
        logger.info({"message": f"{file.filename} uploaded successfully", "path": path})
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


@app.get("/animation-options")
async def get_animation_options() -> str:
    return JSONResponse(
        content={
            "animation-options": AnimationScriptFactory.get_animation_name_list(),
        },
        status_code=status.HTTP_201_CREATED,
    )

@app.post(
    "/generate-website",
    responses={
        status.HTTP_201_CREATED: {"model": SuccessfulResponse},
        status.HTTP_400_BAD_REQUEST: {"model": ErrorResponse},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"model": ErrorResponse},
    },
    response_model=None,
)
async def generate_website(request_body: Article, is_download: bool) -> Union[FileResponse, JSONResponse]:  # noqa: FBT001
    try:
        # Extract the values from the request body
        title = request_body.title if request_body.title is not None else "My Animated Website"
        pages = request_body.pages
        article_id = request_body.articleId

        process_pages(article_id, pages, title)

        if is_download:
            zip_path = download_files(article_id)
            return FileResponse(path=zip_path, filename=Path(zip_path).name, media_type="application/zip")

        # # Copy from private bucket to public bucket
        path = copy_files(article_id)
        return JSONResponse(
            content={
                "message": f"Website generated successfully. The article can be found in {path}",
                "article_id": article_id,
                "url": path,
            },
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
