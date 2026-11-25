"""
AgroRise AI - Agricultural RAG (Retrieval-Augmented Generation) Engine
Calibrated with:
- Kerala Agricultural University (KAU) "Package of Practices: Crops"
- ICAR - CPCRI (Central Plantation Crops Research Institute), Kasaragod
- ICAR - CTCRI (Central Tuber Crops Research Institute), Thiruvananthapuram
- Kerala State Department of Agriculture & Krishi Bhavan Guidelines
"""

import re
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# =============================================================================
# CURATED KERALA AGRICULTURAL KNOWLEDGE BASE (RAG CHUNKS)
# =============================================================================
KNOWLEDGE_DOCUMENTS = [
    {
        "id": "kau-coconut-pest-01",
        "title": "Coconut: Rhinoceros Beetle & Red Palm Weevil Management (KAU POP)",
        "title_ml": "തെങ്ങ്: കൊമ്പൻ ചെല്ലി, ചെമ്പൻ ചെല്ലി കീട നിയന്ത്രണം (KAU POP)",
        "source": "KAU Package of Practices: Plantation Crops",
        "keywords": ["coconut", "rhinoceros beetle", "red palm weevil", "oructes", "rhynchophorus", "വണ്ട്", "ചെല്ലി", "കൊമ്പൻ ചെല്ലി", "ചെമ്പൻ ചെല്ലി", "തെങ്ങ്"],
        "content_ml": """തെങ്ങിലെ പ്രധാന കീടങ്ങളും നിയന്ത്രണവും (KAU പാക്കേജ്):
1. കൊമ്പൻ ചെല്ലി (Rhinoceros beetle):
   - ലക്ഷണങ്ങൾ: മണ്ടയിലെ കൂമ്പോലകൾ വിടരുമ്പോൾ 'V' ആകൃതിയിൽ കത്രിക കൊണ്ട് മുറിച്ചതുപോലെ കാണപ്പെടുക.
   - നിയന്ത്രണം: മണ്ട വൃത്തിയാക്കി 250 ഗ്രാം വേപ്പിൻപിണ്ണാക്കും തുല്യ അളവ് മണലും ചേർത്ത് ഏറ്റവും ഉള്ളിലെ 3-4 ഓലക്കവിളുകളിൽ വർഷത്തിൽ രണ്ടുതവണ (മേയ്, ഒക്ടോബർ) നിറയ്ക്കുക. അല്ലെങ്കിൽ നാഫ്തലിൻ ഗുളികകൾ (3 എണ്ണം) മണൽ ചേർത്ത് ഇടുക.
2. ചെമ്പൻ ചെല്ലി (Red palm weevil):
   - ലക്ഷണങ്ങൾ: തടിയിൽ ചെറിയ സുഷിരങ്ങളും അവയിലൂടെ കൊഴുത്ത തവിട്ടുനിറത്തിലുള്ള ദ്രാവകം ഒലിച്ചിറങ്ങുന്നതും കാണാം. മണ്ട ചരിഞ്ഞു വീഴുക.
   - നിയന്ത്രണം: ഫെറോമോൺ കെണി (ഫെറോലൂർ പ്ലസ്) വെക്കുക. ആക്രമണമുള്ള ഭാഗത്ത് ക്ലോർപൈറിഫോസ് 20 EC (1 ലിറ്റർ വെള്ളത്തിൽ 10 മില്ലി) സുഷിരത്തിലൂടെ ഒഴിച്ച് സിമന്റോ കളിമണ്ണോ വെച്ച് അടയ്ക്കുക.""",
        "content": """Coconut Pest Management (Kerala Agricultural University):
1. Rhinoceros Beetle (Oryctes rhinoceros / കൊമ്പൻ ചെല്ലി):
   - Symptoms: Characteristic geometric 'V'-shaped cut on fan-opened leaves; bore holes on crown.
   - Organic/Cultural Control: Hook out beetles from crowns using beetle hooks during peak seasons (May-June and Sep-Oct).
   - Bio-control: Apply green muscardine fungus (Metarhizium anisopliae) @ 5 x 10^11 spores/m3 to cattle dung pits and breeding sites.
   - Leaf Axil Filling: Fill the top 3-4 innermost leaf axils with a mixture of 250g neem cake or marotti cake mixed with equal parts of river sand twice a year (May and October). Alternatively, use naphthalene balls (3 balls of 3.5g each covered with sand) every 45 days.
2. Red Palm Weevil (Rhynchophorus ferrugineus / ചെമ്പൻ ചെല്ലി):
   - Symptoms: Small holes on the stem with brownish viscous sap oozing out; extruded chewed fibrous frass; gnawing sound inside trunk.
   - Management: Never cut green leaves leaving petiole bases. Install pheromone traps ('Ferrolure+' lure) @ 1 trap per 2 hectares.
   - Curative: Inject Chlorpyrifos 20 EC @ 10ml in 1 litre water into the bore hole and seal with wet clay/cement."""
    },
    {
        "id": "kau-coconut-disease-02",
        "title": "Coconut: Bud Rot & Root Wilt Management (KAU POP)",
        "source": "KAU Package of Practices: Plantation Crops",
        "keywords": ["coconut", "bud rot", "root wilt", "phytophthora", "leaf rot", "മണ്ടയഴുകൽ", "കാറ്റുവീഴ്ച", "തെങ്ങ്", "ബോർഡോ"],
        "content": """Coconut Disease Management:
1. Bud Rot (Phytophthora palmivora / മണ്ടയഴുകൽ):
   - Symptoms: Yellowing of the spear leaf followed by drooping and rotting of terminal bud; foul odor when rotting spear is pulled out.
   - Preventive Care: Spray 1% Bordeaux mixture on the crown of palms before South-West monsoon (May-June) and again in September-October.
   - Curative Treatment: In early stages, cut and remove the rotten spear tissues cleanly; apply 10% Bordeaux paste or a paste of Copper Oxychloride (50 WP) on the cleaned crown and cover with a perforated polythene cap to prevent rainwater entry until a new spear emerges.
2. Root Wilt Disease (Phytophthora / കാറ്റുവീഴ്ച):
   - Symptoms: Ribbing and flaccidity of leaflets, general chlorosis, marginal necrosis, abnormal shedding of immature nuts.
   - Management: Root wilt cannot be cured completely, but yields can be maintained by:
     * Balanced NPK fertilization: 500g N, 320g P2O5, 1200g K2O per palm/year (higher potassium is vital).
     * Magnesium sulphate: Apply 500g MgSO4 per palm/year.
     * Organic manure: Apply 50 kg green manure/farmyard manure annually.
     * Intercropping with cocoa, pepper, or banana to enhance microclimate and farm income."""
    },
    {
        "id": "kau-paddy-pop-03",
        "title": "Paddy / Rice: Varieties, Seasons, and Nutrient Management (KAU POP)",
        "source": "KAU Package of Practices: Rice & Wetland Crops",
        "keywords": ["paddy", "rice", "uma", "jyothi", "virippu", "mundakan", "puncha", "npk", "നെല്ല്", "ഉമ", "ജ്യോതി", "വിരിപ്പ്", "മുണ്ടകൻ", "പുഞ്ച"],
        "content": """Paddy Cultivation in Kerala (Package of Practices):
1. Cropping Seasons in Kerala:
   - Virippu (Autumn / Kharif): Sown April-May, harvested August-September. High-yielding varieties: Uma (MO 16), Jyothi (PTB 39), Jaya.
   - Mundakan (Winter / Rabi): Sown August-September, harvested December-January. Varieties: Uma, Panchami, Remya.
   - Puncha (Summer): Sown November-December, harvested March-April. Common in Kuttanad and Kole lands.
2. Fertilizer Schedule (Medium Duration Varieties like Uma):
   - Recommended NPK: 70:35:35 kg/ha for Virippu; 90:45:45 kg/ha for Mundakan/Puncha.
   - Basal Dose: Full P2O5 (super phosphate/rock phosphate) + 1/3 Nitrogen + 1/2 Potassium at last ploughing.
   - First Top Dressing: 1/3 Nitrogen at active tillering stage (15-20 days after transplanting).
   - Second Top Dressing: 1/3 Nitrogen + 1/2 Potassium at panicle initiation stage (35-42 days after transplanting).
3. Soil Acidity & Liming in Wetland Soils:
   - Apply agricultural lime or dolomite @ 350-500 kg/ha at least 7-10 days before applying chemical fertilizers."""
    },
    {
        "id": "kau-paddy-pests-diseases-04",
        "title": "Paddy: Blast, Sheath Blight & Stem Borer Control",
        "source": "KAU Package of Practices: Plant Protection",
        "keywords": ["paddy blast", "sheath blight", "stem borer", "tricyclazole", "pseudomonas", "പോളരോഗം", "കുറുനാമ്പ്", "തണ്ടുതുരപ്പൻ", "നെല്ല്"],
        "content": """Paddy Pest & Disease Control (Kerala Guidelines):
1. Rice Blast (Magnaporthe oryzae / കുറുനാമ്പ് രോഗം):
   - Symptoms: Spindle-shaped lesions with ash-colored centers and dark brown margins on leaves; neck rot causing grain chaffiness.
   - Control: Spray Tricyclazole 75 WP @ 0.6g/L water OR Kasugamycin 3% SL @ 2.5ml/L. Avoid excessive nitrogen application.
2. Sheath Blight (Rhizoctonia solani / പോളരോഗം):
   - Symptoms: Snake-skin or greenish-grey oval water-soaked lesions on leaf sheaths near water line.
   - Management: Foliar spray of Pseudomonas fluorescens @ 20g/L or Hexaconazole 5 EC @ 2ml/L water at first appearance of disease.
3. Yellow Stem Borer (Scirpophaga incertulas / തണ്ടുതുരപ്പൻ):
   - Symptoms: 'Dead hearts' in vegetative stage; 'white ears' (empty white panicles) at maturity.
   - Control: Release Trichogramma japonicum egg parasitoid @ 1,00,000/ha weekly. Apply Chlorantraniliprole 0.4% G @ 10 kg/ha or spray Flubendiamide 39.35 SC @ 0.2ml/L."""
    },
    {
        "id": "kau-rubber-pop-05",
        "title": "Rubber: Cultivation, Tapping, Rain Guarding & Leaf Fall",
        "source": "Rubber Board India & KAU Plantation Manual",
        "keywords": ["rubber", "tapping", "rain guarding", "phytophthora", "rrii 105", "latex", "റബ്ബർ", "ടാപ്പിംഗ്", "റെയിൻ ഗാർഡിംഗ്", "അകാല ഇലപൊഴിച്ചിൽ"],
        "content": """Rubber (Hevea brasiliensis) Management in Kerala:
1. Clone Selection: RRII 105 is the most widely planted high-yielding clone in Kerala; RRII 414 and RRII 430 offer superior yield and wind tolerance.
2. Rain Guarding & Monsoon Tapping:
   - Rain guarding panels using polythene sheets and adhesive (rubber compound) should be installed on tapping panels by late April or early May before SW monsoon arrives.
   - This prevents fungal wash-down into the tapping cut and ensures 30-40 additional tapping days during monsoon months.
3. Abnormal Leaf Fall (Phytophthora meadii / അകാല ഇലപൊഴിച്ചിൽ):
   - Symptoms: Green water-soaked lesions on petiole with a drop of coagulated latex; premature massive defoliation in July-August.
   - Control: Prophylactic aerial or high-pressure ground spraying with 1% Bordeaux mixture OR Copper Oxychloride in oil dispersion (4-5 kg in 30-40L spray oil/ha) before monsoon.
4. Tapping System:
   - Standard system for RRII 105: Half-spiral alternate day (S/2 d2) or third-spiral third day (S/3 d3).
   - Early morning tapping (5:00 AM - 7:00 AM) maximizes turgor pressure and latex yield."""
    },
    {
        "id": "kau-pepper-pop-06",
        "title": "Black Pepper: Quick Wilt & Slow Decline Management",
        "title_ml": "കുരുമുളക്: ദ്രുതവാട്ടം, മന്ദവാട്ടം, പൊള്ളുവണ്ട് നിയന്ത്രണം",
        "source": "ICAR - Indian Institute of Spices Research (IISR), Kozhikode",
        "keywords": ["black pepper", "quick wilt", "foot rot", "phytophthora", "trichoderma", "panniyur", "കുരുമുളക്", "ദ്രുതവാട്ടം", "പന്നിയൂർ", "ഐ.ഐ.എസ്.ആർ"],
        "content_ml": """കുരുമുളക് കൃഷിയും ദ്രുതവാട്ട നിയന്ത്രണവും (IISR & KAU ശുപാർശകൾ):
1. ദ്രുതവാട്ടം (Phytophthora capsici):
   - ലക്ഷണങ്ങൾ: തണ്ടിന്റെ ചുവട്ടിലും ഇലകളിലും കറുത്ത പാടുകൾ, ഇല കൊഴിയൽ, വേരുകൾ ചീഞ്ഞ് ചെടി പെട്ടെന്ന് ഉണങ്ങിപ്പോകുന്നു.
   - നിയന്ത്രണം:
     * കാലവർഷത്തിന് മുൻപ് (മേയ്-ജൂൺ): 1% ബോർഡോ മിശ്രിതം അല്ലെങ്കിൽ 0.2% കോപ്പർ ഓക്സിക്ലോറൈഡ് തടത്തിൽ ഒഴിച്ചു കൊടുക്കുക (ഒരു കൊടിക്ക് 3-5 ലിറ്റർ).
     * ജൈവ നിയന്ത്രണം: 50 ഗ്രാം ട്രൈക്കോഡെർമ 5 കിലോ ഉണങ്ങിയ ചാണകപ്പൊടിയോ വേപ്പിൻ പിണ്ണാക്കോ ചേർത്ത് ജൂൺ മാസത്തിൽ തടത്തിലിടുക.
     * കാലവർഷത്തിന് ശേഷം (ഓഗസ്റ്റ്-സെപ്റ്റംബർ): പൊട്ടാസ്യം ഫോസ്ഫണേറ്റ് (അക്കോമിൻ) 3 മില്ലി ഒരു ലിറ്റർ വെള്ളത്തിൽ കലക്കി തളിക്കുക.
2. പൊള്ളുവണ്ട് (Pollu Beetle):
   - തിരികളിൽ കായ് തുരന്ന് ഉൾഭാഗം പൊള്ളയാക്കുന്നു.
   - 2% വേപ്പെണ്ണ വെളുത്തുള്ളി മിശ്രിതം അല്ലെങ്കിൽ ക്വിനാൽഫോസ് 0.05% ജൂൺ-ജൂലൈ, സെപ്റ്റംബർ-ഒക്ടോബർ മാസങ്ങളിൽ തളിക്കുക.""",
        "content": """Black Pepper (Piper nigrum) Agronomy & Disease Management:
1. Varieties: Panniyur-1 (high yield hybrid), Panniyur-5 (tolerant to shade), IISR Thevam, IISR Shakthi.
2. Quick Wilt / Foot Rot (Phytophthora capsici / ദ്രുതവാട്ടം):
   - Symptoms: Rapid blackening and rotting of underground collar region; sudden wilting and total shedding of leaves and spikes within 10-14 days.
   - Integrated Management Protocol:
     a) Pre-Monsoon (May-June): Drench vine basins with 1% Bordeaux mixture or 0.2% Copper Oxychloride @ 3-5 litres per vine.
     b) Bio-Control: Apply 50g Trichoderma harzianum formulation mixed with 5 kg farmyard manure / neem cake to vine basins in June.
     c) Post-Monsoon (August-September): Repeat drenching with Potassium Phosphonate (Akomin) @ 0.3% (3ml/L) or Metalaxyl-Mancozeb (Ridomil) @ 2g/L.
3. Pollu Beetle (Longitarsus nigripennis):
   - Symptoms: Grubs bore into berries causing them to become hollow ('pollu').
   - Control: Spray Quinalphos 0.05% or Neem oil 2% twice during June-July and September-October."""
    },
    {
        "id": "kau-banana-pop-07",
        "title": "Banana (Nendran): Spacing, Fertilizer Schedule & Pest Control",
        "source": "KAU Package of Practices: Fruit Crops",
        "keywords": ["banana", "nendran", "sigatoka", "pseudostem borer", "fertilizer", "വാഴ", "നേന്ത്രൻ", "സിഗാട്ടോക്ക", "പിണ്ടിപ്പുഴു"],
        "content": """Nendran Banana (ഏത്തവാഴ) Package of Practices (Kerala):
1. Planting Season & Spacing:
   - Plant pit size: 50cm x 50cm x 50cm; Spacing: 2m x 2m (1,000 plants/acre).
   - High Density Planting (HDP): 3 suckers per pit at 3m x 2m spacing.
2. Fertilizer Schedule per Plant (KAU Standard):
   - NPK Ratio: 190g N : 115g P2O5 : 300g K2O per plant.
   - Pit Filling: 10-15 kg well-rotted cattle manure + 500g lime/dolomite.
   - 2nd Month: 1/3 N + Full P + 1/3 K.
   - 3rd Month: 1/3 N + 1/3 K.
   - 5th Month (Shooting stage): 1/3 N + 1/3 K.
3. Major Pests and Diseases:
   - Sigatoka Leaf Spot: Spray Propiconazole 1ml/L or Carbendazim 1g/L with wetting agent (sticker) on underside of leaves.
   - Banana Pseudostem Weevil (പിണ്ടിപ്പുഴു): Clean trunk bases; inject 20ml chlorpyrifos solution (2.5ml/L) into trunk cavity, or place longitudinal split pseudostem traps."""
    },
    {
        "id": "kau-soil-liming-08",
        "title": "Kerala Soil Types, Acidity, Liming and Dolomite Guide",
        "source": "Kerala Department of Agriculture & Soil Survey Directorate",
        "keywords": ["soil", "laterite", "ph", "acidity", "lime", "dolomite", "liming", "മണ്ണ്", "കുമ്മായം", "ഡോളമൈറ്റ്", "അമ്ലത", "ചെങ്കൽ"],
        "content": """Kerala Soil Health & Acidity Management:
1. Soil Acidity Profile: Over 85% of Kerala soils (especially Laterite in Kannur, Malappuram, Kozhikode, and Kollam) are strongly acidic with pH ranging from 4.5 to 5.5.
2. Impact of Low pH:
   - Fixes Phosphorus (making applied P unavailable to plants).
   - Causes Calcium and Magnesium deficiency.
   - Induces Aluminium and Iron toxicity.
3. Corrective Liming Practice (കുമ്മായം / ഡോളമൈറ്റ്):
   - Recommended Dosage: 250 to 400 kg per acre (1-2 kg per cent of land) once every 2 years based on soil test.
   - Choice of Material: Use Dolomite if Magnesium deficiency is prevalent; otherwise use Agricultural Lime (Calcium Carbonate).
   - Critical Timing Rule: Apply lime or dolomite at least 15 to 20 days BEFORE applying chemical fertilizers (especially Urea or Rock Phosphate). Never mix lime directly with chemical fertilizers, as it causes nitrogen loss as ammonia gas."""
    },
    {
        "id": "govt-schemes-msp-09",
        "title": "Kerala Government Agriculture Schemes, MSP Rates & Subsidies",
        "source": "State Department of Agriculture (Krishi Bhavan) & Ministry of Agriculture",
        "keywords": ["msp", "subsidy", "pm-kisan", "subhiksha keralam", "krishi bhavan", "rubber subsidy", "copra msp", "താങ്ങുവില", "സബ്സിഡി", "പി.എം. കിസാൻ", "കൃഷിഭവൻ"],
        "content": """Kerala Agriculture Subsidies, Support Prices (MSP) & Schemes:
1. Rubber Production Incentive Scheme (RPIS / റബ്ബർ സബ്സിഡി):
   - Guaranteed baseline price for natural rubber RSS-4 sheet is maintained at ₹180/kg.
   - The price differential between market farmgate rate and baseline is deposited directly to farmer's bank account via DBT.
2. Coconut & Copra Procurement:
   - Government of Kerala procures raw green coconut at an enhanced state baseline rate through VFPCK and primary co-operatives.
   - Milling copra MSP is backed by NAFED and state agencies.
3. Paddy Royalty & Subsidized Procurement:
   - Kerala Civil Supplies Corporation (Supplyco) procures paddy directly from farmers at ₹28.20/kg.
   - Royalty for cultivable paddy land: ₹3,000/hectare annually to protect wetland ecosystems.
4. PM-KISAN (Pradhan Mantri Kisan Samman Nidhi):
   - ₹6,000 per year paid in three equal 4-monthly installments of ₹2,000 via Aadhaar-linked DBT accounts.
5. Soil Testing via Krishi Bhavan:
   - Free or subsidized Soil Health Cards available through local Krishi Bhavans and District Soil Testing Labs."""
    },
    {
        "id": "kau-spices-cardamom-ginger-10",
        "title": "Cardamom & Ginger Cultivation and Disease Protocols",
        "source": "ICAR-IISR & KAU Spices Directorate",
        "keywords": ["cardamom", "ginger", "rhizome rot", "bacterial wilt", "azhukal", "ഏലം", "ഇഞ്ചി", "ചീയൽ", "മഞ്ഞൾ"],
        "content": """Cardamom & Ginger Cultivation in High Ranges (Idukki, Wayanad):
1. Small Cardamom (Elettaria cardamomum / ഏലം):
   - Requires 50-60% filtered shade, high humidity, elevation above 800m MSL.
   - Azhukal Disease (Capsule Rot / Phytophthora): Spray 1% Bordeaux mixture before monsoon in May, and repeat with 0.2% Copper Oxychloride in August.
   - Thrips (Sciothrips cardamomi): Attack panicles causing scabby verrucose capsules. Spray Quinalphos 0.05% or Spinosad 0.3ml/L.
2. Ginger & Turmeric (ഇഞ്ചി, മഞ്ഞൾ):
   - Soft Rot / Rhizome Rot (Pythium aphanidermatum):
     * Seed Treatment: Treat rhizomes with Mancozeb 0.3% (3g/L) for 30 minutes before planting and storage.
     * Soil application of Trichoderma-enriched farmyard manure (1 kg Trichoderma in 100 kg FYM) at planting.
     * Drainage: Raise beds 15cm high with 50cm inter-bed trenches to avoid water stagnancy."""
    }
]


# =============================================================================
# HYBRID TF-IDF + KEYWORD KNOWLEDGE RETRIEVER
# =============================================================================
class AgriculturalRAGRetriever:
    """
    In-memory vector retrieval using sublinear TF-IDF, n-grams, and cosine similarity.
    Engineered for ultra-fast, local, deterministic retrieval without external vector DBs.
    """
    def __init__(self, documents):
        self.docs = documents
        self.corpus = []
        for d in self.docs:
            combined = f"{d['title']} {' '.join(d['keywords'])} {d['content']}"
            self.corpus.append(combined)

        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            sublinear_tf=True,
            stop_words='english'
        )
        self.doc_vectors = self.vectorizer.fit_transform(self.corpus)

    def retrieve(self, query: str, top_k: int = 2):
        """
        Retrieves top_k most relevant documents for the given user query.
        """
        query_clean = query.strip()
        if not query_clean:
            return self.docs[:top_k]

        # 1. Compute cosine similarity scores
        try:
            query_vec = self.vectorizer.transform([query_clean])
            sim_scores = cosine_similarity(query_vec, self.doc_vectors).flatten()
        except Exception:
            sim_scores = np.zeros(len(self.docs))

        # 2. Add keyword match boost (especially for Malayalam and key agronomic terms)
        q_lower = query_clean.lower()
        boosted_scores = np.array(sim_scores, dtype=float)

        for idx, doc in enumerate(self.docs):
            # Keyword matches in doc keywords list
            match_count = sum(1 for kw in doc["keywords"] if kw in q_lower)
            if match_count > 0:
                boosted_scores[idx] += 0.35 * match_count

            # Title matches
            if any(word in q_lower for word in doc["title"].lower().split()):
                boosted_scores[idx] += 0.25

        # Rank indices by score descending
        top_indices = np.argsort(boosted_scores)[::-1][:top_k]

        results = []
        for rank, idx in enumerate(top_indices):
            score = float(boosted_scores[idx])
            # Only include documents that have genuine agronomic relevance
            if score < 0.06:
                continue
            doc = dict(self.docs[idx])
            doc["score"] = score
            doc["rank"] = rank + 1
            results.append(doc)

        return results


# Global Singleton Instance
rag_retriever = AgriculturalRAGRetriever(KNOWLEDGE_DOCUMENTS)


def get_rag_context_and_sources(query: str, top_k: int = 2):
    """
    Given a query, returns a formatted context string and list of cited sources.
    """
    retrieved_docs = rag_retriever.retrieve(query, top_k=top_k)

    context_parts = []
    sources = []

    for doc in retrieved_docs:
        content_text = doc.get("content_ml") or doc.get("content")
        context_parts.append(
            f"--- VERIFIED REFERENCE [{doc['id']}]: {doc['title']} ---\n"
            f"Source Authority: {doc['source']}\n"
            f"{content_text}\n"
        )
        if doc['source'] not in sources:
            sources.append(doc['source'])

    combined_context = "\n".join(context_parts) if context_parts else "No specific document matched this query."
    return combined_context, sources, retrieved_docs
