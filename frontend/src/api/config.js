export const API = {
  CATEGORIES: '/api/categories/',
  CATEGORY_CATCODES: '/api/categories/catcodes/',
  CATEGORIES_WITH_ITEMS: '/api/categories/with-medicalitems/',
  MEDICAL_ITEMS: '/api/medicalitems/',
  IDENTIFY_CUSTOMER: '/api/auth/identify-customer/',
  GET_CUSTOMER_ADDRESS: '/api/auth/get-customer-address/',
  SEND_OTP: '/api/auth/send-otp/',
  RESEND_OTP: '/api/auth/resend-otp/',
  VERIFY_OTP: '/api/auth/verify-otp/',
  REGISTER: '/api/auth/register/',
  LOGIN: '/api/auth/login/',
  CARTS: '/api/carts/',
  CART_ADD_ITEM: '/api/cart/item/add/',
  CART_INCREMENT_ITEM: '/api/cart/item/increment/',
  CART_DECREMENT_ITEM: '/api/cart/item/decrement/',
  CART_DELETE_ITEM: '/api/cart/item/delete/',
  CART_SUMMARY: '/api/cart/summary/',
  APPLY_COUPON: '/api/cart/apply-coupon/',
  ORDERS_CONFIRM: '/api/orders/confirm/',
  ADMIN_LOGIN: '/api/admin/login/',
  ADMIN_ORDERS: '/api/admin/orders/',
};

export function authHeaders() {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Token ${token}` } : {}),
  };
}
