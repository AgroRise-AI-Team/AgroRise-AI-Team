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

// User Roles
export const USER_ROLES = [
  { value: "FARMER", label: "Farmer (കർഷകൻ)" },
  { value: "BUYER", label: "Buyer / Trader (വ്യാപാരി)" },
  { value: "BOTH", label: "Farmer & Buyer" },
  { value: "EXPERT", label: "Agricultural Officer / Expert" }
];
