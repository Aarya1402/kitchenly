# Recipe Extraction API

A robust FastAPI application that extracts structured recipe data (JSON) from PDF documents and images using **PaddleOCR** for text extraction and **Google Gemini** for intelligent parsing.

## 🚀 Features
- **PDF & Image Support**: Extracts text and embedded images from documents.
- **AI-Powered Structuring**: Uses Gemini 2.5 Flash Lite to convert raw text into structured JSON.
- **Per-User API Keys**: Supports individual Google API keys via request headers.
- **Dockerized**: Fully containerized with all system dependencies handled.
- **Static Image Serving**: Serves extracted images directly via a dedicated route.

## 🛠️ Setup

### Prerequisites
- Docker & Docker Compose
- Google Gemini API Key

### Local Installation (Manual)
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Create a `.env` file:
   ```env
   GOOGLE_API_KEY=your_gemini_key_here
   ```
3. Run the server:
   ```bash
   uvicorn app.main:app --host 192.168.24.68 --port 8000
   ```

## 🐳 Docker Usage (Recommended)
Build and run everything in one command:
```bash
docker compose up --build -d
```
The API will be available at `http://localhost:8080`.

## 📌 API Endpoints

### 1. Extract Recipe
**POST** `/extract`

**Headers:**
- `X-API-Key` (Optional): Provide your own Google API Key.

**Form Data:**
- `file`: The PDF or Image file.

**Example Response:**
```json
{
  "success": true,
  "recipe": {
    "title": "Chocolate Cake",
    "description": "A delicious moist cake.",
    "ingredients": ["2 cups flour", "1 cup sugar"],
    "steps": ["Mix ingredients", "Bake at 350F"]
  },
  "image_count": 1,
  "images": ["extracted_images/xyz.png"]
}
```

### 2. View Image
**GET** `/images/{filename}`
Access any extracted image by its path.

## 📁 Project Structure
- `app/main.py`: API entry point and routing.
- `app/extractor.py`: PaddleOCR and PDF processing logic.
- `app/llm.py`: Gemini AI initialization.
- `app/utils.py`: Prompt engineering and JSON cleaning.
- `app/logger.py`: Centralized logging configuration.
- `extracted_images/`: temporary storage for processed images.
