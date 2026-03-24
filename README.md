# Kottakkal Arya Vaidya Sala - Full Stack Project

## Tech Stack
- **Backend**: Django 4.2 + Django REST Framework + SQLite
- **Frontend**: React 18 + Vite + React Router

## Project Structure
```
kottakkal/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── seed_data.py
│   ├── kottakkal_project/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   └── apps/
│       ├── catalog/      # Categories + Products (MedicalItems)
│       ├── auth_app/     # Customer auth, OTP, registration
│       ├── cart/         # Cart management
│       ├── orders/       # Order confirmation
│       └── admin_panel/  # Admin dashboard APIs
└── frontend/
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── api/config.js       # All API endpoints
        ├── context/CartContext.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   ├── ProductCard.jsx
        │   ├── CartPanel.jsx
        │   ├── CheckoutModal.jsx
        │   ├── ProductDetailModal.jsx
        │   └── Toast.jsx
        └── pages/
            ├── StorePage.jsx
            └── AdminPage.jsx
```

## Quick Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- pip

### Step 1: Backend
```bash
cd backend
pip install -r requirements.txt
python manage.py makemigrations catalog cart orders auth_app admin_panel
python manage.py migrate
python manage.py shell < seed_data.py
python manage.py runserver
```
Django runs at: http://localhost:8000

### Step 2: Frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
```
React runs at: http://localhost:5173

## URLs
| URL | Description |
|-----|-------------|
| http://localhost:5173 | Customer Store |
| http://localhost:5173/admin | Admin Dashboard |
| http://localhost:8000/admin | Django Admin |
| http://localhost:8000/api/ | REST API |

## Default Credentials
- **Admin**: username=`admin`, password=`admin123`

## REST API Reference

### Catalog
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/categories/ | List all categories |
| GET | /api/categories/catcodes/ | Category codes only |
| GET | /api/categories/with-medicalitems/ | Categories with products |
| POST | /api/categories/ | Create category |
| GET | /api/medicalitems/ | List products |
| POST | /api/medicalitems/ | Create product |
| GET | /api/medicalitems/?catcode=KAS | Filter by category |
| GET | /api/medicalitems/?search=kashayam | Search products |

### Auth
| Method | Endpoint | Body |
|--------|----------|------|
| POST | /api/auth/identify-customer/ | `{mobileNumber}` |
| POST | /api/auth/send-otp/ | `{mobileNumber}` |
| POST | /api/auth/verify-otp/ | `{otpReferenceId, otp}` |
| POST | /api/auth/register/ | `{mobileNumber, name, prefix, address, ...}` |
| POST | /api/auth/get-customer-address/ | `{mobileNumber}` |

### Cart
| Method | Endpoint | Body |
|--------|----------|------|
| POST | /api/carts/ | `{ccode}` → returns `order_no` |
| POST | /api/cart/item/add/ | `{order_no, mcode, qty}` |
| POST | /api/cart/item/increment/ | `{order_no, mcode}` |
| POST | /api/cart/item/decrement/ | `{order_no, mcode}` |
| POST | /api/cart/item/delete/ | `{order_no, mcode}` |
| GET  | /api/cart/summary/?order_no=xxx | Cart summary |
| POST | /api/cart/apply-coupon/ | `{order_no, coupon_code}` |

### Orders
| Method | Endpoint | Body |
|--------|----------|------|
| POST | /api/orders/confirm/ | `{order_no, address_id, payment_mode}` + Token header OR `customer_code` in body |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/admin/login/ | `{username, password}` |
| GET  | /api/admin/orders/ | All orders (Token required) |
| PATCH | /api/admin/orders/{id}/ | Update order status |

## Coupon Codes (for testing)
- `WELCOME10` — 10% off
- `SAVE20` — 20% off
- `FLAT50` — ₹50 off

## OTP in Development
OTPs are printed to the **Django console** (terminal). Look for:
```
*** OTP for 9876543210: 123456 (ref: abc123) ***
```

## Adding Products via Admin
1. Go to http://localhost:5173/admin
2. Login with admin/admin123
3. Click "Add Product" tab
4. Fill in: mcode, category, name, unit, MRP, discount

## Django Admin
Visit http://localhost:8000/admin to manage all data directly via Django's built-in admin interface.
