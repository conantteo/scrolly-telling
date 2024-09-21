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

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On Windows:
     ```
     venv\Scripts\activate
     ```
   - On macOS and Linux:
     ```
     source venv/bin/activate
     ```

4. Install the required packages:
   ```
   pip install -r requirements.txt
   ```

5. Run the application:
   ```
   python server/main.py
   ```

The server should now be running on `http://localhost:5000`.

## Usage

Send a POST request to `http://localhost:5000/generate-website` with JSON data containing the title and content for your website. For example:

```json
{
  "title": "Test title",
  "scrollTrigger": true
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