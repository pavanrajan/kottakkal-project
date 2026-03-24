from django.contrib import admin
from .models import Category, MedicalItem

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['cat_code', 'cat_name']
    search_fields = ['cat_code', 'cat_name']

@admin.register(MedicalItem)
class MedicalItemAdmin(admin.ModelAdmin):
    list_display = ['mcode', 'sku_name', 'mrp', 'sell_discount', 'catcode', 'status']
    list_filter = ['status', 'catcode']
    search_fields = ['mcode', 'sku_name', 'sku_code']
