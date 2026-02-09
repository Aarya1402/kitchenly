import fitz
import numpy as np
import gc
import os
import io
import uuid
from PIL import Image
from app.logger import setup_logger

logger = setup_logger("app.extractor")

_OCR_INSTANCE = None


def get_ocr():
    global _OCR_INSTANCE
    if _OCR_INSTANCE is not None:
        return _OCR_INSTANCE

    logger.info("Loading PaddleOCR models into memory...")

    try:
        from paddleocr import PaddleOCR
        _OCR_INSTANCE = PaddleOCR(use_angle_cls=True, lang="en")
        logger.info("PaddleOCR loaded successfully.")
    except Exception as e:
        logger.error(f"Failed to load PaddleOCR: {e}")
        _OCR_INSTANCE = None

    return _OCR_INSTANCE


def extract_from_image(image_bytes: bytes, image_dir: str = "extracted_images"):
    try:
        os.makedirs(image_dir, exist_ok=True)
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        img_filename = f"upload_{uuid.uuid4().hex[:8]}.png"
        img_path = os.path.join(image_dir, img_filename)
        img.save(img_path)

        img_np = np.array(img)
        ocr = get_ocr()

        if ocr is None:
            return "", [img_path]

        result = ocr.ocr(img_np, cls=True)
        extracted_text = " ".join([line[1][0] for line in result[0]]) if result and result[0] else ""

        return extracted_text.strip(), [img_path]

    finally:
        gc.collect()


def extract_from_pdf(pdf_bytes: bytes, image_dir: str = "extracted_images"):
    os.makedirs(image_dir, exist_ok=True)
    all_text = []
    saved_images = []

    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")

        for page_num, page in enumerate(doc):
            all_text.append(page.get_text())

            for img_index, img_info in enumerate(page.get_images(full=True)):
                xref = img_info[0]
                pix = fitz.Pixmap(doc, xref)

                if pix.n - pix.alpha < 4:
                    pix = fitz.Pixmap(fitz.csRGB, pix)

                img_filename = f"p{page_num+1}_i{img_index+1}_{uuid.uuid4().hex[:8]}.png"
                img_path = os.path.join(image_dir, img_filename)
                pix.save(img_path)
                saved_images.append(img_path)

                pix = None

        doc.close()

    finally:
        gc.collect()

    return "\n".join(all_text).strip(), saved_images
