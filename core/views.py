import random
from django.conf import settings
from django.core.cache import cache
from django.core.mail import send_mail
from django.contrib.auth.models import User
from django.db.models import Q
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import UserProfile, ProductListing, PurchaseOrder, FarmerEnquiry
from .serializers import (
    ChangePasswordSerializer,
    CustomTokenObtainPairSerializer,
    RegisterSerializer,
    UserSerializer,
    UserProfileSerializer,
    ProductListingSerializer,
    PurchaseOrderSerializer,
)


# 0. API Overview
class AuthOverviewView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        return Response({
            "message": "Agro_rice Auth API (Built with APIView)",
            "endpoints": {
                "register": "/api/auth/register/",
                "login": "/api/auth/login/",
                "token_refresh": "/api/auth/token/refresh/",
                "profile": "/api/auth/profile/",
                "change_password": "/api/auth/change-password/",
                "logout": "/api/auth/logout/",
            }
        }, status=status.HTTP_200_OK)


# 1. Register View (APIView - NOT generic)
class RegisterView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            errors = serializer.errors
            if 'email' in errors:
                msg = errors['email'][0] if isinstance(errors['email'], list) else str(errors['email'])
                return Response(
                    {"email": [msg], "message": msg, "error": msg},
                    status=status.HTTP_400_BAD_REQUEST
                )
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            "message": "User registered successfully",
            "user": UserSerializer(user).data,
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


# 2. Custom Login View (APIView - NOT generic)
class LoginView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = CustomTokenObtainPairSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response({
            "message": "Login successful",
            **serializer.validated_data,
        }, status=status.HTTP_200_OK)


# 3. User Profile View (APIView - GET & PUT)
class UserProfileView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        UserProfile.objects.get_or_create(user=request.user)
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        UserProfile.objects.get_or_create(user=request.user)
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)

        if 'profile' not in data:
            user_fields = {'username', 'email', 'first_name', 'last_name'}
            profile_payload = {k: v for k, v in data.items() if k not in user_fields}
            user_payload = {k: v for k, v in data.items() if k in user_fields}
            if profile_payload:
                user_payload['profile'] = profile_payload
            data = user_payload

        serializer = UserSerializer(request.user, data=data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            "message": "Profile updated successfully",
            "user": serializer.data,
        }, status=status.HTTP_200_OK)


# View to fetch the land image and details of the specific logged-in user
class LoggedUserLandDetailView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)

        land_image_url = None
        if profile.land_image:
            land_image_url = request.build_absolute_uri(profile.land_image.url)

        id_doc_url = None
        if profile.id_documentation:
            id_doc_url = request.build_absolute_uri(profile.id_documentation.url)

        return Response({
            "user_id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
            "first_name": request.user.first_name,
            "last_name": request.user.last_name,
            "role": profile.role,
            "phone_number": profile.phone_number,
            "bio": profile.bio,
            "profile_picture": profile.profile_picture,
            "district": profile.district,
            "panchayath_or_village": profile.panchayath_or_village,
            "address": profile.address,
            "pincode": profile.pincode,
            "latitude": str(profile.latitude) if profile.latitude is not None else None,
            "longitude": str(profile.longitude) if profile.longitude is not None else None,
            "preferred_language": profile.preferred_language,
            "land_area": str(profile.land_area),
            "land_area_unit": profile.land_area_unit,
            "soil_type": profile.soil_type,
            "soil_ph": str(profile.soil_ph) if profile.soil_ph is not None else None,
            "water_availability": profile.water_availability,
            "primary_water_source": profile.primary_water_source,
            "irrigation_method": profile.irrigation_method,
            "current_crop": profile.current_crop,
            "growth_stage": profile.growth_stage,
            "cultivation_budget": str(profile.cultivation_budget),
            "available_labour_count": profile.available_labour_count,
            "historical_pest_issues": profile.historical_pest_issues,
            "is_verified_farmer": profile.is_verified_farmer,
            "upi_id": profile.upi_id,
            "land_image": land_image_url,
            "id_documentation": id_doc_url,
            "created_at": profile.created_at,
            "updated_at": profile.updated_at,
        }, status=status.HTTP_200_OK)


# View for visitors and public observers to explore agriculture data uploaded by farmers
class FarmerAgricultureDataView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        district = request.GET.get('district', '').strip()
        crop = request.GET.get('crop', '').strip()
        search = request.GET.get('search', '').strip()

        # Fetch profiles that belong strictly to registered farmers
        queryset = UserProfile.objects.select_related('user').filter(
            role=UserProfile.Role.FARMER
        ).order_by('-updated_at')

        if district:
            queryset = queryset.filter(district__iexact=district)
        if crop:
            queryset = queryset.filter(current_crop__icontains=crop)
        if search:
            queryset = queryset.filter(
                Q(user__username__icontains=search) |
                Q(current_crop__icontains=search) |
                Q(district__icontains=search) |
                Q(panchayath_or_village__icontains=search)
            )

        data = []
        for profile in queryset:
            land_image_url = None
            if profile.land_image:
                land_image_url = request.build_absolute_uri(profile.land_image.url)

            products = list(profile.user.products.values('id', 'crop_name', 'quantity_available_kg', 'price_per_kg', 'district'))

            data.append({
                "id": profile.user.id,
                "farmer_username": profile.user.username,
                "farmer_display_name": f"{profile.user.first_name} {profile.user.last_name}".strip() or profile.user.username,
                "role": profile.role,
                "district": profile.district,
                "panchayath_or_village": profile.panchayath_or_village,
                "current_crop": profile.current_crop or "Rice",
                "growth_stage": profile.growth_stage,
                "growth_stage_display": profile.get_growth_stage_display(),
                "land_area": str(profile.land_area),
                "land_area_unit": profile.land_area_unit,
                "soil_type": profile.soil_type,
                "soil_type_display": profile.get_soil_type_display(),
                "water_availability": profile.water_availability,
                "water_availability_display": profile.get_water_availability_display(),
                "primary_water_source": profile.primary_water_source,
                "primary_water_source_display": profile.get_primary_water_source_display(),
                "irrigation_method": profile.irrigation_method,
                "irrigation_method_display": profile.get_irrigation_method_display(),
                "land_image_url": land_image_url,
                "phone_number": profile.phone_number or "",
                "email": profile.user.email or "",
                "is_verified_farmer": profile.is_verified_farmer,
                "products": products,
                "updated_at": profile.updated_at,
            })

        return Response({
            "total_farmers": len(data),
            "farmers": data
        }, status=status.HTTP_200_OK)


# 4. Change Password View (APIView - NOT generic)
class ChangePasswordView(APIView):
    permission_classes = (IsAuthenticated,)

    def put(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)

        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()

        return Response({
            "detail": "Password updated successfully."
        }, status=status.HTTP_200_OK)


# 5. Logout View
class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response(
                    {"detail": "Refresh token is required."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {"detail": "Successfully logged out."},
                status=status.HTTP_200_OK
            )
        except Exception:
            return Response(
                {"detail": "Invalid or expired token."},
                status=status.HTTP_400_BAD_REQUEST
            )


# 6. Farmer Detail View (GET & PUT profile including file uploads)
class FarmerDetailView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        # Ensure a profile exists
        UserProfile.objects.get_or_create(user=request.user)
        profile = request.user.profile
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(request.user.profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            "message": "Farmer details updated successfully",
            "profile": serializer.data,
        }, status=status.HTTP_200_OK)


# -------------------------------------------------------------
# 7. OTP Verification Views (Supports Gmail SMTP & Mobile SMS)
# -------------------------------------------------------------
class SendOTPView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        phone_number = request.data.get('phone_number', '').strip()

        if not email and not phone_number:
            return Response(
                {"error": "Please provide an email address or mobile phone number."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if email and User.objects.filter(email__iexact=email).exists():
            return Response(
                {
                    "error": "This email is already registered. Please use another email or log in.",
                    "message": "This email is already registered. Please use another email or log in."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        target = email if email else phone_number
        cache_key = f"otp_{target}"

        # Generate 6-digit numeric OTP
        otp = str(random.randint(100000, 999999))

        # Store in cache with 5 minutes (300 seconds) expiry
        cache.set(cache_key, otp, timeout=300)

        # 1. Send via Gmail SMTP if email is provided
        email_sent = False
        if email:
            try:
                subject = "Your AgroRise AI Verification Code"
                message = (
                    f"Hello,\n\n"
                    f"Your AgroRise AI verification code is: {otp}\n\n"
                    f"This OTP is valid for 5 minutes. Please do not share this code with anyone.\n\n"
                    f"Best regards,\n"
                    f"AgroRise AI Team"
                )
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[email],
                    fail_silently=False,
                )
                email_sent = True
            except Exception as e:
                print(f"[Email Warning] Could not send via SMTP: {e}")

        # 2. Console debug output
        print(f"\n==========================================")
        print(f"  [AgroRise OTP] Target: {target}")
        print(f"  [AgroRise OTP] Code:   {otp}")
        print(f"  [AgroRise OTP] Sent via Gmail: {email_sent}")
        print(f"==========================================\n")

        return Response({
            "message": f"OTP sent successfully to {target}.",
            "target": target,
            "email_sent": email_sent,
            "dev_otp": otp,
        }, status=status.HTTP_200_OK)


class VerifyOTPView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        phone_number = request.data.get('phone_number', '').strip()
        user_otp = request.data.get('otp', '').strip()

        target = email if email else phone_number
        if not target or not user_otp:
            return Response(
                {"error": "Both target (email or phone) and OTP code are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        cache_key = f"otp_{target}"
        cached_otp = cache.get(cache_key)

        if not cached_otp:
            return Response(
                {"error": "OTP has expired or was never requested. Please request a new OTP."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if str(cached_otp).strip() != str(user_otp).strip():
            return Response(
                {"error": "Invalid OTP code. Please check and try again."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # OTP is verified -> delete from cache to prevent replay
        cache.delete(cache_key)

        # Check if an existing user matches this email/username
        user = User.objects.filter(email__iexact=target).first() if email else User.objects.filter(username__iexact=target).first()
        tokens = None
        user_data = None
        if user:
            refresh = RefreshToken.for_user(user)
            tokens = {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }
            user_data = UserSerializer(user).data

        return Response({
            "verified": True,
            "message": "Verification successful!",
            "target": target,
            "tokens": tokens,
            "user": user_data,
        }, status=status.HTTP_200_OK)


# -------------------------------------------------------------
# 8. Forgot Password with Email OTP Views
# -------------------------------------------------------------
class ForgotPasswordSendOTPView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        email = str(request.data.get('email') or '').strip().lower()
        if not email:
            return Response(
                {"error": "Please provide your registered email address."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if user exists with this email or username
        user = User.objects.filter(email__iexact=email).first()
        if not user:
            user = User.objects.filter(username__iexact=email).first()

        if not user:
            return Response(
                {"error": "No account registered with this email or username."},
                status=status.HTTP_404_NOT_FOUND
            )

        target_email = user.email or email
        cache_key = f"pwd_reset_{target_email}"
        otp = str(random.randint(100000, 999999))
        cache.set(cache_key, otp, timeout=300)

        email_sent = False
        try:
            subject = "AgroRise AI - Password Reset Code"
            message = (
                f"Hello {user.username},\n\n"
                f"You requested to reset your password for AgroRise AI.\n\n"
                f"Your 6-digit password reset verification code is:\n"
                f"    {otp}\n\n"
                f"This code is valid for 5 minutes. If you did not request this, please disregard this email.\n\n"
                f"Warm regards,\n"
                f"AgroRise AI Security Team"
            )
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[target_email],
                fail_silently=False,
            )
            email_sent = True
        except Exception as e:
            print(f"[Email Warning] Could not send password reset OTP via SMTP: {e}")

        print(f"\n==========================================")
        print(f"  [AgroRise Password Reset OTP] User: {user.username}")
        print(f"  [AgroRise Password Reset OTP] Email: {target_email}")
        print(f"  [AgroRise Password Reset OTP] Code:  {otp}")
        print(f"  [AgroRise Password Reset OTP] Sent via Gmail: {email_sent}")
        print(f"==========================================\n")

        return Response({
            "message": f"Password reset verification code sent to {target_email}.",
            "email": target_email,
            "email_sent": email_sent,
            "dev_otp": otp if not email_sent else None,
        }, status=status.HTTP_200_OK)


class ForgotPasswordConfirmView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        email = str(request.data.get('email') or '').strip().lower()
        otp = str(request.data.get('otp') or '').strip()
        new_password = str(request.data.get('new_password') or '').strip()

        if not email or not otp or not new_password:
            return Response(
                {"error": "Email, verification OTP code, and new password are all required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(new_password) < 6:
            return Response(
                {"error": "New password must be at least 6 characters long."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.filter(email__iexact=email).first()
        if not user:
            user = User.objects.filter(username__iexact=email).first()

        if not user:
            return Response(
                {"error": "Account not found for this email."},
                status=status.HTTP_404_NOT_FOUND
            )

        target_email = user.email or email
        cache_key = f"pwd_reset_{target_email}"
        cached_otp = cache.get(cache_key)

        if not cached_otp:
            return Response(
                {"error": "OTP has expired or was not requested. Please request a new code."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if str(cached_otp).strip() != str(otp).strip():
            return Response(
                {"error": "Invalid verification code. Please check and try again."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Clear OTP cache
        cache.delete(cache_key)

        # Update password
        user.set_password(new_password)
        user.save()

        # Generate tokens for immediate login
        refresh = RefreshToken.for_user(user)
        tokens = {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }
        user_data = UserSerializer(user).data

        return Response({
            "message": "Password reset successfully! You are now logged in.",
            "tokens": tokens,
            "user": user_data,
        }, status=status.HTTP_200_OK)



# ---------------------------------------------------------------------------
# Agricultural Modules (Advisory, Planning, Voice & Marketplace)
# ---------------------------------------------------------------------------

# Module 1: Crop Suitability & Recommendation
class CropRecommendationView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        soil_type = request.data.get('soil_type', 'LATERITE')
        water_availability = request.data.get('water_availability', 'MEDIUM')
        district = request.data.get('district', 'Palakkad')
        budget = float(request.data.get('budget', 50000) or 50000)
        land_area = float(request.data.get('land_area', 1.5) or 1.5)

        ranked_crops = [
            {
                "rank": 1,
                "crop_name": "Paddy (Uma Variety)",
                "suitability_score": "94%",
                "explanation": f"Well suited for {soil_type.replace('_', ' ').title()} soil with {water_availability.title()} water availability during Mundakan season in {district}.",
                "basic_guidance": "Transplant seedlings at 20x15cm spacing. Apply lime (250kg/ha) to regulate soil pH."
            },
            {
                "rank": 2,
                "crop_name": "Nendran Banana",
                "suitability_score": "86%",
                "explanation": f"High return on {land_area} acres within ₹{int(budget):,} initial budget with drip setup.",
                "basic_guidance": "Dig pits 50x50x50cm. Provide organic manure and neem cake during planting."
            },
            {
                "rank": 3,
                "crop_name": "Short Duration Black Gram (Co-6)",
                "suitability_score": "78%",
                "explanation": "Ideal for soil nitrogen replenishment with low water consumption.",
                "basic_guidance": "Broadcast seeds after light tilling. Inoculate with Rhizobium culture before sowing."
            }
        ]
        return Response({"ranked_crops": ranked_crops}, status=status.HTTP_200_OK)


# Module 2: Pest Risk Estimation
class PestRiskView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        crop_type = request.data.get('crop_type', 'Rice')
        growth_stage = request.data.get('growth_stage', 'VEGETATIVE')
        season = request.data.get('season', 'Mundakan')

        risk_level = "High" if growth_stage in ["FLOWERING", "GRAIN_FILLING"] else "Medium"
        suggestions = [
            "Install pheromone traps @ 8 per acre to monitor adult moths.",
            "Avoid excessive nitrogen fertilizer application to prevent leaf folder surge.",
            "Release Trichogramma chilonis egg parasitoids @ 5cc/acre at weekly intervals.",
            "Maintain clean bunds and ensure periodic drainage to deter hopper build-up."
        ]
        return Response({
            "risk_level": risk_level,
            "likely_pests": ["Yellow Stem Borer", "Rice Leaf Folder", "Brown Plant Hopper"],
            "preventive_suggestions": suggestions
        }, status=status.HTTP_200_OK)


# Module 3: Smart Irrigation Advisory
class IrrigationAdvisoryView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        crop = request.data.get('crop_type', 'Rice')
        stage = request.data.get('growth_stage', 'VEGETATIVE')

        return Response({
            "suggested_timing": "Every 3 to 4 days, early morning (6:00 AM - 8:30 AM)",
            "water_requirement": f"Maintain 2-3 cm standing water during {stage.lower().replace('_', ' ')} phase",
            "water_saving_practices": [
                "Adopt Alternate Wetting and Drying (AWD) using a field perforated PVC water tube.",
                "Repair bunds and seal crab holes to prevent seepage losses.",
                "Apply organic paddy straw mulching in adjacent vegetable/pulse beds to conserve root zone moisture."
            ]
        }, status=status.HTTP_200_OK)


# Module 4: Malayalam Voice Assistant
class VoiceAssistantView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        prompt = request.data.get('prompt', 'voice_query')
        language = request.data.get('language', 'ml')

        transcribed = prompt if prompt != 'voice_query' else "നെല്ലിൽ ഓലചുരുട്ടി പുഴുവിനെ എങ്ങനെ നിയന്ത്രിക്കാം?"
        reply = (
            "ഓലചുരുട്ടി പുഴുവിനെ നിയന്ത്രിക്കാൻ ട്രൈക്കോഗ്രാമ മുട്ടക്കാർഡുകൾ ഒരേക്കറിന് 2 സി.സി ക്രമത്തിൽ വെക്കുക. "
            "വേപ്പെണ്ണ അധിഷ്ഠിത കീടനാശിനികൾ പ്രയോഗിക്കാവുന്നതാണ്. തോട്ടിൽ കളകൾ നീക്കം ചെയ്ത് വെളിച്ചക്കെണികൾ സ്ഥാപിക്കുക."
        )
        return Response({
            "transcribed_question": transcribed,
            "response_text": reply,
            "audio_url": "https://api.agrorise.ai/media/audio_responses/res_92831.mp3"
        }, status=status.HTTP_200_OK)


# Module 5: Resource & Multi-Crop Planning
class ResourceAllocationView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        land_area = float(request.data.get('land_area', 3.0) or 3.0)
        budget = float(request.data.get('budget', 90000) or 90000)

        plot_a = round(land_area * 0.65, 1)
        plot_b = round(land_area * 0.35, 1)

        return Response({
            "allocation_plan": [
                {
                    "plot_id": f"Plot A ({plot_a} Acres)",
                    "recommended_crop": "Paddy (Uma Variety)",
                    "budget_allocated": int(budget * 0.6),
                    "labour_days_needed": 18
                },
                {
                    "plot_id": f"Plot B ({plot_b} Acres)",
                    "recommended_crop": "Short-duration Pulses / Vegetables",
                    "budget_allocated": int(budget * 0.4),
                    "labour_days_needed": 12
                }
            ],
            "guidance": "Intercropping pulses after paddy harvest will restore soil nitrogen, breaking the pest cycle and providing secondary revenue."
        }, status=status.HTTP_200_OK)


# Module 6: Cultivation Expenses & Returns
class CostEstimatorView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        seed = float(request.data.get('seed_cost', 0) or 0)
        fertiliser = float(request.data.get('fertiliser_cost', 0) or 0)
        labour = float(request.data.get('labour_cost', 0) or 0)
        irrigation = float(request.data.get('irrigation_cost', 0) or 0)
        other = float(request.data.get('other_expenses', 0) or 0)

        total_expenses = seed + fertiliser + labour + irrigation + other
        if total_expenses == 0:
            total_expenses = 33000.00

        yield_qty = float(request.data.get('expected_yield_quintals', 22) or 22)
        price_per_unit = float(request.data.get('expected_price_per_quintal', 2820) or 2820)

        gross_returns = yield_qty * price_per_unit
        net_profit = gross_returns - total_expenses
        roi = round((net_profit / total_expenses) * 100) if total_expenses > 0 else 0
        break_even = round(total_expenses / yield_qty, 2) if yield_qty > 0 else 0

        return Response({
            "total_expenses": total_expenses,
            "gross_returns": gross_returns,
            "estimated_net_profit": net_profit,
            "roi_percentage": f"{roi}%",
            "break_even_price": f"{break_even:.2f} per quintal"
        }, status=status.HTTP_200_OK)


# Module 7: Marketplace Listings & Orders
class MarketplaceProductListView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        search = request.GET.get('search', '').strip()
        district = request.GET.get('district', '').strip()

        queryset = ProductListing.objects.all().order_by('-created_at')
        if search:
            queryset = queryset.filter(Q(crop_name__icontains=search) | Q(description__icontains=search))
        if district:
            queryset = queryset.filter(district__iexact=district)

        serializer = ProductListingSerializer(queryset, many=True)
        return Response({
            "count": queryset.count(),
            "results": serializer.data
        }, status=status.HTTP_200_OK)

    def post(self, request):
        user = request.user if request.user.is_authenticated else User.objects.first()
        data = request.data.copy()
        if 'image_url' not in data and 'images' in data and data['images']:
            data['image_url'] = data['images'][0]

        serializer = ProductListingSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        product = serializer.save(farmer=user)
        return Response({
            "message": "Product listed successfully",
            "product": ProductListingSerializer(product).data
        }, status=status.HTTP_201_CREATED)


class MarketplaceOrderView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        product_id = request.data.get('product_id')
        qty = request.data.get('requested_quantity_kg', 10)
        notes = request.data.get('notes', '')
        name = request.data.get('buyer_name', 'Buyer')
        phone = request.data.get('buyer_phone', '')

        try:
            product = ProductListing.objects.get(id=product_id)
        except ProductListing.DoesNotExist:
            return Response({"detail": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

        buyer = request.user if request.user.is_authenticated else None
        order = PurchaseOrder.objects.create(
            product=product,
            buyer=buyer,
            buyer_name=name,
            buyer_phone=phone,
            requested_quantity_kg=qty,
            notes=notes
        )
        return Response({
            "message": "Purchase request sent successfully",
            "order_id": order.id,
            "crop_name": product.crop_name,
            "status": order.status
        }, status=status.HTTP_201_CREATED)


class FarmerEnquiryView(APIView):
    """
    Enquiries and doubts API:
    - GET: Returns received doubts for Farmers, or sent doubts for Normal Users
    - POST: Normal users/visitors submit an enquiry/doubt to a specific farmer
    """
    permission_classes = (AllowAny,)

    def get(self, request):
        if not request.user.is_authenticated:
            return Response({"enquiries": []}, status=status.HTTP_200_OK)

        user = request.user
        profile = getattr(user, 'profile', None)
        is_farmer = profile and profile.role == UserProfile.Role.FARMER

        if is_farmer:
            enquiries = FarmerEnquiry.objects.filter(farmer=user)
        else:
            enquiries = FarmerEnquiry.objects.filter(sender=user)

        data = []
        for eq in enquiries:
            farmer_profile = getattr(eq.farmer, 'profile', None)
            data.append({
                "id": eq.id,
                "farmer_id": eq.farmer.id,
                "farmer_username": eq.farmer.username,
                "farmer_name": f"{eq.farmer.first_name} {eq.farmer.last_name}".strip() or eq.farmer.username,
                "farmer_district": getattr(farmer_profile, 'district', '') if farmer_profile else '',
                "farmer_phone": getattr(farmer_profile, 'phone_number', '') if farmer_profile else '',
                "farmer_crop": getattr(farmer_profile, 'current_crop', '') if farmer_profile else '',
                "sender_name": eq.sender_name,
                "sender_email": eq.sender_email,
                "sender_phone": eq.sender_phone,
                "subject": eq.subject,
                "message": eq.message,
                "reply": eq.reply,
                "status": eq.status,
                "created_at": eq.created_at.isoformat(),
            })

        return Response({
            "is_farmer": is_farmer,
            "total": len(data),
            "enquiries": data
        }, status=status.HTTP_200_OK)

    def post(self, request):
        farmer_id = request.data.get('farmer_id')
        if not farmer_id:
            return Response({"detail": "farmer_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            farmer = User.objects.get(id=farmer_id)
        except User.DoesNotExist:
            return Response({"detail": "Target farmer not found"}, status=status.HTTP_404_NOT_FOUND)

        sender = request.user if request.user.is_authenticated else None
        sender_name = request.data.get('sender_name', '').strip()
        if not sender_name and sender:
            sender_name = f"{sender.first_name} {sender.last_name}".strip() or sender.username
        if not sender_name:
            sender_name = "Interested Farmer/Visitor"

        sender_email = request.data.get('sender_email', '').strip()
        if not sender_email and sender:
            sender_email = sender.email

        sender_phone = request.data.get('sender_phone', '').strip()
        if not sender_phone and sender and hasattr(sender, 'profile'):
            sender_phone = sender.profile.phone_number

        subject = request.data.get('subject', '').strip() or 'Agricultural Doubt / Enquiry'
        message = request.data.get('message', '').strip()
        if not message:
            return Response({"detail": "Enquiry message / question cannot be empty"}, status=status.HTTP_400_BAD_REQUEST)

        enquiry = FarmerEnquiry.objects.create(
            farmer=farmer,
            sender=sender,
            sender_name=sender_name,
            sender_email=sender_email,
            sender_phone=sender_phone,
            subject=subject,
            message=message,
            status='PENDING'
        )

        # Notify the farmer via email if email is present
        try:
            if farmer.email:
                email_subj = f"🌾 [AgroRise AI] New Farming Enquiry from {sender_name}: {subject}"
                email_body = f"""Dear {farmer.username},

You have received a new farming doubt/enquiry on AgroRise AI:

From: {sender_name}
Email: {sender_email or 'Not provided'}
Phone: {sender_phone or 'Not provided'}
Subject: {subject}

Question / Doubt Details:
--------------------------------------------------
{message}
--------------------------------------------------

You can view and reply to this directly from your AgroRise Farmer Dashboard under 'Enquiries'.

Warm regards,
AgroRise AI Team
"""
                send_mail(
                    email_subj,
                    email_body,
                    settings.DEFAULT_FROM_EMAIL or 'noreply@agrorise.com',
                    [farmer.email],
                    fail_silently=True
                )
        except Exception:
            pass

        return Response({
            "status": "success",
            "message": "Enquiry submitted successfully. The farmer has been notified.",
            "enquiry_id": enquiry.id
        }, status=status.HTTP_201_CREATED)


class FarmerEnquiryReplyView(APIView):
    """
    Farmer responds to an enquiry/doubt
    """
    permission_classes = (AllowAny,)

    def post(self, request, pk):
        try:
            enquiry = FarmerEnquiry.objects.get(pk=pk)
        except FarmerEnquiry.DoesNotExist:
            return Response({"detail": "Enquiry not found"}, status=status.HTTP_404_NOT_FOUND)

        reply = request.data.get('reply', '').strip()
        if not reply:
            return Response({"detail": "Reply text cannot be empty"}, status=status.HTTP_400_BAD_REQUEST)

        enquiry.reply = reply
        enquiry.status = 'ANSWERED'
        enquiry.save()

        # Send email response to user if email was given
        try:
            if enquiry.sender_email:
                send_mail(
                    f"🌾 [AgroRise AI] Farmer {enquiry.farmer.username} replied to your enquiry",
                    f"""Hello {enquiry.sender_name},

Farmer {enquiry.farmer.username} has replied to your enquiry: "{enquiry.subject}"

Farmer's Response:
--------------------------------------------------
{reply}
--------------------------------------------------

Thank you for consulting Kerala farmers on AgroRise AI.
""",
                    settings.DEFAULT_FROM_EMAIL or 'noreply@agrorise.com',
                    [enquiry.sender_email],
                    fail_silently=True
                )
        except Exception:
            pass

        return Response({
            "status": "success",
            "message": "Reply saved successfully and notification sent.",
            "enquiry_id": enquiry.id,
            "reply": enquiry.reply,
            "status": enquiry.status
        }, status=status.HTTP_200_OK)


