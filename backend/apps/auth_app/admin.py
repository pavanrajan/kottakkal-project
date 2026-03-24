from django.contrib import admin
from .models import Customer, OTPRecord

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['customer_code', 'name', 'mobile', 'email', 'created_at']
    search_fields = ['customer_code', 'name', 'mobile']

@admin.register(OTPRecord)
class OTPAdmin(admin.ModelAdmin):
    list_display = ['mobile', 'otp', 'reference_id', 'is_used', 'created_at']
