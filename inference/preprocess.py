"""
Image preprocessing pipeline for the VIOGI visual search module.

All functions accept raw image bytes so they are transport-agnostic
(works from FastAPI request bodies, file system, or tests).
"""

import io
import cv2
import numpy as np
from PIL import Image

TARGET_SIZE = (224, 224)
MIN_DIMENSION = 100


def check_image_quality(image_bytes: bytes) -> tuple[bool, str]:
    """
    Validate that an image meets minimum quality requirements.

    Returns (ok: bool, reason: str). reason is empty when ok is True.
    """
    try:
        img = _decode(image_bytes)
    except ValueError as exc:
        return False, str(exc)

    h, w = img.shape[:2]
    if h < MIN_DIMENSION or w < MIN_DIMENSION:
        return False, f"Resolución insuficiente ({w}×{h}). Mínimo: {MIN_DIMENSION}×{MIN_DIMENSION}."

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    mean_val = float(gray.mean())
    if mean_val < 5:
        return False, "La imagen es demasiado oscura."
    if mean_val > 250:
        return False, "La imagen es demasiado clara."

    return True, ""


def preprocess_image(
    image_bytes: bytes,
    apply_clahe: bool = False,
    apply_grabcut: bool = False,
) -> np.ndarray:
    """
    Full preprocessing pipeline.

    Steps:
    1. Decode JPEG/PNG bytes → BGR ndarray
    2. Resize to 224×224
    3. Convert BGR → HSV
    4. Optionally apply CLAHE on V channel (improves low-light images)
    5. Optionally apply GrabCut segmentation to isolate the garment
    6. Normalize pixels to [0, 1]

    Returns a float32 ndarray of shape (224, 224, 3) in RGB channel order,
    ready for model.predict(np.expand_dims(arr, 0)).
    """
    img = _decode(image_bytes)
    img = cv2.resize(img, TARGET_SIZE, interpolation=cv2.INTER_AREA)

    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

    if apply_clahe:
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        hsv[:, :, 2] = clahe.apply(hsv[:, :, 2])

    img = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)

    if apply_grabcut:
        img = _apply_grabcut(img)

    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    normalized = img_rgb.astype(np.float32) / 255.0
    return normalized


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _decode(image_bytes: bytes) -> np.ndarray:
    """Decode JPEG/PNG bytes to a BGR uint8 ndarray via PIL → cv2."""
    try:
        pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as exc:
        raise ValueError(f"No se pudo decodificar la imagen: {exc}") from exc

    # PIL gives RGB; convert to BGR for cv2 consistency
    bgr = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
    return bgr


def _apply_grabcut(img: np.ndarray) -> np.ndarray:
    """
    Basic GrabCut segmentation: treats the centre 60 % of the image as
    the probable foreground region (the garment). Returns the image with
    the background replaced by white so the model focuses on the clothing.
    """
    h, w = img.shape[:2]
    mask = np.zeros((h, w), np.uint8)
    bgd_model = np.zeros((1, 65), np.float64)
    fgd_model = np.zeros((1, 65), np.float64)

    margin_x = int(w * 0.20)
    margin_y = int(h * 0.20)
    rect = (margin_x, margin_y, w - 2 * margin_x, h - 2 * margin_y)

    try:
        cv2.grabCut(img, mask, rect, bgd_model, fgd_model, iterCount=5, mode=cv2.GC_INIT_WITH_RECT)
    except cv2.error:
        return img  # graceful fallback if GrabCut fails

    # Pixels marked as definite/probable foreground become 1
    fg_mask = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 1, 0).astype(np.uint8)
    result = img.copy()
    # Replace background with white
    result[fg_mask == 0] = [255, 255, 255]
    return result
