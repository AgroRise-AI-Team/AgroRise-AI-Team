"""
AgroRise AI - Kerala Agronomic Crop Dataset & Knowledge Base
Module 2: Smart Land Analyzer

Calibrated using:
- Kerala Agricultural University (KAU) "Package of Practices: Crops"
- ICAR - Central Tuber Crops Research Institute (CTCRI) & CPCRI
- State Department of Agriculture, Government of Kerala
"""

KERALA_DISTRICTS = [
    "Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod",
    "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad",
    "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"
]

# Soil Types in Kerala
SOIL_TYPE_PROPERTIES = {
    "LATERITE": {
        "name": "Laterite Soil",
        "malayalam": "ചെങ്കൽ മണ്ണ്",
        "typical_ph_range": (4.5, 6.0),
        "typical_n": "Low to Medium",
        "typical_p": "Low (high P fixation)",
        "typical_k": "Low to Medium",
        "drainage": "Good to Excessive",
        "description": "Predominant in midland Kerala (Kozhikode, Kannur, Malappuram, Kasaragod). Acidic, rich in iron/aluminum, requires liming (dolomite/lime) and organic compost."
    },
    "ALLUVIAL": {
        "name": "Coastal & Riverine Alluvium",
        "malayalam": "തീരദേശ / എക്കൽ മണ്ണ്",
        "typical_ph_range": (5.5, 7.0),
        "typical_n": "Medium",
        "typical_p": "Medium",
        "typical_k": "Medium",
        "drainage": "Moderate to Good",
        "description": "Found along riverbanks and coastal tracts. Ideal for coconut, vegetables, and wetland paddy."
    },
    "CLAYEY_KOLE": {
        "name": "Clayey / Kari / Kole Soil",
        "malayalam": "കരി / കോൾ മണ്ണ്",
        "typical_ph_range": (3.5, 5.5),
        "typical_n": "Medium to High",
        "typical_p": "Low",
        "typical_k": "Low",
        "drainage": "Poor (Waterlogged)",
        "description": "Found in Kuttanad (Alappuzha/Kottayam) and Thrissur-Ponnani kole wetlands. Rich in organic matter, ideal for submerged wetland rice."
    },
    "RED_LOAM": {
        "name": "Red Loam Soil",
        "malayalam": "ചുവന്ന പശിമരാശി",
        "typical_ph_range": (5.5, 6.8),
        "typical_n": "Medium",
        "typical_p": "Low to Medium",
        "typical_k": "Medium",
        "drainage": "Good",
        "description": "Found in parts of Palakkad and Thiruvananthapuram. Well-drained, porous, supports banana, tapioca, pulses, and groundnut."
    },
    "BLACK_COTTON": {
        "name": "Black Cotton Soil",
        "malayalam": "കറുത്ത മണ്ണ് (ചിറ്റൂർ)",
        "typical_ph_range": (7.0, 8.5),
        "typical_n": "Medium",
        "typical_p": "Low to Medium",
        "typical_k": "High",
        "drainage": "Poor when wet (high swelling/shrinkage)",
        "description": "Found primarily in Chittur taluk of Palakkad. Alkaline/neutral pH (7.0-8.5), high moisture retention, ideal for sugarcane, cotton, and pulses. Does not require lime!"
    },
    "SANDY_LOAM": {
        "name": "Sandy Loam",
        "malayalam": "മണൽ കലർന്ന പശിമരാശി",
        "typical_ph_range": (5.8, 6.8),
        "typical_n": "Low to Medium",
        "typical_p": "Medium",
        "typical_k": "Low to Medium",
        "drainage": "Very Good",
        "description": "Light textured soil with rapid infiltration, ideal for tuber crops, ginger, turmeric, and vegetables."
    },
    "FOREST_LOAM": {
        "name": "Forest Loam",
        "malayalam": "വനമണ്ണ്",
        "typical_ph_range": (5.0, 6.5),
        "typical_n": "High",
        "typical_p": "Medium",
        "typical_k": "Medium to High",
        "drainage": "Good",
        "description": "Rich in organic carbon (>1.5%), dark colored, found in high ranges of Wayanad and Idukki. Ideal for spices, coffee, tea, and cool-season vegetables."
    }
}

# -----------------------------------------------------------------------------
# Detailed Location & Agro-Climatic Profiles for All 14 Kerala Districts
# -----------------------------------------------------------------------------
DISTRICT_LOCATION_PROFILES = {
    "Palakkad": {
        "zone": "Palakkad Plains / Rain Shadow & Granary Zone",
        "zone_ml": "പാലക്കാടൻ സമതല കാർഷിക മേഖല (കേരളത്തിന്റെ നെല്ലറ)",
        "climate_description": "Warm, sunny, semi-arid plains with Palakkad gap winds. High solar radiation and lower monsoon rainfall compared to coastal Kerala.",
        "signature_crops": ["Paddy / Rice (Palakkad Matta / Uma)", "Sugarcane (കരിമ്പ്)", "Nendran Banana (ഏത്തവാഴ)", "Groundnut & Pulses (നിലക്കടല / പയർ)"],
        "recommended_soil": "BLACK_COTTON",
        "secondary_soils": ["RED_LOAM", "ALLUVIAL", "LATERITE"],
        "typical_slope": "FLAT",
        "typical_water": "MEDIUM",
        "typical_water_source": "CANAL_RIVER",
        "typical_sunlight": "GOOD",
        "soil_advisory": "Palakkad plains feature fertile Black Cotton soil (Chittur) and Red Loam. Unlike coastal laterite, black soils are neutral-to-alkaline (pH 7.0–8.2), rich in potassium, and require drainage management rather than liming."
    },
    "Kozhikode": {
        "zone": "Northern Midland & Coastal Zone",
        "zone_ml": "വടക്കൻ ഇടനാട് - തീരദേശ മേഖല",
        "climate_description": "Humid tropical climate with high rainfall (SW and NE monsoons), moderate temperatures (24-33°C), and coastal sea breezes.",
        "signature_crops": ["Nendran Banana (ഏത്തവാഴ)", "Kuttiyadi Coconut (കുറ്റ്യാടി തെങ്ങ്)", "Ginger (മാരൻ ഇഞ്ചി)", "Tapioca (കപ്പ)", "Mixed Vegetables (വെണ്ട, പയർ)"],
        "recommended_soil": "LATERITE",
        "secondary_soils": ["ALLUVIAL", "SANDY_LOAM"],
        "typical_slope": "GENTLE",
        "typical_water": "MEDIUM",
        "typical_water_source": "OPEN_WELL",
        "typical_sunlight": "GOOD",
        "soil_advisory": "Kozhikode soils are predominantly Laterite and Coastal Alluvium. Laterite is naturally acidic (pH 4.8–5.8). Liming (കുമ്മായം/ഡോളമൈറ്റ് @ 1-2 kg/cent) and organic compost are essential for optimal root uptake."
    },
    "Wayanad": {
        "zone": "High Altitude / Western Ghats Hill Zone",
        "zone_ml": "ഉയർന്ന മലയോര കാർഷിക മേഖല (>700m MSL)",
        "climate_description": "Cool subtropical high-range climate, high humidity, frequent mist, and rich forest canopy. Annual rainfall 2,500-3,500mm.",
        "signature_crops": ["Black Pepper (കുരുമുളക്)", "Robusta Coffee (റോബസ്റ്റ കാപ്പി)", "Ginger (മാരൻ ഇഞ്ചി)", "Cardamom (ഏലം)", "Gandhakasala Scented Rice"],
        "recommended_soil": "FOREST_LOAM",
        "secondary_soils": ["LATERITE", "RED_LOAM"],
        "typical_slope": "MODERATE",
        "typical_water": "HIGH",
        "typical_water_source": "OPEN_WELL",
        "typical_sunlight": "PARTIAL",
        "soil_advisory": "Wayanad features fertile Forest Loam rich in organic carbon (>1.5%). Acidic to slightly acidic (pH 5.2–6.2). Terracing and contour farming are crucial on rolling slopes."
    },
    "Idukki": {
        "zone": "High Altitude / Hill & Spice Sanctuary Zone",
        "zone_ml": "ഹൈറേഞ്ച് സുഗന്ധവ്യഞ്ജന മേഖല (>900m MSL)",
        "climate_description": "Cool high range temperatures (15-26°C), heavy rainfall, dense shade, ideal for premium spices and plantation crops.",
        "signature_crops": ["Cardamom (ഏലം - സുഗന്ധറാണി)", "Black Pepper (കുരുമുളക്)", "Robusta Coffee (റോബസ്റ്റ കാപ്പി)", "Nutmeg & Clove (ജാതിക്ക / ഗ്രാമ്പൂ)"],
        "recommended_soil": "FOREST_LOAM",
        "secondary_soils": ["LATERITE"],
        "typical_slope": "STEEP",
        "typical_water": "HIGH",
        "typical_water_source": "POND",
        "typical_sunlight": "SHADE",
        "soil_advisory": "Forest soils rich in humus and micronutrients. Avoid clear felling; maintain tree canopy and apply dolomite to neutralize high acidity."
    },
    "Alappuzha": {
        "zone": "Coastal Wetland / Kuttanad Below-Sea-Level Zone",
        "zone_ml": "കുട്ടനാട് തണ്ണീർത്തട കാർഷിക മേഖല (സമുദ്രനിരപ്പിന് താഴെ)",
        "climate_description": "Wetland floodplains, backwaters, and coastal sandy strip. Submerged farming systems (FAO Globally Important Agricultural Heritage).",
        "signature_crops": ["Wetland Paddy (Puncha / Pokkali)", "Coconut on Bunds (വരമ്പിലെ തെങ്ങ്)", "Short-Duration Vegetables", "Tapioca on Mounds"],
        "recommended_soil": "CLAYEY_KOLE",
        "secondary_soils": ["ALLUVIAL", "SANDY_LOAM"],
        "typical_slope": "FLAT",
        "typical_water": "HIGH",
        "typical_water_source": "CANAL_RIVER",
        "typical_sunlight": "GOOD",
        "soil_advisory": "Kuttanad Kari and Kayal soils are heavily acidic and occasionally saline (acid sulphate soils, pH 3.8–5.0). Systematic flushing of acid salts and liberal liming (500 kg/ha) are required before sowing."
    },
    "Thrissur": {
        "zone": "Central Midland & Kole Wetland Zone",
        "zone_ml": "മധ്യകേരള ഇടനാട് & കോൾ നില കാർഷിക മേഖല",
        "climate_description": "Diverse agro-ecology spanning coastal belt, Kole rice lands, and fertile midland undulating terrain.",
        "signature_crops": ["Wetland Paddy (കോൾ നെൽകൃഷി - ഉമ)", "Nendran Banana (ഏത്തവാഴ)", "Coconut (തെങ്ങ്)", "Nutmeg (ജാതിക്ക)", "Vegetables (വെണ്ട, പയർ)"],
        "recommended_soil": "CLAYEY_KOLE",
        "secondary_soils": ["LATERITE", "ALLUVIAL"],
        "typical_slope": "FLAT",
        "typical_water": "HIGH",
        "typical_water_source": "POND",
        "typical_sunlight": "GOOD",
        "soil_advisory": "Kole wetlands feature deep clayey soils with high water table. Midland soils are lateritic requiring lime and drainage bunds."
    },
    "Malappuram": {
        "zone": "Northern Midland & River Valley Zone",
        "zone_ml": "മലപ്പുറം ഇടനാട് - നദീതട കാർഷിക മേഖല",
        "climate_description": "Warm humid tropical climate with prominent Bharathapuzha and Chaliyar river basins. Rich alluvial flood plains and rolling laterite hills.",
        "signature_crops": ["Nendran Banana (ഏത്തവാഴ)", "Coconut (തെങ്ങ്)", "Tapioca (കപ്പ)", "Arecanut (അടയ്ക്ക)", "Ginger & Turmeric (ഇഞ്ചി, മഞ്ഞൾ)"],
        "recommended_soil": "LATERITE",
        "secondary_soils": ["ALLUVIAL", "SANDY_LOAM"],
        "typical_slope": "GENTLE",
        "typical_water": "MEDIUM",
        "typical_water_source": "OPEN_WELL",
        "typical_sunlight": "GOOD",
        "soil_advisory": "Deep red laterite soils with moderate depth. Respond strongly to farmyard manure, poultry compost, and liming."
    },
    "Kannur": {
        "zone": "Northern Coastal & Laterite Hill Zone",
        "zone_ml": "കണ്ണൂർ തീരദേശ & ചെങ്കൽ കുന്നിൻ പ്രദേശം",
        "climate_description": "High monsoon rainfall, coastal breeze, undulating midlands transitioning to Western Ghats foothills.",
        "signature_crops": ["Cashew (കശുമാവ്)", "Black Pepper (കുരുമുളക്)", "Coconut (തെങ്ങ്)", "Nendran Banana (ഏത്തവാഴ)", "Turmeric (മഞ്ഞൾ)"],
        "recommended_soil": "LATERITE",
        "secondary_soils": ["ALLUVIAL", "SANDY_LOAM"],
        "typical_slope": "GENTLE",
        "typical_water": "MEDIUM",
        "typical_water_source": "OPEN_WELL",
        "typical_sunlight": "GOOD",
        "soil_advisory": "Laterite crusting can occur during summer. Mulching with dried leaves or coir pith preserves soil moisture."
    },
    "Kasaragod": {
        "zone": "Northern Coastal & Laterite Zone",
        "zone_ml": "കാസർഗോഡ് ചെങ്കൽ & തീരദേശ മേഖല",
        "climate_description": "Northern coastal agro-climate with heavy South-West monsoon and sharp summer dry spells.",
        "signature_crops": ["Arecanut (അടയ്ക്ക)", "Coconut (തെങ്ങ്)", "Black Pepper (കുരുമുളക്)", "Cashew (കശുമാവ്)", "Tapioca (കപ്പ)"],
        "recommended_soil": "LATERITE",
        "secondary_soils": ["ALLUVIAL", "RED_LOAM"],
        "typical_slope": "GENTLE",
        "typical_water": "MEDIUM",
        "typical_water_source": "BOREWELL",
        "typical_sunlight": "GOOD",
        "soil_advisory": "Hard laterite pans occur at shallow depth. Dig deeper pits (75x75x75cm) and fill with topsoil + compost for banana and fruit trees."
    },
    "Kottayam": {
        "zone": "Wetland & Midland Rubber Belt Zone",
        "zone_ml": "കോട്ടയം തണ്ണീർത്തട & റബ്ബർ മേഖല",
        "climate_description": "Well-distributed rainfall, humid tropical conditions, lake margins (Vembanad) to gentle midland slopes.",
        "signature_crops": ["Rubber (റബ്ബർ)", "Nendran Banana (ഏത്തവാഴ)", "Tapioca (കപ്പ)", "Nutmeg (ജാതിക്ക)", "Wetland Paddy (നെല്ല്)"],
        "recommended_soil": "LATERITE",
        "secondary_soils": ["CLAYEY_KOLE", "ALLUVIAL"],
        "typical_slope": "GENTLE",
        "typical_water": "HIGH",
        "typical_water_source": "OPEN_WELL",
        "typical_sunlight": "GOOD",
        "soil_advisory": "High organic matter in eastern slopes; acid saline soils near western lake basins. Apply dolomite to neutralize high subsoil acidity."
    },
    "Ernakulam": {
        "zone": "Central Coastal & Midland River Basin",
        "zone_ml": "എറണാകുളം തീരദേശ - പെരിയാർ നദീതട മേഖല",
        "climate_description": "Periyar river delta with rich alluvial deposits, coastal wetlands (Pokkali saline tracts), and commercial farming.",
        "signature_crops": ["Pokkali Rice / Prawn Farming", "Nendran Banana (ഏത്തവാഴ)", "Nutmeg (ജാതിക്ക)", "Pineapple (പൈനാപ്പിൾ - വാഴക്കുളം)", "Vegetables"],
        "recommended_soil": "ALLUVIAL",
        "secondary_soils": ["LATERITE", "SANDY_LOAM"],
        "typical_slope": "FLAT",
        "typical_water": "HIGH",
        "typical_water_source": "CANAL_RIVER",
        "typical_sunlight": "GOOD",
        "soil_advisory": "Alluvial deposits along Periyar basin are naturally fertile. Coastal Pokkali tracts require saline-resistant varieties (Vytilla-1 to 8)."
    },
    "Kollam": {
        "zone": "Southern Coastal & Midland Zone",
        "zone_ml": "കൊല്ലം തീരദേശ - ഇടനാട് കാർഷിക മേഖല",
        "climate_description": "Bimodal rainfall distribution (both SW and NE monsoons), humid coastal climate, Ashtamudi wetland basin.",
        "signature_crops": ["Tapioca (കപ്പ - വെള്ളായണി ഹ്രസ്വ)", "Coconut (തെങ്ങ്)", "Cashew (കശുമാവ്)", "Black Pepper (കുരുമുളക്)", "Vegetables (വെണ്ട, വഴുതന)"],
        "recommended_soil": "LATERITE",
        "secondary_soils": ["ALLUVIAL", "SANDY_LOAM"],
        "typical_slope": "GENTLE",
        "typical_water": "MEDIUM",
        "typical_water_source": "OPEN_WELL",
        "typical_sunlight": "GOOD",
        "soil_advisory": "Tuber crops thrive exceptionally well in Kollam's well-drained laterite and sandy loam. Add potash for maximum starch accumulation."
    },
    "Pathanamthitta": {
        "zone": "Southern Midland & Foothill Zone",
        "zone_ml": "പത്തനംതിട്ട മലയോര താഴ്‌വര മേഖല",
        "climate_description": "Heavy rainfall, high humidity, foothills of Western Ghats with rich natural tree cover.",
        "signature_crops": ["Rubber (റബ്ബർ)", "Tapioca (കപ്പ)", "Nendran Banana (ഏത്തവാഴ)", "Nutmeg (ജാതിക്ക)", "Black Pepper (കുരുമുളക്)"],
        "recommended_soil": "LATERITE",
        "secondary_soils": ["FOREST_LOAM", "RED_LOAM"],
        "typical_slope": "MODERATE",
        "typical_water": "HIGH",
        "typical_water_source": "OPEN_WELL",
        "typical_sunlight": "GOOD",
        "soil_advisory": "Foothill laterite is prone to erosion during peak monsoon. Implement contour bunds and half-moon terracing."
    },
    "Thiruvananthapuram": {
        "zone": "Southern Midland & Coastal Zone",
        "zone_ml": "തെക്കൻ ഇടനാട് - തീരദേശ മേഖല",
        "climate_description": "Tropical climate with two distinct monsoons, warm sunny dry period from January to April.",
        "signature_crops": ["Tapioca (കപ്പ)", "Red Banana (ചെങ്കദളി)", "Coconut (തെങ്ങ്)", "Amaranthus (ചീര)", "Cowpea & Okra (പയർ, വെണ്ട)"],
        "recommended_soil": "RED_LOAM",
        "secondary_soils": ["LATERITE", "SANDY_LOAM"],
        "typical_slope": "GENTLE",
        "typical_water": "MEDIUM",
        "typical_water_source": "OPEN_WELL",
        "typical_sunlight": "GOOD",
        "soil_advisory": "Red loam soils in southern taluks (Neyyattinkara, Nedumangad) have good permeability. Fosters excellent root and tuber development."
    }
}

DISTRICT_AGRO_CLIMATIC_ZONE = {k: v["zone"] for k, v in DISTRICT_LOCATION_PROFILES.items()}

# -----------------------------------------------------------------------------
# Comprehensive Crops Database (Calibrated with KAU Package of Practices)
# -----------------------------------------------------------------------------
CROPS_DATABASE = [
    {
        "id": "paddy_wetland",
        "name": "Paddy / Rice (Wetland - Uma / Jyothi)",
        "malayalam_name": "നെല്ല് (തണ്ണീർത്തടം - ഉമ / ജ്യോതി)",
        "suitable_soils": ["ALLUVIAL", "CLAYEY_KOLE", "LATERITE", "RED_LOAM", "BLACK_COTTON"],
        "min_ph": 4.5,
        "max_ph": 7.8,
        "ideal_ph": 6.2,
        "water_need": "HIGH",
        "water_sources_compatible": ["CANAL_RIVER", "POND", "BOREWELL", "OPEN_WELL", "RAINFED"],
        "sunlight_need": "GOOD",  # Full sun (>6 hrs)
        "max_slope": "FLAT",
        "slope_compatibility": ["FLAT"],
        "suitable_seasons": ["VIRIPPU", "MUNDAKAN", "PUNCHA"],
        "districts_priority": ["Palakkad", "Alappuzha", "Thrissur", "Kottayam", "Kozhikode", "Malappuram", "Kannur", "Ernakulam", "Wayanad"],
        "cost_per_cent_inr": 450,       # ~₹45,000 per acre (100 cents)
        "expected_yield_per_cent_kg": 22, # ~2,200 kg per acre
        "avg_selling_price_per_kg_inr": 28.20, # Supplyco procurement price ~₹28.20/kg
        "duration_days": 120,
        "category": "Cereal / Grain",
        "lime_requirement_in_laterite": "Apply 1-1.5 kg agricultural lime per cent (250 kg/ha) during basal tilling for acidic soils. Palakkad black soils do not need lime.",
        "agronomic_guidance": "Requires bunded flat land to retain standing water (2-5 cm). Transplant 18-20 day old seedlings."
    },
    {
        "id": "sugarcane_commercial",
        "name": "Sugarcane (കരിമ്പ് - മാധുരി / Co-86032)",
        "malayalam_name": "കരിമ്പ് (ചിറ്റൂർ കരിമ്പ്)",
        "suitable_soils": ["BLACK_COTTON", "ALLUVIAL", "RED_LOAM", "SANDY_LOAM"],
        "min_ph": 6.0,
        "max_ph": 8.5,
        "ideal_ph": 7.2,
        "water_need": "HIGH",
        "water_sources_compatible": ["CANAL_RIVER", "BOREWELL", "OPEN_WELL"],
        "sunlight_need": "GOOD",
        "max_slope": "FLAT",
        "slope_compatibility": ["FLAT", "GENTLE"],
        "suitable_seasons": ["ALL_SEASON", "MUNDAKAN", "PUNCHA"],
        "districts_priority": ["Palakkad", "Idukki", "Pathanamthitta"],
        "cost_per_cent_inr": 500,
        "expected_yield_per_cent_kg": 400, # ~40 tonnes per acre
        "avg_selling_price_per_kg_inr": 3.80, # Cane price per kg
        "duration_days": 330,
        "category": "Commercial Sugar Crop",
        "lime_requirement_in_laterite": "Thrives best in neutral-to-alkaline black cotton soils. Avoid highly acidic laterite.",
        "agronomic_guidance": "Iconic crop for Palakkad (Chittur belt) and Marayoor (Idukki). High sucrose recovery under bright sunlight."
    },
    {
        "id": "groundnut_pulses",
        "name": "Groundnut / Peanut (നിലക്കടല - TMV-2 / TG-37)",
        "malayalam_name": "നിലക്കടല (ചിറ്റൂർ നിലക്കടല)",
        "suitable_soils": ["RED_LOAM", "SANDY_LOAM", "BLACK_COTTON"],
        "min_ph": 6.0,
        "max_ph": 7.5,
        "ideal_ph": 6.5,
        "water_need": "LOW",
        "water_sources_compatible": ["OPEN_WELL", "BOREWELL", "RAINFED"],
        "sunlight_need": "GOOD",
        "max_slope": "GENTLE",
        "slope_compatibility": ["FLAT", "GENTLE"],
        "suitable_seasons": ["MUNDAKAN", "PUNCHA"],
        "districts_priority": ["Palakkad", "Kollam", "Kasaragod"],
        "cost_per_cent_inr": 220,
        "expected_yield_per_cent_kg": 15,
        "avg_selling_price_per_kg_inr": 75.0,
        "duration_days": 105,
        "category": "Oilseed / Legume",
        "lime_requirement_in_laterite": "Gypsum application (1-2 kg/cent) at flowering is critical for pod filling and calcium supply.",
        "agronomic_guidance": "High return oilseed crop suited to Palakkad's sunny, low-humidity winter season. Fixes atmospheric nitrogen."
    },
    {
        "id": "nendran_banana",
        "name": "Nendran Banana (ഏത്തവാഴ - നെടുനേന്ത്രൻ / മഞ്ചേരി)",
        "malayalam_name": "നേന്ത്രവാഴ (നെടുനേന്ത്രൻ / മഞ്ചേരി)",
        "suitable_soils": ["LATERITE", "ALLUVIAL", "RED_LOAM", "SANDY_LOAM", "BLACK_COTTON"],
        "min_ph": 5.5,
        "max_ph": 7.5,
        "ideal_ph": 6.4,
        "water_need": "MEDIUM",
        "water_sources_compatible": ["OPEN_WELL", "BOREWELL", "POND", "CANAL_RIVER"],
        "sunlight_need": "GOOD",
        "max_slope": "GENTLE",
        "slope_compatibility": ["FLAT", "GENTLE"],
        "suitable_seasons": ["MUNDAKAN", "VIRIPPU", "ALL_SEASON"],
        "districts_priority": ["Kozhikode", "Malappuram", "Thrissur", "Palakkad", "Kannur", "Ernakulam", "Wayanad", "Kottayam"],
        "cost_per_cent_inr": 600,       # ~₹60,000 per acre (~10 pits/cent, ~₹60/plant)
        "expected_yield_per_cent_kg": 90, # ~9-10 bunches of 9-10 kg each
        "avg_selling_price_per_kg_inr": 38.0,
        "duration_days": 290,
        "category": "Fruit / Commercial Cash Crop",
        "lime_requirement_in_laterite": "Apply 500g lime per pit 2 weeks before planting in acidic soils. In Palakkad black soil, reduce lime and focus on organic compost.",
        "agronomic_guidance": "Pits of 50x50x50 cm spaced 2x2 meters (10 pits per cent). High responsiveness to farmyard manure (10kg/pit) and potash."
    },
    {
        "id": "tapioca_cassava",
        "name": "Tapioca / Cassava (കപ്പ - വെള്ളായണി ഹ്രസ്വ / M-4)",
        "malayalam_name": "മരച്ചീനി / കപ്പ (വെള്ളായണി ഹ്രസ്വ / എം-4)",
        "suitable_soils": ["LATERITE", "RED_LOAM", "SANDY_LOAM", "ALLUVIAL"],
        "min_ph": 4.5,
        "max_ph": 7.0,
        "ideal_ph": 5.5,
        "water_need": "LOW",
        "water_sources_compatible": ["RAINFED", "OPEN_WELL", "BOREWELL", "POND"],
        "sunlight_need": "GOOD",
        "max_slope": "MODERATE",
        "slope_compatibility": ["FLAT", "GENTLE", "MODERATE"],
        "suitable_seasons": ["VIRIPPU", "MUNDAKAN", "ALL_SEASON"],
        "districts_priority": ["Kollam", "Pathanamthitta", "Thiruvananthapuram", "Kozhikode", "Malappuram", "Kottayam", "Ernakulam", "Kannur"],
        "cost_per_cent_inr": 250,       # ~₹25,000 per acre
        "expected_yield_per_cent_kg": 110, # ~11 tonnes per acre
        "avg_selling_price_per_kg_inr": 16.0,
        "duration_days": 210,
        "category": "Tuber / Root Crop",
        "lime_requirement_in_laterite": "Tolerates moderate acidity well; 500g lime per cent improves tuber starch synthesis.",
        "agronomic_guidance": "Form mounds or ridges. Highly drought-tolerant once established. Low input cost makes it budget-friendly."
    },
    {
        "id": "ginger",
        "name": "Ginger (ഇഞ്ചി - മാരൻ / റിയോ ഡി ജനീറോ)",
        "malayalam_name": "ഇഞ്ചി (മാരൻ / റിയോ ഡി ജനീറോ)",
        "suitable_soils": ["LATERITE", "SANDY_LOAM", "FOREST_LOAM", "RED_LOAM"],
        "min_ph": 5.2,
        "max_ph": 6.8,
        "ideal_ph": 6.0,
        "water_need": "MEDIUM",
        "water_sources_compatible": ["OPEN_WELL", "BOREWELL", "POND", "RAINFED"],
        "sunlight_need": "PARTIAL", # Does well in open and partial shade (25-30% shade)
        "max_slope": "MODERATE",
        "slope_compatibility": ["FLAT", "GENTLE", "MODERATE"],
        "suitable_seasons": ["VIRIPPU", "ALL_SEASON"],
        "districts_priority": ["Wayanad", "Idukki", "Kozhikode", "Kannur", "Malappuram", "Palakkad", "Kasaragod"],
        "cost_per_cent_inr": 900,       # Seed rhizome is expensive (~₹90,000/acre)
        "expected_yield_per_cent_kg": 75,
        "avg_selling_price_per_kg_inr": 60.0,
        "duration_days": 240,
        "category": "Spices / Commercial Rhizome",
        "lime_requirement_in_laterite": "Laterite soil must be well-drained. Incorporate 1 kg lime per cent during bed preparation to suppress soft rot (Pythium).",
        "agronomic_guidance": "Raised beds of 1m width with green leaf mulch (250 kg/cent). Excellent drainage is mandatory to prevent rhizome rot."
    },
    {
        "id": "turmeric",
        "name": "Turmeric (മഞ്ഞൾ - പ്രതിഭ / കാന്തി)",
        "malayalam_name": "മഞ്ഞൾ (പ്രതിഭ / കാന്തി)",
        "suitable_soils": ["LATERITE", "SANDY_LOAM", "RED_LOAM", "ALLUVIAL"],
        "min_ph": 5.0,
        "max_ph": 7.0,
        "ideal_ph": 5.8,
        "water_need": "MEDIUM",
        "water_sources_compatible": ["RAINFED", "OPEN_WELL", "BOREWELL", "POND"],
        "sunlight_need": "PARTIAL",
        "max_slope": "MODERATE",
        "slope_compatibility": ["FLAT", "GENTLE", "MODERATE"],
        "suitable_seasons": ["VIRIPPU", "ALL_SEASON"],
        "districts_priority": ["Kozhikode", "Malappuram", "Kannur", "Palakkad", "Wayanad", "Thrissur", "Kollam"],
        "cost_per_cent_inr": 500,
        "expected_yield_per_cent_kg": 90,
        "avg_selling_price_per_kg_inr": 35.0,
        "duration_days": 270,
        "category": "Spices / Medicinal Crop",
        "lime_requirement_in_laterite": "Apply 750g lime per cent in acidic soil to enhance curcumin recovery and root growth.",
        "agronomic_guidance": "Hardier and more disease-resistant than ginger. Excellent intercrop under coconut or open sunny fields."
    },
    {
        "id": "black_pepper",
        "name": "Black Pepper (കുരുമുളക് - പന്നിയൂർ ഇനങ്ങൾ)",
        "malayalam_name": "കുരുമുളക് (പന്നിയൂർ ഇനങ്ങൾ)",
        "suitable_soils": ["LATERITE", "FOREST_LOAM", "RED_LOAM"],
        "min_ph": 5.0,
        "max_ph": 6.5,
        "ideal_ph": 5.8,
        "water_need": "MEDIUM",
        "water_sources_compatible": ["RAINFED", "OPEN_WELL", "BOREWELL"],
        "sunlight_need": "PARTIAL", # Filtered sunlight / standard trees
        "max_slope": "STEEP",
        "slope_compatibility": ["GENTLE", "MODERATE", "STEEP"],
        "suitable_seasons": ["ALL_SEASON", "VIRIPPU"],
        "districts_priority": ["Idukki", "Wayanad", "Kannur", "Kozhikode", "Kasaragod", "Kottayam", "Pathanamthitta"],
        "cost_per_cent_inr": 400,
        "expected_yield_per_cent_kg": 18, # Dry pepper per cent once yielding
        "avg_selling_price_per_kg_inr": 550.0,
        "duration_days": 365,
        "category": "Perennial Spice / Cash Crop",
        "lime_requirement_in_laterite": "Apply 500g lime or dolomite per vine standard in May-June to combat Phytophthora foot rot.",
        "agronomic_guidance": "Grown on living standards (silver oak, erythrina, coconut). Prefers sloping land with rapid drainage."
    },
    {
        "id": "robusta_coffee",
        "name": "Robusta Coffee (കാപ്പി - റോബസ്റ്റ)",
        "malayalam_name": "കാപ്പി (വയനാട് റോബസ്റ്റ കാപ്പി)",
        "suitable_soils": ["FOREST_LOAM", "LATERITE", "RED_LOAM"],
        "min_ph": 5.0,
        "max_ph": 6.5,
        "ideal_ph": 5.8,
        "water_need": "MEDIUM",
        "water_sources_compatible": ["OPEN_WELL", "RAINFED", "POND"],
        "sunlight_need": "PARTIAL", # Two-tier shade canopy
        "max_slope": "MODERATE",
        "slope_compatibility": ["GENTLE", "MODERATE", "STEEP"],
        "suitable_seasons": ["ALL_SEASON"],
        "districts_priority": ["Wayanad", "Idukki", "Palakkad"],
        "cost_per_cent_inr": 450,
        "expected_yield_per_cent_kg": 25,
        "avg_selling_price_per_kg_inr": 210.0,
        "duration_days": 365,
        "category": "Plantation / Beverage Crop",
        "lime_requirement_in_laterite": "Apply dolomite @ 250g per bush every 2 years in high range forest soils.",
        "agronomic_guidance": "GI Tagged 'Wayanad Robusta Coffee'. Thrives at 500-1000m MSL under dappled shade."
    },
    {
        "id": "coconut",
        "name": "Coconut (തെങ്ങ് - ഡബ്ല്യു.സി.ടി / കുറ്റ്യാടി)",
        "malayalam_name": "തെങ്ങ് (ഡബ്ല്യു.സി.ടി / കൊമാടൻ / കുറ്റ്യാടി)",
        "suitable_soils": ["LATERITE", "ALLUVIAL", "RED_LOAM", "SANDY_LOAM"],
        "min_ph": 5.2,
        "max_ph": 7.5,
        "ideal_ph": 6.5,
        "water_need": "MEDIUM",
        "water_sources_compatible": ["OPEN_WELL", "BOREWELL", "POND", "RAINFED", "CANAL_RIVER"],
        "sunlight_need": "GOOD",
        "max_slope": "MODERATE",
        "slope_compatibility": ["FLAT", "GENTLE", "MODERATE"],
        "suitable_seasons": ["ALL_SEASON"],
        "districts_priority": ["Kozhikode", "Malappuram", "Kannur", "Kasaragod", "Thrissur", "Alappuzha", "Ernakulam", "Kollam", "Thiruvananthapuram"],
        "cost_per_cent_inr": 350,       # Initial planting maintenance per cent
        "expected_yield_per_cent_kg": 35, # ~30-40 nuts per cent per year
        "avg_selling_price_per_kg_inr": 35.0, # ~₹14-16 per nut
        "duration_days": 365,
        "category": "Perennial Plantation",
        "lime_requirement_in_laterite": "Apply 1 kg lime/dolomite per palm every year in laterite soils alongside magnesium sulphate.",
        "agronomic_guidance": "Kozhikode/Kuttiyadi is the heritage belt for coconut. High organic matter and coir pith mulching maximize nut retention."
    },
    {
        "id": "vegetables_cowpea_bhindi",
        "name": "Mixed Vegetables (Cowpea & Okra / പയർ & വെണ്ട)",
        "malayalam_name": "പച്ചക്കറികൾ (ലോല പയർ & സുസ്ഥിര വെണ്ട)",
        "suitable_soils": ["LATERITE", "ALLUVIAL", "SANDY_LOAM", "RED_LOAM", "BLACK_COTTON"],
        "min_ph": 5.5,
        "max_ph": 7.5,
        "ideal_ph": 6.3,
        "water_need": "MEDIUM",
        "water_sources_compatible": ["OPEN_WELL", "BOREWELL", "POND", "CANAL_RIVER"],
        "sunlight_need": "GOOD",
        "max_slope": "GENTLE",
        "slope_compatibility": ["FLAT", "GENTLE"],
        "suitable_seasons": ["MUNDAKAN", "PUNCHA", "VIRIPPU"],
        "districts_priority": ["Kozhikode", "Palakkad", "Thrissur", "Ernakulam", "Malappuram", "Kollam", "Alappuzha", "Thiruvananthapuram"],
        "cost_per_cent_inr": 350,       # ₹7,000 for 20 cents
        "expected_yield_per_cent_kg": 50,
        "avg_selling_price_per_kg_inr": 42.0,
        "duration_days": 90,
        "category": "Short-Duration Vegetables",
        "lime_requirement_in_laterite": "Incorporate 1 kg lime per cent 10 days before sowing to regulate pH for vegetable roots.",
        "agronomic_guidance": "Quick returns within 45-60 days. Cowpea fixes atmospheric nitrogen, improving laterite soil fertility."
    },
    {
        "id": "elephant_foot_yam",
        "name": "Elephant Foot Yam (ചേന - ഗജേന്ദ്ര / ശ്രീ പത്മ)",
        "malayalam_name": "ചേന (ഗജേന്ദ്ര / ശ്രീ പത്മ)",
        "suitable_soils": ["LATERITE", "SANDY_LOAM", "RED_LOAM", "ALLUVIAL"],
        "min_ph": 5.0,
        "max_ph": 6.8,
        "ideal_ph": 6.0,
        "water_need": "MEDIUM",
        "water_sources_compatible": ["OPEN_WELL", "BOREWELL", "POND", "RAINFED"],
        "sunlight_need": "PARTIAL", # Tolerates up to 40% shade, great as intercrop
        "max_slope": "GENTLE",
        "slope_compatibility": ["FLAT", "GENTLE"],
        "suitable_seasons": ["VIRIPPU", "MUNDAKAN", "ALL_SEASON"],
        "districts_priority": ["Kozhikode", "Malappuram", "Ernakulam", "Kottayam", "Palakkad", "Thrissur", "Kannur"],
        "cost_per_cent_inr": 550,
        "expected_yield_per_cent_kg": 120, # Corms yield ~120kg/cent
        "avg_selling_price_per_kg_inr": 28.0,
        "duration_days": 240,
        "category": "Tuber / Commercial Vegetable",
        "lime_requirement_in_laterite": "500g lime per pit mixed with farmyard manure and trichoderma.",
        "agronomic_guidance": "High profit potential for Onam market harvest. Pits of 60x60x45cm spaced 90x90cm."
    },
    {
        "id": "pulses_blackgram",
        "name": "Pulses / Black Gram (ഉഴുന്ന് / ചെറുപയർ - Co-6)",
        "malayalam_name": "പയറുവർഗ്ഗങ്ങൾ (ഉഴുന്ന് - Co-6 / ചെറുപയർ)",
        "suitable_soils": ["ALLUVIAL", "RED_LOAM", "BLACK_COTTON", "LATERITE", "SANDY_LOAM"],
        "min_ph": 5.8,
        "max_ph": 8.0,
        "ideal_ph": 6.8,
        "water_need": "LOW",
        "water_sources_compatible": ["RAINFED", "OPEN_WELL", "BOREWELL"],
        "sunlight_need": "GOOD",
        "max_slope": "GENTLE",
        "slope_compatibility": ["FLAT", "GENTLE"],
        "suitable_seasons": ["MUNDAKAN", "PUNCHA"],
        "districts_priority": ["Palakkad", "Kozhikode", "Thrissur", "Malappuram", "Alappuzha", "Kollam"],
        "cost_per_cent_inr": 180,       # Very low budget requirement
        "expected_yield_per_cent_kg": 10,
        "avg_selling_price_per_kg_inr": 90.0,
        "duration_days": 75,
        "category": "Legume / Pulse",
        "lime_requirement_in_laterite": "In laterite soils, 750g lime per cent facilitates nodulation; black cotton soils require no lime.",
        "agronomic_guidance": "Residual moisture crop following paddy harvest or standalone summer crop. Replenishes soil nitrogen naturally."
    },
    {
        "id": "cardamom_cool_spices",
        "name": "Cardamom / Cool Season Spices (ഏലം - വണ്ടൻമേട്)",
        "malayalam_name": "ഏലം (വണ്ടൻമേട് / തിരുതാളി)",
        "suitable_soils": ["FOREST_LOAM", "LATERITE"],
        "min_ph": 4.8,
        "max_ph": 6.2,
        "ideal_ph": 5.5,
        "water_need": "HIGH",
        "water_sources_compatible": ["CANAL_RIVER", "POND", "OPEN_WELL", "RAINFED"],
        "sunlight_need": "SHADE",  # Requires heavy filtered shade (40-60% shade)
        "max_slope": "STEEP",
        "slope_compatibility": ["GENTLE", "MODERATE", "STEEP"],
        "suitable_seasons": ["ALL_SEASON"],
        "districts_priority": ["Idukki", "Wayanad"],
        "cost_per_cent_inr": 850,
        "expected_yield_per_cent_kg": 6,
        "avg_selling_price_per_kg_inr": 1400.0,
        "duration_days": 365,
        "category": "High-Value Hill Spice",
        "lime_requirement_in_laterite": "Dolomite application (100g/clump) balances high soil acidity in rainforest soils.",
        "agronomic_guidance": "Strictly limited to cool high elevation belts (>600m MSL) with evergreen forest canopy. Unsuited for coastal/lowland zones."
    },
    {
        "id": "amaranthus_red_spinach",
        "name": "Red Spinach / Amaranthus (ചുവപ്പ് ചീര - അരുൺ)",
        "malayalam_name": "ചീര (അരുൺ / രേണുശ്രീ)",
        "suitable_soils": ["LATERITE", "SANDY_LOAM", "ALLUVIAL", "RED_LOAM"],
        "min_ph": 5.5,
        "max_ph": 7.0,
        "ideal_ph": 6.2,
        "water_need": "MEDIUM",
        "water_sources_compatible": ["OPEN_WELL", "BOREWELL", "POND", "CANAL_RIVER"],
        "sunlight_need": "GOOD",
        "max_slope": "FLAT",
        "slope_compatibility": ["FLAT", "GENTLE"],
        "suitable_seasons": ["ALL_SEASON", "MUNDAKAN", "PUNCHA"],
        "districts_priority": ["Kozhikode", "Malappuram", "Ernakulam", "Thrissur", "Thiruvananthapuram", "Kollam", "Kannur", "Palakkad"],
        "cost_per_cent_inr": 200,
        "expected_yield_per_cent_kg": 40,
        "avg_selling_price_per_kg_inr": 35.0,
        "duration_days": 40,
        "category": "Short-Duration Leafy Vegetable",
        "lime_requirement_in_laterite": "500g lime per cent prevents damping-off and fosters tender growth.",
        "agronomic_guidance": "Rapid 30-40 day crop. Multiple harvests possible. Perfect for fast cash flow and small parcel plots."
    }
]
