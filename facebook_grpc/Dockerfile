FROM python:3.6-slim

RUN mkdir /app
WORKDIR /app
COPY requirements.txt ./
RUN pip install -r requirements.txt
COPY . ./

ENTRYPOINT [ "python3", "facebook_grpc.py" ]
