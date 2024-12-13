# Scrolly Telling

# Server

This project contains a Flask server that generates websites with GSAP animations and uploads them to MinIO.

## API Documentation

`/api/generate-website` is used to generate websites with GSAP animations and upload them to MinIO.

| Parameter | Type | Description | Required  |
| --- | --- | --- | --- |
| articleId | string | The ID of the article. | :x: |
| title | string | The title of the website. | :heavy_check_mark: |
| pages | Page[] | List of pages in the website. | :heavy_check_mark: |

Example request body

```json
{
   {
    "articleId": "123",
    "title": "Test",
    "pages": [
        {
            "id": "001",
            "pinnable": true,
            "layout": {
                "template": "left-right",
                "heightTop": null,
                "widthLeft": "50%",
                "heightBottom": null,
                "widthRight": "50%"
            },
            "frames": [
                {
                    "id": "001-1",
                    "components": [
                        {
                            "id": "001-1-1",
                            "type": "text",
                            "position": "left",
                            "animation": "fade",
                            "contentHtml": "<html>hi</html>"
                        },
                        {
                            "id": "001-1-3",
                            "type": "image",
                            "position": "right",
                            "animation": "fade",
                            "image": "001.png"
                        }
                    ]
                },
                {
                    "id": "001-2",
                    "components": [
                        {
                            "id": "001-1-1",
                            "type": "text",
                            "position": "left",
                            "animation": "overlap",
                            "contentHtml": "<html>hi</html>"
                        },
                        {
                            "id": "001-2-2",
                            "type": "image",
                            "position": "right",
                            "animation": "overlap",
                            "image": "002.png"
                        }
                    ]
                }
            ]
        },
    ]
}
```

### Page

| Parameter | Type | Description | Required  |
| --- | --- | --- | --- |
| id | string | The ID of the page. | :x: |
| pinnable | boolean | Whether the page is pinnable. Defaults to false. | :x: |
| layout | Layout | The layout of the page. | :heavy_check_mark: |
| frames | Frame[] | List of frames in the page. | :heavy_check_mark: |

### Frame

| Parameter | Type | Description | Required  |
| --- | --- | --- | --- |
| id | string | The ID of the frame. | :x: |
| components | Component[] | List of components in the frame. | :heavy_check_mark: |

### Component

| Parameter | Type | Description | Required  |
| --- | --- | --- | --- |
| id | string | The ID of the component. If you are re-using the same image or text, you should reuse the same id. | :heavy_check_mark: |
| position | string | The position of the component. | :heavy_check_mark: |
| animation | string | The animation of the component. | :heavy_check_mark: |
| type | string | The type of the component. | :heavy_check_mark: |
| contentHtml | string | The HTML content of the component. Must be provided if type is of `text` | :x: |
| image | string | The image of the component. Must be provided if type is of `image` | :x: |

### Layout

| Parameter | Type | Description | Required  |
| --- | --- | --- | --- |
| template | string | The template of the layout. | :heavy_check_mark: |
| heightTop | string | The height of the top of the layout. Defaults to XXX. | :x: |
| widthLeft | string | The width of the left side of the layout. Defaults to XXX. | :x: |
| heightBottom | string | The height of the bottom of the layout. Defaults to XXX. | :x: |
| widthRight | string | The width of the right side of the layout. Defaults to XXX. | :x: |

## Repository Structure

```
scrolly-telling/
│
├── server/
│   ├── __init__.py
│   ├── main.py
│   └── templates/
│       ├── index.html
│       └── css/
│           └── styles.css
│       └── js/
│           └── *.js
│
├── .gitignore
├── README.md
├── requirements.txt
```

## Files

1. `server/main.py`: This is the main application file containing the Flask server and website generation logic.

2. `server/__init__.py`: An empty file to make the `server` directory a Python package.

3. `.gitignore`: Specifies files and directories that Git should ignore.

4. `README.md`: Contains project information and setup instructions.

5. `requirements.txt`: Lists all Python dependencies for the project.

## Setup Instructions

1. Clone the repository:
   ```
   git clone git@github.com:conantteo/scrolly-telling.git
   cd scrolly-telling
   ```

2. Create and run the virtual environment:
   - In anaconda:
     ```
     conda create -n scrolly
     conda activate scrolly
     conda install pip
     ```
   - In Python:
     ```
     python -m venv venv

     # On Windows
     venv\Scripts\activate

     # On macOS and Linux
     source venv/bin/activate
     ```

3. Install the required packages:
   ```
   pip install .
   ```
   
4. Run the server:
   ```
   uvicorn server.main:app --reload
   ```

5. To run the checks for linting and formatting, run:
   ```
   ruff check --fix
   ```
The server should now be running on `http://localhost:8000`.
To access the Swagger API UI page, go to `http://localhost:8000/docs` or `http://localhost:8000/redoc`

## Docker setup instructions

### Build
```bash
docker build -t scrollytelling:v1 .
```

### Run
To run Minio and the application together:
```bash
docker compose up
```
The frontend can be accessed through http://localhost:5173.
The server can be accessed through http://localhost:8001.
MinIO can be accessed through http://localhost:9001.

Running the application only:
```bash
docker run -p 8001:8001 -p 5173:5173 -it scrollytelling:v1
```
The frontend can be accessed through http://localhost:5173.
The server can be accessed through http://localhost:8001.

## Usage

Send a POST request to `http://localhost:8000/api/generate-website` with JSON data containing the title and content for your website. For example:

```json
{
  "title": "Test title",
  "scroll_trigger": true
}
```

The server will generate the website, upload it to MinIO, and return the URLs for the uploaded files.

### Adding GSAP plugins

You can specify more than one GSAP plugin to be included in the generated site.

All core free plugins have been downloaded from GSAP (public files) [here](https://gsap.com/docs/v3/Installation) as of 21/09/2024.

Plugin currently supported:

| Plugin | Request Object Variable |
| --- | --- |
| ScrollTrigger | scrollTrigger |

### Adding Content

TBU

## Configuration

Update the MinIO client setup in `server/main.py` with your own MinIO server details:

```python
minio_client = Minio(
    "your-minio-server-url",
    access_key="your-access-key",
    secret_key="your-secret-key",
    secure=True  # Set to False if not using HTTPS
)
```

### Local Configuration

Running the server locally will not upload any content to minio.

All the files will be output in a local directory under `server/output`. Refer to the files generated inside the folder.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` file for more information.
