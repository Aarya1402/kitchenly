import os

# --- CORE PADDLE/SYSTEM FLAGS ---
os.environ["PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK"] = "True"
os.environ["KMP_DUPLICATE_LIB_OK"] = "True"
os.environ["OMP_NUM_THREADS"] = "1"

from fastapi import FastAPI, UploadFile, File, HTTPException, Header
from fastapi.staticfiles import StaticFiles
from typing import Optional
import json
from dotenv import load_dotenv

from app.logger import setup_logger
from app.extractor import extract_from_image, extract_from_pdf, get_ocr
from app.llm import get_llm
from app.utils import extract_recipe

load_dotenv()

logger = setup_logger("app.main")

app = FastAPI(
    title="Recipe Extraction API",
    description="API for extracting recipe data from PDF and images.",
    version="1.0.0"
)

# ---------- STARTUP WARMUP ----------
@app.on_event("startup")
async def warmup_models():
    logger.info("Warming OCR model at startup...")
    try:
        ocr = get_ocr()
        if ocr:
            logger.info("OCR warmup completed.")
        else:
            logger.warning("OCR warmup failed.")
    except Exception as e:
        logger.exception(f"OCR warmup error: {e}")
# -----------------------------------

EXTRACTED_IMAGES_DIR = "extracted_images"
os.makedirs(EXTRACTED_IMAGES_DIR, exist_ok=True)
app.mount("/images", StaticFiles(directory=EXTRACTED_IMAGES_DIR), name="images")


@app.get("/")
async def root():
    return {"status": "online", "message": "Recipe Extraction API is ready."}


@app.post("/extract")
async def extract(
        file: UploadFile = File(...),
        x_api_key: Optional[str] = Header(None)
):
    logger.info(f"--- Extraction Request: {file.filename} ---")

    content = await file.read()
    filename = file.filename.lower()

    try:
        llm = get_llm(api_key=x_api_key)

        if filename.endswith(".pdf"):
            text, images = extract_from_pdf(content, image_dir=EXTRACTED_IMAGES_DIR)
        elif filename.endswith((".png", ".jpg", ".jpeg")):
            text, images = extract_from_image(content, image_dir=EXTRACTED_IMAGES_DIR)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type")

        recipe_json_str = extract_recipe(llm, text)

        try:
            recipe_data = json.loads(recipe_json_str)
            return {
                "success": True,
                "recipe": recipe_data,
                "image_count": len(images),
                "images": images
            }
        except json.JSONDecodeError:
            return {
                "success": False,
                "error": "Invalid JSON from LLM",
                "raw_structured_data": recipe_json_str,
                "images": images
            }

    except ValueError as ve:
        raise HTTPException(status_code=401, detail=str(ve))
    except Exception as e:
        logger.exception("Extraction failed")
        raise HTTPException(status_code=500, detail=str(e))
