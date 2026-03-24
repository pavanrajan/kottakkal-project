from django.db import models
from django.contrib.auth.models import User
import uuid


def gen_order_no():
    return 'ORD' + uuid.uuid4().hex[:10].upper()


class Cart(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)

    order_no = models.CharField(max_length=50, unique=True, default=gen_order_no)
    customer_code = models.CharField(max_length=20, blank=True)
    ccode = models.CharField(max_length=20, blank=True)

    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    coupon_code = models.CharField(max_length=50, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user} - {self.order_no}"

    @property
    def net_amount(self):
        return max(0, float(self.total_amount) - float(self.discount_amount))
    
class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    order_no = models.CharField(max_length=50)
    mcode = models.CharField(max_length=50)
    sku_name = models.CharField(max_length=300, blank=True)
    rate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    qty = models.IntegerField(default=1)
    amt = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def save(self, *args, **kwargs):
        self.amt = float(self.rate) * self.qty
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.order_no} - {self.mcode}"    