"""
VIOGI Visual Search — FastAPI inference service.

Start locally:
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload

Environment variables:
    MODEL_PATH                Path to the .h5 model file (default: ./model/model.h5)
    LOW_CONFIDENCE_THRESHOLD  Minimum gap between top-2 probabilities below
                              which the result is flagged (default: 0.15)
"""

import os
import logging
from contextlib import asynccontextmanager
from pathlib import Path

import numpy as np
import tensorflow as tf
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from preprocess import check_image_quality, preprocess_image

logger = logging.getLogger("viogi.inference")
logging.basicConfig(level=logging.INFO)

CLASSES: list[str] = ["playera", "pantalon", "sudadera", "calzado"]
LOW_CONFIDENCE_THRESHOLD = float(os.getenv("LOW_CONFIDENCE_THRESHOLD", "0.15"))
MODEL_PATH = Path(os.getenv("MODEL_PATH", "./model/model.h5"))

_model: tf.keras.Model | None = None


def run_inference(tensor: np.ndarray) -> dict[str, float]:
    probs: list[float] = _model.predict(np.expand_dims(tensor, axis=0), verbose=0)[0].tolist()
    return dict(zip(CLASSES, probs))


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _model
    logger.info("Loading model from %s", MODEL_PATH)
    _model = tf.keras.models.load_model(str(MODEL_PATH))
    logger.info("Model loaded successfully.")
    yield


app = FastAPI(title="VIOGI Visual Search Inference", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok", "model_loaded": _model is not None}


@app.post("/classify")
async def classify(image: UploadFile = File(...)):
    if image.content_type not in ("image/jpeg", "image/png"):
        raise HTTPException(status_code=400, detail="Solo se aceptan imágenes JPEG o PNG.")

    image_bytes = await image.read()

    ok, reason = check_image_quality(image_bytes)
    if not ok:
        raise HTTPException(status_code=422, detail=reason)

    try:
        tensor = preprocess_image(image_bytes, apply_clahe=False, apply_grabcut=False)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    prob_map = run_inference(tensor)
    probs = list(prob_map.values())

    sorted_indices = sorted(range(len(probs)), key=lambda i: probs[i], reverse=True)
    top_idx = sorted_indices[0]
    second_idx = sorted_indices[1]

    confidence = probs[top_idx]
    low_confidence = (confidence - probs[second_idx]) < LOW_CONFIDENCE_THRESHOLD

    return {
        "class": CLASSES[top_idx],
        "confidence": round(confidence, 4),
        "probabilities": {cls: round(prob_map[cls], 4) for cls in CLASSES},
        "low_confidence": low_confidence,
    }
