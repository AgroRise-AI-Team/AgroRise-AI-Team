from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import UserProfile


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Agricultural & Farmer Profile'


class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)


# Re-register UserAdmin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'district', 'current_crop', 'soil_type', 'water_availability', 'cultivation_budget', 'is_verified_farmer')
    list_filter = ('role', 'district', 'soil_type', 'water_availability', 'growth_stage', 'last_estimated_pest_risk')
    search_fields = ('user__username', 'user__email', 'phone_number', 'panchayath_or_village', 'current_crop')
