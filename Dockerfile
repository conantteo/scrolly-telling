FROM node:23-alpine3.19

# RUN apk add --update --no-cache python3=3.12 python3-pip
RUN apk add --no-cache python3 py3-pip && ln -sf python3 /usr/bin/python
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
COPY ./entrypoint.sh /app/entrypoint.sh

WORKDIR /app/frontend
RUN npm install

WORKDIR /app/server
RUN /opt/venv/bin/pip3 install .

EXPOSE 8000
EXPOSE 5173

ENV FLASK_ENV=development

WORKDIR /app
CMD ./entrypoint.sh