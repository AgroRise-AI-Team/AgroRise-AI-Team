"""
AgroRise AI - Module: RAG-Augmented Gemini AI Agricultural Chatbot Engine (Kisan Mitra / കിസാൻ മിത്രം)
Augments user queries with verified agronomic knowledge retrieved from Kerala Agricultural University (KAU)
and ICAR research packages of practices before invoking Google Gemini AI.
"""

import os
import json
import logging
import urllib.request
import urllib.error
from .rag_engine import get_rag_context_and_sources

logger = logging.getLogger(__name__)

GEMINI_MODELS = [
    "gemini-1.5-flash",
    "gemini-2.0-flash",
    "gemini-2.5-flash",
]

BASE_SYSTEM_PROMPT = """You are "AgroRise Kisan Mitra" (അഗ്രോറൈസ് കിസാൻ മിത്രം), an expert AI Agronomist and Agricultural Specialist for AgroRise AI.
Your purpose is to provide trustworthy, scientific, and practical farming advice to farmers in Kerala and across India.

Response Rules:
1. STRICT FACTUAL GROUNDING: Always ground your answers in the VERIFIED KERALA AGRONOMIC KNOWLEDGE provided below. Do not guess or invent dosages.
2. If the user asks in Malayalam, reply in natural, fluent Malayalam with respectful, empathetic phrasing.
3. If the user asks in English, reply in professional, clear English.
4. Structure your response with:
   - Clear Summary
   - Step-by-step Actionable Solution (dosages, timing, application method)
   - Precaution / Preventive Measures
5. Mention verified bio-control options (Trichoderma, Pseudomonas, Metarhizium, Neem cake) alongside recommended chemical treatments where appropriate.
6. Clearly state the cited authority (e.g. Kerala Agricultural University Package of Practices / Krishi Bhavan)."""


def query_gemini_chat_with_rag(message: str, history: list = None, language: str = "en") -> dict:
    """
    RAG-Augmented query pipeline:
    1. Retrieve verified agronomic documents via AgriculturalRAGRetriever.
    2. Inject grounded context into Gemini prompt.
    3. Generate high-precision response.
    4. Return reply, cited sources, and verification status.
    """
    # 1. RETRIEVE RELEVANT CONTEXT (RAG Step)
    rag_context, cited_sources, retrieved_docs = get_rag_context_and_sources(message, top_k=2)

    gemini_key = os.environ.get("GEMINI_API_KEY", "").strip()

    # If Gemini API Key is missing or default, use high-precision local RAG synthesis
    if not gemini_key or gemini_key == "your_gemini_api_key_here":
        logger.warning("GEMINI_API_KEY not configured. Generating response directly from local RAG knowledge base.")
        reply = synthesize_local_rag_response(message, retrieved_docs, language)
        return {
            "reply": reply,
            "sources": cited_sources,
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
        "parts": [{"text": message}]
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
                        "sources": cited_sources,
                        "grounded_by_rag": True,
                        "model": model_name
                    }
        except urllib.error.HTTPError as e:
            logger.warning(f"Gemini API model {model_name} HTTP {e.code}: {e.read().decode('utf-8', errors='ignore')}")
            continue
        except Exception as e:
            logger.error(f"Gemini API connection error with {model_name}: {e}")
            continue

    # Fallback to local RAG synthesis if API fails
    reply = synthesize_local_rag_response(message, retrieved_docs, language)
    return {
        "reply": reply,
        "sources": cited_sources,
        "grounded_by_rag": True,
        "model": "local-rag-fallback"
    }


def synthesize_local_rag_response(message: str, retrieved_docs: list, language: str = "en") -> str:
    """
    Synthesizes a structured response directly from the top retrieved RAG knowledge document.
    Ensures the user receives factual, verified KAU package of practices even during network downtime.
    """
    if not retrieved_docs:
        return "Welcome to AgroRise AI! Please ask about crop diseases, fertilizers, soil health, or government subsidies."

    top_doc = retrieved_docs[0]
    content = top_doc.get("content", "").strip()
    title = top_doc.get("title", "")
    source = top_doc.get("source", "")

    if language == "ml":
        return f"""🌾 **{title}** (അടിസ്ഥാനം: {source})

{content}

📌 **നിർദ്ദേശം:** പ്രാദേശിക കാലാവസ്ഥയും മണ്ണ് പരിശോധനാ ഫലവും അനുസരിച്ച് കൃത്യമായ തോത് ക്രമീകരിക്കാൻ നിങ്ങളുടെ അടുത്തുള്ള കൃഷിഭവനുമായി (Krishi Bhavan) ബന്ധപ്പെടുക."""

    return f"""🌾 **{title}**
*(Verified Reference: {source})*

{content}

💡 **Agronomic Advisory:** For exact customized dosage for your acreage, cross-reference with your local Krishi Bhavan soil testing report."""


# Backward compatibility alias
def query_gemini_chat(message: str, history: list = None, language: str = "en") -> str:
    result = query_gemini_chat_with_rag(message, history, language)
    return result["reply"]
