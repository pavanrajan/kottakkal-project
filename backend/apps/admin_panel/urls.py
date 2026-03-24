from django.urls import path
from .views import AdminLoginView, AdminOrdersView

urlpatterns = [
    path('admin/login/', AdminLoginView.as_view()),
    path('admin/orders/', AdminOrdersView.as_view()),
    path('admin/orders/<int:order_id>/', AdminOrdersView.as_view()),
]
