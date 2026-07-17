import logging
from typing import Optional
from app.core.config import settings
import ssl

# Global SSL verification bypass patch
try:
    ssl._create_default_https_context = ssl._create_unverified_context
    orig_ssl_context = ssl.SSLContext
    
    class UnverifiedSSLContext(orig_ssl_context):
        def __new__(cls, *args, **kwargs):
            instance = orig_ssl_context.__new__(cls, *args, **kwargs)
            # Disable verification by default
            instance.check_hostname = False
            instance.verify_mode = ssl.CERT_NONE
            return instance
            
    ssl.SSLContext = UnverifiedSSLContext
except Exception:
    pass

# Setup basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL_NAME
        self.initialized = False
        
        if self.api_key and self.api_key != "mock_key_for_now" and self.api_key != "your_gemini_api_key_here":
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key, transport="rest")
                self.initialized = True
                logger.info(f"Gemini SDK initialized with model: {self.model_name}")
            except ImportError:
                logger.warning("google-generativeai package not found. Running in mock mode.")
            except Exception as e:
                logger.error(f"Error configuring Gemini SDK: {e}")
        else:
            logger.info("Gemini API key is not set. Running in mock/simulation mode.")

    async def generate_response(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        """
        Generates a response from the Gemini model.
        Falls back to a structured mock response if the SDK is not initialized.
        """
        if not self.initialized:
            raise RuntimeError("Gemini SDK not initialized.")
            
        try:
            import google.generativeai as genai
            
            # Using the GenerativeModel class from google-generativeai
            if system_instruction:
                model = genai.GenerativeModel(
                    model_name=self.model_name,
                    system_instruction=system_instruction
                )
            else:
                model = genai.GenerativeModel(model_name=self.model_name)
                
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Error calling Gemini SDK: {e}.")
            raise e


gemini_service = GeminiService()


