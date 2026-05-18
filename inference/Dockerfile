FROM python:3.11-slim

WORKDIR /app

# System deps required by OpenCV headless
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    libgl1 \
 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# MODEL_PATH can be overridden at runtime to point to a mounted real model.
ENV MODEL_PATH=/app/model/model.h5
ENV LOW_CONFIDENCE_THRESHOLD=0.15

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
