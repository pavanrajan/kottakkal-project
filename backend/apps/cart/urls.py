from django.urls import path
from .views import (CartCreateView, CartAddItemView, CartIncrementItemView,
                    CartDecrementItemView, CartDeleteItemView, CartSummaryView, ApplyCouponView)

urlpatterns = [
    path('carts/', CartCreateView.as_view()),
    path('cart/item/add/', CartAddItemView.as_view()),
    path('cart/item/increment/', CartIncrementItemView.as_view()),
    path('cart/item/decrement/', CartDecrementItemView.as_view()),
    path('cart/item/delete/', CartDeleteItemView.as_view()),
    path('cart/summary/', CartSummaryView.as_view()),
    path('cart/apply-coupon/', ApplyCouponView.as_view()),
]
