from django.db import models
from django.contrib.auth.models import User
import random
import string


def generate_customer_code():
    return 'CUST' + ''.join(random.choices(string.digits, k=6))


class Customer(models.Model):
    PREFIX_CHOICES = [('Mr', 'Mr'), ('Mrs', 'Mrs'), ('Miss', 'Miss'), ('Dr', 'Dr'), ('Prof', 'Prof')]

    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    customer_code = models.CharField(max_length=20, unique=True, default=generate_customer_code)
    mobile = models.CharField(max_length=15, unique=True)
    email = models.EmailField(blank=True)
    prefix = models.CharField(max_length=10, choices=PREFIX_CHOICES, default='Mr')
    name = models.CharField(max_length=200)

    # Address
    address = models.TextField(blank=True)
    post = models.CharField(max_length=100, blank=True)
    district = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    pin = models.CharField(max_length=10, blank=True)
    country = models.CharField(max_length=100, default='India')

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.customer_code} - {self.name} ({self.mobile})"


class OTPRecord(models.Model):
    mobile = models.CharField(max_length=15)
    email = models.EmailField(blank=True)
    otp = models.CharField(max_length=6)
    reference_id = models.CharField(max_length=50, unique=True)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"OTP for {self.mobile} - {self.otp}"
