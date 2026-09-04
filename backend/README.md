# Agross Backend API (Node.js + Express + MongoDB)

Unified REST API powering the Agross Agricultural Ecosystem:
- **Farmer Panel (Mobile App)**: Product listings, pricing, order fulfillment, payout tracking.
- **Customer Panel (Mobile App)**: Browsing, search, cart, checkout, payment processing, bills.
- **Admin Panel (Web Portal)**: Verification of farmers, product moderation, order audits, farmer payouts.

## Architecture Overview

```
backend/
├── src/
│   ├── config/
│   │   └── db.js              # MongoDB Mongoose connection
│   ├── models/
│   │   ├── User.js            # Farmers, Customers, Admins
│   │   ├── Product.js         # Vegetables, Fruits, Prices, Harvest Date
│   │   ├── Order.js           # Customer orders, delivery status
│   │   ├── Bill.js            # Invoice generated per order
│   │   └── Payout.js          # Farmer earnings & bank payout records
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   └── adminController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   └── adminRoutes.js
│   ├── middlewares/
│   │   ├── authMiddleware.js  # JWT verification
│   │   └── roleMiddleware.js  # Farmer / Customer / Admin access guard
│   └── server.js
├── .env.example
└── package.json
```

## API Endpoints Reference

### 1. Authentication (`/api/auth`)
- `POST /api/auth/register` - Register as Farmer or Customer
- `POST /api/auth/login` - Authenticate with email/mobile + password or OTP
- `GET /api/auth/me` - Get profile and role details

### 2. Products & Harvest Catalog (`/api/products`)
- `GET /api/products` - Browse all vegetables & fruits with filters
- `POST /api/products` - [Farmer Only] Add new harvest produce with price & qty
- `PUT /api/products/:id` - [Farmer Only] Update crop price/stock
- `DELETE /api/products/:id` - [Farmer Only] Remove crop listing

### 3. Orders & Billing (`/api/orders`)
- `POST /api/orders` - [Customer] Place new order & initiate payment
- `GET /api/orders/my-orders` - [Customer] View past purchase invoices
- `GET /api/orders/farmer-orders` - [Farmer] View incoming crop requests

### 4. Admin Management (`/api/admin`)
- `GET /api/admin/farmers` - Manage registered farmers & approvals
- `GET /api/admin/customers` - Manage customer accounts
- `GET /api/admin/bills` - View customer bills and tax summaries
- `POST /api/admin/payouts/:farmerId` - Approve and record farmer payouts
