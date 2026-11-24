"""
AgroRise AI - Module 4: Crop Profit Estimator
Calculation Engine & Risk / Scenario Modeling (Calibrated to Real Kerala Market Conditions)

Formulas:
- Total Cost = Planting Material + Fertiliser + Labour + Irrigation + Transport + Other Expenses
- Revenue = Expected Yield × Expected Selling Price
- Estimated Profit = Revenue − Total Cost
- Scenarios: Low (Conservative / Weather Stress), Medium (Realistic), High (Optimistic / Peak Festival)
- Break-Even Analysis: Break-Even Price (₹/unit) and Break-Even Yield (kg)
"""

CROP_ECONOMIC_PROFILES = {
    "nendran_banana": {
        "id": "nendran_banana",
        "name": "Nendran Banana (നേന്ത്രവാഴ)",
        "malayalam": "നേന്ത്രവാഴ",
        "unit_name": "kg",
        "plants_per_cent": 10,
        "typical_cost_per_cent_range": (1200.0, 1600.0), # Realistic ₹1.2L to 1.6L per acre
        "default_expenses_per_cent": {
            "planting_material": 220.0,   # 10 disease-free suckers @ ₹22/sucker
            "fertiliser": 280.0,          # Cow dung (100kg/cent), lime (5kg), NPK, potash
            "labour": 480.0,              # Pit digging (50x50cm), planting, weeding, earthing up, harvest
            "irrigation": 80.0,           # Pumping / drip maintenance across 10 months
            "transport": 60.0,            # Farm-gate to wholesale mandi
            "other_expenses": 280.0       # 10 bamboo props @ ₹25-28 + bio-control (pseudomonas)
        },
        "yield_per_cent_kg": {
            "low": 70.0,                  # Stress / small bunches (~7kg per bunch)
            "medium": 90.0,               # Normal season (9-10kg per bunch) -> ~9,000kg/acre
            "high": 115.0                 # High management / big bunches (~11.5kg) -> ~11,500kg/acre
        },
        "selling_price_per_kg_inr": {
            "low": 28.0,                  # Market glut
            "medium": 38.0,               # Normal wholesale farm-gate price
            "high": 48.0                  # Peak Onam / Vishu season farm-gate rate
        },
        "weather_risks": {
            "monsoon_excess": "Heavy winds during July-August can cause lodging (വാഴ ഒടിഞ്ഞു വീഴൽ). Bamboo propping (മുളന്താങ്ങ്) is mandatory for every plant.",
            "summer_drought": "Requires irrigation every 3 days in summer to maintain bunch emergence and filling."
        }
    },
    "paddy_wetland": {
        "id": "paddy_wetland",
        "name": "Paddy / Rice (നെല്ല് - ഉമ / ജ്യോതി)",
        "malayalam": "നെല്ല്",
        "unit_name": "kg",
        "plants_per_cent": 0,
        "typical_cost_per_cent_range": (400.0, 550.0), # ₹40,000 to ₹55,000 per acre
        "default_expenses_per_cent": {
            "planting_material": 60.0,    # Certified seed ~1.2kg/cent
            "fertiliser": 110.0,          # Basal lime, urea, rajphos, potash
            "labour": 220.0,              # Tractor tilling, transplanting, combine harvester
            "irrigation": 35.0,           # Canal cess / pumping
            "transport": 25.0,            # Transport to Supplyco paddy depot
            "other_expenses": 30.0        # Bund maintenance, weedicide
        },
        "yield_per_cent_kg": {
            "low": 16.0,                  # Blast disease / drought / unseasonal rain
            "medium": 22.0,               # Standard KAU yield (~2,200kg per acre)
            "high": 28.0                  # High management yield
        },
        "selling_price_per_kg_inr": {
            "low": 22.0,                  # Distress private sale
            "medium": 28.20,              # Kerala Government Supplyco MSP (~₹28.20/kg)
            "high": 34.0                  # Premium organic/direct retail
        },
        "weather_risks": {
            "monsoon_excess": "Unseasonal rains during harvest can lodge panicles and cause grain sprouting in field.",
            "summer_drought": "Puncha crop requires assured irrigation during panicle initiation stage."
        }
    },
    "tapioca_cassava": {
        "id": "tapioca_cassava",
        "name": "Tapioca / Cassava (കപ്പ - മരച്ചീനി)",
        "malayalam": "കപ്പ",
        "unit_name": "kg",
        "plants_per_cent": 20,
        "typical_cost_per_cent_range": (220.0, 320.0),
        "default_expenses_per_cent": {
            "planting_material": 40.0,    # Stem cuttings
            "fertiliser": 60.0,           # Farmyard manure, ash, potash
            "labour": 120.0,              # Mound forming, planting, weeding, harvest
            "irrigation": 15.0,           # Mostly rainfed
            "transport": 20.0,            # Transport to local market
            "other_expenses": 15.0        # Rodent & wild boar protection
        },
        "yield_per_cent_kg": {
            "low": 80.0,                  # Mosaic disease / poor tuberization
            "medium": 110.0,              # Standard ~11 tonnes/acre
            "high": 140.0                 # Hybrid Vellayani Hraswa
        },
        "selling_price_per_kg_inr": {
            "low": 11.0,                  # Market surplus
            "medium": 16.0,               # Regular retail/hotel demand
            "high": 24.0                  # Scarcity / off-season
        },
        "weather_risks": {
            "monsoon_excess": "Waterlogging leads to tuber rot (കിഴങ്ങ് ചീയൽ). Ensure elevated mounds.",
            "summer_drought": "Hardy and drought-tolerant; one of the safest crops under erratic rainfall."
        }
    },
    "ginger": {
        "id": "ginger",
        "name": "Ginger (ഇഞ്ചി - മാരൻ)",
        "malayalam": "ഇഞ്ചി",
        "unit_name": "kg",
        "plants_per_cent": 40,
        "typical_cost_per_cent_range": (800.0, 1100.0),
        "default_expenses_per_cent": {
            "planting_material": 380.0,   # Certified seed rhizome is expensive (~₹75/kg)
            "fertiliser": 160.0,          # Farmyard manure, neem cake, trichoderma
            "labour": 260.0,              # Bed making, mulching with green leaves, weeding
            "irrigation": 50.0,           # Sprinkler in summer
            "transport": 40.0,            # Wholesale mandi transport
            "other_expenses": 60.0        # Green leaf mulch procurement
        },
        "yield_per_cent_kg": {
            "low": 45.0,                  # Bacterial wilt / soft rot damage
            "medium": 75.0,               # Normal healthy harvest
            "high": 105.0                 # Bumper crop
        },
        "selling_price_per_kg_inr": {
            "low": 35.0,                  # Price crash in Karnataka/Wayanad markets
            "medium": 60.0,               # Stable market price
            "high": 90.0                  # Off-season peak price
        },
        "weather_risks": {
            "monsoon_excess": "Heavy continuous rains create ideal conditions for Soft Rot (Pythium). Raised beds and trichoderma are mandatory.",
            "summer_drought": "Young sprouted beds require shade mulch."
        }
    },
    "turmeric": {
        "id": "turmeric",
        "name": "Turmeric (മഞ്ഞൾ - പ്രതിഭ)",
        "malayalam": "മഞ്ഞൾ",
        "unit_name": "kg",
        "plants_per_cent": 40,
        "typical_cost_per_cent_range": (450.0, 600.0),
        "default_expenses_per_cent": {
            "planting_material": 180.0,   # Seed rhizomes
            "fertiliser": 100.0,          # Manure, lime, potash
            "labour": 160.0,              # Bed preparation, weeding, harvesting
            "irrigation": 30.0,           # Rainfed with supplemental watering
            "transport": 25.0,            # Transport
            "other_expenses": 25.0        # Mulching
        },
        "yield_per_cent_kg": {
            "low": 65.0,                  # Moderate yield
            "medium": 90.0,               # Standard yield
            "high": 120.0                 # High curcumin variety Pratibha
        },
        "selling_price_per_kg_inr": {
            "low": 24.0,                  # Raw fresh rhizome low price
            "medium": 35.0,               # Raw fresh average
            "high": 50.0                  # Quality fresh / certified organic
        },
        "weather_risks": {
            "monsoon_excess": "Hardy against excessive rain, much lower rot susceptibility than ginger.",
            "summer_drought": "Leaves dry out in summer, matching natural rhizome maturity."
        }
    },
    "black_pepper": {
        "id": "black_pepper",
        "name": "Black Pepper (കുരുമുളക് - പന്നിയൂർ)",
        "malayalam": "കുരുമുളക്",
        "unit_name": "kg (dry)",
        "plants_per_cent": 6,
        "typical_cost_per_cent_range": (350.0, 500.0),
        "default_expenses_per_cent": {
            "planting_material": 60.0,    # Rooted cuttings (amortized)
            "fertiliser": 110.0,          # Dolomite, bone meal, neem cake
            "labour": 170.0,              # Vine tying, ladder picking/harvesting, drying
            "irrigation": 30.0,           # Summer basin irrigation
            "transport": 20.0,            # Mandi
            "other_expenses": 30.0        # Bordeaux mixture spray against Phytophthora
        },
        "yield_per_cent_kg": {
            "low": 10.0,                  # Quick wilt incidence / poor spike set
            "medium": 18.0,               # Healthy yielding vines (dry pepper)
            "high": 26.0                  # High yielding mature standards
        },
        "selling_price_per_kg_inr": {
            "low": 420.0,                 # Import pressure price dip
            "medium": 550.0,              # Kerala standard ungarbled market rate
            "high": 680.0                 # Premium bold black pepper
        },
        "weather_risks": {
            "monsoon_excess": "Prolonged monsoon mist triggers Quick Wilt (Phytophthora foot rot). Spray 1% Bordeaux mixture before monsoon.",
            "summer_drought": "Prolonged summer without blossom showers delays spike initiation."
        }
    },
    "vegetables_cowpea_bhindi": {
        "id": "vegetables_cowpea_bhindi",
        "name": "Mixed Vegetables (Cowpea & Okra / പയർ & വെണ്ട)",
        "malayalam": "പച്ചക്കറികൾ",
        "unit_name": "kg",
        "plants_per_cent": 60,
        "typical_cost_per_cent_range": (300.0, 450.0),
        "default_expenses_per_cent": {
            "planting_material": 40.0,    # Hybrid seeds
            "fertiliser": 90.0,           # Cow dung, vermicompost, lime, 19:19:19
            "labour": 160.0,              # Trellising (പന്തൽ/കുറ്റികൾ), multi-picking
            "irrigation": 40.0,           # Regular watering
            "transport": 20.0,            # Local market
            "other_expenses": 20.0        # Pheromone traps, neem oil spray
        },
        "yield_per_cent_kg": {
            "low": 35.0,                  # Fruit borer / yellow vein mosaic loss
            "medium": 50.0,               # Good multi-pick harvest (45-60 days)
            "high": 75.0                  # Bumper harvest with drip
        },
        "selling_price_per_kg_inr": {
            "low": 25.0,                  # High harvest season drop
            "medium": 42.0,               # Direct retail / VFPCK rate
            "high": 60.0                  # Festive / summer vegetable demand
        },
        "weather_risks": {
            "monsoon_excess": "Excess rain increases fungal damping-off and reduces pollinator visits.",
            "summer_drought": "Requires frequent shallow irrigation in summer."
        }
    },
    "sugarcane_commercial": {
        "id": "sugarcane_commercial",
        "name": "Sugarcane (കരിമ്പ് - ചിറ്റൂർ)",
        "malayalam": "കരിമ്പ്",
        "unit_name": "kg",
        "plants_per_cent": 0,
        "typical_cost_per_cent_range": (450.0, 600.0),
        "default_expenses_per_cent": {
            "planting_material": 90.0,    # Two-budded setts
            "fertiliser": 130.0,          # Heavy nitrogen and potash feeder
            "labour": 210.0,              # Ridge making, earthing up, harvesting
            "irrigation": 50.0,           # High water requirement
            "transport": 25.0,            # Transport to jaggery mill
            "other_expenses": 15.0        # Trash mulching
        },
        "yield_per_cent_kg": {
            "low": 300.0,                 # Water stress / borer infestation
            "medium": 400.0,              # 40 tonnes per acre
            "high": 520.0                 # High sucrose Co varieties
        },
        "selling_price_per_kg_inr": {
            "low": 3.0,                   # Factory floor rate
            "medium": 3.80,               # Kerala jaggery mill rate
            "high": 5.0                   # Fresh juice / festival sale
        },
        "weather_risks": {
            "monsoon_excess": "Stagnant water lowers sugar accumulation.",
            "summer_drought": "Severe drought in tillering stage stunts cane height."
        }
    }
}


def estimate_crop_profit(
    crop_id="nendran_banana",
    land_area_cents=20.0,
    custom_expenses=None,
    custom_price=None,
    district="Kozhikode"
):
    """
    Computes transparent crop cultivation expenses, revenues, and profits
    across 3 scenarios (Low/Stress, Medium/Expected, High/Optimistic).
    """
    try:
        area_cents = max(1.0, float(land_area_cents))
    except (TypeError, ValueError):
        area_cents = 20.0

    profile = CROP_ECONOMIC_PROFILES.get(crop_id, CROP_ECONOMIC_PROFILES["nendran_banana"])
    base_expenses = profile["default_expenses_per_cent"]

    # 1. Calculate Expenses Breakdown
    user_exp = custom_expenses or {}

    def get_cost(item_key):
        if item_key in user_exp and user_exp[item_key] is not None and user_exp[item_key] != "":
            try:
                return float(user_exp[item_key])
            except (ValueError, TypeError):
                pass
        return round(base_expenses.get(item_key, 0.0) * area_cents, 2)

    planting_cost = get_cost("planting_material")
    fertiliser_cost = get_cost("fertiliser")
    labour_cost = get_cost("labour")
    irrigation_cost = get_cost("irrigation")
    transport_cost = get_cost("transport")
    other_cost = get_cost("other_expenses")

    total_cost = round(
        planting_cost + fertiliser_cost + labour_cost + irrigation_cost + transport_cost + other_cost,
        2
    )

    cost_per_cent = round(total_cost / area_cents, 2)

    cost_breakdown = {
        "planting_material": planting_cost,
        "fertiliser": fertiliser_cost,
        "labour": labour_cost,
        "irrigation": irrigation_cost,
        "transport": transport_cost,
        "other_expenses": other_cost,
        "total_cost": total_cost,
        "cost_per_cent": cost_per_cent
    }

    # 2. Yield Scenarios (kg or bunches)
    yield_rates = profile["yield_per_cent_kg"]
    yield_low = round(yield_rates["low"] * area_cents, 1)
    yield_med = round(yield_rates["medium"] * area_cents, 1)
    yield_high = round(yield_rates["high"] * area_cents, 1)

    # 3. Price Scenarios (₹/unit)
    price_rates = profile["selling_price_per_kg_inr"]
    if custom_price and float(custom_price) > 0:
        c_price = float(custom_price)
        p_low = round(c_price * 0.85, 2)
        p_med = round(c_price, 2)
        p_high = round(c_price * 1.20, 2)
    else:
        p_low = price_rates["low"]
        p_med = price_rates["medium"]
        p_high = price_rates["high"]

    # 4. Scenarios Calculations
    def build_scenario(name, y_val, p_val, desc, scenario_type):
        rev = round(y_val * p_val, 2)
        profit = round(rev - total_cost, 2)
        roi = round((profit / max(1.0, total_cost)) * 100, 1)
        is_loss = profit < 0
        return {
            "scenario_name": name,
            "scenario_type": scenario_type,
            "description": desc,
            "expected_yield_kg": y_val,
            "selling_price_per_kg": p_val,
            "gross_revenue": rev,
            "total_cost": total_cost,
            "estimated_profit": profit,
            "roi_percentage": roi,
            "is_loss": is_loss,
            "status_text": f"Potential Loss of ₹{abs(int(profit)):,}" if is_loss else f"Net Profit of ₹{int(profit):,}"
        }

    scenario_low = build_scenario(
        name="Low / Conservative Scenario",
        y_val=yield_low,
        p_val=p_low,
        desc="Adverse weather, pest outbreak, or local market price glut.",
        scenario_type="conservative"
    )

    scenario_med = build_scenario(
        name="Medium / Realistic Scenario",
        y_val=yield_med,
        p_val=p_med,
        desc="Normal seasonal rainfall, KAU standard package practices, and prevailing farm-gate rate.",
        scenario_type="realistic"
    )

    scenario_high = build_scenario(
        name="High / Optimistic Scenario",
        y_val=yield_high,
        p_val=p_high,
        desc="Favorable monsoon, optimal fertilization, and peak festival demand (Onam/Vishu).",
        scenario_type="optimistic"
    )

    # 5. Break-Even Analysis
    break_even_price = round(total_cost / max(1.0, yield_med), 2)
    break_even_yield = round(total_cost / max(0.1, p_med), 1)
    price_safety_margin = round(((p_med - break_even_price) / max(0.1, p_med)) * 100, 1)

    # 6. Agronomic Reality / Sanity Check Engine
    # Detects if user entered artificially low costs (e.g. ₹136/cent instead of ₹1,400) or high prices
    sanity_warnings = []
    typical_min, typical_max = profile.get("typical_cost_per_cent_range", (500.0, 1500.0))
    expected_min_total = typical_min * area_cents
    expected_max_total = typical_max * area_cents

    if total_cost < (expected_min_total * 0.45):
        sanity_warnings.append(
            f"⚠️ Unusually Low Cultivation Cost: In Kerala, cultivating {int(area_cents)} Cents of {profile['name']} "
            f"typically requires ₹{int(expected_min_total):,} to ₹{int(expected_max_total):,} in real agricultural expenses. "
            f"At ₹{int(total_cost):,}, critical expenses like full labour (കൂലിച്ചെലവ്) or bamboo staking (മുളന്താങ്ങ്) appear under-reported, "
            f"which inflates the calculated ROI to an unrealistic level."
        )

    if p_med > (price_rates["high"] * 1.35):
        sanity_warnings.append(
            f"⚠️ High Selling Price Notice: ₹{p_med}/kg is significantly higher than prevailing Kerala wholesale farm-gate rates "
            f"(typically ₹{price_rates['medium']} - ₹{price_rates['high']}/kg). Make sure this is farm-gate wholesale price, not retail shop price."
        )

    if scenario_med["roi_percentage"] > 250.0:
        sanity_warnings.append(
            f"💡 Realistic Agronomic Notice: In genuine commercial farming, realistic net ROI for {profile['name']} "
            f"ranges between 60% and 150%. An ROI of +{scenario_med['roi_percentage']}% indicates expenses were under-estimated or price was inflated."
        )

    # 7. Location Weather Risk Alert
    w_risks = profile.get("weather_risks", {})
    location_weather_advisory = (
        f"For {district}: {w_risks.get('monsoon_excess', 'Protect soil from heavy rain runoff.')} "
        f"{w_risks.get('summer_drought', 'Ensure supplemental watering in summer.')}"
    )

    return {
        "status": "success",
        "crop_info": {
            "id": profile["id"],
            "name": profile["name"],
            "malayalam": profile["malayalam"],
            "unit": profile["unit_name"],
            "land_area_cents": area_cents,
            "typical_cost_per_acre": f"₹{int(typical_min * 100):,} - ₹{int(typical_max * 100):,}"
        },
        "location": district,
        "cost_breakdown": cost_breakdown,
        "scenarios": {
            "low": scenario_low,
            "medium": scenario_med,
            "high": scenario_high
        },
        "break_even": {
            "break_even_price_per_kg": break_even_price,
            "market_price_realistic": p_med,
            "price_safety_margin_percentage": price_safety_margin,
            "break_even_yield_kg": break_even_yield,
            "expected_yield_realistic": yield_med,
            "guidance": (
                f"You need to sell at least {break_even_yield} kg at ₹{break_even_price}/kg to recover your ₹{int(total_cost):,} total cost. "
                f"Any price above ₹{break_even_price}/kg generates direct net profit."
            )
        },
        "sanity_warnings": sanity_warnings,
        "weather_risk_advisory": location_weather_advisory,
        "disclaimer": "⚠️ Cultivation cost, yield, and profit estimates are based on Kerala Agricultural University agronomic models and current market averages. Actual farm profits will vary based on weather, pest incidence, soil fertility, and market fluctuations. Profit is an estimate, not a guarantee."
    }
