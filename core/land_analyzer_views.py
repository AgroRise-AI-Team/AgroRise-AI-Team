"""
AgroRise AI - Module 2: Smart Land Analyzer API Views
"""

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .ml.analyzer import land_analyzer
from .ml.crop_dataset import (
    KERALA_DISTRICTS,
    DISTRICT_LOCATION_PROFILES,
    SOIL_TYPE_PROPERTIES,
    CROPS_DATABASE
)


class SmartLandAnalyzerView(APIView):
    """
    POST: Run Smart Land Analysis on user land parameters.
    Returns ranked crop options, location intelligence, reasons, missing information, confidence, and financials.
    """
    permission_classes = (AllowAny,)

    def post(self, request):
        payload = request.data or {}

        # If user is authenticated and didn't provide some fields, optional prefill
        if request.user.is_authenticated and hasattr(request.user, 'profile'):
            profile = request.user.profile
            if 'district' not in payload and profile.district:
                payload['district'] = profile.district
            if 'land_area' not in payload and profile.land_area:
                payload['land_area'] = float(profile.land_area)
            if 'land_area_unit' not in payload and profile.land_area_unit:
                payload['land_area_unit'] = profile.land_area_unit
            if 'budget' not in payload and profile.cultivation_budget:
                payload['budget'] = float(profile.cultivation_budget)

        try:
            analysis_result = land_analyzer.analyze(payload)
            return Response(analysis_result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "status": "error",
                "message": f"Land analysis failed: {str(e)}"
            }, status=status.HTTP_400_BAD_REQUEST)


from .ml.nearby_facilities import find_nearest_facilities, DISTRICT_COORDINATES


class SmartLandNearbyFacilitiesView(APIView):
    """
    GET: Return nearby Krishi Bhavans, KAU Soil Testing Labs, and Research Centers for a location.
    Query params: ?district=Kozhikode&lat=11.25&lng=75.78
    """
    permission_classes = (AllowAny,)

    def get(self, request):
        district = request.query_params.get('district', 'Kozhikode')
        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')

        data = find_nearest_facilities(district, lat=lat, lng=lng)
        return Response(data, status=status.HTTP_200_OK)


class SmartLandDistrictProfileView(APIView):
    """
    GET: Returns rich agro-climatic profile and signature crops for a selected district.
    Query param: ?district=Palakkad
    """
    permission_classes = (AllowAny,)

    def get(self, request):
        district = request.query_params.get('district', 'Kozhikode')
        profile = land_analyzer.get_location_profile(district)
        return Response(profile, status=status.HTTP_200_OK)


class SmartLandAnalyzerMetadataView(APIView):
    """
    GET: Returns metadata, district profiles, and options for the Smart Land Analyzer UI.
    """
    permission_classes = (AllowAny,)

    def get(self, request):
        soil_types_data = []
        for k, v in SOIL_TYPE_PROPERTIES.items():
            soil_types_data.append({
                "id": k,
                "name": v["name"],
                "malayalam": v["malayalam"],
                "typical_ph_range": v["typical_ph_range"],
                "description": v["description"]
            })

        metadata = {
            "districts": KERALA_DISTRICTS,
            "district_profiles": DISTRICT_LOCATION_PROFILES,
            "soil_types": soil_types_data,
            "land_area_units": [
                {"id": "CENTS", "label": "Cents (സെന്റ്)", "default": True},
                {"id": "ACRES", "label": "Acres (ഏക്കർ)"},
                {"id": "HECTARES", "label": "Hectares (ഹെക്ടർ)"}
            ],
            "water_availability": [
                {"id": "HIGH", "label": "High - Abundant Year-Round Water (ധാരാളം വെള്ളം)", "desc": "Canal, continuous borewell or river access"},
                {"id": "MEDIUM", "label": "Medium - Seasonal / Adequate Water (ആവശ്യത്തിന് വെള്ളം)", "desc": "Open well / seasonal pond, good for most crops"},
                {"id": "LOW", "label": "Low - Limited Water (കുറഞ്ഞ വെള്ളം)", "desc": "Summer shortage, requires drip/mulching"},
                {"id": "SCARCE", "label": "Scarce - Severe Water Scarcity (കടുത്ത ജലക്ഷാമം)", "desc": "Drought prone, rainfed only"}
            ],
            "water_sources": [
                {"id": "OPEN_WELL", "label": "Open Well (തുറന്ന കിണർ)"},
                {"id": "BOREWELL", "label": "Borewell (കുഴൽക്കിണർ)"},
                {"id": "CANAL_RIVER", "label": "Canal / River (തോട് / പുഴ)"},
                {"id": "POND", "label": "Farm Pond / Rainwater Harvesting (കുളം)"},
                {"id": "RAINFED", "label": "Rainfed Only (മഴയെ മാത്രം ആശ്രയിച്ച്)"}
            ],
            "sunlight_options": [
                {"id": "GOOD", "label": "Good / Full Sunlight (>6-8 hrs daily)", "desc": "Unobstructed direct sun throughout the day"},
                {"id": "PARTIAL", "label": "Partial Sunlight / Semi-Shade (3-5 hrs)", "desc": "Filtered sunlight under trees or afternoon shade"},
                {"id": "SHADE", "label": "Heavy Shade / Low Sunlight (<3 hrs)", "desc": "Dense canopy or shaded courtyard/valley"}
            ],
            "slope_options": [
                {"id": "FLAT", "label": "Flat / Plain (0 - 3% slope)", "desc": "Wetland or leveled field; ideal for paddy or flood irrigation"},
                {"id": "GENTLE", "label": "Gentle Slope (3 - 10% slope)", "desc": "Slight gradient; good natural drainage for banana, vegetables"},
                {"id": "MODERATE", "label": "Moderate Slope (10 - 25% slope)", "desc": "Terracing or contour bunds recommended"},
                {"id": "STEEP", "label": "Steep / Hilly (>25% slope)", "desc": "High ranges / hill slopes; tea, coffee, rubber, spices"}
            ],
            "seasons": [
                {"id": "MUNDAKAN", "label": "Mundakan / Rabi (Oct - Jan/Feb)", "desc": "North-East monsoon & cool winter season"},
                {"id": "VIRIPPU", "label": "Virippu / Kharif (May/June - Sep/Oct)", "desc": "South-West monsoon season (heavy rains)"},
                {"id": "PUNCHA", "label": "Puncha / Summer (Jan/Feb - April/May)", "desc": "Irrigated summer season"},
                {"id": "ALL_SEASON", "label": "All Season / Perennial", "desc": "Year-round plantation / perennial crops"}
            ],
            "example_presets": [
                {
                    "name": "Kozhikode • 20 Cents (Banana/Vegetables)",
                    "district": "Kozhikode",
                    "land_area": 20,
                    "land_area_unit": "CENTS",
                    "soil_type": "LATERITE",
                    "soil_type_confirmed": True,
                    "water_availability": "MEDIUM",
                    "water_source": "OPEN_WELL",
                    "sunlight": "GOOD",
                    "land_slope": "GENTLE",
                    "season": "MUNDAKAN",
                    "budget": 15000,
                    "has_soil_test": False
                },
                {
                    "name": "Palakkad • 1 Acre (Paddy/Sugarcane)",
                    "district": "Palakkad",
                    "land_area": 1,
                    "land_area_unit": "ACRES",
                    "soil_type": "BLACK_COTTON",
                    "soil_type_confirmed": True,
                    "water_availability": "HIGH",
                    "water_source": "CANAL_RIVER",
                    "sunlight": "GOOD",
                    "land_slope": "FLAT",
                    "season": "MUNDAKAN",
                    "budget": 45000,
                    "has_soil_test": False
                },
                {
                    "name": "Wayanad • 50 Cents (Pepper/Coffee Spices)",
                    "district": "Wayanad",
                    "land_area": 50,
                    "land_area_unit": "CENTS",
                    "soil_type": "FOREST_LOAM",
                    "soil_type_confirmed": True,
                    "water_availability": "HIGH",
                    "water_source": "OPEN_WELL",
                    "sunlight": "PARTIAL",
                    "land_slope": "MODERATE",
                    "season": "ALL_SEASON",
                    "budget": 25000,
                    "has_soil_test": False
                },
                {
                    "name": "Alappuzha • 1 Acre (Kuttanad Wetland Rice)",
                    "district": "Alappuzha",
                    "land_area": 1,
                    "land_area_unit": "ACRES",
                    "soil_type": "CLAYEY_KOLE",
                    "soil_type_confirmed": True,
                    "water_availability": "HIGH",
                    "water_source": "CANAL_RIVER",
                    "sunlight": "GOOD",
                    "land_slope": "FLAT",
                    "season": "PUNCHA",
                    "budget": 45000,
                    "has_soil_test": False
                }
            ]
        }
        return Response(metadata, status=status.HTTP_200_OK)
