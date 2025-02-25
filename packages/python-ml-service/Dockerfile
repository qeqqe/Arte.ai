FROM python:3.10-slim AS development

WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Don't copy application code in development
# It will be mounted as a volume

EXPOSE 5000

CMD ["uvicorn", "app.main:create_app", "--reload", "--host", "0.0.0.0", "--port", "5000"]

FROM python:3.10-slim AS production

WORKDIR /app

# intall system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# copy requirements first for better caching
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# copy application code
COPY . .

EXPOSE 5000

CMD ["python", "-m", "app.main"]
