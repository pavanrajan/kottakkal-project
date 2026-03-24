from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication

from .models import Cart, CartItem
from apps.catalog.models import MedicalItem


# ===========================
# CREATE / GET CART
# ===========================
class CartCreateView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cart = Cart.objects.filter(user=request.user, status='open').first()

        if not cart:
            cart = Cart.objects.create(user=request.user)

        return Response({"order_no": cart.order_no})


# ===========================
# ADD ITEM
# ===========================
class CartAddItemView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_no = request.data.get('order_no')
        mcode = request.data.get('mcode')
        qty = int(request.data.get('qty', 1))

        # ✅ Correct indentation
        cart = Cart.objects.filter(
            order_no=order_no,
            user=request.user,
            status='open'
        ).first()

        # 🔥 AUTO CREATE CART
        if not cart:
            cart = Cart.objects.create(user=request.user)
            order_no = cart.order_no  # 🔥 IMPORTANT

        item = MedicalItem.objects.filter(mcode=mcode).first()
        if not item:
            return Response({'message': 'Item not found'}, status=404)

        ci = CartItem.objects.filter(cart=cart, mcode=mcode).first()

        if ci:
            ci.qty += qty
            ci.rate = item.sell_price
            ci.save()
        else:
            CartItem.objects.create(
                cart=cart,
                order_no=cart.order_no,  # 🔥 FIX HERE
                mcode=mcode,
                sku_name=item.sku_name,
                rate=item.sell_price,
                qty=qty
            )

        update_cart(cart)

        return Response({
            'message': 'Item added',
            'order_no': cart.order_no  # 🔥 RETURN THIS
        })
# ===========================
# INCREMENT ITEM
# ===========================
class CartIncrementItemView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_no = request.data.get('order_no')
        mcode = request.data.get('mcode')

        cart = Cart.objects.filter(order_no=order_no, user=request.user, status='open').first()
        if not cart:
            return Response({'message': 'Cart not found'}, status=403)

        item = CartItem.objects.filter(cart=cart, mcode=mcode).first()
        if not item:
            return Response({'message': 'Item not found'}, status=404)

        item.qty += 1
        item.save()

        update_cart(cart)
        return Response({'message': 'Item incremented'})


# ===========================
# DECREMENT ITEM
# ===========================
class CartDecrementItemView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_no = request.data.get('order_no')
        mcode = request.data.get('mcode')

        cart = Cart.objects.filter(order_no=order_no, user=request.user, status='open').first()
        if not cart:
            return Response({'message': 'Cart not found'}, status=403)

        item = CartItem.objects.filter(cart=cart, mcode=mcode).first()
        if not item:
            return Response({'message': 'Item not found'}, status=404)

        if item.qty <= 1:
            item.delete()
        else:
            item.qty -= 1
            item.save()

        update_cart(cart)
        return Response({'message': 'Item updated'})


# ===========================
# DELETE ITEM
# ===========================
class CartDeleteItemView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_no = request.data.get('order_no')
        mcode = request.data.get('mcode')

        cart = Cart.objects.filter(order_no=order_no, user=request.user, status='open').first()
        if not cart:
            return Response({'message': 'Cart not found'}, status=403)

        CartItem.objects.filter(cart=cart, mcode=mcode).delete()

        update_cart(cart)
        return Response({'message': 'Item removed'})


# ===========================
# CART SUMMARY
# ===========================
class CartSummaryView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        order_no = request.query_params.get('order_no')

        cart = Cart.objects.filter(order_no=order_no, user=request.user).first()
        if not cart:
            return Response({'message': 'Cart not found'}, status=404)

        items = list(cart.items.values())

        return Response({
            'order_no': cart.order_no,
            'items': items,
            'total': float(cart.total_amount),
            'discount': float(cart.discount_amount),
            'net': cart.net_amount
        })


# ===========================
# APPLY COUPON
# ===========================
class ApplyCouponView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_no = request.data.get('order_no')
        coupon_code = request.data.get('coupon_code', '').upper()

        cart = Cart.objects.filter(order_no=order_no, user=request.user, status='open').first()
        if not cart:
            return Response({'message': 'Cart not found'}, status=404)

        COUPONS = {'WELCOME10': 10, 'SAVE20': 20, 'FLAT50': 50}

        if coupon_code not in COUPONS:
            return Response({'message': 'Invalid coupon'}, status=400)

        pct = COUPONS[coupon_code]

        cart.coupon_code = coupon_code
        cart.discount_amount = float(cart.total_amount) * pct / 100
        cart.save()

        return Response({
            'message': f'{pct}% discount applied',
            'discount': float(cart.discount_amount),
            'net': cart.net_amount
        })


# ===========================
# CONFIRM ORDER (ONLY ONE)
# ===========================
class ConfirmOrderView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_no = request.data.get('order_no')

        if not order_no:
            return Response({'message': 'Order number required'}, status=400)

        cart = Cart.objects.filter(order_no=order_no, user=request.user, status='open').first()

        if not cart:
            return Response({'message': 'Cart not found or already confirmed'}, status=404)

        cart.status = 'confirmed'
        cart.save()

        return Response({
            "message": "Your order is placed successfully",
            "order_no": cart.order_no
        })


# ===========================
# HELPER
# ===========================
def update_cart(cart):
    total = sum(float(i.amt) for i in cart.items.all())
    cart.total_amount = total

    if cart.coupon_code:
        COUPONS = {'WELCOME10': 10, 'SAVE20': 20, 'FLAT50': 50}
        pct = COUPONS.get(cart.coupon_code, 0)
        cart.discount_amount = total * pct / 100

    cart.save()