cd /app/frontend
npm run preview &
cd ..
/opt/venv/bin/python3 -m uvicorn server.main:app  --host 0.0.0.0 --port 8001 --reload