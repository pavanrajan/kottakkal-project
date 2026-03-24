from django.db import models
import uuid


def gen_invoice_no():
    return 'INV' + uuid.uuid4().hex[:8].upper()


class Order(models.Model):
    STATUS_CHOICES = [
        ('ORDERED', 'Ordered'),
        ('PROCESSING', 'Processing'),
        ('DISPATCHED', 'Dispatched'),
        ('DELIVERED', 'Delivered'),
        ('CANCELLED', 'Cancelled'),
    ]
    PAYMENT_CHOICES = [('ONLINE', 'Online'), ('COD', 'Cash on Delivery'), ('UPI', 'UPI')]

    order_no = models.CharField(max_length=50, unique=True)
    invoice_no = models.CharField(max_length=50, unique=True, default=gen_invoice_no)
    customer_code = models.CharField(max_length=20)
    customer_name = models.CharField(max_length=200, blank=True)
    mobile = models.CharField(max_length=15, blank=True)

    # Address snapshot at time of order
    address = models.TextField(blank=True)
    post = models.CharField(max_length=100, blank=True)
    district = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    pin = models.CharField(max_length=10, blank=True)
    country = models.CharField(max_length=100, default='India')

    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    net_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    payment_mode = models.CharField(max_length=20, choices=PAYMENT_CHOICES, default='ONLINE')
    delivery_status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='ORDERED')

    dispatch_no = models.CharField(max_length=50, blank=True)
    courier = models.CharField(max_length=100, blank=True)

    date = models.DateField(auto_now_add=True)
    time = models.TimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order {self.order_no} - {self.invoice_no}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    order_no = models.CharField(max_length=50)
    mcode = models.CharField(max_length=50)
    sku_name = models.CharField(max_length=300, blank=True)
    rate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    qty = models.IntegerField(default=1)
    amt = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.order_no} - {self.mcode} x{self.qty}"
