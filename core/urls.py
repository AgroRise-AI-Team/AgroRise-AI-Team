from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    LoginView,
    UserProfileView,
    ChangePasswordView,
    LogoutView,
    LoggedUserLandDetailView,
    FarmerAgricultureDataView,
    MarketplaceProductListView,
    SendOTPView,
    VerifyOTPView,
    ForgotPasswordSendOTPView,
    ForgotPasswordConfirmView,
    FarmerEnquiryView,
    FarmerEnquiryReplyView,
)
from .land_analyzer_views import (
    SmartLandAnalyzerView,
    SmartLandAnalyzerMetadataView,
    SmartLandDistrictProfileView,
    SmartLandNearbyFacilitiesView,
)

from .profit_estimator_views import (
    CropProfitCalculateView,
    CropProfitMetadataView,
)

from .news_views import (
    AgriNewsListView,
    AgriNewsRefreshView,
)

from .chat_views import (
    AgroChatbotView,
    AgroChatSuggestionsView,
)

from .leaf_views import (
    LeafDiseaseDiagnosisView,
    LeafDiseaseSampleCasesView,
)

urlpatterns = [
    # Auth endpoints
    path('register/', RegisterView.as_view(), name='register_alt'),
    path('login/', LoginView.as_view(), name='login_alt'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh_alt'),
    path('profile/', UserProfileView.as_view(), name='user_profile_alt'),
    path('profile/land-details/', LoggedUserLandDetailView.as_view(), name='logged_user_land_details'),
    path('farmer/land-details/', LoggedUserLandDetailView.as_view(), name='farmer_land_details'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password_alt'),
    path('logout/', LogoutView.as_view(), name='logout_alt'),

    # Module 2: Smart Land Analyzer AI/ML Endpoints
    path('smart-land-analyzer/analyze/', SmartLandAnalyzerView.as_view(), name='smart_land_analyze'),
    path('smart-land-analyzer/metadata/', SmartLandAnalyzerMetadataView.as_view(), name='smart_land_metadata'),
    path('smart-land-analyzer/location-profile/', SmartLandDistrictProfileView.as_view(), name='smart_land_location_profile'),
    path('smart-land-analyzer/nearby-facilities/', SmartLandNearbyFacilitiesView.as_view(), name='smart_land_nearby_facilities'),
    path('land-analyzer/analyze/', SmartLandAnalyzerView.as_view(), name='land_analyze_shortcut'),
    path('land-analyzer/metadata/', SmartLandAnalyzerMetadataView.as_view(), name='land_metadata_shortcut'),
    path('land-analyzer/location-profile/', SmartLandDistrictProfileView.as_view(), name='land_location_profile_shortcut'),
    path('land-analyzer/nearby-facilities/', SmartLandNearbyFacilitiesView.as_view(), name='land_nearby_facilities_shortcut'),


    # Module 4: Crop Profit Estimator Endpoints
    path('crop-profit-estimator/calculate/', CropProfitCalculateView.as_view(), name='crop_profit_calculate'),
    path('crop-profit-estimator/crops/', CropProfitMetadataView.as_view(), name='crop_profit_crops'),
    path('profit-estimator/calculate/', CropProfitCalculateView.as_view(), name='profit_calc_shortcut'),
    path('profit-estimator/crops/', CropProfitMetadataView.as_view(), name='profit_crops_shortcut'),



    # Forgot Password with Email OTP Endpoints
    path('auth/password-reset/send-otp/', ForgotPasswordSendOTPView.as_view(), name='forgot_pwd_send_otp'),
    path('auth/password-reset/confirm/', ForgotPasswordConfirmView.as_view(), name='forgot_pwd_confirm'),
    path('password-reset/send-otp/', ForgotPasswordSendOTPView.as_view(), name='forgot_pwd_send_otp_alt'),
    path('password-reset/confirm/', ForgotPasswordConfirmView.as_view(), name='forgot_pwd_confirm_alt'),

    # Public / Visitor Agriculture Data Endpoints
    path('farmers/agriculture-data/', FarmerAgricultureDataView.as_view(), name='farmer_agriculture_data'),
    path('farmers/enquiries/', FarmerEnquiryView.as_view(), name='farmer_enquiries'),
    path('farmers/enquiries/<int:pk>/reply/', FarmerEnquiryReplyView.as_view(), name='farmer_enquiry_reply'),
    path('marketplace/products/', MarketplaceProductListView.as_view(), name='marketplace_products'),

    # OTP Verification Endpoints
    path('auth/otp/send/', SendOTPView.as_view(), name='send_otp'),
    path('auth/otp/verify/', VerifyOTPView.as_view(), name='verify_otp'),
    path('otp/send/', SendOTPView.as_view(), name='send_otp_alt'),
    path('otp/verify/', VerifyOTPView.as_view(), name='verify_otp_alt'),

    # AI Agricultural News Analyzer Endpoints
    path('news/latest/', AgriNewsListView.as_view(), name='agri_news_latest'),
    path('news/refresh/', AgriNewsRefreshView.as_view(), name='agri_news_refresh'),

    # Gemini AI Agricultural Chatbot Endpoints
    path('chat/', AgroChatbotView.as_view(), name='agri_chat'),
    path('ai/chat/', AgroChatbotView.as_view(), name='agri_chat_alt'),
    path('chat/suggestions/', AgroChatSuggestionsView.as_view(), name='agri_chat_suggestions'),

    # Leaf Disease Detection & Computer Vision Endpoints
    path('leaf-disease/diagnose/', LeafDiseaseDiagnosisView.as_view(), name='leaf_disease_diagnose'),
    path('leaf-disease/detect/', LeafDiseaseDiagnosisView.as_view(), name='leaf_disease_detect'),
    path('leaf-disease/', LeafDiseaseDiagnosisView.as_view(), name='leaf_disease_base'),
    path('leaf-doctor/diagnose/', LeafDiseaseDiagnosisView.as_view(), name='leaf_doctor_diagnose'),
    path('leaf-doctor/', LeafDiseaseDiagnosisView.as_view(), name='leaf_doctor_base'),
    path('leaf-disease/samples/', LeafDiseaseSampleCasesView.as_view(), name='leaf_disease_samples'),
]



