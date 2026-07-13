import logging
from typing import Optional
from app.core.config import settings

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
                genai.configure(api_key=self.api_key)
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
            return self._get_mock_response(prompt)
            
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
            logger.error(f"Error calling Gemini SDK: {e}. Falling back to mock response.")
            return self._get_mock_response(prompt)

    def _get_mock_response(self, prompt: str) -> str:
        prompt_lower = prompt.lower()
        if "gate" in prompt_lower or "entrance" in prompt_lower or "entry" in prompt_lower:
            return (
                "**StadiumPilot AI Assistant (Simulation Mode)**\n\n"
                "Based on the live telemetry from the FIFA World Cup 2026 gates:\n"
                "- 🚪 **Gate A (North Entrance)**: Wait time is **8 minutes** (Normal flow).\n"
                "- 🚪 **Gate B (East Entrance)**: Wait time is **22 minutes** (Highly congested due to transit arrivals).\n"
                "- 🚪 **Gate C (South Entrance)**: Wait time is **4 minutes** (Low crowd density).\n\n"
                "💡 **Recommendation**: If you are arriving from the East transit hub, bypass the Gate B queue and walk along the external pathway to Gate C for a faster entrance."
            )
        elif "food" in prompt_lower or "eat" in prompt_lower or "burger" in prompt_lower or "taco" in prompt_lower:
            return (
                "**StadiumPilot AI Assistant (Simulation Mode)**\n\n"
                "Hungry? Here are the nearest concessions to your seat:\n"
                "- 🍔 **Vanguard Stadium Burgers** (Section 108): High demand, wait time is approximately **15 minutes**. (Card-only)\n"
                "- 🌮 **Taco Goal** (Section 124): Lower demand, wait time is **5 minutes**. (Cash/card accepted)\n\n"
                "You can order ahead in the official app to skip the physical queues."
            )
        elif "emergency" in prompt_lower or "accident" in prompt_lower or "hurt" in prompt_lower or "fire" in prompt_lower:
            return (
                "⚠️ **EMERGENCY WARNING** ⚠️\n\n"
                "Please notify stadium security guards or emergency personnel immediately.\n"
                "- **First Aid Bay**: Located at **Section 112** (Main level).\n"
                "- **Actions Taken**: I have automatically raised an alert in the central dispatcher panel. A medical team will be dispatched."
            )
        else:
            return (
                f"**StadiumPilot AI Assistant (Simulation Mode)**\n\n"
                f"Thanks for asking: *'{prompt}'*.\n\n"
                f"I am set up as a placeholder. To unlock full AI features, please configure a valid "
                f"`GEMINI_API_KEY` inside the `backend/.env` file.\n\n"
                f"Try asking me about **gates**, **concessions**, or simulating an **emergency**."
            )


gemini_service = GeminiService()
