"""
LLM Module
Interaction layer with Google Gemini via LangChain.
Supports per-request API keys for multi-tenancy.
"""

from langchain_google_genai import ChatGoogleGenerativeAI
from app.logger import setup_logger
import os

logger = setup_logger("app.llm")

def get_llm(api_key: str = None):
    """
    Initializes a ChatGoogleGenerativeAI instance.
    
    Args:
        api_key (str, optional): The Google API Key. 
            If not provided, attempts to read from 'GOOGLE_API_KEY' environment variable.
            
    Returns:
        ChatGoogleGenerativeAI: The initialized LLM instance.
        
    Raises:
        ValueError: If no API key is found.
    """
    # Priority: Header Key > Environment Variable Key
    key = api_key or os.getenv("GOOGLE_API_KEY")
    
    if not key:
        logger.error("No Google API Key found in headers or environment.")
        raise ValueError(
            "Google API Key missing. Please provide it in the 'X-API-Key' header "
            "or set the 'GOOGLE_API_KEY' environment variable."
        )
        
    model_name = "gemini-2.5-flash-lite"
    logger.info(f"Connecting to LLM model: {model_name}")
    
    return ChatGoogleGenerativeAI(
        model=model_name,
        google_api_key=key,
        temperature=0.2, # Low temperature for consistent JSON structuring
    )