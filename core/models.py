from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    """
    Profile extension for agricultural users (Farmers, Buyers, Agricultural Officers)
    supporting:
      - Crop suitability & recommendation (soil, area, water, climate, budget)
      - Pest risk estimation (crop, weather, season, history)
      - Smart irrigation advisory (crop, soil, water source, growth stage)
      - Malayalam Voice Assistant (speech-to-text, TTS, Malayalam responses)
      - Resource planning & allocation (land, water, labour, budget)
      - Cultivation cost and financial returns estimation
      - Marketplace buyer/seller listings and trade requests
    """

    class Role(models.TextChoices):
        FARMER = 'FARMER', 'Farmer'
        USER = 'USER', 'Normal User'

    class Language(models.TextChoices):
        MALAYALAM = 'ml', 'Malayalam (മലയാളം)'
        ENGLISH = 'en', 'English'

    class KeralaDistrict(models.TextChoices):
        ALAPPUZHA = 'Alappuzha', 'Alappuzha'
        ERNAKULAM = 'Ernakulam', 'Ernakulam'
        IDUKKI = 'Idukki', 'Idukki'
        KANNUR = 'Kannur', 'Kannur'
        KASARAGOD = 'Kasaragod', 'Kasaragod'
        KOLLAM = 'Kollam', 'Kollam'
        KOTTAYAM = 'Kottayam', 'Kottayam'
        KOZHIKODE = 'Kozhikode', 'Kozhikode'
        MALAPPURAM = 'Malappuram', 'Malappuram'
        PALAKKAD = 'Palakkad', 'Palakkad'
        PATHANAMTHITTA = 'Pathanamthitta', 'Pathanamthitta'
        THIRUVANANTHAPURAM = 'Thiruvananthapuram', 'Thiruvananthapuram'
        THRISSUR = 'Thrissur', 'Thrissur'
        WAYANAD = 'Wayanad', 'Wayanad'

    class LandAreaUnit(models.TextChoices):
        ACRES = 'ACRES', 'Acres'
        CENTS = 'CENTS', 'Cents'
        HECTARES = 'HECTARES', 'Hectares'

    class SoilType(models.TextChoices):
        LATERITE = 'LATERITE', 'Laterite Soil'
        ALLUVIAL = 'ALLUVIAL', 'Coastal Alluvium'
        CLAYEY_KOLE = 'CLAYEY_KOLE', 'Clayey / Kari / Kole Soil (Kuttanad & Thrissur)'
        RED_LOAM = 'RED_LOAM', 'Red Loam Soil'
        BLACK_COTTON = 'BLACK_COTTON', 'Black Cotton Soil (Chittur / Palakkad)'
        SANDY_LOAM = 'SANDY_LOAM', 'Sandy Loam'
        FOREST_LOAM = 'FOREST_LOAM', 'Forest Loam (High Ranges - Idukki/Wayanad)'

    class WaterAvailability(models.TextChoices):
        HIGH = 'HIGH', 'High (Abundant year-round water)'
        MEDIUM = 'MEDIUM', 'Medium (Adequate seasonal water)'
        LOW = 'LOW', 'Low (Limited water supply)'
        SCARCE = 'SCARCE', 'Scarce (Severely drought-prone)'

    class WaterSource(models.TextChoices):
        OPEN_WELL = 'OPEN_WELL', 'Open Well'
        BOREWELL = 'BOREWELL', 'Borewell'
        CANAL_RIVER = 'CANAL_RIVER', 'Canal / River'
        POND = 'POND', 'Farm Pond / Rainwater Harvesting'
        RAINFED = 'RAINFED', 'Rainfed Only (Monsoon dependent)'

    class IrrigationMethod(models.TextChoices):
        DRIP = 'DRIP', 'Drip Irrigation (Micro-irrigation)'
        SPRINKLER = 'SPRINKLER', 'Sprinkler Irrigation'
        FLOOD = 'FLOOD', 'Flood / Furrow Irrigation'
        MANUAL = 'MANUAL', 'Manual Watering'
        RAINFED = 'RAINFED', 'None / Rainfed'

    class GrowthStage(models.TextChoices):
        LAND_PREPARATION = 'LAND_PREPARATION', 'Land Preparation / Sowing'
        VEGETATIVE = 'VEGETATIVE', 'Vegetative / Tillering Stage'
        FLOWERING = 'FLOWERING', 'Flowering / Panicle Initiation'
        GRAIN_FILLING = 'GRAIN_FILLING', 'Grain Filling / Maturation'
        HARVEST = 'HARVEST', 'Harvesting / Post-Harvest'

    class RiskLevel(models.TextChoices):
        LOW = 'LOW', 'Low Risk'
        MEDIUM = 'MEDIUM', 'Medium Risk'
        HIGH = 'HIGH', 'High Risk'

    # One-to-One link with Django Auth User
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')

    # 1. Identity, Roles & Contact Info
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.FARMER)
    phone_number = models.CharField(max_length=15, blank=True)
    bio = models.TextField(blank=True)
    profile_picture = models.URLField(max_length=500, blank=True, null=True)

    # 2. Location & Climate Context (For Weather, Season & Climate Analytics)
    district = models.CharField(max_length=50, choices=KeralaDistrict.choices, default=KeralaDistrict.PALAKKAD)
    panchayath_or_village = models.CharField(max_length=100, blank=True)
    address = models.TextField(blank=True)
    pincode = models.CharField(max_length=10, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    # 3. Voice Assistant & Malayalam Language Support
    preferred_language = models.CharField(max_length=10, choices=Language.choices, default=Language.MALAYALAM)
    voice_assistant_enabled = models.BooleanField(default=True, help_text="Enable Malayalam voice Q&A, STT, and TTS")

    # 4. Land & Soil Parameters (For Crop Recommendation & Land Use Planning)
    land_area = models.DecimalField(max_digits=10, decimal_places=2, default=1.0)
    land_area_unit = models.CharField(max_length=10, choices=LandAreaUnit.choices, default=LandAreaUnit.ACRES)
    soil_type = models.CharField(max_length=30, choices=SoilType.choices, default=SoilType.LATERITE)
    soil_ph = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True, help_text="e.g. 5.8 - 6.5")

    # 5. Water Availability & Irrigation Advisory
    water_availability = models.CharField(max_length=20, choices=WaterAvailability.choices, default=WaterAvailability.MEDIUM)
    primary_water_source = models.CharField(max_length=20, choices=WaterSource.choices, default=WaterSource.OPEN_WELL)
    irrigation_method = models.CharField(max_length=20, choices=IrrigationMethod.choices, default=IrrigationMethod.FLOOD)

    # 6. Crop Management, Pest Risk & History
    current_crop = models.CharField(max_length=100, default='Rice', help_text="Current crop being cultivated (e.g. Rice, Coconut, Banana)")
    growth_stage = models.CharField(max_length=30, choices=GrowthStage.choices, default=GrowthStage.VEGETATIVE)
    historical_pest_issues = models.TextField(blank=True, help_text="Historical pest/disease occurrences (e.g., Stem borer, Rice blast, BPH)")
    last_estimated_pest_risk = models.CharField(max_length=10, choices=RiskLevel.choices, default=RiskLevel.LOW)

    # 7. Resource & Financial Budgeting (Labour, Cultivation Cost & Returns)
    cultivation_budget = models.DecimalField(max_digits=12, decimal_places=2, default=50000.00, help_text="Available budget in INR (₹)")
    available_labour_count = models.IntegerField(default=2, help_text="Number of available family or hired farm labourers")
    expected_yield_quintals = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    expected_selling_price_per_unit = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Expected price in INR per quintal/kg")

    # 8. Marketplace & Buyer Purchase Requests
    is_verified_farmer = models.BooleanField(default=False)
    upi_id = models.CharField(max_length=100, blank=True, help_text="UPI ID / Bank details for receiving payments")

    # 9. Document uploads (ID proof & land image)
    id_documentation = models.FileField(upload_to='documents/', blank=True, null=True)
    land_image = models.ImageField(upload_to='land_images/', blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} ({self.get_role_display()}) - {self.district}"


class ProductListing(models.Model):
    farmer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products')
    crop_name = models.CharField(max_length=150)
    quantity_available_kg = models.DecimalField(max_digits=10, decimal_places=2)
    price_per_kg = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    image_url = models.URLField(max_length=500, blank=True, null=True)
    district = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.crop_name} - {self.farmer.username} ({self.quantity_available_kg} kg)"


class PurchaseOrder(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        ACCEPTED = 'ACCEPTED', 'Accepted'
        REJECTED = 'REJECTED', 'Rejected'
        COMPLETED = 'COMPLETED', 'Completed'

    product = models.ForeignKey(ProductListing, on_delete=models.CASCADE, related_name='orders')
    buyer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='purchase_orders')
    buyer_name = models.CharField(max_length=100, blank=True)
    buyer_phone = models.CharField(max_length=20, blank=True)
    requested_quantity_kg = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} for {self.product.crop_name} ({self.requested_quantity_kg} kg)"


class FarmerEnquiry(models.Model):
    """
    Enquiries and agricultural doubts sent by normal users/visitors to farmers
    """
    farmer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_enquiries')
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='sent_enquiries')
    sender_name = models.CharField(max_length=150)
    sender_email = models.EmailField(blank=True)
    sender_phone = models.CharField(max_length=20, blank=True)
    subject = models.CharField(max_length=200)
    message = models.TextField()
    reply = models.TextField(blank=True)
    status = models.CharField(max_length=20, default='PENDING')  # 'PENDING', 'ANSWERED'
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Enquiry to {self.farmer.username} from {self.sender_name}: {self.subject}"


class AgriculturalNewsItem(models.Model):
    """
    Live agricultural news, advisories, and market intelligence auto-updated every 24 hours.
    """
    title = models.CharField(max_length=500)
    title_ml = models.CharField(max_length=500, blank=True)
    source = models.CharField(max_length=200, default='Agri News')
    link = models.URLField(max_length=1000, blank=True, default='#')
    published_at = models.CharField(max_length=100, blank=True)
    category = models.CharField(max_length=100, default='General Agriculture')
    category_ml = models.CharField(max_length=100, blank=True)
    impact_level = models.CharField(max_length=20, default='MEDIUM')  # HIGH, MEDIUM, LOW
    impact_level_ml = models.CharField(max_length=50, blank=True)
    sentiment = models.CharField(max_length=20, default='NEUTRAL')  # POSITIVE, CAUTION, NEUTRAL
    affected_crops = models.JSONField(default=list, blank=True)
    affected_crops_ml = models.JSONField(default=list, blank=True)
    farmer_summary = models.TextField(blank=True)
    farmer_summary_ml = models.TextField(blank=True)
    action_advice = models.TextField(blank=True)
    action_advice_ml = models.TextField(blank=True)
    is_live = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at', '-created_at']

    def __str__(self):
        return f"[{self.category}] {self.title[:60]}"



