# Agross Web Admin Portal (React + Vite)

Dedicated web dashboard for the **Admin Panel** to manage the entire Agross platform:
- **Farmers Management**: Verify farmer identities, monitor land & crop listings, handle grievance tickets.
- **Customers Management**: Customer directory, address verification, active order tracking.
- **Product & Price Moderation**: Ensure fair pricing, quality assurance standards for fruits & vegetables.
- **Customer Bills & Invoices**: Generate GST-compliant invoices, track payment gateways (Razorpay/Stripe/UPI).
- **Farmer Payouts**: Automated calculation of farmer earnings (Sales minus platform fees), direct bank NEFT/UPI release status.

## Architecture Overview

```
web-admin/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx
│   │   ├── Navbar.jsx
│   │   ├── StatCard.jsx
│   │   └── DataTable.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Farmers.jsx
│   │   ├── Customers.jsx
│   │   ├── Products.jsx
│   │   ├── Bills.jsx
│   │   └── Payouts.jsx
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```
