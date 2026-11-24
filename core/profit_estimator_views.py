"""
AgroRise AI - Module 4: Crop Profit Estimator Views
"""

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .ml.profit_estimator import CROP_ECONOMIC_PROFILES, estimate_crop_profit
from .ml.analyzer import SmartLandAnalyzer


class CropProfitCalculateView(APIView):
    """
    POST: Calculate crop cultivation cost, revenue, profit, loss risk,
    and break-even across Low, Medium, and High scenarios.
    """
    permission_classes = (AllowAny,)

    def post(self, request):
        data = request.data or {}

        crop_id = data.get("crop_id", "nendran_banana")
        raw_area = data.get("land_area", 20)
        unit = data.get("land_area_unit", "CENTS")
        district = data.get("district", "Kozhikode")

        area_cents = SmartLandAnalyzer.normalize_to_cents(raw_area, unit)

        custom_expenses = data.get("custom_expenses") or {}
        custom_price = data.get("custom_price")

        try:
            result = estimate_crop_profit(
                crop_id=crop_id,
                land_area_cents=area_cents,
                custom_expenses=custom_expenses,
                custom_price=custom_price,
                district=district
            )
            result["input_summary"] = {
                "original_area": f"{raw_area} {unit}",
                "area_cents": area_cents,
                "crop_id": crop_id,
                "district": district
            }
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": "error",
                "message": f"Crop profit estimation failed: {str(e)}"
            }, status=status.HTTP_400_BAD_REQUEST)


class CropProfitMetadataView(APIView):
    """
    GET: Return available crops and baseline expense / yield benchmarks.
    """
    permission_classes = (AllowAny,)

    def get(self, request):
        crops_list = []
        for cid, prof in CROP_ECONOMIC_PROFILES.items():
            crops_list.append({
                "id": prof["id"],
                "name": prof["name"],
                "malayalam": prof["malayalam"],
                "unit": prof["unit_name"],
                "default_expenses_per_cent": prof["default_expenses_per_cent"],
                "yield_per_cent_kg": prof["yield_per_cent_kg"],
                "selling_price_per_kg_inr": prof["selling_price_per_kg_inr"]
            })

        return Response({
            "status": "success",
            "crops": crops_list
        }, status=status.HTTP_200_OK)
