from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('apps.catalog.urls')),
    path('api/', include('apps.cart.urls')),
    path('api/', include('apps.orders.urls')),
    path('api/auth/', include('apps.auth_app.urls')),
    path('api/', include('apps.admin_panel.urls')),
    path('api/orders/', include('apps.orders.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
