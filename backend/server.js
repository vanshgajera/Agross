/**
 * Agross Central Real-Time REST API & Database Server in Node.js
 * 
 * Features:
 * - Built in Node.js
 * - Clean Database persistence (agross_data.json)
 * - User Registration (Farmer / Customer) with default "Pending" status
 * - Admin Approvals & Rejections
 * - Authentication & Login verification
 * - Farmer Produce Management (Add, List, Delete)
 * - Customer Order Checkout -> Generates Bills & Farmer Payouts
 * - Farmer Payout Settlements
 * - Dual Engine: Supports Express.js or Node.js native http module
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 5001;
const DATA_FILE = path.join(__dirname, 'agross_data.json');
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agross';

let isMongoConnected = false;

// =========================================================================
// MONGODB SCHEMAS & MODELS
// =========================================================================
const FarmerSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  name: String,
  farmName: String,
  branch: String,
  location: String,
  mobile: String,
  email: String,
  password: String,
  cropsListed: String,
  totalSales: { type: Number, default: 0 },
  bankUpi: String,
  status: { type: String, default: 'Pending' },
  rating: { type: Number, default: 5 },
  registeredAt: String
}, { timestamps: true });

const CustomerSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  name: String,
  mobile: String,
  email: String,
  password: String,
  city: String,
  deliveryAddress: String,
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  status: { type: String, default: 'Active' },
  registeredAt: String
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  name: String,
  category: String,
  farmer: String,
  farmerId: String,
  farmerEmail: String,
  farmName: String,
  branch: String,
  location: String,
  price: Number,
  marketAvg: Number,
  unit: { type: String, default: 'kg' },
  stock: Number,
  ordersCount: { type: Number, default: 0 },
  emoji: String,
  image: String,
  description: String
}, { timestamps: true });

const BillSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  customer: String,
  customerEmail: String,
  customerMobile: String,
  deliveryAddress: String,
  items: String,
  itemsList: Array,
  farmerMentionedPrice: Number,
  farmerTotal: Number,
  subtotal: Number,
  delivery: Number,
  gst: Number,
  total: Number,
  method: String,
  status: { type: String, default: 'Paid' },
  farmerName: String,
  farmerEmail: String,
  farmName: String,
  farmBranch: String,
  date: String
}, { timestamps: true });

const PayoutSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  farmer: String,
  farmName: String,
  bankUpi: String,
  billId: String,
  grossAmount: Number,
  commissionRate: Number,
  netAmount: Number,
  status: { type: String, default: 'Settled' },
  dueDate: String
}, { timestamps: true });

const WithdrawalSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  farmer: String,
  farmerId: String,
  amount: Number,
  bankUpi: String,
  status: { type: String, default: 'Completed' },
  date: String
}, { timestamps: true });

const Farmer = mongoose.model('Farmer', FarmerSchema);
const Customer = mongoose.model('Customer', CustomerSchema);
const Product = mongoose.model('Product', ProductSchema);
const Bill = mongoose.model('Bill', BillSchema);
const Payout = mongoose.model('Payout', PayoutSchema);
const Withdrawal = mongoose.model('Withdrawal', WithdrawalSchema);

// MongoDB Connect Function
async function initMongoDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 2000
    });
    isMongoConnected = true;
    console.log(`🍃 [MongoDB] Database connected successfully: ${MONGODB_URI}`);
    await syncMongoData();
  } catch (err) {
    isMongoConnected = false;
    console.log(`ℹ️  [MongoDB] Database offline (${err.message}). Using real-time JSON file persistence (agross_data.json).`);
  }
}
initMongoDB();

async function syncMongoData() {
  if (!isMongoConnected) return;
  try {
    const data = loadData();
    const fCount = await Farmer.countDocuments();
    if (fCount === 0 && data.farmers && data.farmers.length > 0) {
      await Farmer.insertMany(data.farmers);
    }
    const cCount = await Customer.countDocuments();
    if (cCount === 0 && data.customers && data.customers.length > 0) {
      await Customer.insertMany(data.customers);
    }
    const pCount = await Product.countDocuments();
    if (pCount === 0 && data.products && data.products.length > 0) {
      await Product.insertMany(data.products);
    }
    const bCount = await Bill.countDocuments();
    if (bCount === 0 && data.bills && data.bills.length > 0) {
      await Bill.insertMany(data.bills);
    }
    const pyCount = await Payout.countDocuments();
    if (pyCount === 0 && data.payouts && data.payouts.length > 0) {
      await Payout.insertMany(data.payouts);
    }
  } catch (e) {}
}

async function persistToMongoDB(data) {
  if (!isMongoConnected) return;
  try {
    if (data.farmers) {
      for (const f of data.farmers) {
        await Farmer.findOneAndUpdate({ id: f.id }, f, { upsert: true });
      }
    }
    if (data.customers) {
      for (const c of data.customers) {
        await Customer.findOneAndUpdate({ id: c.id }, c, { upsert: true });
      }
    }
    if (data.products) {
      for (const p of data.products) {
        await Product.findOneAndUpdate({ id: p.id }, p, { upsert: true });
      }
    }
    if (data.bills) {
      for (const b of data.bills) {
        await Bill.findOneAndUpdate({ id: b.id }, b, { upsert: true });
      }
    }
    if (data.payouts) {
      for (const py of data.payouts) {
        await Payout.findOneAndUpdate({ id: py.id }, py, { upsert: true });
      }
    }
    if (data.withdrawals) {
      for (const w of data.withdrawals) {
        await Withdrawal.findOneAndUpdate({ id: w.id }, w, { upsert: true });
      }
    }
  } catch (e) {}
}

// Helper: Read Data
function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    const initial = {
      farmers: [],
      customers: [],
      products: [],
      bills: [],
      payouts: [],
      withdrawals: []
    };
    saveData(initial);
    return initial;
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const data = JSON.parse(raw);
    for (const key of ['farmers', 'customers', 'products', 'bills', 'payouts', 'withdrawals']) {
      if (!data[key]) data[key] = [];
    }

    // Recalculate customer total orders and total spent dynamically from bills
    if (data.customers && data.bills) {
      data.customers.forEach(c => {
        const custBills = data.bills.filter(b => {
          const bEm = String(b.customerEmail || '').trim().toLowerCase();
          const cEm = String(c.email || '').trim().toLowerCase();
          const bMob = String(b.customerMobile || '').trim();
          const cMob = String(c.mobile || '').trim();
          const bName = String(b.customer || '').trim().toLowerCase();
          const cName = String(c.name || '').trim().toLowerCase();
          return (cEm && bEm && bEm === cEm) || (cMob && bMob && bMob === cMob) || (cName && bName && bName === cName);
        });

        c.totalOrders = custBills.length;
        c.totalSpent = custBills.reduce((sum, b) => sum + (parseFloat(b.total) || 0), 0);
      });
    }

    return data;
  } catch (e) {
    return { farmers: [], customers: [], products: [], bills: [], payouts: [], withdrawals: [] };
  }
}

// Helper: Save Data (Dual-layer: JSON File + MongoDB)
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  if (isMongoConnected) {
    persistToMongoDB(data).catch(() => {});
  }
}

// Check if Express & CORS are installed
let expressApp = null;
try {
  const express = require('express');
  const cors = require('cors');

  const app = express();
  app.use(cors());
  app.use(express.json());

  // GET: Health / Status
  app.get('/api/status', (req, res) => {
    res.json({ status: 'healthy', runtime: 'Node.js ' + process.version, database: 'active' });
  });

  // GET: Full Data
  app.get('/api/data', (req, res) => {
    res.json(loadData());
  });

  // GET: Products
  app.get('/api/products', (req, res) => {
    const data = loadData();
    res.json(data.products || []);
  });

  // GET: Farmers
  app.get('/api/farmers', (req, res) => {
    const data = loadData();
    res.json(data.farmers || []);
  });

  // GET: Customers
  app.get('/api/customers', (req, res) => {
    const data = loadData();
    res.json(data.customers || []);
  });

  // GET: Bills
  app.get('/api/bills', (req, res) => {
    const data = loadData();
    res.json(data.bills || []);
  });

  // GET: Payouts
  app.get('/api/payouts', (req, res) => {
    const data = loadData();
    res.json(data.payouts || []);
  });

  // GET: Withdrawals History
  app.get('/api/withdrawals', (req, res) => {
    const data = loadData();
    res.json(data.withdrawals || []);
  });

  // POST: Register User
  app.post('/api/register', (req, res) => {
    const body = req.body || {};
    const role = (body.role || 'CUSTOMER').toUpperCase();
    const name = (body.name || '').trim();
    const mobile = (body.mobile || '').trim();
    const email = (body.email || '').trim();
    const password = (body.password || '').trim();

    if (!name || !mobile) {
      return res.status(400).json({ success: false, message: 'Name and mobile are required' });
    }

    const data = loadData();
    let newUser = {};

    if (role === 'FARMER') {
      newUser = {
        id: `F-${100 + data.farmers.length + 1}`,
        name: name,
        farmName: (body.farmName || `${name}'s Farm`).trim(),
        branch: (body.branch || body.location || 'Gujarat Branch').trim(),
        location: (body.location || 'Gujarat').trim(),
        mobile: mobile,
        email: email,
        password: password,
        cropsListed: body.cropsListed || 'Organic Vegetables & Fruits',
        totalSales: 0,
        bankUpi: (body.upiId || `${name.toLowerCase().replace(/\s+/g, '')}@oksbi`).trim(),
        status: 'Pending', // Awaiting Admin Approval
        rating: 5.0,
        registeredAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      data.farmers.unshift(newUser);
    } else {
      newUser = {
        id: `C-${200 + data.customers.length + 1}`,
        name: name,
        mobile: mobile,
        email: email,
        password: password,
        city: (body.city || body.deliveryAddress || 'Surat, Gujarat').trim(),
        totalOrders: 0,
        totalSpent: 0,
        status: 'Pending', // Awaiting Admin Approval
        registeredAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      data.customers.unshift(newUser);
    }

    saveData(data);
    res.json({
      success: true,
      message: `${role.toLowerCase()} registration submitted! Awaiting Agross Admin approval.`,
      user: newUser
    });
  });

  // POST: Login User (Supports both mobile and email for Farmers and Customers)
  app.post('/api/login', (req, res) => {
    const { identifier, password, role } = req.body || {};
    const cleanId = (identifier || '').trim().toLowerCase();
    const roleUpper = (role || 'CUSTOMER').toUpperCase();

    const data = loadData();
    const targetList = roleUpper === 'FARMER' ? data.farmers : data.customers;

    const matched = targetList.find(u => {
      const mob = String(u.mobile || '').trim().toLowerCase();
      const em = String(u.email || '').trim().toLowerCase();
      const nm = String(u.name || '').trim().toLowerCase();
      return cleanId === mob || (em && cleanId === em) || (cleanId && cleanId === nm);
    });

    if (!matched) {
      return res.json({
        success: false,
        code: 'NOT_FOUND',
        message: `No registered ${roleUpper.toLowerCase()} account found for '${identifier}'. Please check mobile/email or register first.`
      });
    }

    if (password && matched.password && matched.password !== password) {
      return res.json({
        success: false,
        code: 'INVALID_PASSWORD',
        message: 'Incorrect password. Please verify and try again.'
      });
    }

    const status = matched.status || 'Pending';
    if (status === 'Pending') {
      return res.json({
        success: false,
        code: 'PENDING_APPROVAL',
        name: matched.name,
        user: matched,
        message: `Account Pending Approval: Dear ${matched.name}, your ${roleUpper.toLowerCase()} registration is waiting for Agross Admin approval. Please check back after verification.`
      });
    }

    if (status === 'Rejected') {
      return res.json({
        success: false,
        code: 'REJECTED',
        name: matched.name,
        message: 'Your registration was rejected by Admin. Please contact support.'
      });
    }

    res.json({
      success: true,
      code: 'APPROVED',
      name: matched.name,
      status: status,
      user: matched
    });
  });

  // POST: Admin Approve
  app.post('/api/approve', (req, res) => {
    const { id, type } = req.body || {};
    const userType = (type || 'farmer').toLowerCase();
    const data = loadData();

    const targetList = userType === 'farmer' ? data.farmers : data.customers;
    const user = targetList.find(u => u.id === id);

    if (user) {
      user.status = userType === 'farmer' ? 'Verified' : 'Active';
      saveData(data);
      res.json({
        success: true,
        message: `Approved ${user.name}! Account is now active for mobile app login.`
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  });

  // POST: Admin Reject
  app.post('/api/reject', (req, res) => {
    const { id, type } = req.body || {};
    const userType = (type || 'farmer').toLowerCase();
    const data = loadData();

    const targetList = userType === 'farmer' ? data.farmers : data.customers;
    const user = targetList.find(u => u.id === id);

    if (user) {
      user.status = 'Rejected';
      saveData(data);
      res.json({
        success: true,
        message: `Rejected ${user.name} registration.`
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  });

  // DELETE: Farmer (Admin can delete farmer & their products)
  const deleteFarmerHandler = (req, res) => {
    const id = req.params.id || req.body.id;
    const data = loadData();
    const initialLen = data.farmers.length;
    const farmerToDelete = data.farmers.find(f => f.id === id);
    data.farmers = data.farmers.filter(f => f.id !== id);

    if (farmerToDelete) {
      const farmerNameClean = (farmerToDelete.name || '').trim().toLowerCase();
      data.products = data.products.filter(p => {
        const pFarmer = (p.farmer || '').trim().toLowerCase();
        return p.farmerId !== id && pFarmer !== farmerNameClean;
      });
    }

    saveData(data);
    res.json({
      success: true,
      message: `Farmer '${farmerToDelete ? farmerToDelete.name : id}' deleted successfully!`,
      deletedCount: initialLen - data.farmers.length
    });
  };
  app.delete('/api/farmers/:id', deleteFarmerHandler);
  app.post('/api/farmers/delete', deleteFarmerHandler);

  // DELETE: Customer (Admin can delete customer)
  const deleteCustomerHandler = (req, res) => {
    const id = req.params.id || req.body.id;
    const data = loadData();
    const initialLen = data.customers.length;
    const customerToDelete = data.customers.find(c => c.id === id);
    data.customers = data.customers.filter(c => c.id !== id);

    saveData(data);
    res.json({
      success: true,
      message: `Customer '${customerToDelete ? customerToDelete.name : id}' deleted successfully!`,
      deletedCount: initialLen - data.customers.length
    });
  };
  app.delete('/api/customers/:id', deleteCustomerHandler);
  app.post('/api/customers/delete', deleteCustomerHandler);

  // DELETE: Product (Admin or Farmer can delete product)
  const deleteProductHandler = (req, res) => {
    const id = req.params.id || req.body.id;
    const data = loadData();
    const initialLen = data.products.length;
    const prodToDelete = data.products.find(p => p.id === id);
    data.products = data.products.filter(p => p.id !== id);

    saveData(data);
    res.json({
      success: true,
      message: `Product '${prodToDelete ? prodToDelete.name : id}' deleted successfully!`,
      deletedCount: initialLen - data.products.length
    });
  };
  app.delete('/api/products/:id', deleteProductHandler);
  app.post('/api/products/delete', deleteProductHandler);

  // PUT / POST: Update Farmer Profile
  const updateFarmerProfileHandler = (req, res) => {
    const id = req.params.id || req.body.id;
    const body = req.body || {};
    const data = loadData();
    const farmer = data.farmers.find(f => (id && f.id === id) || (body.oldName && f.name.toLowerCase() === body.oldName.toLowerCase()) || (body.mobile && f.mobile === body.mobile) || (body.name && f.name.toLowerCase() === body.name.toLowerCase()));

    if (!farmer) {
      return res.status(404).json({ success: false, message: 'Farmer not found' });
    }

    const oldName = farmer.name;
    if (body.name) farmer.name = body.name.trim();
    if (body.mobile) farmer.mobile = body.mobile.trim();
    if (body.email) farmer.email = body.email.trim();
    if (body.farmName) farmer.farmName = body.farmName.trim();
    if (body.branch) farmer.branch = body.branch.trim();
    if (body.location) farmer.location = body.location.trim();
    if (body.bankUpi) farmer.bankUpi = body.bankUpi.trim();
    if (body.password) farmer.password = body.password.trim();
    if (body.cropsListed) farmer.cropsListed = body.cropsListed.trim();

    // Also update associated products if farmer name or farm name changed
    if (body.name || body.farmName || body.branch || body.email) {
      data.products.forEach(p => {
        if (p.farmerId === farmer.id || p.farmer.toLowerCase() === oldName.toLowerCase()) {
          if (body.name) p.farmer = farmer.name;
          if (body.farmName) p.farmName = farmer.farmName;
          if (body.branch) p.branch = farmer.branch || farmer.location;
          if (body.email) p.farmerEmail = farmer.email;
        }
      });
    }

    saveData(data);
    res.json({
      success: true,
      message: `Farmer profile for '${farmer.name}' updated successfully!`,
      user: farmer
    });
  };
  app.put('/api/farmers/:id', updateFarmerProfileHandler);
  app.post('/api/farmers/update', updateFarmerProfileHandler);

  // PUT / POST: Update Customer Profile
  const updateCustomerProfileHandler = (req, res) => {
    const id = req.params.id || req.body.id;
    const body = req.body || {};
    const data = loadData();
    const customer = data.customers.find(c => (id && c.id === id) || (body.oldName && c.name.toLowerCase() === body.oldName.toLowerCase()) || (body.mobile && c.mobile === body.mobile) || (body.name && c.name.toLowerCase() === body.name.toLowerCase()));

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    if (body.name) customer.name = body.name.trim();
    if (body.mobile) customer.mobile = body.mobile.trim();
    if (body.email) customer.email = body.email.trim();
    if (body.city) customer.city = body.city.trim();
    if (body.deliveryAddress) customer.city = body.deliveryAddress.trim();
    if (body.password) customer.password = body.password.trim();

    saveData(data);
    res.json({
      success: true,
      message: `Customer profile for '${customer.name}' updated successfully!`,
      user: customer
    });
  };
  app.put('/api/customers/:id', updateCustomerProfileHandler);
  app.post('/api/customers/update', updateCustomerProfileHandler);

  // Generic Profile Update Endpoint
  app.post('/api/profile/update', (req, res) => {
    const role = (req.body.role || req.body.type || 'CUSTOMER').toUpperCase();
    if (role === 'FARMER') {
      return updateFarmerProfileHandler(req, res);
    } else {
      return updateCustomerProfileHandler(req, res);
    }
  });

  // POST: Add Produce (Farmer lists produce with Farm Name / Branch)
  app.post('/api/products', (req, res) => {
    const body = req.body || {};
    const name = (body.name || '').trim();
    const category = (body.category || 'Vegetables').trim();
    const price = parseFloat(body.price) || 30;
    const unit = (body.unit || 'kg').trim();
    const stock = parseInt(body.stock) || 50;
    const farmerName = (body.farmer || 'vans gajere').trim();
    const farmerId = body.farmerId || 'F-106';

    const data = loadData();
    const farmerRecord = data.farmers.find(f => f.id === farmerId || f.name.toLowerCase() === farmerName.toLowerCase()) || {};
    const farmName = (body.farmName || farmerRecord.farmName || 'Gajera Organic Farms').trim();
    const branch = (body.branch || farmerRecord.location || 'Surat Branch, Gujarat').trim();
    const location = (body.location || farmerRecord.location || 'Surat, Gujarat').trim();
    const description = (body.description || `Fresh harvest ${name} from ${farmName}`).trim();
    const emoji = body.emoji || (category === 'Vegetables' ? '🥦' : '🍎');

    const image = body.image || null;

    const newProduct = {
      id: `P-${100 + data.products.length + 1}`,
      name: name,
      category: category,
      farmer: farmerName,
      farmerId: farmerId,
      farmName: farmName,
      branch: branch,
      price: price,
      marketAvg: Math.round(price * 1.25),
      unit: unit,
      stock: stock,
      ordersCount: 0,
      location: location,
      emoji: emoji,
      image: image,
      description: description
    };

    data.products.unshift(newProduct);
    saveData(data);

    res.json({
      success: true,
      message: `Product '${name}' added to catalog!`,
      product: newProduct
    });
  });

  // PUT / POST: Update Product Details (Farmer can update produce details)
  const updateProductHandler = (req, res) => {
    const id = req.params.id || req.body.id;
    const body = req.body || {};
    const data = loadData();

    const prod = data.products.find(p => p.id === id);
    if (!prod) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (body.name !== undefined) prod.name = String(body.name).trim();
    if (body.category !== undefined) prod.category = String(body.category).trim();
    if (body.price !== undefined) {
      prod.price = parseFloat(body.price) || prod.price;
      prod.marketAvg = Math.round(prod.price * 1.25);
    }
    if (body.unit !== undefined) prod.unit = String(body.unit).trim();
    if (body.stock !== undefined) prod.stock = parseInt(body.stock) || prod.stock;
    if (body.farmName !== undefined) prod.farmName = String(body.farmName).trim();
    if (body.branch !== undefined) prod.branch = String(body.branch).trim();
    if (body.location !== undefined) prod.location = String(body.location).trim();
    if (body.description !== undefined) prod.description = String(body.description).trim();
    if (body.emoji !== undefined) prod.emoji = body.emoji;
    if (body.image !== undefined) prod.image = body.image;

    saveData(data);
    res.json({
      success: true,
      message: `Product '${prod.name}' updated successfully!`,
      product: prod
    });
  };

  app.put('/api/products/:id', updateProductHandler);
  app.post('/api/products/update', updateProductHandler);

  // POST: Orders / Checkout (Customer)
  app.post('/api/orders', (req, res) => {
    const body = req.body || {};
    const custName = (body.customerName || 'urvish jivani').trim();
    const custMobile = (body.customerMobile || '9878979890').trim();
    const deliveryAddress = (body.deliveryAddress || 'a-303 sarthi complex adajan surat').trim();
    const itemsList = Array.isArray(body.itemsList) ? body.itemsList : [];
    const itemsDesc = (body.items || (itemsList.length > 0 ? itemsList.map(i => `${i.name} (${i.quantity} ${i.unit || 'kg'})`).join(', ') : 'Fresh Harvest Produce')).trim();
    const subtotal = parseFloat(body.subtotal) || (itemsList.reduce((sum, i) => sum + (parseFloat(i.price || 0) * (parseInt(i.quantity || 1))), 0)) || 0;
    const delivery = parseFloat(body.deliveryFee) !== undefined ? parseFloat(body.deliveryFee) : 30;
    const total = subtotal + delivery;
    const method = body.paymentMethod || 'UPI Instant';
    const farmerName = body.farmerName || (itemsList.length > 0 && itemsList[0].farmer ? itemsList[0].farmer : 'Anash Retiwala');

    const data = loadData();
    const billId = `AGR-${Math.floor(1000 + Math.random() * 9000)}`;

    const reqEmail = (body.customerEmail || '').trim().toLowerCase();
    const reqMobile = (body.customerMobile || '').trim();
    const reqName = (body.customerName || '').trim().toLowerCase();

    const custObj = data.customers.find(c => 
      (reqEmail && c.email && c.email.toLowerCase() === reqEmail) ||
      (reqMobile && c.mobile && c.mobile === reqMobile) ||
      (reqName && c.name && c.name.toLowerCase() === reqName)
    ) || {};

    const farmerObj = data.farmers.find(f => f.name.toLowerCase() === farmerName.toLowerCase()) || {};

    const finalCustName = custObj.name || body.customerName || 'Customer';
    const finalCustMobile = custObj.mobile || body.customerMobile || '';
    const finalCustEmail = custObj.email || body.customerEmail || '';

    const farmName = farmerObj.farmName || (itemsList.length > 0 && itemsList[0].farmName ? itemsList[0].farmName : 'AR Organic');
    const farmBranch = farmerObj.branch || farmerObj.location || 'Surat';
    const farmerEmail = farmerObj.email || body.farmerEmail || 'anasretiwala@gmail.com';

    // Farmer payout is calculated strictly from farmer mentioned base price (not retail price)
    const farmerMentionedTotal = itemsList.reduce((sum, i) => {
      const fPrice = parseFloat(i.farmerPrice || (i.price ? Math.round(i.price / 1.05) : 140));
      return sum + (fPrice * (parseInt(i.quantity) || 1));
    }, 0) || Math.round(subtotal / 1.05);

    const newBill = {
      id: billId,
      customer: finalCustName,
      customerEmail: finalCustEmail,
      customerMobile: finalCustMobile,
      deliveryAddress: deliveryAddress,
      items: itemsDesc,
      itemsList: itemsList,
      farmerMentionedPrice: Math.round(farmerMentionedTotal / (itemsList.length > 0 ? (parseInt(itemsList[0].quantity) || 1) : 1)),
      farmerTotal: farmerMentionedTotal,
      subtotal: subtotal,
      delivery: delivery,
      gst: 0,
      total: total,
      method: method,
      status: 'Paid',
      farmerName: farmerName,
      farmerEmail: farmerEmail,
      farmName: farmName,
      farmBranch: farmBranch,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    data.bills.unshift(newBill);

    const payoutId = `PAY-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPayout = {
      id: payoutId,
      farmer: farmerName,
      farmName: farmName,
      bankUpi: farmerObj.bankUpi || body.farmerUpi || 'Anas@oksbi',
      billId: billId,
      grossAmount: subtotal,
      commissionRate: 5,
      netAmount: farmerMentionedTotal, // Farmer gets their exact mentioned price
      status: 'Pending',
      dueDate: new Date().toISOString().substring(0, 10)
    };
    data.payouts.unshift(newPayout);

    // Update customer stats
    const cust = data.customers.find(c => c.name.toLowerCase() === custName.toLowerCase() || c.mobile === custMobile);
    if (cust) {
      cust.totalOrders = (cust.totalOrders || 0) + 1;
      cust.totalSpent = (cust.totalSpent || 0) + total;
    }

    // Update farmer stats using their mentioned price
    if (farmerObj) {
      farmerObj.totalSales = (farmerObj.totalSales || 0) + farmerMentionedTotal;
    }

    // Update product orders count and decrement stock
    if (itemsList.length > 0) {
      itemsList.forEach(item => {
        const prod = data.products.find(p => p.id === item.id || p.name.toLowerCase() === item.name.toLowerCase());
        if (prod) {
          const qty = parseInt(item.quantity) || 1;
          prod.ordersCount = (prod.ordersCount || 0) + qty;
          if (prod.stock >= qty) {
            prod.stock -= qty;
          }
        }
      });
    } else if (itemsDesc) {
      const matchedProd = data.products.find(p => itemsDesc.toLowerCase().includes(p.name.toLowerCase()) || (farmerName && p.farmer.toLowerCase() === farmerName.toLowerCase()));
      if (matchedProd) {
        matchedProd.ordersCount = (matchedProd.ordersCount || 0) + 1;
        if (matchedProd.stock >= 1) matchedProd.stock -= 1;
      }
    }

    saveData(data);
    res.json({
      success: true,
      message: 'Order placed & tax invoice generated',
      bill: newBill,
      payout: newPayout
    });
  });

  // POST: Settle Payouts (Admin)
  app.post('/api/payouts/settle', (req, res) => {
    const { id } = req.body || {};
    const data = loadData();
    let count = 0;

    data.payouts.forEach(p => {
      if (id === 'ALL' || p.id === id) {
        p.status = 'Settled';
        count++;
      }
    });

    saveData(data);
    res.json({ success: true, message: `Settled ${count} farmer payout(s)` });
  });

  // POST: Farmer Withdrawal
  app.post('/api/farmer/withdraw', (req, res) => {
    const body = req.body || {};
    const farmerName = (body.farmer || 'vans gajere').trim();
    const farmerId = body.farmerId || 'F-106';
    const amount = parseFloat(body.amount) || 0;
    const bankUpi = body.bankUpi || 'Gajera@oksbi';

    const data = loadData();
    if (!data.withdrawals) data.withdrawals = [];

    const withdrawalRecord = {
      id: `WTH-${Math.floor(1000 + Math.random() * 9000)}`,
      farmer: farmerName,
      farmerId: farmerId,
      amount: amount,
      bankUpi: bankUpi,
      status: 'Completed',
      date: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    data.withdrawals.unshift(withdrawalRecord);
    saveData(data);

    res.json({
      success: true,
      message: `Withdrawal of ₹${amount} successfully transferred to ${bankUpi}`,
      withdrawal: withdrawalRecord
    });
  });

  expressApp = app;
} catch (e) {
  // Express not yet installed; fallback will use pure Node http module
}

// Start Server (Express or native HTTP)
if (expressApp) {
  expressApp.listen(PORT, () => {
    console.log(`[Node.js Express] Agross Backend API Server running on port ${PORT}`);
  });
} else {
  // Fallback native HTTP server
  const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      return res.end();
    }

    const url = req.url;
    const data = loadData();

    if (req.method === 'GET' && url === '/api/status') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ status: 'healthy', runtime: 'Node.js native http' }));
    }

    if (req.method === 'GET' && url === '/api/data') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(data));
    }

    if (req.method === 'GET' && url === '/api/products') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(data.products || []));
    }

    // POST requests
    if (req.method === 'POST') {
      let bodyStr = '';
      req.on('data', chunk => { bodyStr += chunk; });
      req.on('end', () => {
        let body = {};
        try { body = JSON.parse(bodyStr); } catch (e) {}

        if (url === '/api/login') {
          const cleanId = (body.identifier || '').trim().toLowerCase();
          const roleUpper = (body.role || 'CUSTOMER').toUpperCase();
          const targetList = roleUpper === 'FARMER' ? data.farmers : data.customers;
          const matched = targetList.find(u => {
            const mob = String(u.mobile || '').trim().toLowerCase();
            const em = String(u.email || '').trim().toLowerCase();
            const nm = String(u.name || '').trim().toLowerCase();
            return cleanId === mob || (em && cleanId === em) || (cleanId && cleanId === nm);
          });

          res.writeHead(200, { 'Content-Type': 'application/json' });
          if (!matched) {
            return res.end(JSON.stringify({ success: false, code: 'NOT_FOUND', message: `User not found` }));
          }
          if (matched.status === 'Pending') {
            return res.end(JSON.stringify({ success: false, code: 'PENDING_APPROVAL', name: matched.name, message: `Account Pending Approval: Dear ${matched.name}, your account is waiting for admin verification.` }));
          }
          return res.end(JSON.stringify({ success: true, code: 'APPROVED', name: matched.name, user: matched }));
        }

        if (url === '/api/register') {
          const role = (body.role || 'CUSTOMER').toUpperCase();
          const name = (body.name || '').trim();
          const mobile = (body.mobile || '').trim();
          let newUser = {};
          if (role === 'FARMER') {
            newUser = {
              id: `F-${100 + data.farmers.length + 1}`,
              name: name,
              farmName: (body.farmName || `${name}'s Farm`).trim(),
              location: (body.location || 'Gujarat').trim(),
              mobile: mobile,
              cropsListed: 'Fresh Produce',
              totalSales: 0,
              bankUpi: (body.upiId || 'upi@oksbi').trim(),
              status: 'Pending',
              rating: 5.0,
              registeredAt: 'Just now'
            };
            data.farmers.unshift(newUser);
          } else {
            newUser = {
              id: `C-${200 + data.customers.length + 1}`,
              name: name,
              mobile: mobile,
              city: (body.deliveryAddress || 'Surat, Gujarat').trim(),
              totalOrders: 0,
              totalSpent: 0,
              status: 'Pending',
              registeredAt: 'Just now'
            };
            data.customers.unshift(newUser);
          }
          saveData(data);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, user: newUser }));
        }

        if (url === '/api/approve') {
          const { id, type } = body;
          const targetList = type === 'farmer' ? data.farmers : data.customers;
          const u = targetList.find(x => x.id === id);
          if (u) {
            u.status = type === 'farmer' ? 'Verified' : 'Active';
            saveData(data);
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true }));
        }

        res.writeHead(404);
        res.end();
      });
      return;
    }

    res.writeHead(404);
    res.end();
  });

  server.listen(PORT, () => {
    console.log(`[Node.js Native HTTP] Agross Backend API Server running on port ${PORT}`);
  });
}
