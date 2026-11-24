"""
AgroRise AI - Kerala Agricultural Facilities & Nearby Locations Database
Provides verified Krishi Bhavans, KAU Soil Testing Labs, and Weather Stations across Kerala.
"""

DISTRICT_COORDINATES = {
    "Kozhikode": {"lat": 11.2588, "lng": 75.7804},
    "Palakkad": {"lat": 10.7867, "lng": 76.6548},
    "Wayanad": {"lat": 11.6854, "lng": 76.1320},
    "Thrissur": {"lat": 10.5276, "lng": 76.2144},
    "Alappuzha": {"lat": 9.4981, "lng": 76.3388},
    "Ernakulam": {"lat": 9.9816, "lng": 76.2999},
    "Idukki": {"lat": 9.8500, "lng": 76.9667},
    "Malappuram": {"lat": 11.0510, "lng": 76.0711},
    "Kannur": {"lat": 11.8745, "lng": 75.3704},
    "Kasaragod": {"lat": 12.5102, "lng": 74.9852},
    "Kottayam": {"lat": 9.5916, "lng": 76.5222},
    "Kollam": {"lat": 8.8932, "lng": 76.6141},
    "Pathanamthitta": {"lat": 9.2648, "lng": 76.7870},
    "Thiruvananthapuram": {"lat": 8.5241, "lng": 76.9366}
}

NEARBY_AGRICULTURAL_FACILITIES = {
    "Kozhikode": [
        {
            "name": "District Soil Testing Laboratory, Kozhikode",
            "type": "Soil Testing Lab",
            "malayalam": "ജില്ലാ മണ്ണ് പരിശോധനാ ലബോറട്ടറി",
            "lat": 11.2685,
            "lng": 75.7920,
            "address": "Civil Station, Kozhikode - 673020",
            "contact": "0495-2371814",
            "services": ["Complete Soil pH & N-P-K", "Micro-nutrient Analysis", "Soil Health Card"]
        },
        {
            "name": "Principal Agricultural Office & Krishi Bhavan, Kozhikode",
            "type": "Krishi Bhavan",
            "malayalam": "കൃഷിഭവൻ, കോഴിക്കോട്",
            "lat": 11.2612,
            "lng": 75.7865,
            "address": "Civil Station Road, Kozhikode",
            "contact": "0495-2371810",
            "services": ["Seed Subsidy", "Organic Manure Distribution", "Krishi Officer Consultation"]
        },
        {
            "name": "Indian Institute of Spices Research (ICAR-IISR)",
            "type": "Research Station",
            "malayalam": "ഐ.ഐ.എസ്.ആർ സുഗന്ധവിള ഗവേഷണ കേന്ദ്രം",
            "lat": 11.2980,
            "lng": 75.7890,
            "address": "Marikunnu P.O, Kozhikode - 673012",
            "contact": "0495-2731410",
            "services": ["Spices Tissue Culture", "Bio-control Agents", "Quality Planting Material"]
        }
    ],
    "Palakkad": [
        {
            "name": "District Soil Testing Laboratory, Palakkad",
            "type": "Soil Testing Lab",
            "malayalam": "ജില്ലാ മണ്ണ് പരിശോധനാ കേന്ദ്രം, പാലക്കാട്",
            "lat": 10.7890,
            "lng": 76.6510,
            "address": "Civil Station Compound, Palakkad",
            "contact": "0491-2505295",
            "services": ["Black Cotton Soil Analysis", "Alkaline / Saline Testing", "Soil Health Card"]
        },
        {
            "name": "Regional Agricultural Research Station (RARS Pattambi - KAU)",
            "type": "Research Station",
            "malayalam": "ആർ.എ.ആർ.എസ് കാർഷിക ഗവേഷണ കേന്ദ്രം, പട്ടാമ്പി",
            "lat": 10.8030,
            "lng": 76.1960,
            "address": "Mele Pattambi, Palakkad - 679306",
            "contact": "0466-2212228",
            "services": ["High Yielding Paddy Varieties (Uma, Jyothi)", "Farm Advisory", "Seed Distribution"]
        },
        {
            "name": "Krishi Bhavan, Chittur (Sugarcane & Black Soil Belt)",
            "type": "Krishi Bhavan",
            "malayalam": "കൃഷിഭവൻ, ചിറ്റൂർ",
            "lat": 10.7020,
            "lng": 76.7210,
            "address": "Chittur-Thathamangalam, Palakkad",
            "contact": "04923-222410",
            "services": ["Sugarcane / Paddy Subsidies", "Drip Irrigation Aid", "Crop Insurance"]
        }
    ],
    "Wayanad": [
        {
            "name": "Regional Agricultural Research Station (RARS Ambalavayal - KAU)",
            "type": "Research Station & Soil Lab",
            "malayalam": "ആർ.എ.ആർ.എസ് കാർഷിക ഗവേഷണ കേന്ദ്രം, അമ്പലവയൽ",
            "lat": 11.6180,
            "lng": 76.2150,
            "address": "Ambalavayal P.O, Wayanad - 673593",
            "contact": "04936-260421",
            "services": ["Forest Soil Analysis", "Spices & Robusta Coffee Seedlings", "Organic Farming Advisory"]
        },
        {
            "name": "District Soil Testing Laboratory, Mananthavady",
            "type": "Soil Testing Lab",
            "malayalam": "മണ്ണ് പരിശോധനാ ലബോറട്ടറി, മാനന്തവാടി",
            "lat": 11.8020,
            "lng": 76.0040,
            "address": "Near Civil Station, Mananthavady, Wayanad",
            "contact": "04935-240320",
            "services": ["High Range Acidity Testing", "Dolomite Dosage Verification", "Soil Cards"]
        },
        {
            "name": "Krishi Bhavan, Kalpetta",
            "type": "Krishi Bhavan",
            "malayalam": "കൃഷിഭവൻ, കൽപ്പറ്റ",
            "lat": 11.6080,
            "lng": 76.0820,
            "address": "Main Road, Kalpetta, Wayanad",
            "contact": "04936-202230",
            "services": ["Pepper & Coffee Subsidies", "Rainwater Harvesting Schemes"]
        }
    ],
    "Thrissur": [
        {
            "name": "Kerala Agricultural University (KAU) Headquarters & Labs",
            "type": "University & Central Lab",
            "malayalam": "കേരള കാർഷിക സർവ്വകലാശാല, വെള്ളാനിക്കര",
            "lat": 10.5510,
            "lng": 76.2810,
            "address": "KAU Main Campus, Vellanikkara, Thrissur - 680656",
            "contact": "0487-2438011",
            "services": ["State Central Soil Testing Lab", "Crop Disease Diagnostic Clinic", "Certified Seeds"]
        },
        {
            "name": "District Soil Testing Laboratory, Ayyanthole",
            "type": "Soil Testing Lab",
            "malayalam": "ജില്ലാ മണ്ണ് പരിശോധനാ കേന്ദ്രം, അയ്യന്തോൾ",
            "lat": 10.5310,
            "lng": 76.1950,
            "address": "Civil Station, Ayyanthole, Thrissur",
            "contact": "0487-2361250",
            "services": ["Kole Wetland Soil Testing", "Acidity & Organic Carbon", "Soil Cards"]
        }
    ],
    "Alappuzha": [
        {
            "name": "Rice Research Station, Moncompu (KAU - Kuttanad)",
            "type": "Research Station & Lab",
            "malayalam": "നെല്ല് ഗവേഷണ കേന്ദ്രം, മങ്കൊമ്പ് (കുട്ടനാട്)",
            "lat": 9.4920,
            "lng": 76.4520,
            "address": "Thekkekara, Moncompu, Alappuzha - 688503",
            "contact": "0477-2702263",
            "services": ["Acid Saline / Kari Soil Analysis", "Kuttanad Submerged Rice Advisory", "Pokkali Varieties"]
        },
        {
            "name": "District Soil Testing Laboratory, Sanathanapuram",
            "type": "Soil Testing Lab",
            "malayalam": "ജില്ലാ മണ്ണ് പരിശോധനാ ലബോറട്ടറി, ആലപ്പുഴ",
            "lat": 9.4810,
            "lng": 76.3450,
            "address": "Sanathanapuram, Kalarcode, Alappuzha",
            "contact": "0477-2268480",
            "services": ["Wetland Soil Testing", "Lime & Salt Flushing Advisory"]
        }
    ],
    "Ernakulam": [
        {
            "name": "District Soil Testing Laboratory, Kakkanad",
            "type": "Soil Testing Lab",
            "malayalam": "ജില്ലാ മണ്ണ് പരിശോധനാ ലബോറട്ടറി, കാക്കനാട്",
            "lat": 10.0150,
            "lng": 76.3520,
            "address": "Civil Station, Kakkanad, Ernakulam",
            "contact": "0484-2422265",
            "services": ["Alluvial Soil Nutrient Analysis", "Soil Health Card"]
        },
        {
            "name": "Rice Research Station, Vytilla (KAU)",
            "type": "Research Station",
            "malayalam": "നെല്ല് ഗവേഷണ കേന്ദ്രം, വൈറ്റില",
            "lat": 9.9670,
            "lng": 76.3190,
            "address": "Kaniyampuzha Road, Vytilla, Kochi - 682019",
            "contact": "0484-2808208",
            "services": ["Saline Resistant Pokkali Seed Varieties (Vytilla-1 to 8)"]
        }
    ],
    "Thiruvananthapuram": [
        {
            "name": "Central Soil Testing Laboratory, Parottukonam",
            "type": "Soil Testing Lab",
            "malayalam": "സെൻട്രൽ മണ്ണ് പരിശോധനാ ലബോറട്ടറി, പറോട്ടുകോണം",
            "lat": 8.5410,
            "lng": 76.9380,
            "address": "Parottukonam, Nalanchira P.O, Thiruvananthapuram",
            "contact": "0471-2530570",
            "services": ["Comprehensive Soil Analysis", "Heavy Metal Testing", "Fertilizer Recommendation"]
        },
        {
            "name": "ICAR - Central Tuber Crops Research Institute (CTCRI)",
            "type": "National Research Institute",
            "malayalam": "കേന്ദ്ര കിഴങ്ങുവിള ഗവേഷണ കേന്ദ്രം (സി.ടി.സി.ആർ.ഐ)",
            "lat": 8.5320,
            "lng": 76.9020,
            "address": "Sreekariyam, Thiruvananthapuram - 695017",
            "contact": "0471-2598551",
            "services": ["Tapioca / Cassava Disease Free Stems", "Elephant Foot Yam Corms", "Tuber Value Addition"]
        }
    ]
}


def find_nearest_facilities(district_name, lat=None, lng=None):
    """
    Returns nearby agricultural centers, Krishi Bhavans, and soil testing labs.
    If lat and lng are provided, computes approximate distance in km.
    """
    import math

    dist_name = str(district_name).strip().title()
    if dist_name not in NEARBY_AGRICULTURAL_FACILITIES:
        # Fallback to closest available district
        facilities = NEARBY_AGRICULTURAL_FACILITIES.get("Kozhikode", [])
    else:
        facilities = NEARBY_AGRICULTURAL_FACILITIES[dist_name]

    coords = DISTRICT_COORDINATES.get(dist_name, DISTRICT_COORDINATES["Kozhikode"])
    user_lat = float(lat) if lat is not None else coords["lat"]
    user_lng = float(lng) if lng is not None else coords["lng"]

    def haversine_km(lat1, lon1, lat2, lon2):
        r = 6371.0
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (math.sin(dlat / 2.0) ** 2 +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
             math.sin(dlon / 2.0) ** 2)
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        return round(r * c, 1)

    result = []
    for fac in facilities:
        dist_km = haversine_km(user_lat, user_lng, fac["lat"], fac["lng"])
        result.append({
            **fac,
            "distance_km": dist_km,
            "map_url": f"https://www.openstreetmap.org/?mlat={fac['lat']}&mlon={fac['lng']}#map=15/{fac['lat']}/{fac['lng']}"
        })

    result.sort(key=lambda x: x["distance_km"])

    return {
        "district": dist_name,
        "center_coordinates": {"lat": user_lat, "lng": user_lng},
        "facilities": result
    }
