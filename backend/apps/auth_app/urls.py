from django.urls import path
from .views import (IdentifyCustomerView, SendOTPView, ResendOTPView,
                    VerifyOTPView, RegisterView, GetCustomerAddressView, LoginView)

urlpatterns = [
    path('identify-customer/', IdentifyCustomerView.as_view()),
    path('send-otp/', SendOTPView.as_view()),
    path('resend-otp/', ResendOTPView.as_view()),
    path('verify-otp/', VerifyOTPView.as_view()),
    path('register/', RegisterView.as_view()),
    path('get-customer-address/', GetCustomerAddressView.as_view()),
    path('login/', LoginView.as_view()),
]
