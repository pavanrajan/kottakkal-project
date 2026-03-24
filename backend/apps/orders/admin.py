from django.contrib import admin
from .models import Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_no', 'invoice_no', 'customer_code', 'customer_name', 'net_amount', 'payment_mode', 'delivery_status', 'created_at']
    list_filter = ['delivery_status', 'payment_mode']
    search_fields = ['order_no', 'invoice_no', 'customer_code', 'customer_name', 'mobile']
    inlines = [OrderItemInline]

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order_no', 'mcode', 'sku_name', 'qty', 'rate', 'amt']
