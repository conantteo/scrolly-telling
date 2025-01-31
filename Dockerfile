FROM node:22-bookworm

# RUN apk add --update --no-cache python3=3.12 python3-pip
RUN apt-get update
RUN apt-get -y upgrade
RUN apt-get install -y python3 python3-pip python3-venv && ln -sf python3 /usr/bin/python
# RUN python3 -m ensurepip
RUN python3 -m venv /opt/venv
RUN /opt/venv/bin/pip3 install --no-cache --upgrade pip setuptools

RUN mkdir /app
RUN mkdir /app/server
RUN mkdir /app/frontend

COPY ./frontend/ /app/frontend/
COPY ./README.md /app/server/README.md
COPY ./pyproject.toml /app/server/pyproject.toml
COPY ./server/ /app/server/
RUN rm -f /app/frontend/.env

WORKDIR /app/frontend
RUN npm install
RUN npm run build

WORKDIR /app/server
RUN /opt/venv/bin/pip3 install .

EXPOSE 8001

WORKDIR /app

CMD ["/opt/venv/bin/python3", "-m", "uvicorn", "server.main:app",  "--host", "0.0.0.0", "--port", "8001", "--reload"]