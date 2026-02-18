"""
Utility Module
Contains helper functions for text cleaning and specialized processing tasks.
"""

from langchain_core.messages import HumanMessage
from app.logger import setup_logger
import json


logger = setup_logger("app.utils")

def extract_recipe(llm, text: str) -> str:
    """
    Sends raw OCR/PDF text to the LLM and requests a structured JSON response.
    Includes logic to strip markdown code blocks if the LLM returns them.
    """
    if not text.strip():
        logger.warning("Empty text passed to recipe extraction.")
        return "{}"

    # Prompt engineered for strict JSON output
    prompt = f"""
Extract recipe information from the text provided below.

Your goal is to return a valid JSON object. Do not include any conversational text before or after the JSON.

Expected JSON Structure:
{
  "title": string,
  "description": string | null,
  "servings": number,
  "dietaryTags": string[],
  "cuisine": string | null,
  "ingredients": [
    { "name": string, "quantity": string }
  ],
  "steps": [
    { "stepNo": number, "content": string }
  ]
}

Text to process:
---
{text}
---
"""

    logger.debug("Prompting LLM for recipe JSON...")
    
    try:
        # LLM Invocation
        response = llm.invoke([HumanMessage(content=prompt)])
        content = response.content.strip()
        
        # Step: Clean Markdown Formatting
        # LLMs often wrap JSON in ```json ... ``` blocks
        if content.startswith("```"):
            logger.info("Markdown code block detected in LLM response, stripping markers.")
            # Remove opening marker (e.g., ```json or ```)
            content = content.replace("```json", "", 1) if "```json" in content else content.replace("```", "", 1)
            # Remove closing marker
            if "```" in content:
                content = content.rsplit("```", 1)[0]
            content = content.strip()
            
        return content

    except Exception as e:
        logger.error(f"Error during LLM invocation/structuring: {e}")
        return json.dumps({"error": "Failed to structure data", "details": str(e)})