import io
import logging
from pathlib import Path
from typing import Annotated
from typing import Union

import uvicorn
from fastapi import FastAPI
from fastapi import Form
from fastapi import UploadFile
from fastapi import status
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.responses import FileResponse
from fastapi.responses import HTMLResponse
from fastapi.responses import JSONResponse
from fastapi.responses import Response
from fastapi.staticfiles import StaticFiles

from server.model.article import Article
from server.model.payload import Payload
from server.model.response_error import ErrorResponse
from server.model.response_successful import SuccessfulResponse
from server.model.script.animation.animation_script_factory import AnimationScriptFactory
from server.parser import process_pages
from server.utilities.constants import BUCKET
from server.utilities.constants import CDN_URL
from server.utilities.constants import LOCAL_OUTPUT_DIR
from server.utilities.constants import MINIO_CLIENT
from server.utilities.constants import MINIO_PRIVATE_ARTICLE_BUCKET
from server.utilities.constants import S3_BUCKET
from server.utilities.constants import S3_CLIENT
from server.utilities.utils import copy_files
from server.utilities.utils import download_files
from server.utilities.utils import stage_file

logger = logging.getLogger(__name__)

app = FastAPI(
    title="ScrollyTelling server",
    version="0.0.1",
    docs_url=None,  # disable so that our override (below) will work
    redoc_url=None,  # disable
    root_path="/api",
)


@app.get("/docs", include_in_schema=False)
async def custom_docs() -> HTMLResponse:
    if BUCKET == "LOCAL":
        return get_swagger_ui_html(
            openapi_url=app.openapi_url,
            title=app.title,
            swagger_favicon_url="/static/logo.png",  # this can also be '/static/favicon.ico'
        )
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title=app.title,
        # warning: newer versions of swagger require chrome>=93
        swagger_js_url=f"{CDN_URL}/cdn.jsdelivr.net/npm/swagger-ui-dist@5.0.0-alpha.6/swagger-ui-bundle.js",
        swagger_css_url=f"{CDN_URL}/cdn.jsdelivr.net/npm/swagger-ui-dist@5.0.0-alpha.6/swagger-ui.css",
        swagger_favicon_url="/static/logo.png",  # this can also be '/static/favicon.ico'
    )


@app.post(
    "/upload-file",
    status_code=status.HTTP_201_CREATED,
    responses={
        status.HTTP_201_CREATED: {"model": SuccessfulResponse},
        status.HTTP_400_BAD_REQUEST: {"model": ErrorResponse},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"model": ErrorResponse},
    },
)
async def upload_file(file: UploadFile, article_id: Annotated[str, Form()]) -> JSONResponse:
    valid_types = {
        "image": ["image/jpeg", "image/png", "image/gif"],
        "html": ["text/html"],
        "css": ["text/css"]
    }
    if file.content_type in valid_types["image"]:
        file_type = "images"
    elif file.content_type == "text/html":
        file_type = "html"
    elif file.content_type == "text/css":
        file_type = "css"
    else:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Unsupported file type"
        )
    try:
        path = stage_file(article_id, file.file, file.filename, file.size, file.content_type, file_type)
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


@app.get("/payload/{article_id}")
def get_payload(article_id: str) -> str:
    if BUCKET == "S3":
        response = S3_CLIENT.get_object(Bucket=S3_BUCKET, Key=f"private-articles/{article_id}/payload.json")
        return response["Body"].read()
    if BUCKET == "MINIO":
        response = MINIO_CLIENT.get_object(MINIO_PRIVATE_ARTICLE_BUCKET, f"{article_id}/payload.json")
        return response.data
    return Path(LOCAL_OUTPUT_DIR / article_id / "payload.json").read_text(encoding="utf-8")


@app.post(
    "/payload",
    responses={
        status.HTTP_201_CREATED: {"model": SuccessfulResponse},
        status.HTTP_400_BAD_REQUEST: {"model": ErrorResponse},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"model": ErrorResponse},
    },
    response_model=None,
)
def save_payload(request_body: Payload) -> None:
    if BUCKET == "S3":
        S3_CLIENT.put_object(
            Body=io.BytesIO(request_body.payload.encode()),
            Bucket=S3_BUCKET,
            ServerSideEncryption="AES256",
            Key=f"private-articles/{request_body.article_id}/payload.json",
            ContentType="application/json",
        )
    elif BUCKET == "MINIO":
        MINIO_CLIENT.put_object(
            MINIO_PRIVATE_ARTICLE_BUCKET,
            f"{request_body.article_id}/payload.json",
            io.BytesIO(request_body.payload.encode()),
            length=len(request_body.payload.encode()),
            content_type="application/json",
        )
    else:
        Path.mkdir(LOCAL_OUTPUT_DIR / request_body.article_id, parents=True, exist_ok=True)
        Path(LOCAL_OUTPUT_DIR / request_body.article_id / "payload.json").write_text(
            request_body.payload, encoding="utf-8"
        )


@app.get("/s3-assets/{path:path}")
def get_s3_assets(path: str) -> Response:
    response = S3_CLIENT.get_object(Bucket=S3_BUCKET, Key=f"private-articles/{path}")
    return Response(
        content=response["Body"].read(), media_type=response["ContentType"], status_code=status.HTTP_201_CREATED
    )


if BUCKET != "LOCAL":
    app.mount("/", StaticFiles(directory="frontend/dist/", html=True), name="static")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)  # noqa: S104
