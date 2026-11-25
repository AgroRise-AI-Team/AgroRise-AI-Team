"""
AgroRise AI - Leaf Disease Detection API Views
Provides endpoints for computer-vision leaf pathology diagnosis and disease treatment advisories.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from datetime import datetime
import base64

from .ml.leaf_disease_detector import diagnose_leaf_image

SAMPLE_CASES = [
    {
        "id": "sample-pepper-wilt",
        "title": "Black Pepper: Quick Wilt (Phytophthora Foot Rot)",
        "title_ml": "കുരുമുളക്: ദ്രുതവാട്ടം",
        "crop": "Black Pepper (കുരുമുളക്)",
        "condition": "Quick Wilt / Foot Rot",
        "condition_ml": "ദ്രുതവാട്ടം",
        "image_url": "https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=600&auto=format&fit=crop&q=80",
        "severity": "HIGH",
        "description": "Rapid blackening of collar region, wilting of vines during monsoon season."
    },
    {
        "id": "sample-coconut-rot",
        "title": "Coconut: Leaf Rot & Bud Rot",
        "title_ml": "തെങ്ങ്: മണ്ടയഴുകലും ഇലയഴുകലും",
        "crop": "Coconut (തെങ്ങ്)",
        "condition": "Fungal Leaf Rot / Bud Rot",
        "condition_ml": "ഇലയഴുകൽ / മണ്ടയഴുകൽ",
        "image_url": "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=600&auto=format&fit=crop&q=80",
        "severity": "HIGH",
        "description": "Blackening of spear leaves, drooping crown, foul odor from rotting tissues."
    },
    {
        "id": "sample-banana-sigatoka",
        "title": "Nendran Banana: Sigatoka Leaf Spot",
        "title_ml": "ഏത്തവാഴ: സിഗാട്ടോക്ക ഇലപ്പുള്ളി രോഗം",
        "crop": "Banana (വാഴ)",
        "condition": "Sigatoka Leaf Spot",
        "condition_ml": "സിഗാട്ടോക്ക ഇലപ്പുള്ളി",
        "image_url": "https://images.unsplash.com/photo-1528825871115-3581a5387919?w=600&auto=format&fit=crop&q=80",
        "severity": "MEDIUM",
        "description": "Oval brown streaks with grey centers along leaf veins leading to premature leaf drying."
    },
    {
        "id": "sample-paddy-blast",
        "title": "Paddy: Rice Blast (Magnaporthe oryzae)",
        "title_ml": "നെല്ല്: കുറുനാമ്പ് രോഗം (Rice Blast)",
        "crop": "Paddy (നെല്ല്)",
        "condition": "Rice Blast Disease",
        "condition_ml": "കുറുനാമ്പ് രോഗം",
        "image_url": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80",
        "severity": "HIGH",
        "description": "Spindle-shaped lesions with ash grey centers on leaf blades."
    }
]


class LeafDiseaseDiagnosisView(APIView):
    """
    POST /api/leaf-disease/diagnose/
    Accepts:
      - 'image' in request.FILES (multipart/form-data)
      OR
      - 'image_base64' in request.data (json)
      - 'language': 'en' | 'ml'
    Returns comprehensive pathology diagnosis with KAU treatments.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        language = request.data.get("language", "en").strip().lower()
        if language not in ("en", "ml"):
            language = "en"

        image_bytes = None
        mime_type = "image/jpeg"

        # 1. Check for uploaded file
        if "image" in request.FILES:
            uploaded_file = request.FILES["image"]
            image_bytes = uploaded_file.read()
            mime_type = uploaded_file.content_type or "image/jpeg"

        # 2. Check for base64 payload
        elif "image_base64" in request.data:
            b64_str = request.data.get("image_base64", "")
            if "," in b64_str:
                header, b64_data = b64_str.split(",", 1)
                if "png" in header:
                    mime_type = "image/png"
                elif "webp" in header:
                    mime_type = "image/webp"
                b64_str = b64_data

            try:
                image_bytes = base64.b64decode(b64_str)
            except Exception as e:
                return Response(
                    {"status": "error", "message": f"Invalid base64 image data: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        if not image_bytes or len(image_bytes) < 100:
            return Response(
                {"status": "error", "message": "No valid leaf image provided for analysis."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            diagnosis = diagnose_leaf_image(image_bytes, mime_type=mime_type, language=language)

            return Response({
                "status": "success",
                "diagnosis": diagnosis,
                "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
                "language": language
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "status": "error",
                "message": f"Leaf pathology diagnosis failed: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LeafDiseaseSampleCasesView(APIView):
    """
    GET /api/leaf-disease/sample-cases/
    Returns curated regional crop pathology benchmark cases for 1-click test.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({
            "status": "success",
            "samples": SAMPLE_CASES
        }, status=status.HTTP_200_OK)
