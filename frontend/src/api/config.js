const BASE_URL = "https://kottakkal-project.onrender.com";

export const API = {
  CATEGORIES: `${BASE_URL}/api/categories/`,
  CATEGORY_CATCODES: `${BASE_URL}/api/categories/catcodes/`,
  CATEGORIES_WITH_ITEMS: `${BASE_URL}/api/categories/with-medicalitems/`,
  MEDICAL_ITEMS: `${BASE_URL}/api/medicalitems/`,
  IDENTIFY_CUSTOMER: `${BASE_URL}/api/auth/identify-customer/`,
  GET_CUSTOMER_ADDRESS: `${BASE_URL}/api/auth/get-customer-address/`,
  SEND_OTP: `${BASE_URL}/api/auth/send-otp/`,
  RESEND_OTP: `${BASE_URL}/api/auth/resend-otp/`,
  VERIFY_OTP: `${BASE_URL}/api/auth/verify-otp/`,
  REGISTER: `${BASE_URL}/api/auth/register/`,
  LOGIN: `${BASE_URL}/api/auth/login/`,
  CARTS: `${BASE_URL}/api/carts/`,
  CART_ADD_ITEM: `${BASE_URL}/api/cart/item/add/`,
  CART_INCREMENT_ITEM: `${BASE_URL}/api/cart/item/increment/`,
  CART_DECREMENT_ITEM: `${BASE_URL}/api/cart/item/decrement/`,
  CART_DELETE_ITEM: `${BASE_URL}/api/cart/item/delete/`,
  CART_SUMMARY: `${BASE_URL}/api/cart/summary/`,
  APPLY_COUPON: `${BASE_URL}/api/cart/apply-coupon/`,
  ORDERS_CONFIRM: `${BASE_URL}/api/orders/confirm/`,
  ADMIN_LOGIN: `${BASE_URL}/api/admin/login/`,
  ADMIN_ORDERS: `${BASE_URL}/api/admin/orders/`,
};

export function authHeaders() {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Token ${token}` } : {}),
  };
}