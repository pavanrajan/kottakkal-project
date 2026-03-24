from django.urls import path
from .views import OrderConfirmView

urlpatterns = [
    path('confirm/', OrderConfirmView.as_view(), name='confirm-order'),
]