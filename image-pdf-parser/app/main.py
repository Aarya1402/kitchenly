import os

# --- CORE PADDLE/SYSTEM FLAGS ---
# These must be set before any paddle-related imports to ensure stability.
os.environ["PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK"] = "True"  # Skips slow connectivity checks
os.environ["KMP_DUPLICATE_LIB_OK"] = "True"                   # Fixes OpenMP duplicate lib crashes
os.environ["OMP_NUM_THREADS"] = "1"                          # Limits threading to prevent OOM/crashes

from fastapi import FastAPI, UploadFile, File, HTTPException, Header
from fastapi.staticfiles import StaticFiles
from typing import Optional
import json
import os
from dotenv import load_dotenv
from app.extractor import get_ocr

# Local module imports
from app.llm import get_llm
from app.logger import setup_logger
from app.extractor import extract_from_image, extract_from_pdf
from app.llm import get_llm
from app.utils import extract_recipe

# Load environment variables from .env if present
load_dotenv()

# Initialize Logger
logger = setup_logger("app.main")

# Initialize FastAPI App
app = FastAPI(
    title="Recipe Extraction API",
    description="API for extracting recipe data (JSON) from PDF documents and images using PaddleOCR and Google Gemini.",
    version="1.0.0"
)

@app.on_event("startup")
async def warmup_models():
    logger.info("Starting OCR warmup...")
    try:
        ocr = get_ocr()  # loads PaddleOCR into RAM once
        if ocr is None:
            logger.warning("OCR warmup failed.")
        else:
            logger.info("OCR warmup completed successfully.")
        try:
            get_llm()   # optional default key warmup
        except:
            pass
    except Exception as e:
        logger.exception(f"OCR warmup error: {e}")

# Ensure extraction directory exists and mount it for static file serving
EXTRACTED_IMAGES_DIR = "extracted_images"
os.makedirs(EXTRACTED_IMAGES_DIR, exist_ok=True)
app.mount("/images", StaticFiles(directory=EXTRACTED_IMAGES_DIR), name="images")

@app.get("/", tags=["Health Check"])
async def root():
    """Health check endpoint to verify the API is running."""
    return {"status": "online", "message": "Recipe Extraction API is ready."}

@app.post("/extract", tags=["Extraction"])
async def extract(
    file: UploadFile = File(..., description="The PDF or Image file (PNG/JPG/JPEG) to process"),
    x_api_key: Optional[str] = Header(None, description="Optional: Your Google Gemini API Key. If not provided, the server default will be used.")
):
    """
    Primary endpoint to extract recipe information from a file.
    1. Extracts text and images using PaddleOCR/PyMuPDF.
    2. Uses Gemini AI to structure the raw text into a clean JSON format.
    3. Returns the recipe JSON and paths to any images found in the document.
    """
    logger.info(f"--- New Extraction Request: {file.filename} ---")

    # Read file content into memory
    content = await file.read()
    filename = file.filename.lower()

    try:
        # Step 1: Initialize LLM (Validates API key)
        logger.info("Initializing LLM service...")
        llm = get_llm(api_key=x_api_key)

        # Step 2: Extract Text and Images based on file type
        logger.info(f"Processing {filename}...")
        if filename.endswith(".pdf"):
            text, images = extract_from_pdf(content, image_dir=EXTRACTED_IMAGES_DIR)
        elif filename.endswith((".png", ".jpg", ".jpeg")):
            text, images = extract_from_image(content, image_dir=EXTRACTED_IMAGES_DIR)
        else:
            logger.warning(f"Unsupported file type attempted: {filename}")
            raise HTTPException(status_code=400, detail="Unsupported file type. Please upload a PDF or an Image (PNG/JPG/JPEG).")

        logger.info(f"Raw extraction successful. Found {len(images)} images and {len(text)} characters of text.")

        # Step 3: LLM Structuring
        logger.info("Sending text to Gemini for recipe structuring...")
        recipe_json_str = extract_recipe(llm, text)

        # Step 4: Final Response Assembly
        try:
            recipe_data = json.loads(recipe_json_str)
            logger.info("Extraction and structuring completed successfully.")
            return {
                "success": True,
                "recipe": recipe_data,
                "image_count": len(images),
                "images": images
            }
        except json.JSONDecodeError as je:
            logger.error(f"Failed to parse LLM response as JSON: {je}")
            logger.debug(f"Raw LLM output: {recipe_json_str}")
            return {
                "success": False,
                "error": "Failed to structure recipe data into valid JSON.",
                "raw_structured_data": recipe_json_str,
                "images": images
            }

    except ValueError as ve:
        # Usually from LLM initialization (missing API key)
        logger.error(f"Configuration error: {ve}")
        raise HTTPException(status_code=401, detail=str(ve))
    except Exception as e:
        logger.exception("Unified extraction handler failed")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")