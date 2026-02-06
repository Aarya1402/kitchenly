"""
Extractor Module
Handles raw text and image extraction from PDF documents and standalone images.
Uses PaddleOCR for Image OCR and PyMuPDF (fitz) for PDF processing.
"""

import fitz  # PyMuPDF
import numpy as np
import gc
import os
import io
import uuid
from PIL import Image
from app.logger import setup_logger

# Initialize logger for this module
logger = setup_logger("app.extractor")

# Singleton instance to hold the OCR engine in memory
_OCR_INSTANCE = None

def get_ocr():
    """
    Lazy loader for PaddleOCR.
    Ensures the engine is only loaded into RAM when needed and stays as a singleton.
    """
    global _OCR_INSTANCE
    if _OCR_INSTANCE is not None:
        return _OCR_INSTANCE

    logger.info("Loading PaddleOCR models into memory... This may take a moment.")
    
    # Environment flag to skip source check for speed and offline stability
    os.environ.setdefault("PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK", "True")

    try:
        from paddleocr import PaddleOCR
        # Initializing with mobile models (default) for efficiency on CPU
        _OCR_INSTANCE = PaddleOCR(use_angle_cls=True, lang="en")
        logger.info("PaddleOCR models loaded successfully.")
    except Exception as e:
        logger.error(f"Failed to load PaddleOCR: {e}")
        _OCR_INSTANCE = None
        
    return _OCR_INSTANCE

def extract_from_image(image_bytes: bytes, image_dir: str = "extracted_images") -> tuple[str, list[str]]:
    """
    Extracts text from a single image bytes using OCR.
    Saves the image to disk and returns (extracted_text, [saved_image_path]).
    """
    try:
        os.makedirs(image_dir, exist_ok=True)
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        # Save a copy of the input image to the extracted folder
        img_filename = f"upload_{uuid.uuid4().hex[:8]}.png"
        img_path = os.path.join(image_dir, img_filename)
        img.save(img_path)
        
        img_np = np.array(img)
        ocr = get_ocr()
        
        if ocr is None:
            logger.error("OCR engine unavailable, skipping text extraction.")
            return "", [img_path]

        logger.info(f"Running OCR on image: {img_path}")
        result = ocr.ocr(img_np, cls=True)
        
        # PaddleOCR returns a nested list of [coordinates, (text, confidence)]
        extracted_text = " ".join([line[1][0] for line in result[0]]) if result and result[0] else ""
        
        return extracted_text.strip(), [img_path]

    except Exception as e:
        logger.exception(f"Error during image extraction: {e}")
        return "", []
    finally:
        # Manual garbage collection to prevent memory spikes
        gc.collect()

def extract_from_pdf(pdf_bytes: bytes, image_dir: str = "extracted_images") -> tuple[str, list[str]]:
    """
    Extracts plain text from PDF pages and saves any embedded images.
    Returns (concatenated_text, list_of_saved_image_paths).
    """
    os.makedirs(image_dir, exist_ok=True)
    all_text = []
    saved_images = []

    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        logger.info(f"PDF opened. Total pages: {len(doc)}")

        for page_num, page in enumerate(doc):
            # 1. Extract plain text from page
            page_text = page.get_text()
            all_text.append(page_text)

            # 2. Extract and save embedded images
            image_list = page.get_images(full=True)
            for img_index, img_info in enumerate(image_list):
                xref = img_info[0]
                pix = fitz.Pixmap(doc, xref)
                
                # Convert to RGB if it's CMYK or other formats
                if pix.n - pix.alpha < 4:
                    pix = fitz.Pixmap(fitz.csRGB, pix)
                
                img_filename = f"p{page_num+1}_i{img_index+1}_{uuid.uuid4().hex[:8]}.png"
                img_path = os.path.join(image_dir, img_filename)
                pix.save(img_path)
                saved_images.append(img_path)
                
                # Free pixmap memory immediately
                pix = None 

        doc.close()
        logger.info(f"Finished PDF processing. Extracted {len(saved_images)} images.")

    except Exception as e:
        logger.exception(f"Error during PDF extraction: {e}")
    finally:
        gc.collect()

    return "\n".join(all_text).strip(), saved_images