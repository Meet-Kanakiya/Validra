---
title: "PaddleOCR Setup & Troubleshooting Guide"
description: "Comprehensive installation, platform compatibility, and troubleshooting guide for PaddleOCR in Validra."
---

# 👁️ PaddleOCR Setup & Troubleshooting Guide

> **Domain:** Team M3 (Computer Vision) & Team M2 (Backend/Infra)  
> **Component:** `backend/app/services/ocr/`  
> **Engine:** PaddleOCR (PP-OCRv4) + PaddlePaddle 3.x  

---

## 📋 Overview

Validra uses **PaddleOCR (PP-OCRv4)** as its core optical character recognition engine for detecting and reading Legal Metrology declarations on product packaging. This guide details setup procedures across Windows, macOS, and Linux, and provides solutions for common runtime, dependency, and platform-specific issues.

---

## 🚀 Standard Installation

### 1. Requirements

Ensure dependencies are listed in `backend/requirements.txt`:

```text
paddlepaddle>=3.0.0
paddleocr>=2.8.0
opencv-python-headless>=4.8.0
numpy>=1.24.0
pillow>=10.0.0
```

> [!TIP]
> Always use `opencv-python-headless` rather than standard `opencv-python` to avoid GUI/X11 system library dependencies in server, Docker, and CI environments.

### 2. Install into Virtual Environment

```bash
cd backend
# Windows
.\.venv\Scripts\activate
pip install -r requirements.txt

# Linux / macOS
source .venv/bin/activate
pip install -r requirements.txt
```

### 3. Verify Installation

Run the verification one-liner:

```bash
python -c "import paddle; import paddleocr; print('Paddle:', paddle.__version__); print('PaddleOCR:', paddleocr.__version__)"
```

Expected output:
```text
Paddle: 3.3.1
PaddleOCR: 3.7.0
```

---

## 🛠️ Platform-Specific Troubleshooting

### 1. Windows: "Application Control policy has blocked this file"

**Symptoms:**
```text
ImportError: DLL load failed while importing timezones / ascii: 
An Application Control policy has blocked this file.
```

**Cause:**
Windows **Smart App Control (SAC)** or **Windows Defender Application Control (WDAC)** blocks unsigned `.pyd` compiled C-extension wheels downloaded into user profile folders (e.g., `C:\Users\<username>\OneDrive\...`).

**Solutions:**

#### Solution A: Use Pure-Python `chardet`
Some newer packages install compiled C-extensions for text detection. Force the pure-Python release:
```bash
pip install "chardet==5.2.0"
```

#### Solution B: Unblock Downloaded Files in PowerShell
If Windows flagged downloaded files with Mark-of-the-Web (Zone.Identifier):
```powershell
Get-ChildItem -Path "backend\.venv" -Recurse | Unblock-File
```

#### Solution C: System Python Inheritance
If your base Python is installed in a trusted system directory (such as `C:\Software\Python\` or `C:\Program Files\Python313\`):
1. In `backend/.venv/pyvenv.cfg`, set:
   ```ini
   include-system-site-packages = true
   ```
2. Or copy the pre-installed system packages into the virtual environment:
   ```powershell
   Remove-Item -Recurse -Force 'backend\.venv\Lib\site-packages\pandas*'
   Copy-Item -Recurse -Force 'C:\Software\Python\Lib\site-packages\pandas*' 'backend\.venv\Lib\site-packages\'
   ```

---

### 2. CPU Inference: "ConvertPirAttribute2RuntimeAttribute not support" (oneDNN / MKLDNN Bug)

**Symptoms:**
```text
NotImplementedError: (Unimplemented) ConvertPirAttribute2RuntimeAttribute not support 
[pir::ArrayAttribute<pir::DoubleAttribute>]  (at ..\onednn_instruction.cc:118)
```

**Cause:**
In PaddlePaddle 3.x, the default new PIR executor has a known bug in oneDNN (MKLDNN) on certain CPU architectures when converting double array attributes in static detection runners.

**Solution:**
In `backend/app/services/ocr/engine.py` and `paddlex`, ensure CPU execution is configured with standard `run_mode="paddle"` and `enable_new_ir=False`:

```python
cfg = pp._cfg.copy()
if cfg.get("device_type") == "cpu":
    cfg["run_mode"] = "paddle"
    cfg["enable_new_ir"] = False
```

This bypasses the oneDNN instruction bug while retaining fast, native CPU inference.

---

### 3. PaddleOCR 3.x API Deprecations

#### Issue A: `ValueError: Unknown argument: show_log`
PaddleOCR 3.x removed the `show_log` parameter from the `PaddleOCR()` constructor.
- **Fix:** Remove `show_log=False` from `PaddleOCR(...)` initialization.

#### Issue B: `DeprecationWarning: use_angle_cls has been deprecated`
In PaddleOCR 3.x, `use_angle_cls` was renamed to `use_textline_orientation`.
- **Fix:** Use `use_textline_orientation=False` (since upstream preprocessing handles deskewing).

#### Issue C: Output Format Differences
PaddleOCR 3.x `predict()` returns a list of dictionaries, whereas legacy 2.x `ocr()` returned nested lists.
Validra's `backend/app/services/ocr/engine.py` supports both formats automatically:
- **3.x Format:** `{'rec_texts': [...], 'rec_scores': [...], 'rec_polys': [...]}`
- **2.x Format:** `[[points, (text, confidence)]]`

---

### 4. Linux / Docker: Missing `libGL.so.1`

**Symptoms:**
```text
ImportError: libGL.so.1: cannot open shared object file: No such file or directory
```

**Cause:**
Standard OpenCV attempts to load X11 / OpenGL shared libraries which are absent in headless container environments.

**Solution:**
Ensure `opencv-python-headless` is installed:
```bash
pip uninstall opencv-python opencv-contrib-python -y
pip install opencv-python-headless
```
Or in your `Dockerfile` / Ubuntu host:
```bash
apt-get update && apt-get install -y libgl1 libglib2.0-0
```

---

### 5. First-Run Model Download & Offline Environments

**Behavior:**
On first invocation, PaddleOCR downloads the official `PP-OCRv4` detection and recognition models into:
- **Windows:** `C:\Users\<username>\.paddlex\official_models\`
- **Linux / macOS:** `~/.paddlex/official_models/`

**Offline / Air-Gapped Setup:**
If deploying to an offline server:
1. Initialize PaddleOCR once on a machine with internet access.
2. Copy the `.paddlex` directory to the target environment's home folder.
3. Set environment variable:
   ```bash
   export PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK=True
   ```

---

### 6. macOS (Apple Silicon M1/M2/M3)

- Ensure you are running native ARM64 Python (verify with `python -c "import platform; print(platform.machine())"` $\rightarrow$ `arm64`).
- PaddlePaddle provides native wheels for macOS ARM64 via standard `pip install paddlepaddle`.

---

## 🧪 Self-Test Script

To verify that the entire OCR pipeline, geometry calculator, and field parser are operating properly:

```bash
cd backend
.\.venv\Scripts\pytest tests/test_ocr.py -v
```

All tests should report `PASSED`.
