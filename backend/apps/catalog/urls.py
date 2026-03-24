from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, MedicalItemViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'medicalitems', MedicalItemViewSet, basename='medicalitem')

urlpatterns = [path('', include(router.urls))]
