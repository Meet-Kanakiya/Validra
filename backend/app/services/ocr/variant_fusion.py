"""Spatial deduplication and bounding box IoU utilities for OCR detections.

Owner: Team M3 (Computer Vision)
Provides spatial overlap deduplication (IoU) for text bounding boxes:
- Filters duplicate or overlapping bounding box detections (IoU >= 0.5)
- Retains highest-confidence detection per cluster
- Sorts detections in natural reading order (top-to-bottom, left-to-right)
"""

import logging
from typing import Any, Dict, List, Optional, Union

logger = logging.getLogger("validra.ocr.fusion")


def compute_bbox_iou(bbox_a: List[Union[int, float]], bbox_b: List[Union[int, float]]) -> float:
    """Compute Intersection over Union between two axis-aligned bounding boxes [x1, y1, x2, y2]."""
    x1 = max(bbox_a[0], bbox_b[0])
    y1 = max(bbox_a[1], bbox_b[1])
    x2 = min(bbox_a[2], bbox_b[2])
    y2 = min(bbox_a[3], bbox_b[3])

    inter_w = max(0.0, x2 - x1)
    inter_h = max(0.0, y2 - y1)
    inter_area = inter_w * inter_h

    area_a = max(1.0, (bbox_a[2] - bbox_a[0]) * (bbox_a[3] - bbox_a[1]))
    area_b = max(1.0, (bbox_b[2] - bbox_b[0]) * (bbox_b[3] - bbox_b[1]))
    union_area = area_a + area_b - inter_area

    return float(inter_area / max(1.0, union_area))


def deduplicate_detections(
    detections: List[Dict[str, Any]],
    iou_threshold: float = 0.5,
) -> List[Dict[str, Any]]:
    """Deduplicate overlapping OCR bounding boxes using IoU clustering.

    Groups detections with spatial overlap >= iou_threshold and retains
    the detection with the highest confidence score.
    """
    if not detections:
        return []

    used = [False] * len(detections)
    clusters: List[List[int]] = []

    for i in range(len(detections)):
        if used[i]:
            continue
        bbox_i = detections[i].get("bbox")
        if not bbox_i or len(bbox_i) < 4:
            clusters.append([i])
            used[i] = True
            continue

        cluster = [i]
        used[i] = True

        for j in range(i + 1, len(detections)):
            if used[j]:
                continue
            bbox_j = detections[j].get("bbox")
            if not bbox_j or len(bbox_j) < 4:
                continue

            if compute_bbox_iou(bbox_i, bbox_j) >= iou_threshold:
                cluster.append(j)
                used[j] = True

        clusters.append(cluster)

    deduped: List[Dict[str, Any]] = []
    for cluster_indices in clusters:
        cluster_dets = [detections[idx] for idx in cluster_indices]
        best_det = max(cluster_dets, key=lambda d: d.get("confidence", 0.0))
        deduped.append(dict(best_det))

    # Sort in natural reading order: top-to-bottom, left-to-right
    deduped.sort(key=lambda r: (
        r.get("bbox", [0, 0, 0, 0])[1],
        r.get("bbox", [0, 0, 0, 0])[0],
    ))

    return deduped


def fuse_variant_results(
    variant_detections: Union[Dict[str, List[Dict[str, Any]]], List[Dict[str, Any]]],
    iou_threshold: float = 0.5,
    scale_factors: Optional[Dict[str, float]] = None,
) -> Dict[str, Any]:
    """Backward-compatible wrapper for spatial deduplication."""
    all_detections: List[Dict[str, Any]] = []

    if isinstance(variant_detections, dict):
        for var_name, dets in variant_detections.items():
            sf = (scale_factors or {}).get(var_name, 1.0)
            for det in dets:
                item = dict(det)
                if sf != 1.0 and "bbox" in item:
                    item["bbox"] = [
                        item["bbox"][0] / sf,
                        item["bbox"][1] / sf,
                        item["bbox"][2] / sf,
                        item["bbox"][3] / sf,
                    ]
                all_detections.append(item)
    elif isinstance(variant_detections, list):
        all_detections = list(variant_detections)

    total_before = len(all_detections)
    deduped = deduplicate_detections(all_detections, iou_threshold=iou_threshold)

    return {
        "regions": deduped,
        "fusion_metadata": {
            "total_detections_before_fusion": total_before,
            "unique_regions_after_fusion": len(deduped),
            "variants_processed": 1,
            "mean_variant_agreement": 1.0,
        },
    }
