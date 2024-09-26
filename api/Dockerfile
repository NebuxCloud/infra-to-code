ARG BASE_IMAGE=public.ecr.aws/lambda/python
ARG PYTHON_VERSION=3.12.2024.08.06.12

FROM ${BASE_IMAGE}:${PYTHON_VERSION} AS base

COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.8.3 /lambda-adapter /opt/extensions/lambda-adapter

WORKDIR /var/task

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY lambda.py .
