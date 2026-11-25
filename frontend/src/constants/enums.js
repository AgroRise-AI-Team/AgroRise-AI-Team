// Frontend Dropdown Options and Enums as specified in the API contract

// Districts in Kerala
export const KERALA_DISTRICTS = [
  "Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod",
  "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad",
  "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"
];

// Soil Types
export const SOIL_TYPES = [
  { value: "LATERITE", label: "Laterite Soil (ചെങ്കൽ മണ്ണ്)" },
  { value: "ALLUVIAL", label: "Coastal Alluvium (തീരദേശ എക്കൽ)" },
  { value: "CLAYEY_KOLE", label: "Clayey / Kari / Kole Soil (കരി / കോൾ മണ്ണ്)" },
  { value: "RED_LOAM", label: "Red Loam (ചുവന്ന പശിമരാശി)" },
  { value: "BLACK_COTTON", label: "Black Cotton Soil (കറുത്ത മണ്ണ് - ചിറ്റൂർ)" },
  { value: "SANDY_LOAM", label: "Sandy Loam (മണൽ കലർന്ന പശിമരാശി)" },
  { value: "FOREST_LOAM", label: "Forest Loam (വനമണ്ണ് - വയനാട്/ഇടുക്കി)" }
];

// Water Availability
export const WATER_AVAILABILITY = [
  { value: "HIGH", label: "High - Year-round abundant water (ധാരാളം വെള്ളം)" },
  { value: "MEDIUM", label: "Medium - Seasonal / adequate (ആവശ്യത്തിന് വെള്ളം)" },
  { value: "LOW", label: "Low - Limited supply (കുറഞ്ഞ വെള്ളം)" },
  { value: "SCARCE", label: "Scarce - Severe drought prone (കടുത്ത ജലക്ഷാമം)" }
];

// Water Sources
export const WATER_SOURCES = [
  { value: "OPEN_WELL", label: "Open Well (തുറന്ന കിണർ)" },
  { value: "BOREWELL", label: "Borewell (കുഴൽക്കിണർ)" },
  { value: "CANAL_RIVER", label: "Canal / River (തോട് / പുഴ)" },
  { value: "POND", label: "Farm Pond / Rainwater Harvesting (കുളം)" },
  { value: "RAINFED", label: "Monsoon Dependent (മഴയെ ആശ്രയിച്ച്)" }
];

// Irrigation Methods
export const IRRIGATION_METHODS = [
  { value: "DRIP", label: "Drip Irrigation (തുള്ളി നന)" },
  { value: "SPRINKLER", label: "Sprinkler Irrigation (സ്പ്രിങ്ക്ലർ)" },
  { value: "FLOOD", label: "Flood / Furrow (ചാലുകൾ വഴി)" },
  { value: "MANUAL", label: "Manual Watering (കൈകൊണ്ട് നനയ്ക്കൽ)" },
  { value: "RAINFED", label: "Rainfed (നനയ്ക്കാറില്ല)" }
];

// Crop Growth Stages
export const GROWTH_STAGES = [
  { value: "LAND_PREPARATION", label: "Land Preparation / Sowing (നിലമൊരുക്കൽ / വിത)" },
  { value: "VEGETATIVE", label: "Vegetative / Tillering (വളർച്ചാ ഘട്ടം)" },
  { value: "FLOWERING", label: "Flowering / Panicle (പൂവിടൽ ഘട്ടം)" },
  { value: "GRAIN_FILLING", label: "Grain Filling / Maturation (കതിരുകൾ മൂപ്പെത്തൽ)" },
  { value: "HARVEST", label: "Harvesting (വിളവെടുപ്പ്)" }
];

// Land Area Units
export const LAND_AREA_UNITS = [
  { value: "ACRES", label: "Acres" },
  { value: "CENTS", label: "Cents" },
  { value: "HECTARES", label: "Hectares" }
];

// User Roles (strictly two roles: Farmer and Normal User)
export const USER_ROLES = [
  { value: "FARMER", label: "Farmer (കർഷകൻ)" },
  { value: "USER", label: "Normal User (സാധാരണ ഉപയോക്താവ്)" }
];

// Default district location profiles for 14 Kerala districts (offline fallback & instant UI response)
export const DEFAULT_DISTRICT_PROFILES = {
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
    "soil_advisory": "Kozhikode soils are predominantly Laterite and Coastal Alluvium. Laterite is naturally acidic (pH 4.8–5.8). Liming and organic compost are essential for optimal root uptake."
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
    "soil_advisory": "Forest soils rich in humus and micronutrients. Maintain tree canopy and apply dolomite to neutralize high acidity."
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
    "soil_advisory": "Kuttanad Kari and Kayal soils are heavily acidic and occasionally saline. Systematic flushing of acid salts and liberal liming are required before sowing."
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
};
