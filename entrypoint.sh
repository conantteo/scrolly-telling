cd /app/frontend
npm run dev &
cd ..
source /opt/venv/bin/activate
uvicorn server.main:app  --host 0.0.0.0 --reload