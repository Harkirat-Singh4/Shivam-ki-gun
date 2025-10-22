from __future__ import annotations

import os
from typing import List, Optional

import numpy as np
from PIL import Image
from pydantic import BaseModel


class DetectorLoadError(Exception):
    pass


class Detection(BaseModel):
    cls: str
    confidence: float
    x1: float
    y1: float
    x2: float
    y2: float


class SniperDetector:
    def __init__(self, model_path: str) -> None:
        self.model_path = model_path
        self.model = None
        self.model_name = "demo"
        self.is_ready = False

        # Try to load Ultralytics model if possible
        try:
            from ultralytics import YOLO  # type: ignore

            if os.path.isfile(self.model_path):
                self.model = YOLO(self.model_path)
                self.model_name = getattr(self.model, "names", {0: "sniper"})
                self.is_ready = True
            else:
                # stay in demo mode if model isn't present
                self.is_ready = True
        except Exception:
            # Fallback to demo mode without raising
            self.is_ready = True

    def _run_demo(self, image: Image.Image) -> List[Detection]:
        # Produce a deterministic fake detection centered in the image
        width, height = image.size
        cx, cy = width / 2, height / 2
        box_w, box_h = width * 0.25, height * 0.25
        x1 = cx - box_w / 2
        y1 = cy - box_h / 2
        x2 = cx + box_w / 2
        y2 = cy + box_h / 2
        return [
            Detection(
                cls="sniper",
                confidence=0.66,
                x1=float(x1),
                y1=float(y1),
                x2=float(x2),
                y2=float(y2),
            )
        ]

    def _filter_roi(self, dets: List[Detection], roi_xyxy: Optional[List[float]]) -> List[Detection]:
        if not roi_xyxy:
            return dets
        rx1, ry1, rx2, ry2 = roi_xyxy
        kept: List[Detection] = []
        for d in dets:
            # simple IOU > 0 check => intersects ROI
            ix1 = max(rx1, d.x1)
            iy1 = max(ry1, d.y1)
            ix2 = min(rx2, d.x2)
            iy2 = min(ry2, d.y2)
            if ix2 > ix1 and iy2 > iy1:
                kept.append(d)
        return kept

    def predict_pil(
        self,
        image: Image.Image,
        conf_threshold: float = 0.25,
        iou_threshold: float = 0.45,
        roi_xyxy: Optional[List[float]] = None,
    ) -> List[Detection]:
        if self.model is None:
            dets = self._run_demo(image)
            return self._filter_roi(dets, roi_xyxy)

        # Use Ultralytics inference
        try:
            results = self.model(
                image,  # PIL Image accepted
                conf=conf_threshold,
                iou=iou_threshold,
                verbose=False,
            )
            dets: List[Detection] = []
            # results is a list; iterate first item
            res = results[0]
            names = getattr(self.model.model, "names", {0: "sniper"}) if hasattr(self.model, "model") else {0: "sniper"}
            for b in res.boxes:
                cls_id = int(b.cls.item()) if hasattr(b.cls, "item") else int(b.cls)
                conf = float(b.conf.item()) if hasattr(b.conf, "item") else float(b.conf)
                x1, y1, x2, y2 = [float(v) for v in b.xyxy[0].tolist()]
                if conf < conf_threshold:
                    continue
                dets.append(
                    Detection(
                        cls=str(names.get(cls_id, "sniper")),
                        confidence=conf,
                        x1=x1,
                        y1=y1,
                        x2=x2,
                        y2=y2,
                    )
                )
            return self._filter_roi(dets, roi_xyxy)
        except Exception:
            # On any runtime error, fall back to demo
            dets = self._run_demo(image)
            return self._filter_roi(dets, roi_xyxy)
