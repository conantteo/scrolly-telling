FROM python:3.10-slim-bookworm

RUN apt-get update
# RUN apt-get install nodejs
RUN apt-get -y install npm

RUN mkdir /app

# Set up server
RUN mkdir /app/server
COPY ./pyproject.toml /app/server/pyproject.toml
COPY ./server/ /app/server/
WORKDIR /app/server
RUN pip install .

# Set up frontend
RUN mkdir /app/frontend
COPY ./frontend/ /app/frontend/
RUN rm -f /app/frontend/.env
WORKDIR /app/frontend
RUN npm install
RUN npm run build

EXPOSE 8001

WORKDIR /app
CMD ["uvicorn", "server.main:app",  "--host", "0.0.0.0", "--port", "8001", "--reload"]