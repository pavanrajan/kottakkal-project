from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from .models import Customer, OTPRecord
import random
import string
import uuid


def generate_otp():
    return ''.join(random.choices(string.digits, k=6))


class IdentifyCustomerView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [AllowAny]

    def post(self, request):
        mobile = request.data.get('mobileNumber', '').strip()
        if not mobile:
            return Response({'message': 'Mobile number required'}, status=400)
        exists = Customer.objects.filter(mobile=mobile).exists()
        return Response({'exists': exists, 'mobile': mobile})


class SendOTPView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [AllowAny]

    def post(self, request):
        mobile = request.data.get('mobileNumber', '').strip()
        email = request.data.get('email', '').strip()
        if not mobile:
            return Response({'message': 'Mobile number required'}, status=400)
        otp = generate_otp()
        reference_id = str(uuid.uuid4())[:20]
        OTPRecord.objects.create(mobile=mobile, email=email, otp=otp, reference_id=reference_id)
        print(f"\n*** OTP for {mobile}: {otp} (ref: {reference_id}) ***\n")
        return Response({'message': 'OTP sent successfully', 'otpReferenceId': reference_id, 'dev_otp': otp})


class ResendOTPView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [AllowAny]

    def post(self, request):
        mobile = request.data.get('mobileNumber', '').strip()
        if not mobile:
            return Response({'message': 'Mobile number required'}, status=400)
        otp = generate_otp()
        reference_id = str(uuid.uuid4())[:20]
        OTPRecord.objects.create(mobile=mobile, otp=otp, reference_id=reference_id)
        print(f"\n*** RESEND OTP for {mobile}: {otp} (ref: {reference_id}) ***\n")
        return Response({'message': 'OTP resent successfully', 'otpReferenceId': reference_id, 'dev_otp': otp})


class VerifyOTPView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [AllowAny]

    def post(self, request):
        reference_id = request.data.get('otpReferenceId', '').strip()
        otp = request.data.get('otp', '').strip()
        if not reference_id or not otp:
            return Response({'message': 'otpReferenceId and otp required'}, status=400)
        try:
            record = OTPRecord.objects.get(reference_id=reference_id, is_used=False)
        except OTPRecord.DoesNotExist:
            return Response({'message': 'Invalid or expired OTP reference'}, status=400)
        if record.otp != otp:
            return Response({'message': 'Invalid OTP'}, status=400)
        record.is_used = True
        record.save()
        customer = Customer.objects.filter(mobile=record.mobile).first()
        if customer and customer.user:
            token, _ = Token.objects.get_or_create(user=customer.user)
            return Response({
                'message': 'OTP verified',
                'token': token.key,
                'customer_code': customer.customer_code,
                'is_new': False,
            })
        return Response({'message': 'OTP verified', 'is_new': True, 'mobile': record.mobile})


class RegisterView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        mobile = data.get('mobileNumber', '').strip()
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        prefix = data.get('prefix', 'Mr')
        address = data.get('address', '')
        post = data.get('post', '')
        district = data.get('district', '')
        state = data.get('state', '')
        pin = data.get('pin', '')
        country = data.get('country', 'India')

        if not mobile or not name:
            return Response({'message': 'Mobile and name are required'}, status=400)
        if Customer.objects.filter(mobile=mobile).exists():
            return Response({'message': 'Customer with this mobile already exists'}, status=400)

        username = f"cust_{mobile}"
        user = User.objects.create_user(username=username, email=email, password=None)
        customer = Customer.objects.create(
            user=user, mobile=mobile, email=email, name=name, prefix=prefix,
            address=address, post=post, district=district, state=state, pin=pin, country=country
        )
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'message': 'Registration successful',
            'token': token.key,
            'customer_code': customer.customer_code,
            'name': customer.name,
        }, status=201)


class GetCustomerAddressView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [AllowAny]

    def post(self, request):
        mobile = request.data.get('mobileNumber', '').strip()
        if not mobile:
            return Response({'message': 'Mobile number required'}, status=400)
        customer = Customer.objects.filter(mobile=mobile).first()
        if not customer:
            return Response({'message': 'Customer not found'}, status=404)
        token = None
        if customer.user:
            t, _ = Token.objects.get_or_create(user=customer.user)
            token = t.key
        return Response({
            'id': customer.id,
            'customer_code': customer.customer_code,
            'name': customer.name,
            'prefix': customer.prefix,
            'address': customer.address,
            'post': customer.post,
            'district': customer.district,
            'state': customer.state,
            'pin': customer.pin,
            'country': customer.country,
            'mobile': customer.mobile,
            'token': token,
        })


class LoginView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [AllowAny]

    def post(self, request):
        mobile = request.data.get('mobileNumber', '').strip()
        customer = Customer.objects.filter(mobile=mobile).first()
        if not customer:
            return Response({'message': 'Customer not found'}, status=404)
        if customer.user:
            token, _ = Token.objects.get_or_create(user=customer.user)
            return Response({'token': token.key, 'customer_code': customer.customer_code, 'name': customer.name})
        return Response({'message': 'Account not fully set up'}, status=400)