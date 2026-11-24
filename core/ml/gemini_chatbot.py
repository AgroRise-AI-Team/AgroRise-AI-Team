"""
AgroRise AI - Module: Gemini AI Agricultural Chatbot Engine (Kisan Mitra / കിസാൻ മിത്രം)
Provides intelligent, multi-turn conversational advice on crops, soil, pest management,
weather adaptations, fertilizer schedules, government subsidies, and market economics.
"""

import os
import json
import logging
import urllib.request
import urllib.error

logger = logging.getLogger(__name__)

GEMINI_MODELS = [
    "gemini-1.5-flash",
    "gemini-2.0-flash",
    "gemini-2.5-flash",
]

SYSTEM_PROMPT = """You are "AgroRise Kisan Mitra" (അഗ്രോറൈസ് കിസാൻ മിത്രം), an expert AI Agricultural Specialist and Agronomist built for AgroRise AI.
Your purpose is to provide trustworthy, scientific, and practical farming advice to farmers, agriculturalists, and landowners across India, with specialized agronomic calibration for Kerala.

Your areas of expertise:
1. Crop Cultivation: Best practices, spacing, sowing, harvesting, and yield optimization for crops including Paddy (നെല്ല്), Coconut (തെങ്ങ്), Rubber (റബ്ബർ), Pepper (കുരുമുളക്), Cardamom (ഏലം), Banana/Plantain (വാഴ), Ginger (ഇഞ്ചി), Turmeric (മഞ്ഞൾ), Nutmeg (ജാതിക്ക), Vegetables, and Tapioca (മരച്ചീനി).
2. Soil & Fertilizers: Soil pH, NPK requirements, organic composting, bio-fertilizers, liming (കുമ്മായം), micronutrient deficiencies.
3. Pest & Disease Control: Identification and eco-friendly/chemical treatments for stem borers, leaf spot, root wilt, rhinoceros beetle, fungal blights, and bud rot.
4. Weather & Monsoon Advisory: Monsoon preparation, drainage management, summer irrigation, drought management, greenhouse farming.
5. Government Schemes & Subsidies: PM-KISAN, Subhiksha Keralam, Krishi Bhavan financial support, Kisan Credit Card (KCC), crop insurance (PMFBY).
6. Farm Economics & MSP: Minimum Support Prices, market timing, storage, value addition, cost reduction.

Response Guidelines:
- If the user communicates in Malayalam or asks in Malayalam, reply in fluent, polite, authentic Malayalam.
- If the user communicates in English, reply in clear, professional English.
- Keep answers structured with short bullet points, clear actionable steps, and practical dosage/instructions.
- Avoid vague advice; mention specific recommendations (e.g. Neem oil 2% spray, Trichoderma, Bordeaux mixture 1%, dolomite application).
- Be polite, encouraging, and supportive of farmers."""

FALLBACK_KNOWLEDGE = {
    "coconut": "For Coconut palms in Kerala: To control Rhinoceros beetle, apply 250g neem cake or marotti cake mixed with equal quantity of sand in the leaf axils. For root wilt / leaf rot, spray 1% Bordeaux mixture on the crown before the onset of monsoons.",
    "paddy": "For Paddy (നെല്ല്): Recommended NPK schedule is typically 70:35:35 kg/ha for high-yielding varieties. To manage blast disease, spray Tricyclazole 75 WP @ 0.6g per litre of water. Ensure proper drainage during flowering.",
    "rubber": "For Rubber (റബ്ബർ): Regular tapping should be done early morning. To protect against abnormal leaf fall caused by Phytophthora, spray with 1% Bordeaux mixture or oil-based copper oxychloride before the South-West monsoon.",
    "pepper": "For Black Pepper (കുരുമുളക്): To prevent Quick Wilt (Phytophthora foot rot), drench vine basins with 1% Bordeaux mixture or Copper Oxychloride (0.2%) during May-June and again in August-September. Apply Trichoderma-enriched compost.",
    "banana": "For Banana (വാഴ): For Sigatoka leaf spot, spray Carbendazim (1g/L) or Propiconazole (1ml/L) with sticker. For pseudostem borer, inject 20ml chlorpyrifos solution into the lower stem cavities.",
    "soil": "For acidic soils common in Kerala (pH below 5.5): Apply agricultural lime or dolomite at 250-500 kg/acre at least 2 weeks before chemical fertilizer application. Organic matter improves soil water retention.",
    "default": "Welcome to AgroRise AI Kisan Mitra! I am your AI Agronomist. You can ask me anything about crop diseases, organic fertilizers, soil suitability, weather preparation, or government farming subsidies."
}


def query_gemini_chat(message: str, history: list = None, language: str = "en") -> str:
    """
    Communicates with Google Gemini API using native Python urllib.
    Supports multi-turn chat history.
    """
    gemini_key = os.environ.get("GEMINI_API_KEY", "").strip()

    if not gemini_key or gemini_key == "your_gemini_api_key_here":
        logger.warning("GEMINI_API_KEY not configured. Using agronomic fallback response.")
        return get_local_fallback(message, language)

    # Format history for Gemini API
    contents = []

    # Insert system prompt as first turn or system instruction
    contents.append({
        "role": "user",
        "parts": [{"text": f"System Directive: {SYSTEM_PROMPT}\n\nLanguage Preference: {'Malayalam (മലയാളം)' if language == 'ml' else 'English'}"}]
    })
    contents.append({
        "role": "model",
        "parts": [{"text": "Understood. I am AgroRise Kisan Mitra, ready to assist farmers with accurate agronomic guidance."}]
    })

    # Add conversation history
    if history and isinstance(history, list):
        for turn in history[-8:]:  # keep last 8 turns for context window efficiency
            role = "user" if turn.get("sender") == "user" or turn.get("role") == "user" else "model"
            text = turn.get("text") or turn.get("message") or ""
            if text:
                contents.append({
                    "role": role,
                    "parts": [{"text": text}]
                })

    # Add current user message
    contents.append({
        "role": "user",
        "parts": [{"text": message}]
    })

    payload = {
        "contents": contents,
        "generationConfig": {
            "temperature": 0.4,
            "topP": 0.9,
            "maxOutputTokens": 1024,
        }
    }

    data_bytes = json.dumps(payload).encode("utf-8")

    # Try supported models in order of priority
    for model_name in GEMINI_MODELS:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={gemini_key}"
        try:
            req = urllib.request.Request(
                url,
                data=data_bytes,
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=12) as response:
                res_json = json.loads(response.read().decode("utf-8"))
                candidate = res_json.get("candidates", [{}])[0]
                text_content = candidate.get("content", {}).get("parts", [{}])[0].get("text", "")
                if text_content.strip():
                    return text_content.strip()
        except urllib.error.HTTPError as e:
            logger.warning(f"Gemini API model {model_name} HTTP {e.code}: {e.read().decode('utf-8', errors='ignore')}")
            continue
        except Exception as e:
            logger.error(f"Gemini API connection error with {model_name}: {e}")
            continue

    # If all API calls fail, return calibrated fallback
    return get_local_fallback(message, language)


def get_local_fallback(message: str, language: str = "en") -> str:
    """Generates a high-quality agronomic response when external API is unreachable."""
    msg_lower = message.lower()

    key_found = "default"
    for k in ["coconut", "paddy", "rubber", "pepper", "banana", "soil"]:
        if k in msg_lower:
            key_found = k
            break

    response_en = FALLBACK_KNOWLEDGE[key_found]

    if language == "ml":
        ml_translations = {
            "coconut": "തെങ്ങിലെ കീട-രോഗ നിയന്ത്രണം: കൊമ്പൻ ചെല്ലിയെ തടയാൻ ഓലക്കവിളുകളിൽ വേപ്പിൻ പിണ്ണാക്കോ മരോട്ടി പിണ്ണാക്കോ തുല്യ അളവ് മണലുമായി ചേർത്ത് വെക്കുക. മണ്ടയഴുകൽ രോഗം തടയാൻ കാലവർഷത്തിന് മുൻപ് 1% ബോർഡോ മിശ്രിതം തളിക്കുക.",
            "paddy": "നെല്ല് കൃഷി ഉപദേശം: ഉയർന്ന വിളവ് തരുന്ന ഇനങ്ങൾക്കായി ഹെക്ടറിന് 70:35:35 kg NPK ക്രമത്തിൽ നൽകുക. പോളരോഗം തടയാൻ ട്രൈസൈക്ലസോൾ 75 WP ഒരു ലിറ്റർ വെള്ളത്തിൽ 0.6 ഗ്രാം എന്ന തോതിൽ തളിക്കുക. പൂവിടുന്ന സമയത്ത് കൃത്യമായ നീർവാർച്ച ഉറപ്പാക്കുക.",
            "rubber": "റബ്ബർ കൃഷി നിർദ്ദേശങ്ങൾ: റബ്ബർ മരങ്ങളിൽ കുമിൾരോഗം (അകാല ഇലപൊഴിച്ചിൽ) തടയാൻ മഴക്കാലത്തിന് തൊട്ടുമുൻപ് 1% ബോർഡോ മിശ്രിതം സ്പ്രേ ചെയ്യുക. ടാപ്പിംഗ് അതിരാവിലെ ചെയ്യുന്നത് കൂടുതൽ പാൽ ലഭിക്കാൻ സഹായിക്കും.",
            "pepper": "കുരുമുളക് കൃഷി: ദ്രുതവാട്ടം തടയാൻ മേയ്-ജൂൺ, ആഗസ്റ്റ്-സെപ്റ്റംബർ മാസങ്ങളിൽ ചെടിയുടെ ചുവട്ടിൽ 1% ബോർഡോ മിശ്രിതം അല്ലെങ്കിൽ 0.2% കോപ്പർ ഓക്സിക്ലോറൈഡ് ഒഴിച്ച് കൊടുക്കുക. ട്രൈക്കോഡെർമ ചേർത്ത ചാണകപ്പൊടി നൽകുന്നത് വേരുകളെ സംരക്ഷിക്കും.",
            "banana": "വാഴ കൃഷി: സിഗാട്ടോക്ക ഇലപ്പുള്ളി രോഗം തടയാൻ കാർബൻഡാസിം (1g/L) പശ ചേർത്ത് തളിക്കുക. പിണ്ടിപ്പുഴുവിനെ തടയാൻ താഴെയുള്ള തണ്ടിൽ ദ്വാരമുണ്ടാക്കി ക്ലോർപൈറിഫോസ് ലായനി നൽകുക.",
            "soil": "മണ്ണിന്റെ അമ്ലത കുറയ്ക്കാൻ (pH 5.5 താഴെയാണെങ്കിൽ): രാസവളങ്ങൾ ചേർക്കുന്നതിന് 2 ആഴ്ച മുൻപ് ഏക്കറിന് 250-500 കിലോ കുമ്മായം അല്ലെങ്കിൽ ഡോളമൈറ്റ് ചേർക്കുക. ജൈവവളങ്ങൾ മണ്ണിന്റെ ഈർപ്പം നിലനിർത്താൻ സഹായിക്കും.",
            "default": "നമസ്കാരം! ഞാൻ അഗ്രോറൈസ് കിസാൻ മിത്രം. വിള രോഗങ്ങൾ, കീടനാശിനികൾ, ജൈവവളങ്ങൾ, സർക്കാർ സബ്സിഡികൾ, മണ്ണ് പരിശോധന എന്നിവയെക്കുറിച്ച് നിങ്ങൾക്ക് എന്തും ചോദിക്കാം."
        }
        return ml_translations.get(key_found, ml_translations["default"])

    return response_en
