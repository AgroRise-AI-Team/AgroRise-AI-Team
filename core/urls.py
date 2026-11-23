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

    # Forgot Password with Email OTP Endpoints
    path('auth/password-reset/send-otp/', ForgotPasswordSendOTPView.as_view(), name='forgot_pwd_send_otp'),
    path('auth/password-reset/confirm/', ForgotPasswordConfirmView.as_view(), name='forgot_pwd_confirm'),
    path('password-reset/send-otp/', ForgotPasswordSendOTPView.as_view(), name='forgot_pwd_send_otp_alt'),
    path('password-reset/confirm/', ForgotPasswordConfirmView.as_view(), name='forgot_pwd_confirm_alt'),

    # Public / Visitor Agriculture Data Endpoints
    path('farmers/agriculture-data/', FarmerAgricultureDataView.as_view(), name='farmer_agriculture_data'),
    path('marketplace/products/', MarketplaceProductListView.as_view(), name='marketplace_products'),

    # OTP Verification Endpoints
    path('auth/otp/send/', SendOTPView.as_view(), name='send_otp'),
    path('auth/otp/verify/', VerifyOTPView.as_view(), name='verify_otp'),
    path('otp/send/', SendOTPView.as_view(), name='send_otp_alt'),
    path('otp/verify/', VerifyOTPView.as_view(), name='verify_otp_alt'),
]


