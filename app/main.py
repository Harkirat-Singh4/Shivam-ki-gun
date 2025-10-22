import io
import os
import time
from typing import List, Optional

from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from PIL import Image
import numpy as np

from .sniper_detector import SniperDetector, Detection, DetectorLoadError


APP_TITLE = "AI Sniper Detection System"
APP_VERSION = "1.0.0"

app = FastAPI(title=APP_TITLE, version=APP_VERSION)

# CORS for local dev and generic hosts
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define API routes first, then mount static at the end to avoid shadowing


detector: Optional[SniperDetector] = None


class DetectResponse(BaseModel):
    time_ms: float
    detections: List[Detection]
    image_width: int
    image_height: int


@app.on_event("startup")
def on_startup() -> None:
    global detector
    model_path = os.path.join(os.path.dirname(__file__), "..", "my_model.pt")
    model_path = os.path.abspath(model_path)
    detector = SniperDetector(model_path=model_path)


@app.post("/api/detect", response_model=DetectResponse)
async def detect(
    file: UploadFile = File(...),
    conf_threshold: float = Form(0.25),
    iou_threshold: float = Form(0.45),
    roi: Optional[str] = Form(None),  # format: "x1,y1,x2,y2" normalized [0,1]
):
    if detector is None:
        return JSONResponse(status_code=503, content={"detail": "Detector not ready"})

    start = time.perf_counter()
    content = await file.read()
    image = Image.open(io.BytesIO(content)).convert("RGB")
    width, height = image.size

    roi_box: Optional[List[float]] = None
    if roi:
        try:
            parts = [float(v) for v in roi.split(",")]
            if len(parts) == 4:
                # convert normalized to pixel coords
                x1 = max(0, min(1, parts[0])) * width
                y1 = max(0, min(1, parts[1])) * height
                x2 = max(0, min(1, parts[2])) * width
                y2 = max(0, min(1, parts[3])) * height
                roi_box = [x1, y1, x2, y2]
        except Exception:
            roi_box = None

    detections = detector.predict_pil(
        image=image,
        conf_threshold=conf_threshold,
        iou_threshold=iou_threshold,
        roi_xyxy=roi_box,
    )
    elapsed_ms = (time.perf_counter() - start) * 1000.0

    return DetectResponse(
        time_ms=elapsed_ms,
        detections=detections,
        image_width=width,
        image_height=height,
    )


@app.get("/api/health")
def health():
    ready = detector is not None and detector.is_ready
    return {"status": "ok" if ready else "loading", "model": detector.model_name if detector else None}


# Finally mount static frontend if exists
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "web"))
if os.path.isdir(frontend_dir):
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="static")
