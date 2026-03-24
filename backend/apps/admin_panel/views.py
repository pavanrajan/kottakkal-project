from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from apps.orders.models import Order, OrderItem
from apps.catalog.models import MedicalItem, Category
from apps.catalog.serializers import MedicalItemSerializer, CategorySerializer
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser


class AdminLoginView(APIView):
    def post(self, request):
        username = request.data.get('username', '')
        password = request.data.get('password', '')
        user = authenticate(username=username, password=password)
        if user and user.is_staff:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({'token': token.key, 'username': user.username})
        return Response({'message': 'Invalid credentials or not admin'}, status=401)


class AdminOrdersView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        orders = Order.objects.all().order_by('-created_at')
        data = []
        for o in orders:
            items = list(o.items.values('mcode', 'sku_name', 'qty', 'rate', 'amt'))
            data.append({
                'id': o.id,
                'order_no': o.order_no,
                'invoice_no': o.invoice_no,
                'customer_code': o.customer_code,
                'customer_name': o.customer_name,
                'mobile': o.mobile,
                'address': o.address,
                'district': o.district,
                'state': o.state,
                'pin': o.pin,
                'total_amount': float(o.total_amount),
                'net_amount': float(o.net_amount),
                'payment_mode': o.payment_mode,
                'delivery_status': o.delivery_status,
                'date': str(o.date),
                'items': items,
            })
        return Response(data)

    def patch(self, request, order_id=None):
        """Update delivery status"""
        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response({'message': 'Order not found'}, status=404)
        new_status = request.data.get('delivery_status')
        if new_status:
            order.delivery_status = new_status
            order.save()
        return Response({'message': 'Updated', 'delivery_status': order.delivery_status})
