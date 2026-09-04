const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5001/api'
  : 'https://0f0c3bfbf6cdc384-171-61-167-229.serveousercontent.com/api';

// =========================================================================
// COOKIE & SESSION STORAGE ENGINE
// =========================================================================
function setAuthCookie(name, value, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(JSON.stringify(value))}; expires=${expires}; path=/; SameSite=Lax`;
  try {
    sessionStorage.setItem(name, JSON.stringify(value));
  } catch (e) {}
}

function getAuthCookie(name) {
  try {
    const sess = sessionStorage.getItem(name);
    if (sess) return JSON.parse(sess);
  } catch (e) {}
  try {
    const match = document.cookie.split('; ').find(row => row.startsWith(`${encodeURIComponent(name)}=`));
    if (match) return JSON.parse(decodeURIComponent(match.split('=')[1]));
  } catch (e) {}
  return null;
}

function clearAuthCookie(name) {
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  try {
    sessionStorage.removeItem(name);
  } catch (e) {}
}

// Restore saved session from Cookie / SessionStorage on startup
const savedSession = getAuthCookie('agross_auth_session');

// =========================================================================
// PRICE CALCULATION ENGINE (5% Margin added to retail value cleanly)
// =========================================================================
function getMarketPrice(farmerPrice) {
  const base = parseFloat(farmerPrice) || 0;
  return Math.round(base * 1.05);
}

function getFarmerBasePrice(farmerPrice) {
  return parseFloat(farmerPrice) || 0;
}

// =========================================================================
// PRODUCT PRESETS BY CATEGORY (For 1-Tap Crop Selection)
// =========================================================================
const categoryPresets = {
  'Vegetables': [
    { name: 'Fresh Organic Broccoli', emoji: '🥦', unit: 'kg', price: 30, image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=500&auto=format&fit=crop&q=80' },
    { name: 'Farm Fresh Tomatoes', emoji: '🍅', unit: 'kg', price: 35, image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80' },
    { name: 'Crisp Green Capsicum', emoji: '🫑', unit: 'kg', price: 48, image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=500&auto=format&fit=crop&q=80' },
    { name: 'Fresh Spinach (Palak)', emoji: '🥬', unit: 'bunch', price: 20, image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop&q=80' },
    { name: 'Organic Red Onions', emoji: '🧅', unit: 'kg', price: 28, image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&auto=format&fit=crop&q=80' },
    { name: 'Farm Fresh Potatoes', emoji: '🥔', unit: 'kg', price: 25, image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=80' },
    { name: 'Sweet Orange Carrots', emoji: '🥕', unit: 'kg', price: 40, image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?w=500&auto=format&fit=crop&q=80' },
    { name: 'Green Cucumbers', emoji: '🥒', unit: 'kg', price: 30, image: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=500&auto=format&fit=crop&q=80' }
  ],
  'Fruits': [
    { name: 'Shimla Royal Apples', emoji: '🍎', unit: 'kg', price: 140, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=80' },
    { name: 'Ratnagiri Alphonso Mangoes', emoji: '🥭', unit: 'dozen', price: 650, image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&auto=format&fit=crop&q=80' },
    { name: 'Nagpur Sweet Oranges', emoji: '🍊', unit: 'kg', price: 85, image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=500&auto=format&fit=crop&q=80' },
    { name: 'Robusta Fresh Bananas', emoji: '🍌', unit: 'dozen', price: 45, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=80' },
    { name: 'Organic Red Papaya', emoji: '🍈', unit: 'kg', price: 35, image: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=500&auto=format&fit=crop&q=80' },
    { name: 'Black Seedless Grapes', emoji: '🍇', unit: 'kg', price: 110, image: 'https://images.unsplash.com/photo-1596363505729-4190a9506133?w=500&auto=format&fit=crop&q=80' },
    { name: 'Mahabaleshwar Strawberries', emoji: '🍓', unit: 'box', price: 90, image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500&auto=format&fit=crop&q=80' }
  ],
  'Grains & Pulses': [
    { name: 'Sharbati Whole Wheat', emoji: '🌾', unit: 'kg', price: 42, image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=80' },
    { name: 'Dehradun Basmati Rice', emoji: '🍚', unit: 'kg', price: 95, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80' },
    { name: 'Unpolished Moong Dal', emoji: '🌱', unit: 'kg', price: 120, image: 'https://images.unsplash.com/photo-1585994192701-f1a505c8574a?w=500&auto=format&fit=crop&q=80' },
    { name: 'Organic Pearl Millet (Bajra)', emoji: '🌾', unit: 'kg', price: 38, image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=80' },
    { name: 'Desi Toor Dal', emoji: '🥣', unit: 'kg', price: 140, image: 'https://images.unsplash.com/photo-1585994192701-f1a505c8574a?w=500&auto=format&fit=crop&q=80' }
  ],
  'Organic Herbs': [
    { name: 'Fresh Green Coriander (Dhania)', emoji: '🌿', unit: 'bunch', price: 15, image: 'https://images.unsplash.com/photo-1589135233689-d5626244ec5f?w=500&auto=format&fit=crop&q=80' },
    { name: 'Aromatic Mint Leaves (Pudina)', emoji: '🍃', unit: 'bunch', price: 15, image: 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=500&auto=format&fit=crop&q=80' },
    { name: 'Organic Holy Tulsi', emoji: '🌱', unit: 'bunch', price: 25, image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop&q=80' },
    { name: 'Fresh Curry Leaves', emoji: '🌿', unit: 'bunch', price: 10, image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=80' },
    { name: 'Organic Garlic Cloves', emoji: '🧄', unit: 'kg', price: 160, image: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=500&auto=format&fit=crop&q=80' }
  ]
};

// =========================================================================
// AGROSS STATE MANAGEMENT (Clean Initial State - Zero Dummy Data)
// =========================================================================
const state = {
  currentScreen: 'dashboard', // 'dashboard' | 'market' | 'cart' | 'payment' | 'bill' | 'bills_history' | 'wallet' | 'account' | 'login' | 'register' | 'add_crop'
  currentRole: savedSession ? savedSession.role : 'CUSTOMER', // 'CUSTOMER' | 'FARMER'
  loggedInUser: savedSession ? savedSession.name : null,
  loggedInUserObj: savedSession ? savedSession.userObj : null,
  
  // Cart State (Starts 100% clean and empty)
  cart: [],
  
  // Farmer Wallet & Withdrawal State (Starts at ZERO)
  farmerWithdrawnAmount: 0,
  farmerPendingWithdrawal: 0,
  
  // Add / Edit Crop Form State
  editingProductId: null,
  addCropCategory: 'Vegetables',
  addCropName: '',
  addCropEmoji: '🥦',
  addCropImage: null,
  addCropPrice: '',
  addCropUnit: 'kg',
  addCropStock: '100',
  addCropDesc: 'Naturally ripened farm-fresh produce harvested this morning.',
  
  // Checkout & Payment State
  selectedPaymentMethod: 'UPI Instant',
  deliveryAddress: {
    name: savedSession ? savedSession.name : 'Customer',
    mobile: savedSession && savedSession.userObj ? savedSession.userObj.mobile : '9876543210',
    address: 'Ring Road',
    city: 'Surat, Gujarat',
    pincode: '395007'
  },
  activeBill: null,
  customerBillsList: [],
  
  // Marketplace Filters
  selectedCategory: '1',
  marketCategory: '1',
  marketSort: 'featured',
  marketSearch: '',
  searchQuery: '',
  
  // Auth
  loginRole: 'CUSTOMER',
  registerRole: 'FARMER',
  pendingApprovalNotice: null,
  prefilledIdentifier: ''
};

// Live Produce Data
let products = [];

// Fallback Community Produce Data (For Customer Market & Farmer Community Benchmark)
const fallbackProducts = [
  {
    id: 'P-103',
    name: 'AR Organic Apple',
    category: 'Fruits',
    farmer: 'Anash Retiwala',
    farmerId: 'F-102',
    farmName: 'AR Organic',
    branch: 'Surat',
    location: 'Surat',
    price: 140,
    marketAvg: 175,
    unit: 'kg',
    stock: 98,
    ordersCount: 2,
    emoji: '🍎',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=80',
    description: 'Naturally ripened farm-fresh produce harvested this morning.'
  },
  {
    id: 'p1',
    name: 'Organic Farm Tomatoes',
    category: 'Vegetables',
    farmer: 'Ramesh Patil',
    farmerId: 'F-101',
    farmName: 'Patil Organic Acres',
    branch: 'Nashik Branch, Maharashtra',
    location: 'Nashik, MH',
    price: 35,
    marketAvg: 45,
    unit: 'kg',
    stock: 150,
    ordersCount: 42,
    emoji: '🍅',
    description: 'Naturally ripened, zero chemicals farm tomatoes.'
  },
  {
    id: 'p2',
    name: 'Shimla Royal Apples',
    category: 'Fruits',
    farmer: 'Suresh Sharma',
    farmerId: 'F-102',
    farmName: 'Valley Apple Orchards',
    branch: 'Shimla Branch, HP',
    location: 'Shimla, HP',
    price: 140,
    marketAvg: 170,
    unit: 'kg',
    stock: 80,
    ordersCount: 28,
    emoji: '🍎',
    description: 'High-altitude crisp, sweet mountain apples.'
  },
  {
    id: 'p3',
    name: 'Crisp Green Capsicum',
    category: 'Vegetables',
    farmer: 'Baburao Shinde',
    farmerId: 'F-103',
    farmName: 'Shinde Agro Farm',
    branch: 'Pune Branch, MH',
    location: 'Pune, MH',
    price: 48,
    marketAvg: 60,
    unit: 'kg',
    stock: 60,
    ordersCount: 19,
    emoji: '🫑',
    description: 'Crunchy bell peppers harvested this morning.'
  },
  {
    id: 'p4',
    name: 'Nagpur Sweet Oranges',
    category: 'Fruits',
    farmer: 'Devendra Joshi',
    farmerId: 'F-104',
    farmName: 'Joshi Citrus Orchards',
    branch: 'Nagpur Branch, MH',
    location: 'Nagpur, MH',
    price: 85,
    marketAvg: 100,
    unit: 'kg',
    stock: 200,
    ordersCount: 56,
    emoji: '🍊',
    description: 'Juicy, Vitamin-C packed authentic Nagpur santra.'
  },
  {
    id: 'p5',
    name: 'Fresh Spinach (Palak)',
    category: 'Vegetables',
    farmer: 'Kishore Kumar',
    farmerId: 'F-105',
    farmName: 'Kishore Farmstead',
    branch: 'Surat Branch, GJ',
    location: 'Surat, GJ',
    price: 20,
    marketAvg: 30,
    unit: 'bunch',
    stock: 90,
    ordersCount: 33,
    emoji: '🥬',
    description: 'Tender palak leaves, zero synthetic chemicals.'
  },
  {
    id: 'p6',
    name: 'Alphonso Mangoes (Ratnagiri)',
    category: 'Fruits',
    farmer: 'Ganesh Sawant',
    farmerId: 'F-107',
    farmName: 'Konkan Mango Grove',
    branch: 'Ratnagiri Branch, MH',
    location: 'Ratnagiri, MH',
    price: 650,
    marketAvg: 800,
    unit: 'dozen',
    stock: 40,
    ordersCount: 88,
    emoji: '🥭',
    description: 'Authentic GI-tagged Ratnagiri Hapus mangoes.'
  }
];

async function fetchProducts() {
  try {
    const res = await fetch(`${API_BASE}/products`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        products = data;
      } else {
        products = fallbackProducts;
      }
      if (state.currentScreen === 'dashboard') {
        renderDashboard();
      } else if (state.currentScreen === 'market') {
        renderMarket();
      } else if (state.currentScreen === 'wallet') {
        renderWallet();
      }
    }
  } catch (err) {
    if (products.length === 0) products = fallbackProducts;
  }
}
fetchProducts();
setInterval(fetchProducts, 4000);

async function fetchPayouts() {
  try {
    const res = await fetch(`${API_BASE}/payouts`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        payouts = data;
        if (state.currentScreen === 'wallet') {
          renderWallet();
        }
      }
    }
  } catch (err) {}
}
fetchPayouts();
setInterval(fetchPayouts, 2500);

let withdrawals = [];

async function fetchWithdrawals() {
  try {
    const res = await fetch(`${API_BASE}/withdrawals`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        withdrawals = data;
        if (state.currentScreen === 'wallet') {
          renderWallet();
        }
      }
    }
  } catch (err) {}
}
fetchWithdrawals();
setInterval(fetchWithdrawals, 2500);

function getDynamicCategories(productList) {
  const list = Array.isArray(productList) ? productList : (products.length > 0 ? products : fallbackProducts);
  
  const vegCount = list.filter(p => p.category && p.category.toLowerCase().includes('veg')).length;
  const fruitCount = list.filter(p => p.category && p.category.toLowerCase().includes('fruit')).length;
  const grainCount = list.filter(p => p.category && (p.category.toLowerCase().includes('grain') || p.category.toLowerCase().includes('pulse'))).length;
  const herbCount = list.filter(p => p.category && (p.category.toLowerCase().includes('herb') || p.category.toLowerCase().includes('spice'))).length;

  return [
    { id: '1', name: 'All', emoji: '🌱', count: list.length },
    { id: '2', name: 'Vegetables', emoji: '🥦', count: vegCount },
    { id: '3', name: 'Fruits', emoji: '🍎', count: fruitCount },
    { id: '4', name: 'Grains & Pulses', emoji: '🌾', count: grainCount },
    { id: '5', name: 'Organic Herbs', emoji: '🌿', count: herbCount }
  ];
}

const categories = getDynamicCategories();

// =========================================================================
// CART HELPER FUNCTIONS
// =========================================================================
function getCartCount() {
  return state.cart.reduce((sum, item) => sum + item.quantity, 0);
}

function getCartSubtotal() {
  return Math.round(state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0));
}

function getCartDeliveryFee() {
  const subtotal = getCartSubtotal();
  if (subtotal === 0) return 0;
  return subtotal >= 500 ? 0 : 30;
}

function getCartTotal() {
  return getCartSubtotal() + getCartDeliveryFee();
}

function addToCart(product, qty = 1) {
  const marketVal = getMarketPrice(product.price);
  const existing = state.cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += qty;
  } else {
    state.cart.push({
      id: product.id,
      name: product.name,
      category: product.category || 'Vegetables',
      farmerPrice: product.price,
      price: marketVal,
      unit: product.unit || 'kg',
      emoji: product.emoji || '🥦',
      farmer: product.farmer || 'Farmer',
      farmName: product.farmName || 'Organic Farm',
      branch: product.branch || product.location || 'Surat, Gujarat',
      quantity: qty
    });
  }
  renderTopBar();
  updateBottomNav();
  showToast(`🛒 Added ${product.name} to Basket!`);
}

function updateCartQty(productId, delta) {
  const item = state.cart.find(i => i.id === productId);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      removeFromCart(productId);
      return;
    }
  }
  renderTopBar();
  updateBottomNav();
  if (state.currentScreen === 'cart') renderCart();
  if (state.currentScreen === 'market') renderMarket();
}

function removeFromCart(productId) {
  state.cart = state.cart.filter(i => i.id !== productId);
  renderTopBar();
  updateBottomNav();
  if (state.currentScreen === 'cart') renderCart();
  if (state.currentScreen === 'market') renderMarket();
  showToast('Removed item from basket');
}

function clearCart() {
  state.cart = [];
  renderTopBar();
  updateBottomNav();
}

// Show Toast Message
function showToast(message) {
  const toast = document.getElementById('toast-message');
  toast.innerText = message;
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 2500);
}

// =========================================================================
// TOP BAR COMPONENT
// =========================================================================
function renderTopBar() {
  const container = document.getElementById('topbar-actions-container');
  const cartCount = getCartCount();
  
  if (!state.loggedInUser) {
    container.innerHTML = `
      <button class="btn-topbar-login" id="topbar-btn-login">
        <span>🔑</span> Login
      </button>
      <button class="btn-topbar-register" id="topbar-btn-register">
        <span>✨</span> Register
      </button>
      ${state.currentRole !== 'FARMER' ? `
        <button class="btn-cart-box" id="topbar-btn-cart" title="Shopping Basket">
          <span>🛍️</span>
          ${cartCount > 0 ? `<span class="cart-badge-count">${cartCount}</span>` : ''}
        </button>
      ` : ''}
    `;

    document.getElementById('topbar-btn-login').addEventListener('click', () => {
      navigateTo('login', state.currentRole);
    });

    document.getElementById('topbar-btn-register').addEventListener('click', () => {
      navigateTo('register', state.currentRole);
    });
  } else {
    container.innerHTML = `
      <div class="user-badge-pill" id="topbar-btn-user" title="Open Account">
        <span class="role-avatar">${state.currentRole === 'FARMER' ? '👨‍🌾' : '🛒'}</span>
        <span>${state.loggedInUser}</span>
      </div>
      ${state.currentRole !== 'FARMER' ? `
        <button class="btn-cart-box" id="topbar-btn-cart" title="Shopping Basket">
          <span>🛍️</span>
          ${cartCount > 0 ? `<span class="cart-badge-count">${cartCount}</span>` : ''}
        </button>
      ` : `
        <button class="btn-topbar-register" id="topbar-btn-add-crop-quick" style="background: #F59E0B; color: #111827; border-color: #D97706;">
          <span>🌱</span> + Crop
        </button>
      `}
    `;

    document.getElementById('topbar-btn-user').addEventListener('click', () => {
      navigateTo('account');
    });

    if (document.getElementById('topbar-btn-add-crop-quick')) {
      document.getElementById('topbar-btn-add-crop-quick').addEventListener('click', () => {
        navigateTo('add_crop');
      });
    }
  }

  if (document.getElementById('topbar-btn-cart')) {
    document.getElementById('topbar-btn-cart').addEventListener('click', () => {
      navigateTo('cart');
    });
  }
}

// =========================================================================
// 1. HOME / DASHBOARD SCREEN (Shows all products from other farmers too)
// =========================================================================
function renderDashboard() {
  const screen = document.getElementById('screen-container');
  const isFarmerRole = state.currentRole === 'FARMER';
  const allList = products.length > 0 ? products : fallbackProducts;

  const filtered = allList.filter(p => {
    const matchesCat = state.selectedCategory === '1' || (p.category && (
      (state.selectedCategory === '2' && p.category.toLowerCase().includes('veg')) ||
      (state.selectedCategory === '3' && p.category.toLowerCase().includes('fruit')) ||
      (state.selectedCategory === '4' && p.category.toLowerCase().includes('grain')) ||
      (state.selectedCategory === '5' && p.category.toLowerCase().includes('herb'))
    ));
    const matchesQuery = p.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                         (p.farmer && p.farmer.toLowerCase().includes(state.searchQuery.toLowerCase())) ||
                         (p.farmName && p.farmName.toLowerCase().includes(state.searchQuery.toLowerCase())) ||
                         (p.location && p.location.toLowerCase().includes(state.searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  screen.innerHTML = `
    <!-- Search Bar -->
    <div class="dash-search-strip">
      <div class="search-input-wrapper">
        <span class="search-icon">🔍</span>
        <input type="text" id="dash-search-input" placeholder="Search crops, farms, farmers across network..." value="${state.searchQuery}">
        <button class="search-filter-btn" id="btn-jump-market" title="Open Market">🌾</button>
      </div>
    </div>

    <!-- Farmer vs Customer Hero Banner -->
    ${isFarmerRole ? `
      <!-- Farmer Community & Market Benchmark Hero -->
      <div class="promo-hero-card" style="background: linear-gradient(135deg, #065F46 0%, #047857 100%);">
        <span class="promo-tag" style="background: #F59E0B; color: #111827;">🌾 FARMER COMMUNITY NETWORK</span>
        <h2>Live Network Harvest<br>& Market Rates</h2>
        <p>Browse live listings from fellow farmers across India. Compare produce demand and pricing benchmark.</p>
        <div style="display: flex; gap: 8px; margin-top: 10px;">
          <button class="btn-shop-fresh" id="btn-farmer-hero-add" style="background: #F59E0B; color: #111827; font-weight: 800;">+ List New Crop</button>
          <button class="btn-shop-fresh" id="btn-farmer-hero-market" style="background: rgba(255,255,255,0.2); color: white;">My Catalog →</button>
        </div>
        <div class="promo-art">🚜🌾</div>
      </div>
    ` : `
      <!-- Customer Promo Hero Card -->
      <div class="promo-hero-card">
        <span class="promo-tag">FARM FRESH</span>
        <h2>Direct From Farm<br>To Your Kitchen</h2>
        <p>Farmers get fair prices. You get daily morning fresh harvest direct to your door.</p>
        <button class="btn-shop-fresh" id="btn-hero-explore">🌾 Browse All Produce</button>
        <div class="promo-art">🚜🌱</div>
      </div>
    `}

    <!-- Quick Callout Banner -->
    <div class="farmer-callout-banner" id="btn-farmer-portal" style="${isFarmerRole ? 'background: linear-gradient(135deg, #10B981 0%, #059669 100%);' : ''}">
      <div class="farmer-callout-info">
        <div class="callout-icon">${isFarmerRole ? '🌱' : '👨‍🌾'}</div>
        <div class="callout-text">
          <h4 style="${isFarmerRole ? 'color: #FFFFFF;' : ''}">${isFarmerRole ? 'Quick Harvest Action' : 'Are You a Farmer?'}</h4>
          <p style="${isFarmerRole ? 'color: #D1FAE5;' : ''}">${isFarmerRole ? 'Add your fresh crops to sell directly to retail customers.' : 'Sell vegetables & fruits directly. Daily bank payouts.'}</p>
        </div>
      </div>
      <button class="btn-sell-now" style="${isFarmerRole ? 'background: #F59E0B; color: #111827;' : ''}">${isFarmerRole ? '+ Add Crop' : 'Sell Now'}</button>
    </div>

    <!-- Categories Strip -->
    <div class="section-header-row">
      <h3>Categories</h3>
      <span class="view-all-link" id="btn-cat-view-market">${isFarmerRole ? 'My Catalog →' : 'Open Market →'}</span>
    </div>

    <div class="categories-chips-scroll">
      ${getDynamicCategories(allList).map(c => `
        <button class="category-chip ${state.selectedCategory === c.id ? 'active' : ''}" data-id="${c.id}">
          <span>${c.emoji}</span>
          <span>${c.name} (${c.count})</span>
        </button>
      `).join('')}
    </div>

    <!-- Section Title: Shows All Products from all farmers -->
    <div class="section-header-row">
      <h3>${isFarmerRole ? 'Network Farm Listings 🥬' : "Today's Fresh Harvest 🥬"}</h3>
      <span class="view-all-link" id="btn-view-all-market">All Network (${allList.length})</span>
    </div>

    <!-- Responsive Produce Grid -->
    <div class="produce-grid">
      ${filtered.length > 0 ? filtered.map(p => {
        const inCart = state.cart.find(i => i.id === p.id);
        const marketVal = getMarketPrice(p.price);
        return `
        <div class="product-card" data-id="${p.id}">
          <div class="product-media-box">
            ${p.image ? `
              <img src="${p.image}" alt="${p.name}" class="product-real-img" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px 12px 0 0;">
            ` : `
              <span>${p.emoji || '🥦'}</span>
            `}
            <span class="organic-badge">🌱 Farm Fresh</span>
          </div>
          <span class="produce-cat-tag">${p.category || 'Vegetables'}</span>
          <h4 class="produce-name">${p.name}</h4>
          <p class="farmer-provenance">👨‍🌾 ${p.farmer || 'Farmer'} • 🏡 ${p.farmName || 'Organic Farm'}</p>
          
          <div style="font-size: 10px; color: #475569; margin: 2px 0 6px; display: flex; justify-content: space-between;">
            <span>📦 Stock: <strong>${p.stock || 50} ${p.unit || 'kg'}</strong></span>
            <span style="color: #059669; font-weight: 700;">🛒 ${p.ordersCount || 0} Sold</span>
          </div>

          <!-- Price Row (Clean Display without 5% text) -->
          <div class="price-row">
            <div>
              <div style="display: flex; align-items: baseline; gap: 2px;">
                <span class="current-price">₹${marketVal}</span>
                <span class="price-unit">/${p.unit || 'kg'}</span>
              </div>
            </div>

            ${!isFarmerRole ? `
              <button class="btn-add-cart ${inCart ? 'added' : ''}" data-id="${p.id}" title="Add to Cart">
                ${inCart ? `✓ ${inCart.quantity}` : '+'}
              </button>
            ` : `
              <span style="font-size: 10px; background: #ECFDF5; color: #065F46; padding: 3px 6px; border-radius: 6px; font-weight: 800;">
                Live
              </span>
            `}
          </div>
        </div>
      `}).join('') : `
        <div style="grid-column: span 2; text-align: center; padding: 30px 10px; color: #64748B;">
          <p style="font-size: 28px;">🥦</p>
          <p style="font-size: 13px; font-weight: 600; margin-top: 6px;">No produce found for "${state.searchQuery}"</p>
          <button class="btn-shop-fresh" id="btn-clear-search" style="margin-top: 10px;">Clear Search</button>
        </div>
      `}
    </div>
  `;

  // Attach Dashboard Event Handlers
  const searchInput = document.getElementById('dash-search-input');
  searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderDashboard();
    document.getElementById('dash-search-input').focus();
  });

  const jumpMarket = document.getElementById('btn-jump-market');
  if (jumpMarket) jumpMarket.addEventListener('click', () => navigateTo('market'));

  const heroExplore = document.getElementById('btn-hero-explore');
  if (heroExplore) heroExplore.addEventListener('click', () => navigateTo('market'));

  const viewAllMarket = document.getElementById('btn-view-all-market');
  if (viewAllMarket) viewAllMarket.addEventListener('click', () => navigateTo('market'));

  const catViewMarket = document.getElementById('btn-cat-view-market');
  if (catViewMarket) catViewMarket.addEventListener('click', () => navigateTo('market'));

  if (document.getElementById('btn-farmer-hero-add')) {
    document.getElementById('btn-farmer-hero-add').addEventListener('click', () => navigateTo('add_crop'));
  }

  if (document.getElementById('btn-farmer-hero-market')) {
    document.getElementById('btn-farmer-hero-market').addEventListener('click', () => navigateTo('market'));
  }

  const clearBtn = document.getElementById('btn-clear-search');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      state.searchQuery = '';
      renderDashboard();
    });
  }

  document.getElementById('btn-farmer-portal').addEventListener('click', () => {
    if (state.currentRole === 'FARMER') {
      navigateTo('add_crop');
    } else {
      navigateTo('register', 'FARMER');
    }
  });

  document.querySelectorAll('.category-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      state.selectedCategory = btn.dataset.id;
      renderDashboard();
    });
  });

  document.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pId = btn.dataset.id;
      const prod = allList.find(p => p.id === pId);
      if (prod) {
        addToCart(prod, 1);
        renderDashboard();
      }
    });
  });
}

// =========================================================================
// 2. MARKETPLACE SCREEN
// - In Farmer Mode: Shows ONLY logged-in farmer's products (or EMPTY page if none added)
// - In Customer Mode: Shows ALL products from all farmers
// =========================================================================
function renderMarket() {
  const screen = document.getElementById('screen-container');
  const isFarmerMode = state.currentRole === 'FARMER';
  const allList = products.length > 0 ? products : fallbackProducts;
  const user = state.loggedInUserObj || {
    name: state.loggedInUser,
    farmName: 'My Farm',
    id: null
  };

  const currentFarmerName = (state.loggedInUser || '').trim().toLowerCase();

  // If Farmer Mode: Filter strictly to crops added by THIS farmer
  let displayedList = [];
  if (isFarmerMode) {
    if (currentFarmerName) {
      displayedList = products.filter(p => {
        const pFarmer = String(p.farmer || '').trim().toLowerCase();
        const pFarmerId = String(p.farmerId || '').trim();
        return pFarmer === currentFarmerName || (user.id && pFarmerId === user.id);
      });
    } else {
      displayedList = [];
    }
  } else {
    displayedList = allList;
  }

  // Filter by category and search
  let filtered = displayedList.filter(p => {
    const matchesCat = state.marketCategory === '1' || (p.category && (
      (state.marketCategory === '2' && p.category.toLowerCase().includes('veg')) ||
      (state.marketCategory === '3' && p.category.toLowerCase().includes('fruit')) ||
      (state.marketCategory === '4' && (p.category.toLowerCase().includes('grain') || p.category.toLowerCase().includes('pulse'))) ||
      (state.marketCategory === '5' && (p.category.toLowerCase().includes('herb') || p.category.toLowerCase().includes('spice')))
    ));
    const matchesQuery = p.name.toLowerCase().includes(state.marketSearch.toLowerCase()) ||
                         (p.category && p.category.toLowerCase().includes(state.marketSearch.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  // Sort
  if (state.marketSort === 'price_asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (state.marketSort === 'price_desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (state.marketSort === 'rating') {
    filtered.sort((a, b) => (b.ordersCount || 0) - (a.ordersCount || 0));
  }

  const cartCount = getCartCount();
  const cartTotal = getCartTotal();
  const dynamicMarketCats = getDynamicCategories(displayedList);

  screen.innerHTML = `
    <div class="market-screen">
      <!-- Header Banner -->
      <div class="market-header-banner" style="${isFarmerMode ? 'background: linear-gradient(135deg, #B45309 0%, #D97706 100%);' : ''}">
        <h2>${isFarmerMode ? '👨‍🌾 My Farm Produce Catalog' : '🌾 Farm Direct Market'}</h2>
        <p>${isFarmerMode ? 'Showing only your actively listed farm crops.' : '100% verified farmer harvest direct to your home.'}</p>
      </div>

      <!-- Search Input -->
      <div class="dash-search-strip" style="padding: 0; margin-bottom: 12px;">
        <div class="search-input-wrapper">
          <span class="search-icon">🔍</span>
          <input type="text" id="market-search-input" placeholder="${isFarmerMode ? 'Search your listed crops...' : 'Search crops, farms, farmers...'}" value="${state.marketSearch}">
          ${state.marketSearch ? `<button class="search-filter-btn" id="btn-market-clear-search">✕</button>` : ''}
        </div>
      </div>

      <!-- Category Filter Chips (Dynamic Counts for Both Panels) -->
      <div class="categories-chips-scroll" style="margin-bottom: 12px;">
        ${dynamicMarketCats.map(c => `
          <button class="category-chip ${state.marketCategory === c.id ? 'active' : ''}" data-cat-id="${c.id}">
            <span>${c.emoji}</span>
            <span>${c.name} (${c.count})</span>
          </button>
        `).join('')}
      </div>

      <!-- Toolbar: Count & Actions -->
      <div class="market-toolbar">
        <span class="market-results-count">
          ${isFarmerMode ? `My Listed Crops (${filtered.length})` : `Showing ${filtered.length} Farm Items`}
        </span>

        ${isFarmerMode ? `
          <button class="btn-sell-now" id="btn-market-add-crop" style="background: #F59E0B; color: #111827; font-size: 11px; padding: 6px 12px; font-weight: 800;">
            + Add Crop
          </button>
        ` : `
          <select id="market-sort-select" class="market-sort-select">
            <option value="featured" ${state.marketSort === 'featured' ? 'selected' : ''}>🌟 Featured</option>
            <option value="price_asc" ${state.marketSort === 'price_asc' ? 'selected' : ''}>💰 Price: Low to High</option>
            <option value="price_desc" ${state.marketSort === 'price_desc' ? 'selected' : ''}>💎 Price: High to Low</option>
            <option value="rating" ${state.marketSort === 'rating' ? 'selected' : ''}>🔥 Most Popular</option>
          </select>
        `}
      </div>

      <!-- Empty State if Farmer has 0 listed products -->
      ${filtered.length === 0 ? `
        <div class="empty-cart-view" style="margin-top: 20px;">
          <div class="empty-cart-icon">${isFarmerMode ? '🌱👨‍🌾' : '🥦'}</div>
          <h3 style="font-size: 16px; font-weight: 800; color: #0F172A; margin-bottom: 6px;">
            ${isFarmerMode ? 'No Crops Listed in Your Catalog' : 'No Produce Found'}
          </h3>
          <p style="font-size: 12px; color: #64748B; margin-bottom: 18px; line-height: 1.4;">
            ${isFarmerMode ? 'Your farm catalog is currently empty. List your fresh harvest (vegetables, fruits, grains) to start receiving direct retail customer orders.' : `No produce matched "${state.marketSearch}". Try searching for another item or resetting filters.`}
          </p>
          ${isFarmerMode ? `
            <button class="btn-auth-submit farmer-btn" id="btn-empty-add-crop" style="padding: 12px 20px; font-size: 13px;">
              ➕ List Your First Crop Now
            </button>
          ` : `
            <button class="btn-shop-fresh" id="btn-reset-market-filters">Reset All Filters</button>
          `}
        </div>
      ` : `
        <!-- Responsive Produce Grid with Clean Price Display -->
        <div class="produce-grid">
          ${filtered.map(p => {
            const inCart = state.cart.find(i => i.id === p.id);
            const marketVal = getMarketPrice(p.price);
            return `
              <div class="product-card" data-id="${p.id}">
                <div class="product-media-box">
                  ${p.image ? `
                    <img src="${p.image}" alt="${p.name}" class="product-real-img" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px 12px 0 0;">
                  ` : `
                    <span>${p.emoji || '🥦'}</span>
                  `}
                  <span class="organic-badge">${isFarmerMode ? 'My Harvest' : '🌱 Farm Fresh'}</span>
                </div>
                <span class="produce-cat-tag">${p.category || 'Vegetables'}</span>
                <h4 class="produce-name">${p.name}</h4>
                <p class="farmer-provenance">${isFarmerMode ? `🏡 ${p.farmName || user.farmName || 'My Farm'}` : `👨‍🌾 ${p.farmer || 'Farmer'} • 🏡 ${p.farmName || 'Organic Farm'}`}</p>
                
                <div style="font-size: 10.5px; color: #475569; margin: 3px 0 6px; display: flex; justify-content: space-between;">
                  <span>📦 Stock: <strong>${p.stock || 50} ${p.unit || 'kg'}</strong></span>
                  <span style="color: #059669; font-weight: 700;">🛒 ${p.ordersCount || 0} Orders</span>
                </div>

                <div class="price-row">
                  <div>
                    <div style="display: flex; align-items: baseline; gap: 2px;">
                      <span class="current-price">₹${isFarmerMode ? p.price : marketVal}</span>
                      <span class="price-unit">/${p.unit || 'kg'}</span>
                    </div>
                  </div>

                  ${!isFarmerMode ? `
                    ${inCart ? `
                      <div class="cart-item-stepper">
                        <button class="btn-stepper btn-market-minus" data-id="${p.id}">-</button>
                        <span class="stepper-val">${inCart.quantity}</span>
                        <button class="btn-stepper btn-market-plus" data-id="${p.id}">+</button>
                      </div>
                    ` : `
                      <button class="btn-add-cart btn-market-add" data-id="${p.id}" title="Add to Basket">+ Add</button>
                    `}
                  ` : `
                    <div style="display: flex; gap: 6px;">
                      <button class="btn-edit-crop" data-id="${p.id}" title="Edit Crop Details" style="color: #0F766E; font-size: 11.5px; background: #CCFBF1; padding: 5px 9px; border-radius: 8px; font-weight: 800; border: 1px solid #99F6E4; cursor: pointer;">
                        ✏️ Edit
                      </button>
                      <button class="btn-del-crop" data-id="${p.id}" title="Delete Crop" style="color: #EF4444; font-size: 11.5px; background: #FEE2E2; padding: 5px 8px; border-radius: 8px; border: 1px solid #FECACA; cursor: pointer;">
                        🗑️
                      </button>
                    </div>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}

      <!-- Floating Cart Action Bar (Customer Mode only) -->
      ${!isFarmerMode && cartCount > 0 ? `
        <div style="position: sticky; bottom: 10px; z-index: 10; margin-top: 16px;">
          <button class="btn-auth-submit customer-btn" id="btn-floating-cart" style="display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; box-shadow: 0 8px 24px rgba(5, 150, 105, 0.4);">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="background: rgba(255,255,255,0.25); padding: 3px 8px; border-radius: 8px; font-size: 12px; font-weight: 900;">${cartCount} items</span>
              <span>View Basket</span>
            </div>
            <span style="font-size: 15px; font-weight: 900;">₹${cartTotal} →</span>
          </button>
        </div>
      ` : ''}
    </div>
  `;

  // Attach Market Handlers
  const searchInput = document.getElementById('market-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.marketSearch = e.target.value;
      renderMarket();
      const el = document.getElementById('market-search-input');
      if (el) el.focus();
    });
  }

  const clearSearch = document.getElementById('btn-market-clear-search');
  if (clearSearch) {
    clearSearch.addEventListener('click', () => {
      state.marketSearch = '';
      renderMarket();
    });
  }

  document.querySelectorAll('[data-cat-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.marketCategory = btn.dataset.catId;
      renderMarket();
    });
  });

  const sortSelect = document.getElementById('market-sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.marketSort = e.target.value;
      renderMarket();
    });
  }

  const resetFilters = document.getElementById('btn-reset-market-filters');
  if (resetFilters) {
    resetFilters.addEventListener('click', () => {
      state.marketCategory = '1';
      state.marketSearch = '';
      state.marketSort = 'featured';
      renderMarket();
    });
  }

  if (document.getElementById('btn-market-add-crop')) {
    document.getElementById('btn-market-add-crop').addEventListener('click', () => {
      state.editingProductId = null;
      state.addCropName = '';
      state.addCropImage = null;
      state.addCropPrice = '';
      state.addCropStock = '100';
      navigateTo('add_crop');
    });
  }

  if (document.getElementById('btn-empty-add-crop')) {
    document.getElementById('btn-empty-add-crop').addEventListener('click', () => {
      state.editingProductId = null;
      state.addCropName = '';
      state.addCropImage = null;
      state.addCropPrice = '';
      state.addCropStock = '100';
      navigateTo('add_crop');
    });
  }

  document.querySelectorAll('.btn-edit-crop').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pId = btn.dataset.id;
      const prod = allList.find(p => p.id === pId) || products.find(p => p.id === pId);
      if (prod) {
        state.editingProductId = prod.id;
        state.addCropName = prod.name;
        state.addCropCategory = prod.category || 'Vegetables';
        state.addCropPrice = prod.price;
        state.addCropUnit = prod.unit || 'kg';
        state.addCropStock = prod.stock || 50;
        state.addCropEmoji = prod.emoji || '🥦';
        state.addCropImage = prod.image || null;
        state.addCropDesc = prod.description || `Fresh harvest ${prod.name}`;
        navigateTo('add_crop');
      }
    });
  });

  document.querySelectorAll('.btn-market-add').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pId = btn.dataset.id;
      const prod = allList.find(p => p.id === pId);
      if (prod) {
        addToCart(prod, 1);
        renderMarket();
      }
    });
  });

  document.querySelectorAll('.btn-market-plus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      updateCartQty(btn.dataset.id, 1);
    });
  });

  document.querySelectorAll('.btn-market-minus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      updateCartQty(btn.dataset.id, -1);
    });
  });

  document.querySelectorAll('.btn-del-crop').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pId = btn.dataset.id;
      if (confirm('Are you sure you want to remove this crop listing?')) {
        products = products.filter(p => p.id !== pId);
        showToast('Crop listing removed');
        renderMarket();
      }
    });
  });

  const floatingCart = document.getElementById('btn-floating-cart');
  if (floatingCart) {
    floatingCart.addEventListener('click', () => {
      navigateTo('cart');
    });
  }
}

// =========================================================================
// 3. IN-APP ADD & EDIT CROP SCREEN (Photo Upload, Presets & Live Details Update)
// =========================================================================
function renderAddCrop() {
  const screen = document.getElementById('screen-container');
  const isEditing = !!state.editingProductId;
  const user = state.loggedInUserObj || {
    name: state.loggedInUser || 'Farmer',
    farmName: 'Gajera Organic Farms',
    location: 'Surat Branch, Gujarat'
  };

  const selectedCat = state.addCropCategory || 'Vegetables';
  const currentPresets = categoryPresets[selectedCat] || [];

  screen.innerHTML = `
    <div class="cart-screen">
      <!-- Screen Header -->
      <div class="screen-back-header">
        <button class="btn-screen-back" id="btn-addcrop-back">←</button>
        <h2 class="screen-title-text">${isEditing ? '✏️ Edit Crop Details' : '🌱 List New Farm Crop'}</h2>
      </div>

      <form id="app-add-crop-form">
        <!-- 1. Product Image / Photo Upload Section -->
        <div class="cart-section-card" style="margin-bottom: 12px;">
          <div class="cart-section-title" style="display: flex; justify-content: space-between; align-items: center;">
            <span>1. Product Photo / Image</span>
            <span style="font-size: 10.5px; color: #059669; font-weight: 800;">📸 Upload or Pick</span>
          </div>

          <div style="margin-top: 8px; text-align: center;">
            <div id="crop-image-preview-box" style="width: 100%; height: 140px; border-radius: 14px; background: #F8FAFC; border: 2px dashed #CBD5E1; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; overflow: hidden; margin-bottom: 10px;">
              ${state.addCropImage ? `
                <img src="${state.addCropImage}" alt="Crop Photo" style="width: 100%; height: 100%; object-fit: cover;">
                <div style="position: absolute; bottom: 6px; right: 6px; background: rgba(0,0,0,0.65); color: white; font-size: 10px; padding: 3px 8px; border-radius: 6px; font-weight: 700;">✓ Photo Attached</div>
              ` : `
                <span style="font-size: 40px; margin-bottom: 4px;">${state.addCropEmoji || '🥦'}</span>
                <span style="font-size: 11px; color: #64748B; font-weight: 600;">No photo attached • Tap button to upload photo</span>
              `}
            </div>

            <input type="file" id="input-crop-image-file" accept="image/*" style="display: none;">

            <div style="display: flex; gap: 8px; justify-content: center;">
              <button type="button" class="btn-auth-submit customer-btn" id="btn-trigger-upload-image" style="font-size: 11.5px; padding: 8px 14px; width: auto; background: #059669;">
                📷 ${state.addCropImage ? 'Change Photo' : 'Upload From Device / Camera'}
              </button>
              ${state.addCropImage ? `
                <button type="button" class="btn-auth-submit" id="btn-remove-crop-image" style="font-size: 11.5px; padding: 8px 12px; width: auto; background: #FEE2E2; color: #EF4444; border: 1px solid #FECACA;">
                  ✕ Remove
                </button>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- 2. Category Selection -->
        <div class="cart-section-card" style="margin-bottom: 12px;">
          <div class="cart-section-title">
            <span>2. Crop Category</span>
          </div>
          <div class="categories-chips-scroll" style="margin-top: 4px; padding: 2px 0 6px;">
            <button type="button" class="category-chip ${selectedCat === 'Vegetables' ? 'active' : ''}" data-cat-choice="Vegetables">
              <span>🥦</span> Vegetables
            </button>
            <button type="button" class="category-chip ${selectedCat === 'Fruits' ? 'active' : ''}" data-cat-choice="Fruits">
              <span>🍎</span> Fruits
            </button>
            <button type="button" class="category-chip ${selectedCat === 'Grains & Pulses' ? 'active' : ''}" data-cat-choice="Grains & Pulses">
              <span>🌾</span> Grains & Pulses
            </button>
            <button type="button" class="category-chip ${selectedCat === 'Organic Herbs' ? 'active' : ''}" data-cat-choice="Organic Herbs">
              <span>🌿</span> Organic Herbs
            </button>
          </div>
        </div>

        <!-- 3. Quick Product Name Presets & Custom Name -->
        <div class="cart-section-card" style="margin-bottom: 12px;">
          <div class="cart-section-title" style="display: flex; justify-content: space-between; align-items: center;">
            <span>3. Crop / Produce Name</span>
            <span style="font-size: 10.5px; color: #059669; font-weight: 800;">1-Tap Quick Pick</span>
          </div>

          <p style="font-size: 11px; color: #64748B; margin: 4px 0 8px;">Select commonly grown crops or type custom name:</p>

          <!-- Quick Presets Carousel -->
          <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px;">
            ${currentPresets.map(preset => `
              <button type="button" class="btn-crop-preset-chip ${state.addCropName === preset.name ? 'selected-preset' : ''}" data-preset-name="${preset.name}" data-preset-emoji="${preset.emoji}" data-preset-unit="${preset.unit}" data-preset-price="${preset.price}" data-preset-image="${preset.image || ''}" style="background: ${state.addCropName === preset.name ? '#FEF3C7' : '#F1F5F9'}; border: 1px solid ${state.addCropName === preset.name ? '#D97706' : '#CBD5E1'}; border-radius: 8px; padding: 5px 8px; font-size: 11px; font-weight: 700; color: #1E293B; cursor: pointer;">
                ${preset.emoji} ${preset.name}
              </button>
            `).join('')}
          </div>

          <div class="form-group" style="margin: 0;">
            <label style="font-size: 11px; margin-bottom: 3px;">Crop / Product Name</label>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span id="preview-crop-emoji" style="font-size: 24px; padding: 4px;">${state.addCropEmoji || '🥦'}</span>
              <input type="text" id="add-crop-name" class="form-input" style="padding: 9px 12px; font-size: 13px;" placeholder="e.g. Fresh Organic Broccoli" value="${state.addCropName}" required>
            </div>
          </div>
        </div>

        <!-- 4. Price, Unit & Stock Quantity -->
        <div class="cart-section-card" style="margin-bottom: 12px;">
          <div class="cart-section-title">
            <span>4. Pricing & Harvest Stock</span>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
            <div class="form-group" style="margin: 0;">
              <label style="font-size: 11px; margin-bottom: 3px;">Farmer Base Price (₹)</label>
              <input type="number" id="add-crop-price" class="form-input" style="padding: 8px 10px; font-size: 13px;" placeholder="e.g. 30" value="${state.addCropPrice}" required min="1">
            </div>

            <div class="form-group" style="margin: 0;">
              <label style="font-size: 11px; margin-bottom: 3px;">Unit</label>
              <select id="add-crop-unit" class="form-input" style="padding: 8px 10px; font-size: 13px; background: white;">
                <option value="kg" ${state.addCropUnit === 'kg' ? 'selected' : ''}>per kg</option>
                <option value="dozen" ${state.addCropUnit === 'dozen' ? 'selected' : ''}>per dozen</option>
                <option value="bunch" ${state.addCropUnit === 'bunch' ? 'selected' : ''}>per bunch</option>
                <option value="box" ${state.addCropUnit === 'box' ? 'selected' : ''}>per box</option>
                <option value="quintal" ${state.addCropUnit === 'quintal' ? 'selected' : ''}>per quintal</option>
              </select>
            </div>
          </div>

          <div class="form-group" style="margin: 0;">
            <label style="font-size: 11px; margin-bottom: 3px;">Available Harvest Stock</label>
            <input type="number" id="add-crop-stock" class="form-input" style="padding: 8px 10px; font-size: 13px;" placeholder="e.g. 200" value="${state.addCropStock}" required min="1">
          </div>
        </div>

        <!-- 5. Farm Provenance & Description -->
        <div class="cart-section-card" style="margin-bottom: 16px;">
          <div class="cart-section-title">
            <span>5. Farm Provenance & Notes</span>
          </div>

          <div class="form-group" style="margin-bottom: 8px;">
            <label style="font-size: 11px; margin-bottom: 3px;">Farm Name</label>
            <input type="text" id="add-crop-farm" class="form-input" style="padding: 8px 10px; font-size: 12px;" value="${user.farmName || 'Gajera Organic Farms'}" required>
          </div>

          <div class="form-group" style="margin-bottom: 8px;">
            <label style="font-size: 11px; margin-bottom: 3px;">Farm Location & Branch</label>
            <input type="text" id="add-crop-loc" class="form-input" style="padding: 8px 10px; font-size: 12px;" value="${user.branch || user.location || 'Surat Branch, Gujarat'}" required>
          </div>

          <div class="form-group" style="margin: 0;">
            <label style="font-size: 11px; margin-bottom: 3px;">Produce Description</label>
            <input type="text" id="add-crop-desc" class="form-input" style="padding: 8px 10px; font-size: 12px;" value="${state.addCropDesc}" required>
          </div>
        </div>

        <!-- Submit Button -->
        <button type="submit" class="btn-auth-submit farmer-btn" id="btn-submit-publish-crop" style="padding: 14px; font-size: 14px; font-weight: 900; margin-bottom: 20px;">
          ${isEditing ? '💾 Save & Update Crop Details' : '🌾 Publish Crop to My Catalog'}
        </button>
      </form>
    </div>
  `;

  // Attach Add Crop Screen Handlers
  document.getElementById('btn-addcrop-back').addEventListener('click', () => {
    state.editingProductId = null;
    navigateTo('market');
  });

  // Image Upload File Handler
  const fileInput = document.getElementById('input-crop-image-file');
  const triggerBtn = document.getElementById('btn-trigger-upload-image');
  if (triggerBtn && fileInput) {
    triggerBtn.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          state.addCropImage = loadEvent.target.result;
          renderAddCrop();
        };
        reader.readAsDataURL(file);
      }
    });
  }

  const removeImgBtn = document.getElementById('btn-remove-crop-image');
  if (removeImgBtn) {
    removeImgBtn.addEventListener('click', () => {
      state.addCropImage = null;
      renderAddCrop();
    });
  }

  // Category choice buttons
  document.querySelectorAll('[data-cat-choice]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.addCropCategory = btn.dataset.catChoice;
      const presets = categoryPresets[state.addCropCategory];
      if (presets && presets.length > 0) {
        state.addCropName = presets[0].name;
        state.addCropEmoji = presets[0].emoji;
        state.addCropUnit = presets[0].unit;
        state.addCropPrice = presets[0].price;
        if (!state.addCropImage || state.addCropImage.startsWith('http')) {
          state.addCropImage = presets[0].image || null;
        }
      }
      renderAddCrop();
    });
  });

  // Quick preset crop buttons
  document.querySelectorAll('.btn-crop-preset-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      state.addCropName = chip.dataset.presetName;
      state.addCropEmoji = chip.dataset.presetEmoji;
      state.addCropUnit = chip.dataset.presetUnit;
      state.addCropPrice = chip.dataset.presetPrice;
      if (chip.dataset.presetImage && (!state.addCropImage || state.addCropImage.startsWith('http'))) {
        state.addCropImage = chip.dataset.presetImage;
      }
      renderAddCrop();
    });
  });

  // Form inputs change tracking
  const nameInput = document.getElementById('add-crop-name');
  if (nameInput) {
    nameInput.addEventListener('input', (e) => {
      state.addCropName = e.target.value;
    });
  }

  const priceInput = document.getElementById('add-crop-price');
  if (priceInput) {
    priceInput.addEventListener('input', (e) => {
      state.addCropPrice = e.target.value;
    });
  }

  const unitInput = document.getElementById('add-crop-unit');
  if (unitInput) {
    unitInput.addEventListener('change', (e) => {
      state.addCropUnit = e.target.value;
    });
  }

  const stockInput = document.getElementById('add-crop-stock');
  if (stockInput) {
    stockInput.addEventListener('input', (e) => {
      state.addCropStock = e.target.value;
    });
  }

  const descInput = document.getElementById('add-crop-desc');
  if (descInput) {
    descInput.addEventListener('input', (e) => {
      state.addCropDesc = e.target.value;
    });
  }

  // Submit Handler (Supports Create & Update)
  document.getElementById('app-add-crop-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('add-crop-name').value.trim();
    const category = state.addCropCategory;
    const price = parseFloat(document.getElementById('add-crop-price').value) || 30;
    const unit = document.getElementById('add-crop-unit').value;
    const stock = parseInt(document.getElementById('add-crop-stock').value) || 50;
    const farmName = document.getElementById('add-crop-farm').value.trim();
    const location = document.getElementById('add-crop-loc').value.trim();
    const desc = document.getElementById('add-crop-desc').value.trim();
    const emoji = state.addCropEmoji || (category === 'Vegetables' ? '🥦' : (category === 'Fruits' ? '🍎' : '🌾'));
    const image = state.addCropImage || null;

    if (isEditing) {
      // UPDATE EXISTING PRODUCT
      const editId = state.editingProductId;
      const targetProd = products.find(p => p.id === editId);
      if (targetProd) {
        targetProd.name = name;
        targetProd.category = category;
        targetProd.price = price;
        targetProd.unit = unit;
        targetProd.stock = stock;
        targetProd.farmName = farmName;
        targetProd.branch = location;
        targetProd.location = location;
        targetProd.description = desc;
        targetProd.emoji = emoji;
        targetProd.image = image;
      }

      try {
        await fetch(`${API_BASE}/products/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editId,
            name,
            category,
            price,
            unit,
            stock,
            farmName,
            branch: location,
            location,
            description: desc,
            emoji,
            image
          })
        });
      } catch (err) {}

      state.editingProductId = null;
      showToast(`✅ '${name}' updated successfully!`);
      navigateTo('market');
      await fetchProducts();
    } else {
      // CREATE NEW PRODUCT
      const newProd = {
        id: `P-${Date.now() % 10000}`,
        name: name,
        category: category,
        price: price,
        unit: unit,
        stock: stock,
        description: desc,
        farmer: state.loggedInUser || 'vans gajere',
        farmerId: (user && user.id) ? user.id : 'F-106',
        farmName: farmName,
        branch: location,
        location: location,
        emoji: emoji,
        image: image,
        ordersCount: 0
      };

      // Add locally to products list
      products.unshift(newProd);

      try {
        await fetch(`${API_BASE}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProd)
        });
      } catch (err) {}

      showToast(`🌱 '${name}' published to your farm catalog!`);
      navigateTo('market');
      await fetchProducts();
    }
  });
}

// =========================================================================
// 4. DEDICATED CART / BASKET SCREEN
// =========================================================================
function renderCart() {
  const screen = document.getElementById('screen-container');
  const cartCount = getCartCount();
  const subtotal = getCartSubtotal();
  const delivery = getCartDeliveryFee();
  const total = getCartTotal();

  if (cartCount === 0) {
    screen.innerHTML = `
      <div class="cart-screen">
        <div class="screen-back-header">
          <button class="btn-screen-back" id="btn-cart-back">←</button>
          <h2 class="screen-title-text">🛒 Your Basket</h2>
        </div>

        <div class="empty-cart-view">
          <div class="empty-cart-icon">🛍️</div>
          <h3 style="font-size: 16px; font-weight: 800; color: #0F172A; margin-bottom: 6px;">Your Basket is Empty</h3>
          <p style="font-size: 12px; color: #64748B; margin-bottom: 18px;">Add pesticide-free vegetables & fruits directly from local farmers.</p>
          <button class="btn-auth-submit customer-btn" id="btn-cart-explore-market">
            🌾 Explore Fresh Produce Market
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-cart-back').addEventListener('click', () => navigateTo('market'));
    document.getElementById('btn-cart-explore-market').addEventListener('click', () => navigateTo('market'));
    return;
  }

  const userObj = state.loggedInUserObj || {};
  const custDefaultName = state.deliveryAddress.name || userObj.name || state.loggedInUser || 'Customer';
  const custDefaultPhone = state.deliveryAddress.mobile || userObj.mobile || '';
  const custDefaultCity = state.deliveryAddress.city || userObj.city || 'Surat, Gujarat';
  const custDefaultAddr = state.deliveryAddress.address || userObj.deliveryAddress || userObj.city || 'Surat, Gujarat';

  screen.innerHTML = `
    <div class="cart-screen">
      <!-- Screen Header -->
      <div class="screen-back-header">
        <button class="btn-screen-back" id="btn-cart-back">←</button>
        <h2 class="screen-title-text">🛒 Your Basket (${cartCount} items)</h2>
      </div>

      <!-- Items List -->
      <div class="cart-items-list">
        ${state.cart.map(item => `
          <div class="cart-item-card">
            <div class="cart-item-img">${item.emoji || '🥦'}</div>
            <div class="cart-item-info">
              <div class="cart-item-name">${item.name}</div>
              <div class="cart-item-farmer">👨‍🌾 ${item.farmer} • 📍 ${item.branch || 'Surat'}</div>
              <div class="cart-item-price">₹${item.price} <span style="font-size: 10px; color: #64748B; font-weight: normal;">/${item.unit || 'kg'}</span></div>
            </div>
            <div class="cart-item-stepper">
              <button class="btn-stepper btn-cart-minus" data-id="${item.id}">-</button>
              <span class="stepper-val">${item.quantity}</span>
              <button class="btn-stepper btn-cart-plus" data-id="${item.id}">+</button>
            </div>
            <button class="btn-cart-remove btn-cart-del" data-id="${item.id}" title="Remove">✕</button>
          </div>
        `).join('')}
      </div>

      <!-- Delivery Address Card -->
      <div class="cart-section-card">
        <div class="cart-section-title">
          <span>📍 Delivery Address</span>
          <span style="font-size: 11px; color: #059669; font-weight: 700; margin-left: auto;">Express Direct Farm Delivery</span>
        </div>
        
        <div class="form-group" style="margin-bottom: 8px;">
          <label style="font-size: 11px; margin-bottom: 2px;">Customer Full Name</label>
          <input type="text" id="cart-cust-name" class="form-input" style="padding: 8px 10px; font-size: 12px;" value="${custDefaultName}" placeholder="Your Full Name">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
          <div class="form-group" style="margin: 0;">
            <label style="font-size: 11px; margin-bottom: 2px;">Mobile (Order SMS)</label>
            <input type="tel" id="cart-cust-phone" class="form-input" style="padding: 8px 10px; font-size: 12px;" value="${custDefaultPhone}" placeholder="10-digit mobile">
          </div>
          <div class="form-group" style="margin: 0;">
            <label style="font-size: 11px; margin-bottom: 2px;">City / Area</label>
            <input type="text" id="cart-cust-city" class="form-input" style="padding: 8px 10px; font-size: 12px;" value="${custDefaultCity}" placeholder="City">
          </div>
        </div>

        <div class="form-group" style="margin: 0;">
          <label style="font-size: 11px; margin-bottom: 2px;">Street Address / Landmark</label>
          <input type="text" id="cart-cust-addr" class="form-input" style="padding: 8px 10px; font-size: 12px;" value="${custDefaultAddr}" placeholder="House/Flat No, Landmark">
        </div>
      </div>

      <!-- Bill Breakdown Card -->
      <div class="cart-section-card">
        <div class="cart-section-title">
          <span>🧾 Order Bill Summary</span>
        </div>

        <div class="cart-bill-row">
          <span>Produce Subtotal (${cartCount} items)</span>
          <strong>₹${subtotal}</strong>
        </div>

        <div class="cart-bill-row">
          <span>Farm Packaging & Direct Transit</span>
          <span>${delivery === 0 ? '<strong style="color: #10B981;">FREE (Order > ₹500)</strong>' : `₹${delivery}`}</span>
        </div>

        <div class="cart-bill-row">
          <span>Agricultural GST / Tax</span>
          <span style="color: #059669; font-weight: 700;">₹0 (Tax Exempt)</span>
        </div>

        <div class="cart-bill-row total-row">
          <span>Grand Total Payable</span>
          <span style="color: #065F46; font-size: 16px;">₹${total}</span>
        </div>
      </div>

      <!-- Proceed Button -->
      <button class="btn-auth-submit customer-btn" id="btn-cart-proceed-payment" style="padding: 14px; font-size: 14px; font-weight: 900; box-shadow: 0 6px 20px rgba(5, 150, 105, 0.35);">
        Proceed to Payment (₹${total}) →
      </button>
    </div>
  `;

  // Attach Cart Handlers
  document.getElementById('btn-cart-back').addEventListener('click', () => navigateTo('market'));

  document.querySelectorAll('.btn-cart-plus').forEach(btn => {
    btn.addEventListener('click', () => updateCartQty(btn.dataset.id, 1));
  });

  document.querySelectorAll('.btn-cart-minus').forEach(btn => {
    btn.addEventListener('click', () => updateCartQty(btn.dataset.id, -1));
  });

  document.querySelectorAll('.btn-cart-del').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
  });

  document.getElementById('btn-cart-proceed-payment').addEventListener('click', () => {
    const userObj = state.loggedInUserObj || {};
    state.deliveryAddress.name = document.getElementById('cart-cust-name').value.trim() || userObj.name || state.loggedInUser || 'Customer';
    state.deliveryAddress.mobile = document.getElementById('cart-cust-phone').value.trim() || userObj.mobile || '9876543210';
    state.deliveryAddress.city = document.getElementById('cart-cust-city').value.trim() || userObj.city || 'Surat, Gujarat';
    state.deliveryAddress.address = document.getElementById('cart-cust-addr').value.trim() || userObj.deliveryAddress || 'Surat, Gujarat';
    state.deliveryAddress.email = userObj.email || '';

    navigateTo('payment');
  });
}

// =========================================================================
// 5. PAYMENT OPTIONS SCREEN
// =========================================================================
function renderPayment() {
  const screen = document.getElementById('screen-container');
  const cartCount = getCartCount();
  const total = getCartTotal();

  if (cartCount === 0 && !state.activeBill) {
    navigateTo('cart');
    return;
  }

  screen.innerHTML = `
    <div class="payment-screen">
      <!-- Screen Header -->
      <div class="screen-back-header">
        <button class="btn-screen-back" id="btn-payment-back">←</button>
        <h2 class="screen-title-text">💳 Select Payment Method</h2>
      </div>

      <!-- Amount Banner -->
      <div style="background: #ECFDF5; border: 1.5px solid #A7F3D0; border-radius: 16px; padding: 14px 16px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 11px; color: #065F46; font-weight: 700; text-transform: uppercase;">Total Payable Amount</div>
          <div style="font-size: 22px; font-weight: 900; color: #065F46;">₹${total}</div>
        </div>
        <span style="font-size: 11px; background: #10B981; color: white; padding: 4px 10px; border-radius: 10px; font-weight: 800;">${cartCount} Produce Items</span>
      </div>

      <!-- Payment Methods Grid -->
      <div class="payment-options-grid">
        <!-- 1. UPI Instant -->
        <div class="payment-method-card ${state.selectedPaymentMethod === 'UPI Instant' ? 'selected' : ''}" data-pay-method="UPI Instant">
          <div class="payment-icon-box">⚡</div>
          <div class="payment-details-box">
            <div class="payment-method-title">UPI Instant (Recommended)</div>
            <div class="payment-method-desc">Google Pay, PhonePe, Paytm, BHIM & QR Code</div>
          </div>
          <div class="payment-radio-dot"></div>
        </div>

        <!-- 2. Credit / Debit Card -->
        <div class="payment-method-card ${state.selectedPaymentMethod === 'Credit / Debit Card' ? 'selected' : ''}" data-pay-method="Credit / Debit Card">
          <div class="payment-icon-box">💳</div>
          <div class="payment-details-box">
            <div class="payment-method-title">Credit / Debit Card</div>
            <div class="payment-method-desc">Visa, Mastercard, RuPay & Maestro</div>
          </div>
          <div class="payment-radio-dot"></div>
        </div>

        <!-- 3. Net Banking -->
        <div class="payment-method-card ${state.selectedPaymentMethod === 'Net Banking' ? 'selected' : ''}" data-pay-method="Net Banking">
          <div class="payment-icon-box">🏛️</div>
          <div class="payment-details-box">
            <div class="payment-method-title">Net Banking</div>
            <div class="payment-method-desc">SBI, HDFC, ICICI, Axis, PNB & 50+ Banks</div>
          </div>
          <div class="payment-radio-dot"></div>
        </div>

        <!-- 4. Cash on Delivery -->
        <div class="payment-method-card ${state.selectedPaymentMethod === 'Cash on Delivery' ? 'selected' : ''}" data-pay-method="Cash on Delivery">
          <div class="payment-icon-box">💵</div>
          <div class="payment-details-box">
            <div class="payment-method-title">Cash on Delivery (COD)</div>
            <div class="payment-method-desc">Pay cash or UPI on doorstep farm delivery</div>
          </div>
          <div class="payment-radio-dot"></div>
        </div>
      </div>

      <!-- Dynamic Method Sub-Form -->
      <div class="payment-details-container" id="payment-subform">
        ${getPaymentSubformHtml(state.selectedPaymentMethod)}
      </div>

      <!-- Security Strip -->
      <div class="security-assurance-strip">
        <span>🔒 256-Bit SSL Encrypted Direct Farmer Settlement</span>
      </div>

      <!-- Payment Execution Button -->
      <button class="btn-auth-submit customer-btn" id="btn-execute-payment" style="padding: 14px; font-size: 14px; font-weight: 900;">
        Pay ₹${total} & Generate Tax Bill
      </button>
    </div>
  `;

  // Attach Payment Handlers
  document.getElementById('btn-payment-back').addEventListener('click', () => navigateTo('cart'));

  document.querySelectorAll('.payment-method-card').forEach(card => {
    card.addEventListener('click', () => {
      state.selectedPaymentMethod = card.dataset.payMethod;
      renderPayment();
    });
  });

  const payBtn = document.getElementById('btn-execute-payment');
  payBtn.addEventListener('click', async () => {
    executePaymentProcess();
  });
}

function getPaymentSubformHtml(method) {
  if (method === 'UPI Instant') {
    return `
      <div style="font-size: 12px; font-weight: 700; color: #1E293B; margin-bottom: 8px;">Enter UPI ID or Select App</div>
      <div style="display: flex; gap: 8px; margin-bottom: 10px;">
        <span style="background: #F1F5F9; border: 1px solid #CBD5E1; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 700;">🟢 Google Pay</span>
        <span style="background: #F1F5F9; border: 1px solid #CBD5E1; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 700;">🟣 PhonePe</span>
        <span style="background: #F1F5F9; border: 1px solid #CBD5E1; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 700;">🔵 Paytm</span>
      </div>
      <input type="text" id="input-upi-id" class="form-input" placeholder="e.g. ${state.deliveryAddress.name.toLowerCase().replace(/\s+/g, '')}@okaxis" value="${state.deliveryAddress.name.toLowerCase().replace(/\s+/g, '')}@oksbi">
    `;
  } else if (method === 'Credit / Debit Card') {
    return `
      <div style="font-size: 12px; font-weight: 700; color: #1E293B; margin-bottom: 8px;">Card Details</div>
      <input type="text" class="form-input" placeholder="Card Number (e.g. 4532 •••• •••• 8892)" value="4532 8920 1142 8892" style="margin-bottom: 8px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
        <input type="text" class="form-input" placeholder="MM/YY" value="08/29">
        <input type="password" class="form-input" placeholder="CVV" value="892" maxlength="3">
      </div>
    `;
  } else if (method === 'Net Banking') {
    return `
      <div style="font-size: 12px; font-weight: 700; color: #1E293B; margin-bottom: 8px;">Select Bank</div>
      <select class="form-input" style="background: white;">
        <option value="SBI">State Bank of India (SBI)</option>
        <option value="HDFC">HDFC Bank</option>
        <option value="ICICI">ICICI Bank</option>
        <option value="AXIS">Axis Bank</option>
        <option value="KOTAK">Kotak Mahindra Bank</option>
      </select>
    `;
  } else {
    return `
      <div style="font-size: 11.5px; color: #475569; line-height: 1.4;">
        💵 Pay in cash or via UPI QR code directly to the farm delivery partner upon doorstep arrival.
      </div>
    `;
  }
}

// Payment Execution Simulator & API Saver
async function executePaymentProcess() {
  const payBtn = document.getElementById('btn-execute-payment');
  payBtn.disabled = true;
  payBtn.innerText = '🔄 Processing Direct Payment...';
  payBtn.style.background = '#0F766E';

  const subtotal = getCartSubtotal();
  const delivery = getCartDeliveryFee();
  const total = getCartTotal();

  const itemsList = state.cart.map(i => ({
    id: i.id,
    name: i.name,
    category: i.category,
    price: i.price,
    farmerPrice: i.farmerPrice || i.price,
    quantity: i.quantity,
    unit: i.unit,
    farmer: i.farmer,
    farmName: i.farmName,
    lineTotal: i.price * i.quantity
  }));

  const primaryFarmer = itemsList.length > 0 ? itemsList[0].farmer : 'vans gajere';

  const payload = {
    customerName: state.deliveryAddress.name,
    customerMobile: state.deliveryAddress.mobile,
    customerEmail: state.deliveryAddress.email || state.loggedInUserObj?.email || '',
    deliveryAddress: `${state.deliveryAddress.address}, ${state.deliveryAddress.city}`,
    itemsList: itemsList,
    items: itemsList.map(i => `${i.name} (${i.quantity} ${i.unit})`).join(', '),
    subtotal: subtotal,
    deliveryFee: delivery,
    paymentMethod: state.selectedPaymentMethod,
    farmerName: primaryFarmer
  };

  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    
    payBtn.innerText = '✅ Payment Verified & Bill Generated!';
    payBtn.style.background = '#10B981';

    setTimeout(() => {
      state.activeBill = data.bill || {
        id: `AGR-${Math.floor(1000 + Math.random() * 9000)}`,
        customer: state.deliveryAddress.name,
        customerMobile: state.deliveryAddress.mobile,
        deliveryAddress: `${state.deliveryAddress.address}, ${state.deliveryAddress.city}`,
        itemsList: itemsList,
        subtotal: subtotal,
        delivery: delivery,
        gst: 0,
        total: total,
        method: state.selectedPaymentMethod,
        status: 'Paid',
        farmerName: primaryFarmer,
        farmName: itemsList[0]?.farmName || 'Organic Farm',
        farmBranch: itemsList[0]?.branch || 'Surat, Gujarat',
        date: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };

      state.customerBillsList.unshift(state.activeBill);
      clearCart();
      fetchProducts();
      navigateTo('bill');
      showToast('🎉 Order Placed & Tax Bill Generated!');
    }, 900);

  } catch (err) {
    payBtn.innerText = '✅ Order Confirmed (Offline Mode)';
    setTimeout(() => {
      state.activeBill = {
        id: `AGR-${Math.floor(1000 + Math.random() * 9000)}`,
        customer: state.deliveryAddress.name,
        customerMobile: state.deliveryAddress.mobile,
        deliveryAddress: `${state.deliveryAddress.address}, ${state.deliveryAddress.city}`,
        itemsList: itemsList,
        subtotal: subtotal,
        delivery: delivery,
        gst: 0,
        total: total,
        method: state.selectedPaymentMethod,
        status: 'Paid',
        farmerName: primaryFarmer,
        farmName: itemsList[0]?.farmName || 'Organic Farm',
        farmBranch: itemsList[0]?.branch || 'Surat, Gujarat',
        date: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };

      state.customerBillsList.unshift(state.activeBill);
      clearCart();
      navigateTo('bill');
      showToast('🎉 Tax Bill Generated!');
    }, 900);
  }
}

// =========================================================================
// 6. OFFICIAL GST TAX INVOICE & BILL SCREEN
// =========================================================================
function renderBillInvoice() {
  const screen = document.getElementById('screen-container');
  const bill = state.activeBill;

  if (!bill) {
    navigateTo('market');
    return;
  }

  const items = Array.isArray(bill.itemsList) && bill.itemsList.length > 0 
    ? bill.itemsList 
    : [{ name: bill.items || 'Fresh Harvest Produce', price: bill.subtotal, quantity: 1, unit: 'pkg', lineTotal: bill.subtotal }];

  screen.innerHTML = `
    <div class="bill-invoice-screen">
      <!-- Back / Nav Header -->
      <div class="screen-back-header">
        <button class="btn-screen-back" id="btn-bill-back-market">←</button>
        <h2 class="screen-title-text">🧾 Agross Tax Invoice</h2>
      </div>

      <!-- Tax Invoice Document Container -->
      <div class="tax-invoice-card" id="printable-tax-invoice">
        <!-- Invoice Header -->
        <div class="invoice-header-row">
          <div>
            <div class="invoice-brand-title">🌱 AGROSS COMMERCE</div>
            <div style="font-size: 10.5px; color: #64748B; margin-top: 2px;">Direct Farm-to-Fork Platform</div>
          </div>
          <span class="invoice-badge-paid">✓ ${bill.status || 'PAID'}</span>
        </div>

        <!-- Meta Grid -->
        <div class="invoice-meta-grid">
          <div>
            <span style="color: #64748B;">Invoice No:</span><br>
            <strong>#${bill.id}</strong>
          </div>
          <div>
            <span style="color: #64748B;">Date & Time:</span><br>
            <strong>${bill.date || 'Just now'}</strong>
          </div>
          <div>
            <span style="color: #64748B;">Payment Mode:</span><br>
            <strong style="color: #059669;">${bill.method || 'UPI Instant'}</strong>
          </div>
          <div>
            <span style="color: #64748B;">GST Status:</span><br>
            <strong>Exempt (Sec 10)</strong>
          </div>
        </div>

        <!-- Parties Box: Customer & Farmer -->
        <div class="invoice-party-box">
          <div class="invoice-party-title">👤 Billed To (Customer)</div>
          <div><strong>${bill.customer || 'urvish  jivani'}</strong> • ${bill.customerMobile || '9878979890'}</div>
          <div style="color: #0284C7; font-size: 11px; font-weight: 600;">✉️ ${bill.customerEmail || 'urvishjivani@gmail.com'}</div>
          <div style="color: #64748B; font-size: 11px;">📍 ${bill.deliveryAddress || 'a-303 sarthi complex adajan  surat'}</div>
        </div>

        <div class="invoice-party-box" style="background: #F0FDF4; border-color: #DCFCE7;">
          <div class="invoice-party-title" style="color: #065F46;">👨‍🌾 Direct Farmer & Farm Branch</div>
          <div><strong>${bill.farmerName || 'Anash Retiwala'}</strong> (${bill.farmName || 'AR Organic'})</div>
          <div style="color: #059669; font-size: 11px; font-weight: 600;">✉️ ${bill.farmerEmail || 'anasretiwala@gmail.com'}</div>
          <div style="color: #059669; font-size: 11px;">🏡 Branch: ${bill.farmBranch || 'Surat'}</div>
        </div>

        <!-- Itemized Table -->
        <table class="invoice-items-table">
          <thead>
            <tr>
              <th>Produce Item</th>
              <th>Qty</th>
              <th>Farmer Rate</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(i => `
              <tr>
                <td><strong>${i.name}</strong></td>
                <td>${i.quantity} ${i.unit || 'kg'}</td>
                <td style="color: #059669; font-weight: 600;">₹${i.farmerPrice || bill.farmerMentionedPrice || 140}</td>
                <td><strong>₹${i.lineTotal || (i.price * i.quantity) || bill.subtotal}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Summary Calculation Box -->
        <div class="invoice-summary-box">
          <div class="invoice-summary-row">
            <span>Produce Subtotal:</span>
            <span>₹${bill.subtotal}</span>
          </div>
          <div class="invoice-summary-row">
            <span>Farm Packaging & Transit:</span>
            <span>${bill.delivery === 0 ? 'FREE' : `₹${bill.delivery}`}</span>
          </div>
          <div class="invoice-summary-row">
            <span>Agricultural GST (0%):</span>
            <span style="color: #059669;">₹0.00</span>
          </div>
          <div class="invoice-summary-row invoice-grand-total">
            <span>Total Paid (INR):</span>
            <span>₹${bill.total}</span>
          </div>
        </div>

        <!-- Farmer Mentioned Earning Breakdown -->
        <div style="display: flex; justify-content: space-between; background: #FEF3C7; padding: 10px 12px; border-radius: 8px; font-size: 11px; color: #92400E; margin-top: 10px;">
          <span>👨‍🌾 <strong>Farmer Earning (Mentioned Price):</strong> ₹${bill.farmerTotal || bill.farmerMentionedPrice || 140}</span>
          <span>💼 <strong>App Fee (5%):</strong> ₹${Math.round((bill.subtotal || 147) * 0.05 / 1.05 || 7)}</span>
        </div>

        <!-- Footer Verification Note -->
        <div class="invoice-footer-note">
          ✓ Authentic GST-compliant electronic tax invoice generated on the Agross Platform.
        </div>
      </div>

      <!-- Invoice Actions -->
      <div class="invoice-actions-row">
        <button class="btn-invoice-action btn-invoice-print" id="btn-print-invoice">
          🖨️ Print / Save PDF
        </button>
        <button class="btn-invoice-action btn-invoice-shop" id="btn-invoice-shop-more">
          🌾 Shop More Produce
        </button>
      </div>

      <button class="btn-auth-submit" id="btn-view-all-invoices" style="margin-top: 10px; background: #334155; color: white;">
        📜 View All My Orders & Bills
      </button>
    </div>
  `;

  // Attach Bill Handlers
  document.getElementById('btn-bill-back-market').addEventListener('click', () => navigateTo('market'));
  document.getElementById('btn-invoice-shop-more').addEventListener('click', () => navigateTo('market'));
  
  document.getElementById('btn-print-invoice').addEventListener('click', () => {
    window.print();
  });

  document.getElementById('btn-view-all-invoices').addEventListener('click', () => {
    navigateTo('bills_history');
  });
}

// =========================================================================
// 7. CUSTOMER BILLS & ORDER HISTORY SCREEN
// =========================================================================
async function fetchCustomerBills() {
  try {
    const res = await fetch(`${API_BASE}/bills`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        state.customerBillsList = data;
        if (state.currentScreen === 'bills_history') {
          renderCustomerBills();
        }
      }
    }
  } catch (e) {}
}
fetchCustomerBills();
setInterval(fetchCustomerBills, 3000);

function renderCustomerBills() {
  const screen = document.getElementById('screen-container');
  const isFarmer = state.currentRole === 'FARMER';
  const user = state.loggedInUserObj || (isFarmer ? {
    id: 'F-102',
    name: state.loggedInUser || 'Anash Retiwala',
    mobile: '9090909090',
    email: 'anasretiwala@gmail.com'
  } : {
    id: 'C-201',
    name: state.loggedInUser || 'urvish  jivani',
    mobile: '9878979890',
    email: 'urvishjivani@gmail.com'
  });

  const currentCustNameClean = (state.loggedInUser || user.name || 'urvish  jivani').trim().toLowerCase().replace(/\s+/g, ' ');
  const currentCustMobile = String(user.mobile || '9878979890').trim();
  const currentCustEmail = String(user.email || 'urvishjivani@gmail.com').trim().toLowerCase();

  // Filter bills strictly for this logged-in customer (e.g. urvish jivani)
  const bills = state.customerBillsList.filter(b => {
    const bCust = String(b.customer || '').trim().toLowerCase().replace(/\s+/g, ' ');
    const bMobile = String(b.customerMobile || '').trim();
    const bEmail = String(b.customerEmail || '').trim().toLowerCase();
    return (currentCustNameClean && (bCust === currentCustNameClean || bCust.includes(currentCustNameClean) || currentCustNameClean.includes(bCust))) ||
           (currentCustMobile && bMobile === currentCustMobile) ||
           (currentCustEmail && bEmail === currentCustEmail);
  });

  screen.innerHTML = `
    <div class="bill-invoice-screen">
      <!-- Header -->
      <div class="screen-back-header">
        <button class="btn-screen-back" id="btn-bills-back">←</button>
        <h2 class="screen-title-text">📜 My Orders & Tax Invoices (${bills.length})</h2>
      </div>

      ${bills.length > 0 ? `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${bills.map(b => {
            const itemsSummary = b.items || (b.itemsList && b.itemsList.length > 0 ? b.itemsList.map(i => `${i.name} (${i.quantity} ${i.unit || 'kg'})`).join(', ') : 'Farm Fresh Produce');
            return `
              <div class="cart-section-card btn-open-specific-bill" data-bill-id="${b.id}" style="cursor: pointer; transition: transform 0.15s; border-left: 3px solid #059669;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <strong style="color: #065F46; font-size: 14px;">Invoice #${b.id}</strong>
                  <span class="invoice-badge-paid">✓ ${b.status || 'PAID'}</span>
                </div>
                <div style="font-size: 12px; font-weight: 700; color: #1E293B; margin-bottom: 3px;">
                  📦 ${itemsSummary}
                </div>
                <div style="font-size: 11px; color: #64748B; margin-bottom: 6px;">
                  👨‍🌾 Farmer: <strong>${b.farmerName || 'Farmer'}</strong> (${b.farmName || 'Organic Farm'})
                </div>
                <div style="font-size: 11px; color: #64748B; display: flex; justify-content: space-between; border-top: 1px solid #F1F5F9; padding-top: 6px;">
                  <span>🕒 ${b.date || 'Recent'} • 💳 ${b.method || 'UPI'}</span>
                  <strong style="color: #065F46; font-size: 13.5px;">₹${b.total}</strong>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      ` : `
        <div class="empty-cart-view">
          <div class="empty-cart-icon">📜</div>
          <h3 style="font-size: 16px; font-weight: 800; color: #0F172A; margin-bottom: 6px;">No Bills Found</h3>
          <p style="font-size: 12px; color: #64748B; margin-bottom: 18px;">You haven't placed any orders yet with this account.</p>
          <button class="btn-auth-submit customer-btn" id="btn-bills-shop">
            🌾 Browse Marketplace
          </button>
        </div>
      `}
    </div>
  `;

  document.getElementById('btn-bills-back').addEventListener('click', () => navigateTo('account'));

  const billsShop = document.getElementById('btn-bills-shop');
  if (billsShop) billsShop.addEventListener('click', () => navigateTo('market'));

  document.querySelectorAll('.btn-open-specific-bill').forEach(card => {
    card.addEventListener('click', () => {
      const bId = card.dataset.billId;
      const found = state.customerBillsList.find(b => b.id === bId);
      if (found) {
        state.activeBill = found;
        navigateTo('bill');
      }
    });
  });
}

// =========================================================================
// 8. FARMER WALLET SCREEN (Pending until Admin pays, Settled by Admin, 0 when withdrawn)
// =========================================================================
function renderWallet() {
  const screen = document.getElementById('screen-container');
  const user = state.loggedInUserObj || {
    name: state.loggedInUser || 'vans gajere',
    farmName: 'Gajera Organic Farms',
    location: 'Surat, Gujarat',
    bankUpi: 'Gajera@oksbi',
    totalSales: 0
  };

  const currentFarmerName = (state.loggedInUser || 'vans gajere').trim().toLowerCase();

  // Filter payouts for this logged-in farmer
  const farmerPayouts = payouts.filter(p => {
    const pFarmer = String(p.farmer || '').trim().toLowerCase();
    const pFarmerId = String(p.farmerId || '').trim();
    return pFarmer === currentFarmerName || (user.id && pFarmerId === user.id) || pFarmer.includes(currentFarmerName);
  });

  // Filter withdrawals history for this logged-in farmer
  const farmerWithdrawals = withdrawals.filter(w => {
    const wFarmer = String(w.farmer || '').trim().toLowerCase();
    const wFarmerId = String(w.farmerId || '').trim();
    return wFarmer === currentFarmerName || (user.id && wFarmerId === user.id) || wFarmer.includes(currentFarmerName);
  });

  // 1. Pending Payments (When customer places order -> shown as Pending waiting for Admin Approval)
  const pendingAmount = farmerPayouts
    .filter(p => p.status === 'Pending')
    .reduce((sum, p) => sum + (parseFloat(p.netAmount || p.grossAmount || 0)), 0);

  // 2. Settled Payments (When Admin approves & transfers in Admin Portal)
  const settledAmount = farmerPayouts
    .filter(p => p.status === 'Settled')
    .reduce((sum, p) => sum + (parseFloat(p.netAmount || p.grossAmount || 0)), 0);

  // 3. Total Withdrawn by Farmer
  const totalWithdrawn = farmerWithdrawals.reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0);

  // 4. Available Balance to Withdraw (Settled total minus already withdrawn amount)
  const availableBalance = Math.max(0, settledAmount - totalWithdrawn);

  // Crop earnings
  const farmerProducts = products.filter(p => p.farmer && (p.farmer.toLowerCase() === (user.name || '').toLowerCase() || (user.id && p.farmerId === user.id)));

  screen.innerHTML = `
    <div class="wallet-screen">
      <!-- Wallet Balance Hero Card -->
      <div class="wallet-hero-card">
        <div class="wallet-hero-label">Available Farmer Earning Balance</div>
        <div class="wallet-hero-balance">₹${availableBalance.toLocaleString()}</div>
        
        <div class="wallet-kpi-subgrid" style="grid-template-columns: 1fr 1fr 1fr;">
          <div class="wallet-kpi-col">
            <small>⏳ Pending</small>
            <strong style="color: #FEF08A; font-size: 13px;">₹${pendingAmount.toLocaleString()}</strong>
          </div>
          <div class="wallet-kpi-col">
            <small>✓ Settled</small>
            <strong style="color: #6EE7B7; font-size: 13px;">₹${settledAmount.toLocaleString()}</strong>
          </div>
          <div class="wallet-kpi-col">
            <small>💸 Withdrawn</small>
            <strong style="color: #93C5FD; font-size: 13px;">₹${totalWithdrawn.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      <!-- Bank UPI Strip -->
      <div class="wallet-upi-strip">
        <div class="wallet-upi-left">
          <div class="wallet-upi-icon">💳</div>
          <div>
            <div style="font-size: 13px; font-weight: 800; color: #1E293B;">Direct Bank Payout Account</div>
            <div style="font-size: 11px; color: #64748B;">UPI: <strong style="color: #059669;">${user.bankUpi || 'Gajera@oksbi'}</strong> • 0% Cut</div>
          </div>
        </div>
        <button class="btn-sell-now" id="btn-request-payout" style="background: ${availableBalance > 0 ? '#10B981' : '#94A3B8'}; font-size: 11px; padding: 7px 12px; font-weight: 800;" ${availableBalance === 0 ? 'disabled' : ''}>
          ${availableBalance > 0 ? 'Withdraw All' : 'Withdrawn'}
        </button>
      </div>

      <!-- Order & Payment Settlement Flow Guide -->
      ${pendingAmount > 0 ? `
        <div style="background: #FEF3C7; border: 1.5px solid #F59E0B; border-radius: 14px; padding: 12px 14px; margin-bottom: 14px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <span style="font-size: 18px;">⏳</span>
            <strong style="color: #78350F; font-size: 12.5px;">Pending Customer Orders: ₹${pendingAmount}</strong>
          </div>
          <p style="font-size: 11px; color: #92400E; line-height: 1.4;">
            Customer placed orders for your harvest. Amount is in <strong>Pending</strong> status until Agross Admin approves and releases payout.
          </p>
        </div>
      ` : ''}

      ${totalWithdrawn > 0 && availableBalance === 0 ? `
        <div style="background: #ECFDF5; border: 1.5px solid #10B981; border-radius: 14px; padding: 12px 14px; margin-bottom: 14px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <span style="font-size: 18px;">✓</span>
            <strong style="color: #065F46; font-size: 12.5px;">All Settled Funds Withdrawn (Available: ₹0.00)</strong>
          </div>
          <p style="font-size: 11px; color: #047857; line-height: 1.4;">
            You have withdrawn all admin-settled earnings to UPI <strong>${user.bankUpi || 'Gajera@oksbi'}</strong>. Total settled by admin remains <strong>₹${settledAmount}</strong>.
          </p>
        </div>
      ` : ''}

      <!-- 1. Direct Bank Withdrawal History -->
      <div class="wallet-section-title" style="margin-top: 10px;">
        <span>💸 Direct Bank Withdrawal History (${farmerWithdrawals.length})</span>
        <span style="font-size: 11px; color: #10B981; font-weight: 700;">RTGS / UPI</span>
      </div>

      ${farmerWithdrawals.length > 0 ? farmerWithdrawals.map(w => `
        <div class="crop-earning-card" style="margin-bottom: 8px; border-left: 3px solid #10B981;">
          <div class="crop-earning-left">
            <div class="crop-earning-icon" style="background: #ECFDF5;">🏦</div>
            <div>
              <div class="crop-earning-title">Direct Bank Withdrawal #${w.id}</div>
              <div class="crop-earning-sub">${w.date} • Payout UPI: ${w.bankUpi || user.bankUpi}</div>
            </div>
          </div>
          <div class="crop-earning-amt">
            <div class="amt" style="color: #10B981;">-₹${w.amount}</div>
            <div class="status" style="color: #059669; font-weight: 800; font-size: 10px;">✓ Transferred to Bank</div>
          </div>
        </div>
      `).join('') : `
        <div class="crop-earning-card" style="margin-bottom: 12px;">
          <div class="crop-earning-left">
            <div class="crop-earning-icon">💵</div>
            <div>
              <div class="crop-earning-title">No withdrawal history yet</div>
              <div class="crop-earning-sub">Transferred funds will appear here when you withdraw</div>
            </div>
          </div>
          <div class="crop-earning-amt">
            <div class="amt">₹0</div>
            <div class="status">-</div>
          </div>
        </div>
      `}

      <!-- 2. Recent Customer Orders & Admin Settlements List -->
      <div class="wallet-section-title" style="margin-top: 14px;">
        <span>Customer Orders & Admin Settlements (${farmerPayouts.length})</span>
        <span style="font-size: 11px; color: #64748B;">Live Sync</span>
      </div>

      ${farmerPayouts.length > 0 ? farmerPayouts.map(p => {
        const isSettled = p.status === 'Settled';
        return `
          <div class="crop-earning-card" style="margin-bottom: 8px;">
            <div class="crop-earning-left">
              <div class="crop-earning-icon">${isSettled ? '🏛️' : '🛒'}</div>
              <div>
                <div class="crop-earning-title">${isSettled ? `Admin Settlement #${p.id}` : `Customer Order #${p.billId || p.id}`}</div>
                <div class="crop-earning-sub">${p.dueDate || p.date || 'Recent'} • Bank UPI: ${p.bankUpi || user.bankUpi}</div>
              </div>
            </div>
            <div class="crop-earning-amt">
              <div class="amt" style="color: ${isSettled ? '#10B981' : '#F59E0B'};">+₹${p.netAmount}</div>
              <div class="status" style="color: ${isSettled ? '#10B981' : '#D97706'}; font-weight: 800; font-size: 10px;">
                ${isSettled ? '✓ Settled by Admin' : '⏳ Pending Admin Approval'}
              </div>
            </div>
          </div>
        `;
      }).join('') : `
        <div class="crop-earning-card">
          <div class="crop-earning-left">
            <div class="crop-earning-icon">🌱</div>
            <div>
              <div class="crop-earning-title">No orders yet</div>
              <div class="crop-earning-sub">Customer purchases will appear here as Pending</div>
            </div>
          </div>
          <div class="crop-earning-amt">
            <div class="amt">₹0</div>
            <div class="status">₹0 Pending</div>
          </div>
        </div>
      `}

      <!-- Crops Earnings Breakdown -->
      <div class="wallet-section-title" style="margin-top: 14px;">
        <span>Crops Sales Summary</span>
        <span style="font-size: 11.5px; color: #059669; cursor: pointer; font-weight: 700;" id="btn-wallet-add-crop">+ Add Crop</span>
      </div>

      ${farmerProducts.length > 0 ? farmerProducts.map(p => {
        const cropEarned = (p.ordersCount || 0) * (p.price || 0);
        return `
          <div class="crop-earning-card">
            <div class="crop-earning-left">
              <div class="crop-earning-icon">${p.emoji || '🥦'}</div>
              <div>
                <div class="crop-earning-title">${p.name}</div>
                <div class="crop-earning-sub">${p.ordersCount || 0} orders • ₹${p.price}/${p.unit}</div>
              </div>
            </div>
            <div class="crop-earning-amt">
              <div class="amt">+₹${cropEarned}</div>
              <div class="status">${(p.ordersCount || 0) > 0 ? 'Active Orders' : 'Listed'}</div>
            </div>
          </div>
        `;
      }).join('') : ''}

      <button class="btn-auth-submit farmer-btn" id="btn-wallet-back-home" style="margin-top: 14px;">
        ← Back to Produce Marketplace
      </button>
    </div>
  `;

  document.getElementById('btn-wallet-back-home').addEventListener('click', () => {
    navigateTo('dashboard');
  });

  if (document.getElementById('btn-wallet-add-crop')) {
    document.getElementById('btn-wallet-add-crop').addEventListener('click', () => {
      navigateTo('add_crop');
    });
  }

  const withdrawBtn = document.getElementById('btn-request-payout');
  if (withdrawBtn && availableBalance > 0) {
    withdrawBtn.addEventListener('click', async () => {
      const withdrawAmount = availableBalance;
      
      try {
        const res = await fetch(`${API_BASE}/farmer/withdraw`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            farmer: user.name || state.loggedInUser || 'vans gajere',
            farmerId: user.id || 'F-106',
            amount: withdrawAmount,
            bankUpi: user.bankUpi || 'Gajera@oksbi'
          })
        });
        const data = await res.json();
        if (data.withdrawal) {
          withdrawals.unshift(data.withdrawal);
        }
      } catch (err) {
        withdrawals.unshift({
          id: `WTH-${Math.floor(1000 + Math.random() * 9000)}`,
          farmer: user.name || state.loggedInUser || 'vans gajere',
          amount: withdrawAmount,
          bankUpi: user.bankUpi || 'Gajera@oksbi',
          status: 'Completed',
          date: new Date().toISOString().replace('T', ' ').substring(0, 16)
        });
      }

      showToast(`💸 ₹${withdrawAmount} withdrawn to ${user.bankUpi || 'Gajera@oksbi'}! Available balance is now ₹0.00.`);
      renderWallet();
    });
  }
}

// =========================================================================
// 9. ACCOUNT SCREEN
// =========================================================================
function renderAccount() {
  const screen = document.getElementById('screen-container');
  const isFarmer = state.currentRole === 'FARMER';

  if (!state.loggedInUser) {
    if (isFarmer) {
      state.loggedInUser = 'Anash Retiwala';
      state.loggedInUserObj = {
        id: 'F-102',
        name: 'Anash Retiwala',
        mobile: '9090909090',
        email: 'anasretiwala@gmail.com',
        farmName: 'AR Organic',
        location: 'Surat',
        branch: 'Surat',
        bankUpi: 'Anas@oksbi',
        status: 'Verified'
      };
    } else {
      state.loggedInUser = 'urvish  jivani';
      state.loggedInUserObj = {
        id: 'C-201',
        name: 'urvish  jivani',
        mobile: '9878979890',
        email: 'urvishjivani@gmail.com',
        city: 'a-303 sarthi complex adajan  surat',
        deliveryAddress: 'a-303 sarthi complex adajan  surat',
        status: 'Verified'
      };
    }
  }

  const user = state.loggedInUserObj || (isFarmer ? {
    name: state.loggedInUser || 'Anash Retiwala',
    mobile: '9090909090',
    email: 'anasretiwala@gmail.com',
    farmName: 'AR Organic',
    location: 'Surat',
    branch: 'Surat',
    bankUpi: 'Anas@oksbi',
    status: 'Verified'
  } : {
    name: state.loggedInUser || 'urvish  jivani',
    mobile: '9878979890',
    email: 'urvishjivani@gmail.com',
    city: 'a-303 sarthi complex adajan  surat',
    deliveryAddress: 'a-303 sarthi complex adajan  surat',
    status: 'Verified'
  });

  screen.innerHTML = `
    <div class="account-screen">
      <!-- Profile Header -->
      <div class="account-profile-header">
        <div class="account-avatar-large">${isFarmer ? '👨‍🌾' : '🛒'}</div>
        <h3 class="account-name-title">${user.name || state.loggedInUser}</h3>
        <span class="account-role-tag">${isFarmer ? '🌾 Verified Farmer Seller' : '🛍️ Verified Customer'}</span>
        <p style="font-size: 11.5px; color: #64748B; margin-top: 6px;">Agross Direct Farm-to-Fork Ecosystem</p>
      </div>

      <!-- Details Card -->
      <div class="account-details-card">
        <div class="account-detail-row">
          <span class="account-detail-label">👤 Full Name</span>
          <span class="account-detail-val">${user.name || state.loggedInUser}</span>
        </div>
        <div class="account-detail-row">
          <span class="account-detail-label">📱 Mobile Number</span>
          <span class="account-detail-val">${user.mobile || '9870011223'}</span>
        </div>
        <div class="account-detail-row">
          <span class="account-detail-label">✉️ Email ID</span>
          <span class="account-detail-val">${user.email || 'user@example.com'}</span>
        </div>
        ${isFarmer ? `
          <div class="account-detail-row">
            <span class="account-detail-label">🏡 Farm / Branch</span>
            <span class="account-detail-val">${user.farmName || 'My Farm'}</span>
          </div>
          <div class="account-detail-row">
            <span class="account-detail-label">📍 Branch Location</span>
            <span class="account-detail-val">${user.branch || user.location || 'Surat Branch, Gujarat'}</span>
          </div>
          <div class="account-detail-row">
            <span class="account-detail-label">💳 Payout Bank UPI</span>
            <span class="account-detail-val" style="color: #059669;">${user.bankUpi || 'farmer@oksbi'}</span>
          </div>
        ` : `
          <div class="account-detail-row">
            <span class="account-detail-label">📍 Delivery Address</span>
            <span class="account-detail-val">${user.city || user.deliveryAddress || 'Surat, Gujarat'}</span>
          </div>
        `}
        <div class="account-detail-row">
          <span class="account-detail-label">🛡️ Account Status</span>
          <span class="account-detail-val" style="color: #10B981;">✓ Verified & Active</span>
        </div>
      </div>

      <!-- Quick Actions -->
      <button class="btn-auth-submit" id="btn-acc-edit-profile" style="margin-bottom: 10px; background: linear-gradient(135deg, #0284C7, #0369A1); color: white;">
        ✏️ Edit Profile Details
      </button>

      ${isFarmer ? `
        <button class="btn-auth-submit farmer-btn" id="btn-acc-open-wallet" style="margin-bottom: 10px;">
          💰 View Earnings Wallet
        </button>
        <button class="btn-auth-submit customer-btn" id="btn-acc-add-crop" style="margin-bottom: 10px; background: #0F766E;">
          ➕ Add New Crop / Produce For Sale
        </button>
        <button class="btn-auth-submit" id="btn-acc-my-catalog" style="margin-bottom: 10px; background: #D97706; color: white;">
          🌿 Open My Farm Listed Catalog
        </button>
      ` : `
        <button class="btn-auth-submit customer-btn" id="btn-acc-orders" style="margin-bottom: 10px;">
          🛒 Open My Basket & Checkout
        </button>
        <button class="btn-auth-submit" id="btn-acc-my-bills" style="margin-bottom: 10px; background: #1E293B; color: white;">
          🧾 View My Tax Invoices & Order Bills (${state.customerBillsList.filter(b => {
            const bCust = String(b.customer || '').trim().toLowerCase().replace(/\s+/g, ' ');
            const bMob = String(b.customerMobile || '').trim();
            const bEmail = String(b.customerEmail || '').trim().toLowerCase();
            const nm = (state.loggedInUser || 'urvish  jivani').trim().toLowerCase().replace(/\s+/g, ' ');
            const mb = (user.mobile || '9878979890').trim();
            const em = (user.email || 'urvishjivani@gmail.com').trim().toLowerCase();
            return (nm && (bCust === nm || bCust.includes(nm) || nm.includes(bCust))) || (mb && bMob === mb) || (em && bEmail === em);
          }).length})
        </button>
      `}

      <!-- Logout Button -->
      <button class="btn-logout-account" id="btn-logout-action">
        <span>🚪</span> Sign Out / Log Out
      </button>
    </div>
  `;

  if (document.getElementById('btn-acc-edit-profile')) {
    document.getElementById('btn-acc-edit-profile').addEventListener('click', () => navigateTo('edit_profile'));
  }

  if (document.getElementById('btn-acc-open-wallet')) {
    document.getElementById('btn-acc-open-wallet').addEventListener('click', () => navigateTo('wallet'));
  }

  if (document.getElementById('btn-acc-add-crop')) {
    document.getElementById('btn-acc-add-crop').addEventListener('click', () => navigateTo('add_crop'));
  }

  if (document.getElementById('btn-acc-my-catalog')) {
    document.getElementById('btn-acc-my-catalog').addEventListener('click', () => navigateTo('market'));
  }

  if (document.getElementById('btn-acc-orders')) {
    document.getElementById('btn-acc-orders').addEventListener('click', () => navigateTo('cart'));
  }

  if (document.getElementById('btn-acc-my-bills')) {
    document.getElementById('btn-acc-my-bills').addEventListener('click', () => navigateTo('bills_history'));
  }

  document.getElementById('btn-logout-action').addEventListener('click', () => {
    if (confirm('Are you sure you want to log out of your Agross account?')) {
      clearAuthCookie('agross_auth_session');
      state.loggedInUser = null;
      state.loggedInUserObj = null;
      showToast('Logged out successfully');
      navigateTo('dashboard');
    }
  });
}

// =========================================================================
// 9.1 EDIT PROFILE SCREEN (Rendered in mobile app, not web modal)
// =========================================================================
function renderEditProfile() {
  const screen = document.getElementById('screen-container');
  const isFarmer = state.currentRole === 'FARMER';
  const user = state.loggedInUserObj || (isFarmer ? {
    id: 'F-102',
    name: state.loggedInUser || 'Anash Retiwala',
    mobile: '9090909090',
    email: 'anasretiwala@gmail.com',
    farmName: 'AR Organic',
    location: 'Surat',
    branch: 'Surat',
    bankUpi: 'Anas@oksbi',
    status: 'Verified'
  } : {
    id: 'C-201',
    name: state.loggedInUser || 'urvish  jivani',
    mobile: '9878979890',
    email: 'urvishjivani@gmail.com',
    city: 'a-303 sarthi complex adajan  surat',
    deliveryAddress: 'a-303 sarthi complex adajan  surat',
    status: 'Verified'
  });

  screen.innerHTML = `
    <div class="cart-screen" style="padding-bottom: 30px;">
      <!-- Screen Header -->
      <div class="screen-back-header">
        <button class="btn-screen-back" id="btn-edit-prof-back">←</button>
        <h2 class="screen-title-text">✏️ Edit ${isFarmer ? 'Farmer' : 'Customer'} Profile</h2>
      </div>

      <div style="text-align: center; margin: 12px 0 16px;">
        <div style="font-size: 38px; width: 64px; height: 64px; border-radius: 50%; background: #F1F5F9; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px;">
          ${isFarmer ? '👨‍🌾' : '🛒'}
        </div>
        <h3 style="font-size: 16px; font-weight: 800; color: #0F172A;">${user.name || 'My Profile'}</h3>
        <p style="font-size: 11.5px; color: #64748B;">Update your personal and contact details</p>
      </div>

      <!-- Form Card -->
      <div class="cart-section-card" style="background: white; border-radius: 16px; padding: 18px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <form id="form-edit-profile-screen" style="display: flex; flex-direction: column; gap: 14px;">
          <div class="form-group">
            <label class="form-label" style="font-weight: 700; font-size: 12px; color: #334155; margin-bottom: 4px; display: block;">👤 Full Name</label>
            <input type="text" id="edit-screen-name" class="form-input" required value="${user.name || ''}" style="width: 100%; padding: 10px 12px; border: 1.5px solid #CBD5E1; border-radius: 10px; font-size: 13px;">
          </div>

          <div class="form-group">
            <label class="form-label" style="font-weight: 700; font-size: 12px; color: #334155; margin-bottom: 4px; display: block;">📱 Mobile Number</label>
            <input type="tel" id="edit-screen-mobile" class="form-input" required value="${user.mobile || ''}" style="width: 100%; padding: 10px 12px; border: 1.5px solid #CBD5E1; border-radius: 10px; font-size: 13px;">
          </div>

          <div class="form-group">
            <label class="form-label" style="font-weight: 700; font-size: 12px; color: #334155; margin-bottom: 4px; display: block;">✉️ Email ID (Gmail)</label>
            <input type="email" id="edit-screen-email" class="form-input" required value="${user.email || ''}" style="width: 100%; padding: 10px 12px; border: 1.5px solid #CBD5E1; border-radius: 10px; font-size: 13px;">
          </div>

          ${isFarmer ? `
            <div class="form-group">
              <label class="form-label" style="font-weight: 700; font-size: 12px; color: #334155; margin-bottom: 4px; display: block;">🏡 Farm Name</label>
              <input type="text" id="edit-screen-farm-name" class="form-input" required value="${user.farmName || 'AR Organic'}" style="width: 100%; padding: 10px 12px; border: 1.5px solid #CBD5E1; border-radius: 10px; font-size: 13px;">
            </div>

            <div class="form-group">
              <label class="form-label" style="font-weight: 700; font-size: 12px; color: #334155; margin-bottom: 4px; display: block;">📍 Farm Branch / Location</label>
              <input type="text" id="edit-screen-branch" class="form-input" required value="${user.branch || user.location || 'Surat'}" style="width: 100%; padding: 10px 12px; border: 1.5px solid #CBD5E1; border-radius: 10px; font-size: 13px;">
            </div>

            <div class="form-group">
              <label class="form-label" style="font-weight: 700; font-size: 12px; color: #334155; margin-bottom: 4px; display: block;">💳 Payout Bank UPI ID</label>
              <input type="text" id="edit-screen-upi" class="form-input" required value="${user.bankUpi || 'Anas@oksbi'}" style="width: 100%; padding: 10px 12px; border: 1.5px solid #CBD5E1; border-radius: 10px; font-size: 13px;">
            </div>
          ` : `
            <div class="form-group">
              <label class="form-label" style="font-weight: 700; font-size: 12px; color: #334155; margin-bottom: 4px; display: block;">📍 Delivery Address / City</label>
              <textarea id="edit-screen-city" class="form-input" rows="3" required style="width: 100%; padding: 10px 12px; border: 1.5px solid #CBD5E1; border-radius: 10px; font-size: 13px; font-family: inherit;">${user.city || user.deliveryAddress || ''}</textarea>
            </div>
          `}

          <button type="submit" class="btn-auth-submit customer-btn" id="btn-save-profile-screen" style="margin-top: 10px; background: linear-gradient(135deg, #059669, #047857); padding: 13px; font-size: 14px; font-weight: 700; border-radius: 12px; box-shadow: 0 4px 10px rgba(5, 150, 105, 0.25);">
            💾 Save Profile Changes
          </button>

          <button type="button" class="btn-auth-submit" id="btn-cancel-profile-screen" style="background: #F1F5F9; color: #475569; padding: 11px; font-size: 13px; font-weight: 600; border-radius: 12px;">
            Cancel & Return
          </button>
        </form>
      </div>
    </div>
  `;

  document.getElementById('btn-edit-prof-back').addEventListener('click', () => navigateTo('account'));
  document.getElementById('btn-cancel-profile-screen').addEventListener('click', () => navigateTo('account'));

  document.getElementById('form-edit-profile-screen').addEventListener('submit', async (e) => {
    e.preventDefault();
    const saveBtn = document.getElementById('btn-save-profile-screen');
    saveBtn.disabled = true;
    saveBtn.innerText = 'Saving Changes...';

    const updatedData = {
      role: isFarmer ? 'FARMER' : 'CUSTOMER',
      id: user.id,
      oldName: user.name,
      name: document.getElementById('edit-screen-name').value.trim(),
      mobile: document.getElementById('edit-screen-mobile').value.trim(),
      email: document.getElementById('edit-screen-email').value.trim(),
    };

    if (isFarmer) {
      updatedData.farmName = document.getElementById('edit-screen-farm-name').value.trim();
      updatedData.branch = document.getElementById('edit-screen-branch').value.trim();
      updatedData.location = updatedData.branch;
      updatedData.bankUpi = document.getElementById('edit-screen-upi').value.trim();
    } else {
      updatedData.city = document.getElementById('edit-screen-city').value.trim();
      updatedData.deliveryAddress = updatedData.city;
    }

    // Merge into state
    state.loggedInUser = updatedData.name;
    state.loggedInUserObj = { ...user, ...updatedData };
    setAuthCookie('agross_auth_session', JSON.stringify({
      username: updatedData.name,
      role: isFarmer ? 'FARMER' : 'CUSTOMER',
      user: state.loggedInUserObj
    }), 7);

    showToast('✅ Profile updated successfully!');
    navigateTo('account');

    try {
      await fetch(`${API_BASE}/profile/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
    } catch (err) {}
  });
}

// =========================================================================
// 10. LOGIN SCREEN
// =========================================================================
function renderLogin() {
  const screen = document.getElementById('screen-container');
  const isFarmer = state.loginRole === 'FARMER';
  const defaultVal = state.prefilledIdentifier || '';

  screen.innerHTML = `
    <div class="auth-header-strip">
      <div class="auth-avatar-box">${isFarmer ? '👨‍🌾' : '🛒'}</div>
      <h2>${isFarmer ? 'Farmer Portal Login' : 'Customer Portal Login'}</h2>
      <p>${isFarmer ? 'Login with Mobile Number or Email ID' : 'Order fresh farm vegetables & fruits directly'}</p>
    </div>

    <div class="auth-card-container">
      <!-- Role Segmented Picker -->
      <div class="role-segmented-picker">
        <button class="segment-tab ${!isFarmer ? 'active-customer' : ''}" id="tab-login-customer">
          <span>🛒</span> Customer
        </button>
        <button class="segment-tab ${isFarmer ? 'active-farmer' : ''}" id="tab-login-farmer">
          <span>👨‍🌾</span> Farmer
        </button>
      </div>

      <!-- Pending Approval Warning Card -->
      ${state.pendingApprovalNotice ? `
        <div style="background: #FEF3C7; border: 1.5px solid #F59E0B; border-radius: 14px; padding: 12px 14px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <span style="font-size: 18px;">⏳</span>
            <strong style="color: #78350F; font-size: 12.5px;">Account Verification Pending</strong>
          </div>
          <p style="font-size: 11px; color: #92400E; line-height: 1.4;">${state.pendingApprovalNotice}</p>
          <div style="margin-top: 8px; font-size: 10.5px; color: #B45309; font-weight: bold;">
            👉 Open the <a href="http://localhost:8081" target="_blank" style="color: #1E40AF; text-decoration: underline;">Admin Portal</a> to approve this account.
          </div>
        </div>
      ` : ''}

      <form id="login-form">
        <div class="form-group">
          <label>Mobile Number or Email ID</label>
          <input type="text" id="login-identifier" class="form-input" placeholder="Enter 10-digit mobile or email ID" required value="${defaultVal}">
        </div>

        <div class="form-group">
          <div class="row-inline-between" style="margin-bottom: 5px;">
            <label style="margin: 0;">Password</label>
            <span class="link-text" id="btn-forgot-pw">Forgot?</span>
          </div>
          <input type="password" id="login-pw" class="form-input" placeholder="Enter your password" required value="">
        </div>

        <div class="row-inline-between">
          <label class="checkbox-label">
            <input type="checkbox" checked> Remember me (Save Session & Cookies)
          </label>
          <span class="link-text" id="btn-otp-mode">Login with OTP</span>
        </div>

        <button type="submit" class="btn-auth-submit ${isFarmer ? 'farmer-btn' : 'customer-btn'}" id="btn-submit-login">
          ${isFarmer ? 'Sign In to Farmer Panel' : 'Sign In to Customer Panel'}
        </button>
      </form>

      <div class="auth-footer-prompt">
        Don't have an account? <span id="link-to-register">Register Now</span>
      </div>
    </div>
  `;

  document.getElementById('tab-login-customer').addEventListener('click', () => {
    state.loginRole = 'CUSTOMER';
    renderLogin();
  });

  document.getElementById('tab-login-farmer').addEventListener('click', () => {
    state.loginRole = 'FARMER';
    renderLogin();
  });

  document.getElementById('link-to-register').addEventListener('click', () => {
    navigateTo('register', state.loginRole);
  });

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const identifier = document.getElementById('login-identifier').value.trim();
    const password = document.getElementById('login-pw').value.trim();

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, role: state.loginRole })
      });
      const data = await response.json();

      if (data.code === 'PENDING_APPROVAL') {
        state.pendingApprovalNotice = data.message;
        renderLogin();
        showToast('⚠️ Approval Pending: Admin must approve first');
        return;
      }

      if (data.code === 'REJECTED') {
        state.pendingApprovalNotice = 'Your account registration was rejected by Admin.';
        renderLogin();
        showToast('❌ Account was rejected by Admin');
        return;
      }

      if (data.success || data.code === 'APPROVED') {
        state.pendingApprovalNotice = null;
        state.currentRole = state.loginRole;
        state.loggedInUser = data.name;
        state.loggedInUserObj = data.user;
        
        // Save Session & Cookie
        setAuthCookie('agross_auth_session', {
          role: state.loginRole,
          name: data.name,
          userObj: data.user
        });

        showToast(`Welcome back, ${state.loggedInUser}!`);
        navigateTo('dashboard');
      } else {
        showToast(data.message || 'Login failed. Please verify credentials.');
      }
    } catch (err) {
      // Offline / Static Live Demo Login Fallback
      state.pendingApprovalNotice = null;
      state.currentRole = state.loginRole;
      state.loggedInUser = identifier || (state.loginRole === 'FARMER' ? 'Ramesh Patel' : 'Vansh Gajera');
      state.loggedInUserObj = {
        name: state.loggedInUser,
        mobile: identifier || '9876543210',
        city: 'Surat, Gujarat',
        deliveryAddress: 'Ring Road, Surat'
      };

      setAuthCookie('agross_auth_session', {
        role: state.loginRole,
        name: state.loggedInUser,
        userObj: state.loggedInUserObj
      });

      showToast(`Welcome back, ${state.loggedInUser}!`);
      navigateTo('dashboard');
    }
  });
}

// =========================================================================
// 11. REGISTER SCREEN
// =========================================================================
function renderRegister() {
  const screen = document.getElementById('screen-container');
  const isFarmer = state.registerRole === 'FARMER';

  screen.innerHTML = `
    <div class="auth-header-strip">
      <div class="auth-avatar-box">🌱</div>
      <h2>Join Agross Community</h2>
      <p>Direct farm-to-fork marketplace with fair prices</p>
    </div>

    <div class="auth-card-container">
      <p style="font-size: 12px; font-weight: 700; color: #111827; margin-bottom: 8px;">I am registering as:</p>
      
      <!-- Role Cards -->
      <div class="role-choice-cards">
        <div class="role-choice-card ${isFarmer ? 'selected-farmer' : ''}" id="choice-farmer">
          <div class="role-card-icon">👨‍🌾</div>
          <h5>Farmer</h5>
          <p>Sell fresh produce & direct bank payouts</p>
        </div>
        <div class="role-choice-card ${!isFarmer ? 'selected-customer' : ''}" id="choice-customer">
          <div class="role-card-icon">🛒</div>
          <h5>Customer</h5>
          <p>Buy farm-fresh vegetables & fruits</p>
        </div>
      </div>

      <form id="register-form">
        <div class="form-group">
          <label>Full Name</label>
          <input type="text" id="reg-name" class="form-input" placeholder="${isFarmer ? 'e.g. Ramesh Patil' : 'e.g. Priyank Sharma'}" required value="">
        </div>

        <div class="form-group">
          <label>Mobile Number (for Login & Order SMS)</label>
          <input type="tel" id="reg-mobile" class="form-input" placeholder="10-digit mobile number" required value="">
        </div>

        <div class="form-group">
          <label>Email ID (for Login, Receipts & Bank Alerts)</label>
          <input type="email" id="reg-email" class="form-input" placeholder="e.g. ${isFarmer ? 'vanshgajera@example.com' : 'priyank@example.com'}" required value="">
        </div>

        ${isFarmer ? `
          <div class="form-group">
            <label>Farm Name / Orchard Name</label>
            <input type="text" id="reg-farm" class="form-input" placeholder="e.g. Gajera Organic Farms" required value="">
          </div>

          <div class="form-group">
            <label>Farm Branch & District</label>
            <input type="text" id="reg-loc" class="form-input" placeholder="e.g. Surat Branch, Gujarat" required value="">
          </div>

          <div class="form-group">
            <label>UPI ID or Bank Account (For Direct Bank Payouts)</label>
            <input type="text" id="reg-upi" class="form-input" placeholder="e.g. yourname@oksbi" required value="">
          </div>
        ` : `
          <div class="form-group">
            <label>Delivery Address</label>
            <input type="text" id="reg-address" class="form-input" placeholder="Flat No, Street, Landmark" required value="">
          </div>

          <div class="form-group">
            <label>Pincode / Area</label>
            <input type="text" id="reg-pincode" class="form-input" placeholder="e.g. 411016" required value="">
          </div>
        `}

        <div class="form-group">
          <label>Create Password</label>
          <input type="password" id="reg-password" class="form-input" placeholder="At least 6 characters" required value="">
        </div>

        <div style="margin-bottom: 14px;">
          <label class="checkbox-label" style="font-size: 11px;">
            <input type="checkbox" checked required> I agree to Agross Fair-Trade Terms & Privacy Policy
          </label>
        </div>

        <button type="submit" class="btn-auth-submit ${isFarmer ? 'farmer-btn' : 'customer-btn'}" id="btn-submit-register">
          ${isFarmer ? 'Register as Farmer & Start Selling' : 'Create Customer Account & Shop Fresh'}
        </button>
      </form>

      <div class="auth-footer-prompt">
        Already have an account? <span id="link-to-login">Sign In</span>
      </div>
    </div>
  `;

  document.getElementById('choice-farmer').addEventListener('click', () => {
    state.registerRole = 'FARMER';
    renderRegister();
  });

  document.getElementById('choice-customer').addEventListener('click', () => {
    state.registerRole = 'CUSTOMER';
    renderRegister();
  });

  document.getElementById('link-to-login').addEventListener('click', () => {
    navigateTo('login', state.registerRole);
  });

  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('reg-name').value.trim();
    const mobile = document.getElementById('reg-mobile').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value.trim();

    const payload = {
      role: state.registerRole,
      name: name,
      mobile: mobile,
      email: email,
      password: password,
      farmName: isFarmer ? document.getElementById('reg-farm').value.trim() : null,
      branch: isFarmer ? document.getElementById('reg-loc').value.trim() : null,
      location: isFarmer ? document.getElementById('reg-loc').value.trim() : null,
      upiId: isFarmer ? document.getElementById('reg-upi').value.trim() : null,
      deliveryAddress: !isFarmer ? document.getElementById('reg-address').value.trim() : null,
      pincode: !isFarmer ? document.getElementById('reg-pincode').value.trim() : null
    };

    try {
      const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      state.prefilledIdentifier = mobile;
      state.loginRole = state.registerRole;
      state.pendingApprovalNotice = `Dear ${name}, your ${state.registerRole.toLowerCase()} registration has been submitted to the Admin Panel for approval. Once approved by the Agross Admin, your login will be enabled.`;

      showToast('⏳ Registration Submitted for Admin Approval!');
      navigateTo('login', state.registerRole);
    } catch (err) {
      state.prefilledIdentifier = mobile;
      state.loginRole = state.registerRole;
      state.pendingApprovalNotice = `Dear ${name}, your ${state.registerRole.toLowerCase()} registration is waiting for Admin Approval. Please approve from the Admin Panel.`;
      showToast('⏳ Submitted for Admin Approval!');
      navigateTo('login', state.registerRole);
    }
  });
}

// =========================================================================
// NAVIGATION CONTROLLER
// =========================================================================
function navigateTo(screen, role) {
  state.currentScreen = screen;
  if (role) {
    if (screen === 'login') state.loginRole = role;
    if (screen === 'register') state.registerRole = role;
  }
  renderApp();
}

function updateBottomNav() {
  document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));

  const homeBtn = document.getElementById('nav-btn-home');
  const marketBtn = document.getElementById('nav-btn-market');
  const roleBtn = document.getElementById('nav-btn-role-action');
  const roleIcon = document.getElementById('nav-role-icon');
  const roleLabel = document.getElementById('nav-role-label');
  const accountBtn = document.getElementById('nav-btn-account');

  const cartCount = getCartCount();

  if (state.currentRole === 'FARMER') {
    roleIcon.innerText = '💰';
    roleLabel.innerText = 'Wallet';
    marketBtn.querySelector('.nav-label').innerText = 'My Crops';
  } else {
    roleIcon.innerText = '🛒';
    roleLabel.innerText = cartCount > 0 ? `Cart (${cartCount})` : 'Cart';
    marketBtn.querySelector('.nav-label').innerText = 'Market';
  }

  if (state.currentScreen === 'dashboard') {
    homeBtn.classList.add('active');
  } else if (state.currentScreen === 'market' || state.currentScreen === 'add_crop') {
    marketBtn.classList.add('active');
  } else if (state.currentScreen === 'cart' || state.currentScreen === 'payment' || state.currentScreen === 'bill' || state.currentScreen === 'wallet') {
    roleBtn.classList.add('active');
  } else if (state.currentScreen === 'account' || state.currentScreen === 'edit_profile' || state.currentScreen === 'bills_history' || state.currentScreen === 'login' || state.currentScreen === 'register') {
    accountBtn.classList.add('active');
  }
}

// Master Render
function renderApp() {
  renderTopBar();
  updateBottomNav();

  // Update workbench indicator
  const badge = document.getElementById('workbench-role-badge');
  const badgeText = document.getElementById('workbench-role-text');
  if (state.currentRole === 'FARMER') {
    badge.classList.add('farmer-mode');
    badgeText.innerText = 'Farmer Mode';
  } else {
    badge.classList.remove('farmer-mode');
    badgeText.innerText = 'Customer Mode';
  }

  if (state.currentScreen === 'dashboard') {
    renderDashboard();
  } else if (state.currentScreen === 'market') {
    renderMarket();
  } else if (state.currentScreen === 'add_crop') {
    renderAddCrop();
  } else if (state.currentScreen === 'cart') {
    renderCart();
  } else if (state.currentScreen === 'payment') {
    renderPayment();
  } else if (state.currentScreen === 'bill') {
    renderBillInvoice();
  } else if (state.currentScreen === 'bills_history') {
    renderCustomerBills();
  } else if (state.currentScreen === 'edit_profile') {
    renderEditProfile();
  } else if (state.currentScreen === 'wallet') {
    renderWallet();
  } else if (state.currentScreen === 'account') {
    renderAccount();
  } else if (state.currentScreen === 'login') {
    renderLogin();
  } else if (state.currentScreen === 'register') {
    renderRegister();
  }
}

// Global Bottom Nav Click Listeners
document.getElementById('brand-home-btn').addEventListener('click', () => {
  navigateTo('dashboard');
});

document.getElementById('nav-btn-home').addEventListener('click', () => {
  navigateTo('dashboard');
});

document.getElementById('nav-btn-market').addEventListener('click', () => {
  navigateTo('market');
});

document.getElementById('nav-btn-role-action').addEventListener('click', () => {
  if (state.currentRole === 'FARMER') {
    if (!state.loggedInUser) {
      navigateTo('login', 'FARMER');
    } else {
      navigateTo('wallet');
    }
  } else {
    navigateTo('cart');
  }
});

document.getElementById('nav-btn-account').addEventListener('click', () => {
  navigateTo('account');
});

document.getElementById('btn-reset-demo').addEventListener('click', () => {
  clearAuthCookie('agross_auth_session');
  state.currentScreen = 'dashboard';
  state.currentRole = 'CUSTOMER';
  state.loggedInUser = null;
  state.loggedInUserObj = null;
  state.cart = [];
  state.selectedCategory = '1';
  state.marketCategory = '1';
  state.searchQuery = '';
  state.marketSearch = '';
  state.activeBill = null;
  state.farmerWithdrawnAmount = 0;
  state.farmerPendingWithdrawal = 0;
  renderApp();
  showToast('Session reset to default');
});

// Update live clock
function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');
  const clock = document.getElementById('status-time');
  if (clock) clock.innerText = `${hours}:${mins}`;
}
setInterval(updateClock, 1000);
updateClock();

// Initial Start with DOM Ready Guarantee
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}
window.addEventListener('load', renderApp);
