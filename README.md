# Scrolly Telling

# Server

This project contains a Flask server that generates websites with GSAP animations and uploads them to MinIO.

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
