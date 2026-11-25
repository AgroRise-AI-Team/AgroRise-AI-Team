from django.contrib.auth.models import User
from django.db import IntegrityError
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import UserProfile, ProductListing, PurchaseOrder


class UserProfileSerializer(serializers.ModelSerializer):
    land_image_url = serializers.SerializerMethodField()
    id_documentation_url = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        exclude = ('user', 'id')

    def get_land_image_url(self, obj):
        request = self.context.get('request')
        if obj.land_image:
            return request.build_absolute_uri(obj.land_image.url) if request else obj.land_image.url
        return None

    def get_id_documentation_url(self, obj):
        request = self.context.get('request')
        if obj.id_documentation:
            return request.build_absolute_uri(obj.id_documentation.url) if request else obj.id_documentation.url
        return None

    def validate_role(self, value):
        if str(value).upper() == 'FARMER':
            return 'FARMER'
        return 'USER'



class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=False, allow_blank=True)
    profile = UserProfileSerializer(required=False)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'profile')

    def validate_email(self, value):
        if value:
            normalized_email = value.strip().lower()
            qs = User.objects.filter(email__iexact=normalized_email)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError("This email is already registered. Please use another email or log in.")
            return normalized_email
        return value

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', None)

        instance.username = validated_data.get('username', instance.username)
        if 'email' in validated_data:
            instance.email = validated_data['email'].strip().lower() if validated_data['email'] else ''
        instance.save()

        if profile_data:
            profile, _ = UserProfile.objects.get_or_create(user=instance)
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()

        return instance


class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True, min_length=6)
    profile = UserProfileSerializer(required=False)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'profile')

    def validate_email(self, value):
        if not value or not str(value).strip():
            raise serializers.ValidationError("This email is already registered. Please use another email or log in.")
        normalized_email = str(value).strip().lower()
        if User.objects.filter(email__iexact=normalized_email).exists():
            raise serializers.ValidationError("This email is already registered. Please use another email or log in.")
        return normalized_email

    def create(self, validated_data):
        profile_data = validated_data.pop('profile', None)
        normalized_email = validated_data.get('email', '').strip().lower()
        try:
            user = User.objects.create_user(
                username=validated_data['username'],
                email=normalized_email,
                password=validated_data['password']
            )
        except IntegrityError:
            raise serializers.ValidationError({
                "email": ["This email is already registered. Please use another email or log in."]
            })

        if profile_data:
            profile, _ = UserProfile.objects.get_or_create(user=user)
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()
        else:
            UserProfile.objects.get_or_create(user=user)

        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        UserProfile.objects.get_or_create(user=self.user)
        # Include full user & profile details along with tokens
        data['user'] = UserSerializer(self.user).data
        return data


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, min_length=6)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is not correct.")
        return value


class ProductListingSerializer(serializers.ModelSerializer):
    farmer_name = serializers.SerializerMethodField()
    farmer_phone = serializers.SerializerMethodField()
    is_verified = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()

    class Meta:
        model = ProductListing
        fields = (
            'id', 'farmer', 'farmer_name', 'farmer_phone', 'is_verified',
            'district', 'crop_name', 'quantity_available_kg', 'price_per_kg',
            'description', 'images', 'created_at'
        )
        extra_kwargs = {'farmer': {'read_only': True}}

    def get_farmer_name(self, obj):
        return obj.farmer.get_full_name() or obj.farmer.username

    def get_farmer_phone(self, obj):
        profile = getattr(obj.farmer, 'profile', None)
        return getattr(profile, 'phone_number', '') if profile else ''

    def get_is_verified(self, obj):
        profile = getattr(obj.farmer, 'profile', None)
        return getattr(profile, 'is_verified_farmer', True) if profile else True

    def get_images(self, obj):
        return [obj.image_url] if obj.image_url else []


class PurchaseOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseOrder
        fields = '__all__'
        extra_kwargs = {'buyer': {'read_only': True}}

