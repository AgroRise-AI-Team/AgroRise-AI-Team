"""
AgroRise AI - Module: RAG-Augmented Gemini AI Agricultural Chatbot Engine (Kisan Mitra / കിസാൻ മിത്രം)
Augments user queries with verified agronomic knowledge retrieved from Kerala Agricultural University (KAU)
and ICAR research packages of practices before invoking Google Gemini AI.
"""

import os
import re
import json
import logging
import urllib.request
import urllib.error
from pathlib import Path
from dotenv import load_dotenv
from .rag_engine import get_rag_context_and_sources

logger = logging.getLogger(__name__)

# Ensure .env is loaded
BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / '.env')

# Proven active Google AI Studio models (prioritizing active fast models)
GEMINI_MODELS = [
    "gemini-flash-lite-latest",
    "gemini-flash-latest",
]

# Greetings & Chit-chat vocabulary for immediate conversational responses
GREETINGS_PATTERN = re.compile(
    r'^(ഹലോ|ഹായ്|നമസ്കാരം|നമസ്തേ|സുഖമാണോ|സുഖം|ആരാണ്|ആരാണ് നീ|എന്തൊക്കെയുണ്ട്|ഗുഡ് മോർണിംഗ്|ഗുഡ് ഈവനിംഗ്|നന്ദി|താങ്ക്സ്|hello|hi|hey|good morning|good evening|how are you|who are you|thanks|thank you)[\.\!\?\s]*$',
    re.IGNORECASE
)

BASE_SYSTEM_PROMPT = """You are "AgroRise Kisan Mitra" (അഗ്രോറൈസ് കിസാൻ മിത്രം), an expert Malayalam Agricultural Voice Assistant and Agronomy Specialist dedicated to Kerala farmers.
Your mission is to provide warm, practical, scientifically accurate, and easy-to-understand farming advice in fluent Malayalam (and English when requested).

Response Rules:
1. STRICT FACTUAL GROUNDING: Always ground your answers in the VERIFIED KERALA AGRONOMIC KNOWLEDGE provided below. Do not guess or invent dosages.
2. MALAYALAM VOICE & CONVERSATION: When the user asks in Malayalam or language is 'ml':
   - Reply in natural, spoken Malayalam (കർഷകരോട് നേരിട്ട് സംസാരിക്കുന്ന രീതിയിലുള്ള സ്നേഹപൂർണ്ണമായ മലയാളം).
   - Ensure the Malayalam response is optimized for Text-to-Speech (clear, fluent sentences, avoiding complex ASCII tables or unpronounceable characters).
   - Give concrete, practical dosages (e.g. "ഒരു ലിറ്റർ വെള്ളത്തിൽ 20 ഗ്രാം സ്യൂഡോമോണസ്", "1% ബോർഡോ മിശ്രിതം").
   - Mention bio-controls (സ്യുഡോമോണസ്, ട്രൈക്കോഡെർമ, വേപ്പിൻപിണ്ണാക്ക്) alongside KAU recommended remedies.
3. If the user asks in English, reply in professional, clear, and direct English.
4. Structure the response clearly:
   - ലളിതമായ സംഗ്രഹം (Quick Summary)
   - ചെയ്യേണ്ട കാര്യങ്ങളും മരുന്നളവും (Actionable Solution & Dosage)
   - മുൻകരുതലുകൾ (Precautions & Krishi Bhavan advice)
5. Mention the authority where appropriate (e.g. കേരള കാർഷിക സർവകലാശാല / കൃഷിഭവൻ ശുപാർശകൾ)."""


def is_conversational_greeting(message: str) -> bool:
    clean = message.strip()
    return bool(GREETINGS_PATTERN.match(clean))


def get_greeting_reply(language: str = "ml") -> str:
    if language == "ml":
        return (
            "🌾 **നമസ്കാരം!** ഞാൻ **അഗ്രോറൈസ് കിസാൻ മിത്രം** (AgroRise Kisan Mitra) — നിങ്ങളുടെ സ്വന്തം കാർഷിക വോയ്‌സ് അസിസ്റ്റന്റ്.\n\n"
            "നിങ്ങളുടെ കൃഷിയിടത്തിലെ വിള രോഗങ്ങൾ, വളപ്രയോഗം, കാലാവസ്ഥാ മുന്നറിയിപ്പുകൾ, കീടനിയന്ത്രണം, സർക്കാർ സബ്‌സിഡികൾ എന്നിവയെക്കുറിച്ച് എന്ത് സംശയമാണ് ഉള്ളത്? "
            "ചോദിക്കൂ, സഹായിക്കാം!"
        )
    return (
        "🌾 **Hello!** I am **AgroRise Kisan Mitra**, your dedicated digital agriculture voice assistant.\n\n"
        "How can I help you today with your crops, soil health, plant diseases, weather alerts, or government farming subsidies?"
    )


def query_gemini_chat_with_rag(message: str, history: list = None, language: str = "en") -> dict:
    """
    RAG-Augmented query pipeline:
    1. Check for conversational greetings (reply immediately without dumping RAG docs).
    2. Retrieve verified agronomic documents via AgriculturalRAGRetriever.
    3. Inject grounded context into Gemini prompt.
    4. Generate high-precision response.
    5. Return reply, cited sources, and verification status.
    """
    clean_message = (message or "").strip()

    # Automatically set language to Malayalam if Malayalam script is detected
    if bool(re.search(r'[\u0D00-\u0D7F]', clean_message)):
        language = "ml"

    # Conversational Greeting Short-Circuit (prevents accidental Cardamom/Ginger RAG dumps for "ഹലോ")
    if is_conversational_greeting(clean_message):
        return {
            "reply": get_greeting_reply(language),
            "sources": ["AgroRise Kisan Mitra Conversational Engine"],
            "grounded_by_rag": True,
            "model": "kisan-mitra-conversational"
        }

    # Force reload .env with override=True so key updates take effect immediately in running servers
    load_dotenv(BASE_DIR / '.env', override=True)
    gemini_key = os.environ.get("GEMINI_API_KEY", "").strip()

    # 1. RETRIEVE RELEVANT CONTEXT (RAG Step)
    rag_context, cited_sources, retrieved_docs = get_rag_context_and_sources(clean_message, top_k=2)

    # If Gemini API Key is missing or default, use high-precision local RAG synthesis
    if not gemini_key or gemini_key == "your_gemini_api_key_here":
        logger.warning("GEMINI_API_KEY not configured. Generating response directly from local RAG knowledge base.")
        reply = synthesize_local_rag_response(clean_message, retrieved_docs, language)
        return {
            "reply": reply,
            "sources": cited_sources or ["Kerala Agricultural University (KAU) Package of Practices"],
            "grounded_by_rag": True,
            "model": "local-rag-kau"
        }

    # 2. CONSTRUCT GROUNDED PROMPT (Augmentation Step)
    augmented_system_prompt = f"""{BASE_SYSTEM_PROMPT}

=============================================================================
VERIFIED KERALA AGRONOMIC KNOWLEDGE (GROUNDING CONTEXT):
{rag_context}
=============================================================================
Instruction: Use the verified context above to answer the user query accurately.
Language: {'Malayalam (മലയാളം)' if language == 'ml' else 'English'}"""

    contents = [
        {
            "role": "user",
            "parts": [{"text": augmented_system_prompt}]
        },
        {
            "role": "model",
            "parts": [{"text": "Understood. I have thoroughly reviewed the verified KAU agronomic context and will strictly ground my advice on these package of practices."}]
        }
    ]

    # Add conversation history
    if history and isinstance(history, list):
        for turn in history[-6:]:  # preserve recent context
            role = "user" if turn.get("sender") == "user" or turn.get("role") == "user" else "model"
            text = turn.get("text") or turn.get("message") or ""
            if text:
                contents.append({
                    "role": role,
                    "parts": [{"text": text}]
                })

    # Add the current user query
    contents.append({
        "role": "user",
        "parts": [{"text": clean_message}]
    })

    payload = {
        "contents": contents,
        "generationConfig": {
            "temperature": 0.25,  # Lower temperature for high factual accuracy
            "topP": 0.85,
            "maxOutputTokens": 1024,
        }
    }

    data_bytes = json.dumps(payload).encode("utf-8")

    # 3. GENERATION STEP (Invoke Gemini API)
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
                    return {
                        "reply": text_content.strip(),
                        "sources": cited_sources or ["Kerala Agricultural University (KAU)"],
                        "grounded_by_rag": True,
                        "model": model_name
                    }
        except urllib.error.HTTPError as e:
            logger.warning(f"Gemini API model {model_name} HTTP {e.code}: {e.read().decode('utf-8', errors='ignore')}")
            continue
        except Exception as e:
            logger.error(f"Gemini API connection error with {model_name}: {e}")
            continue

    # Fallback to local RAG synthesis if API fails or rate limited
    reply = synthesize_local_rag_response(clean_message, retrieved_docs, language)
    return {
        "reply": reply,
        "sources": cited_sources or ["Kerala Agricultural University (KAU) Package of Practices"],
        "grounded_by_rag": True,
        "model": "local-rag-fallback"
    }


def synthesize_local_rag_response(message: str, retrieved_docs: list, language: str = "en") -> str:
    """
    Synthesizes a structured response directly from the top retrieved RAG knowledge document.
    Ensures the user receives factual, verified KAU package of practices even during network downtime.
    """
    if not retrieved_docs:
        if language == "ml":
            return (
                "🌾 **നമസ്കാരം!** ഞാൻ **അഗ്രോറൈസ് കിസാൻ മിത്രം**.\n\n"
                "തെങ്ങ്, നെല്ല്, കുരുമുളക്, വാഴ, റബ്ബർ തുടങ്ങിയ വിളകളുടെ രോഗങ്ങൾ, കീടനിയന്ത്രണം, വളപ്രയോഗം, "
                "കാലാവസ്ഥാ മുന്നറിയിപ്പുകൾ, സർക്കാർ സബ്‌സിഡികൾ (MSP, PM-Kisan) എന്നിവയെക്കുറിച്ച് ചോദിക്കൂ, സഹായിക്കാം!"
            )
        return (
            "🌾 **Welcome to AgroRise AI!**\n\n"
            "Please ask about crop diseases (Coconut, Paddy, Pepper, Banana, Rubber), fertilizers, soil health, or government subsidies."
        )

    top_doc = retrieved_docs[0]
    content = top_doc.get("content_ml" if language == "ml" else "content") or top_doc.get("content", "").strip()
    title = top_doc.get("title_ml" if language == "ml" else "title") or top_doc.get("title", "")
    source = top_doc.get("source", "")

    if language == "ml":
        return f"""🌾 **{title}**
*(അടിസ്ഥാനം: {source})*

{content}

📌 **നിർദ്ദേശം:** നിങ്ങളുടെ കൃഷിയിടത്തിലെ മണ്ണിന്റെ ഘടനയും രോഗത്തിന്റെ തീവ്രതയും അനുസരിച്ച് കൃത്യമായ തോത് ക്രമീകരിക്കാൻ പ്രാദേശിക കൃഷിഭവനുമായി (Krishi Bhavan) ബന്ധപ്പെടുക."""

    return f"""🌾 **{title}**
*(Verified Reference: {source})*

{content}

💡 **Agronomic Advisory:** For exact customized dosage for your acreage, cross-reference with your local Krishi Bhavan soil testing report."""


# Backward compatibility alias
def query_gemini_chat(message: str, history: list = None, language: str = "en") -> str:
    result = query_gemini_chat_with_rag(message, history, language)
    return result["reply"]
