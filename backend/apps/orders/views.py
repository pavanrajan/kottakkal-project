from rest_framework.views import APIView
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from apps.cart.models import Cart, CartItem
from apps.auth_app.models import Customer
from .models import Order, OrderItem


class OrderConfirmView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        order_no = data.get('order_no', '').strip()
        address_id = data.get('address_id')
        payment_mode = data.get('payment_mode', 'ONLINE')
        customer_code = data.get('customer_code', '').strip()

        if not order_no:
            return Response({'message': 'order_no is required'}, status=400)

        # Resolve customer from token or customer_code
        customer = None
        if request.user and request.user.is_authenticated:
            customer = Customer.objects.filter(user=request.user).first()
        if not customer and customer_code:
            customer = Customer.objects.filter(customer_code=customer_code).first()

        # Get cart — must be open
        cart = Cart.objects.filter(order_no=order_no).first()
        if not cart:
            return Response({'message': 'Cart not found. Please add items and try again.'}, status=404)
        if cart.status != 'open':
            return Response({'message': f'This order is already {cart.status}. Please add new items to place another order.'}, status=400)

        # Ownership check — only reject if cart belongs to a DIFFERENT customer
        # Anonymous carts (empty customer_code) can be claimed by anyone
        if (customer and cart.customer_code and
                cart.customer_code != customer.customer_code):
            return Response({'message': 'Cart belongs to another customer'}, status=403)

        # Claim the cart if it was anonymous
        if customer and not cart.customer_code:
            cart.customer_code = customer.customer_code
            cart.ccode = customer.customer_code
            cart.save()

        # Get address snapshot
        address_snapshot = {}
        if address_id:
            addr_customer = Customer.objects.filter(id=address_id).first()
            if addr_customer:
                address_snapshot = {
                    'address': addr_customer.address,
                    'post': addr_customer.post,
                    'district': addr_customer.district,
                    'state': addr_customer.state,
                    'pin': addr_customer.pin,
                    'country': addr_customer.country,
                }
        if not address_snapshot and customer:
            address_snapshot = {
                'address': customer.address,
                'post': customer.post,
                'district': customer.district,
                'state': customer.state,
                'pin': customer.pin,
                'country': customer.country,
            }

        cart_items = cart.items.all()
        if not cart_items.exists():
            return Response({'message': 'Cart is empty. Please add items first.'}, status=400)

        # Create Order
        order = Order.objects.create(
            order_no=order_no,
            customer_code=customer.customer_code if customer else cart.customer_code,
            customer_name=customer.name if customer else '',
            mobile=customer.mobile if customer else '',
            address=address_snapshot.get('address', ''),
            post=address_snapshot.get('post', ''),
            district=address_snapshot.get('district', ''),
            state=address_snapshot.get('state', ''),
            pin=address_snapshot.get('pin', ''),
            country=address_snapshot.get('country', 'India'),
            total_amount=cart.total_amount,
            discount_amount=cart.discount_amount,
            net_amount=cart.net_amount,
            payment_mode=payment_mode,
            delivery_status='ORDERED',
        )

        for ci in cart_items:
            OrderItem.objects.create(
                order=order, order_no=order_no,
                mcode=ci.mcode, sku_name=ci.sku_name,
                rate=ci.rate, qty=ci.qty, amt=ci.amt,
            )

        cart.status = 'confirmed'
        cart.invoice_no = order.invoice_no
        cart.delivery_status = 'ORDERED'
        cart.save()

        return Response({
            'message': 'Order confirmed successfully',
            'order_no': order.order_no,
            'invoice_no': order.invoice_no,
            'total_amount': float(order.total_amount),
            'net_amount': float(order.net_amount),
            'payment_mode': order.payment_mode,
            'delivery_status': order.delivery_status,
        })
        
        