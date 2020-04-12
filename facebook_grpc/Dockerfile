FROM python:3.6-slim

RUN mkdir -p /app/data
WORKDIR /app
COPY requirements.txt ./
RUN pip install -r requirements.txt
COPY . ./

VOLUME "/app/data"
VOLUME "/app/logs"

ENTRYPOINT [ "./docker_entrypoint.sh", "python3", "facebook.py" ]
