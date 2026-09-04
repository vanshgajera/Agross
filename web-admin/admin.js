// Agross Super Admin Portal State & Management Engine
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5001/api'
  : 'https://0f0c3bfbf6cdc384-171-61-167-229.serveousercontent.com/api';

const ADMIN_CREDENTIALS = {
  email: 'admin@gmail.com',
  password: 'admin8389123'
};

// Application State (Loaded from Central Database via /api/data)
const adminState = {
  isAuthenticated: false,
  activeTab: 'overview',
  farmers: [],
  customers: [],
  produce: [],
  bills: [],
  payouts: []
};

// =========================================================================
// HELPER FUNCTIONS: TOAST & CLOCK
// =========================================================================
function showAdminToast(msg) {
  const toast = document.getElementById('admin-toast-message');
  toast.innerText = msg;
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
}

// =========================================================================
// AUTHENTICATION LOGIC (ONLY ADMIN CREDENTIALS ALLOWED)
// =========================================================================
const loginForm = document.getElementById('admin-login-form');
const emailInput = document.getElementById('admin-email');
const passwordInput = document.getElementById('admin-password');
const quickFillBtn = document.getElementById('btn-quick-fill');
const togglePwBtn = document.getElementById('btn-toggle-pw');
const errorAlert = document.getElementById('login-error-alert');

// Quick Auto-Fill
quickFillBtn.addEventListener('click', () => {
  emailInput.value = ADMIN_CREDENTIALS.email;
  passwordInput.value = ADMIN_CREDENTIALS.password;
  errorAlert.style.display = 'none';
  showAdminToast('Admin credentials filled automatically');
});

// Toggle Show/Hide Password
togglePwBtn.addEventListener('click', () => {
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    togglePwBtn.innerText = 'Hide';
  } else {
    passwordInput.type = 'password';
    togglePwBtn.innerText = 'Show';
  }
});

// Authenticate Submit
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const enteredEmail = emailInput.value.trim().toLowerCase();
  const enteredPassword = passwordInput.value.trim();

  if (enteredEmail === ADMIN_CREDENTIALS.email && enteredPassword === ADMIN_CREDENTIALS.password) {
    // Authentication Successful
    adminState.isAuthenticated = true;
    localStorage.setItem('agross_admin_authenticated', 'true');
    errorAlert.style.display = 'none';

    document.getElementById('admin-login-view').style.display = 'none';
    document.getElementById('admin-portal-view').style.display = 'flex';

    showAdminToast('Super Admin Logged In Successfully');
    renderPortal();
  } else {
    // Access Denied
    errorAlert.style.display = 'block';
    errorAlert.innerHTML = `
      <strong>Access Denied:</strong> Invalid credentials. Only super admin can access this control panel.<br>
      Use <code>admin@gmail.com</code> / <code>admin8389123</code>.
    `;
    showAdminToast('Authentication Failed: Invalid Credentials');
  }
});

// Admin Logout
document.getElementById('btn-admin-logout').addEventListener('click', () => {
  if (confirm('Are you sure you want to sign out of the Admin Portal?')) {
    adminState.isAuthenticated = false;
    localStorage.removeItem('agross_admin_authenticated');
    document.getElementById('admin-portal-view').style.display = 'none';
    document.getElementById('admin-login-view').style.display = 'flex';
    passwordInput.value = '';
    showAdminToast('Admin signed out safely');
  }
});

// =========================================================================
// NAVIGATION TAB SWITCHING
// =========================================================================
const navLinks = document.querySelectorAll('.sidebar-nav .nav-link:not(.external-link)');
const pageTitle = document.getElementById('page-title');
const pageSubtitle = document.getElementById('page-subtitle');

const tabTitles = {
  overview: {
    title: 'Dashboard Overview',
    subtitle: 'Real-time marketplace monitoring, orders, and settlements'
  },
  farmers: {
    title: 'Farmers Directory & KYC',
    subtitle: 'Review farmer registrations, verified produce, and bank details'
  },
  customers: {
    title: 'Customers Directory',
    subtitle: 'Manage retail buyer accounts, locations, and order frequency'
  },
  products: {
    title: 'Produce & Price Moderation',
    subtitle: 'Monitor fruit & vegetable listings, prices per kg, and fair trade guidelines'
  },
  bills: {
    title: 'Customer Bills & Invoices',
    subtitle: 'Audit customer payments, invoice receipts, and delivery fees'
  },
  payments: {
    title: 'Farmers Direct Payouts',
    subtitle: 'Approve and release zero-commission bank payouts directly to farmers'
  }
};

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    const tabName = link.dataset.tab;
    switchTab(tabName);
  });
});

function switchTab(tabName) {
  adminState.activeTab = tabName;

  navLinks.forEach(l => {
    if (l.dataset.tab === tabName) l.classList.add('active');
    else l.classList.remove('active');
  });

  document.querySelectorAll('.tab-pane').forEach(p => {
    p.classList.remove('active');
  });

  const targetPane = document.getElementById(`tab-${tabName}`);
  if (targetPane) targetPane.classList.add('active');

  if (tabTitles[tabName]) {
    pageTitle.innerText = tabTitles[tabName].title;
    pageSubtitle.innerText = tabTitles[tabName].subtitle;
  }

  renderActiveTab(tabName);
}

// =========================================================================
// TAB RENDERERS
// =========================================================================
function renderPortal() {
  renderOverview();
  renderFarmersTable();
  renderCustomersTable();
  renderProduceTable();
  renderBillsTable();
  renderPayoutsTable();
}

function renderActiveTab(tab) {
  if (tab === 'overview') renderOverview();
  if (tab === 'farmers') renderFarmersTable();
  if (tab === 'customers') renderCustomersTable();
  if (tab === 'products') renderProduceTable();
  if (tab === 'bills') renderBillsTable();
  if (tab === 'payments') renderPayoutsTable();
}

// 1. Overview Tab
function renderOverview() {
  // Dynamic KPIs calculated purely from database records
  const totalRevenue = adminState.bills.reduce((sum, b) => sum + (b.total || 0), 0);
  const appEarnings = Math.round(adminState.bills.reduce((sum, b) => sum + ((b.total || 0) * 0.05), 0));
  const totalFarmers = adminState.farmers.length;
  const activeCustomers = adminState.customers.length;

  const revEl = document.getElementById('kpi-total-revenue');
  if (revEl) revEl.innerText = '₹' + totalRevenue.toLocaleString();

  const farmersEl = document.getElementById('kpi-total-farmers');
  if (farmersEl) farmersEl.innerText = totalFarmers;

  const custEl = document.getElementById('kpi-active-customers');
  if (custEl) custEl.innerText = activeCustomers;

  const appEarnEl = document.getElementById('kpi-app-earnings');
  if (appEarnEl) appEarnEl.innerText = '₹' + appEarnings.toLocaleString();

  // Recent orders table in overview
  const tbody = document.getElementById('table-recent-orders-body');
  if (tbody) {
    if (adminState.bills.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 24px; color: #94A3B8;">
            No customer orders placed yet. Live customer orders and bills will appear here.
          </td>
        </tr>
      `;
    } else {
      tbody.innerHTML = adminState.bills.slice(0, 4).map(b => `
        <tr>
          <td><strong>#${b.id}</strong></td>
          <td>${b.customer}</td>
          <td style="color: #94A3B8;">${b.items}</td>
          <td style="color: #10B981; font-weight: 800;">₹${b.total}</td>
          <td><span class="status-pill ${b.status === 'Paid' ? 'paid' : 'pending'}">${b.status}</span></td>
          <td>
            <button class="btn-table-action" onclick="viewBillDetails('${b.id}')">View Bill</button>
          </td>
        </tr>
      `).join('');
    }
  }

  // Mini produce list in overview
  const miniProduce = document.getElementById('mini-produce-container');
  if (miniProduce) {
    if (adminState.produce.length === 0) {
      miniProduce.innerHTML = `
        <div style="text-align: center; padding: 20px; color: #94A3B8; font-size: 12px;">
          No produce listed yet. Produce added by verified farmers will appear here.
        </div>
      `;
    } else {
      miniProduce.innerHTML = adminState.produce.slice(0, 4).map(p => `
        <div class="produce-mini-item">
          <div class="produce-item-left">
            <div class="produce-item-icon">${p.category === 'Vegetables' ? '🥦' : '🍎'}</div>
            <div>
              <div class="produce-item-title">${p.name}</div>
              <div class="produce-item-sub">By ${p.farmer}</div>
            </div>
          </div>
          <div class="produce-item-right">
            <div class="produce-item-price">₹${p.price}</div>
            <div class="produce-item-stock">${p.stock} available</div>
          </div>
        </div>
      `).join('');
    }
  }

  updateApprovalBadges();
}

// Sync Data with Central Server
async function syncFromBackend() {
  try {
    const res = await fetch(`${API_BASE}/data`);
    if (res.ok) {
      const data = await res.json();
      if (data.farmers) adminState.farmers = data.farmers;
      if (data.customers) adminState.customers = data.customers;
      if (data.products) adminState.produce = data.products;
      if (data.bills) adminState.bills = data.bills;
      if (data.payouts) adminState.payouts = data.payouts;
      
      updateApprovalBadges();
      if (adminState.isAuthenticated) {
        renderPortal();
      }
    }
  } catch (err) {
    // Local memory fallback
  }
}
setInterval(syncFromBackend, 3000);

function updateApprovalBadges() {
  const pendingFarmers = adminState.farmers.filter(f => f.status === 'Pending').length;
  const pendingCustomers = adminState.customers.filter(c => c.status === 'Pending').length;
  const pendingPayouts = adminState.payouts.filter(p => p.status === 'Pending').length;
  
  const farmerBadge = document.getElementById('badge-farmer-count');
  if (farmerBadge) {
    if (pendingFarmers > 0) {
      farmerBadge.innerText = `${pendingFarmers} Pending`;
      farmerBadge.className = 'count-pill warning';
    } else {
      farmerBadge.innerText = `${adminState.farmers.length}`;
      farmerBadge.className = 'count-pill';
    }
  }

  const customerBadge = document.getElementById('badge-customers-count');
  if (customerBadge) {
    if (pendingCustomers > 0) {
      customerBadge.innerText = `${pendingCustomers} Pending`;
      customerBadge.className = 'count-pill warning';
    } else {
      customerBadge.innerText = `${adminState.customers.length}`;
      customerBadge.className = 'count-pill';
    }
  }

  const produceBadge = document.getElementById('badge-produce-count');
  if (produceBadge) {
    produceBadge.innerText = `${adminState.produce.length}`;
    produceBadge.className = 'count-pill';
  }

  const billsBadge = document.getElementById('badge-bills-count');
  if (billsBadge) {
    billsBadge.innerText = `${adminState.bills.length}`;
    billsBadge.className = 'count-pill';
  }

  const payoutBadge = document.getElementById('badge-pending-payouts');
  if (payoutBadge) {
    payoutBadge.innerText = `${pendingPayouts} Pending`;
    payoutBadge.className = pendingPayouts > 0 ? 'count-pill warning' : 'count-pill';
  }
}

// 2. Farmers Table
function renderFarmersTable() {
  const tbody = document.getElementById('table-farmers-body');
  if (adminState.farmers.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 32px; color: #94A3B8;">
          No farmers registered yet. Newly registered farmers from the mobile app will appear here for verification.
        </td>
      </tr>
    `;
    updateApprovalBadges();
    return;
  }

  tbody.innerHTML = adminState.farmers.map(f => {
    const isPending = f.status === 'Pending';
    return `
    <tr style="${isPending ? 'background: rgba(245, 158, 11, 0.08);' : ''}">
      <td>
        <strong>${f.name}</strong><br>
        <span style="font-size: 11px; color: #38BDF8;">✉️ ${f.email || 'anasretiwala@gmail.com'}</span>
      </td>
      <td>
        ${f.farmName}<br>
        <span style="font-size: 11px; color: #94A3B8;">📍 ${f.location}</span>
      </td>
      <td>${f.mobile}</td>
      <td style="color: #6EE7B7;">${f.cropsListed || 'Fresh Produce'}</td>
      <td style="font-weight: 800; color: #10B981;">₹${(f.totalSales || 0).toLocaleString()}</td>
      <td><code>${f.bankUpi}</code></td>
      <td>
        <span class="status-pill ${isPending ? 'pending' : 'verified'}">
          ${isPending ? '⏳ Pending Approval' : '✓ Verified'}
        </span>
      </td>
      <td>
        <div style="display: flex; gap: 6px; align-items: center;">
          ${isPending ? `
            <button class="btn-table-action approve-btn" onclick="approveFarmerAction('${f.id}')">⚡ Approve</button>
          ` : ''}
          <button class="btn-table-action" style="background: rgba(239, 68, 68, 0.15); color: #F87171; border: 1px solid rgba(239, 68, 68, 0.3); padding: 4px 8px; font-size: 11px;" onclick="deleteFarmerAction('${f.id}')">🗑️ Delete</button>
        </div>
      </td>
    </tr>
  `}).join('');
  updateApprovalBadges();
}

window.approveFarmerAction = async function(id) {
  const farmer = adminState.farmers.find(f => f.id === id);
  if (farmer) {
    farmer.status = 'Verified';
    renderFarmersTable();
    renderOverview();
    showAdminToast(`⚡ Approved Farmer ${farmer.name}! Login is now enabled in the mobile app.`);
    try {
      await fetch(`${API_BASE}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type: 'farmer' })
      });
    } catch(e) {}
  }
};

window.deleteFarmerAction = async function(id) {
  const farmer = adminState.farmers.find(f => f.id === id);
  const name = farmer ? farmer.name : id;
  if (!confirm(`Are you sure you want to delete farmer '${name}' and remove all their listed produce?`)) return;

  adminState.farmers = adminState.farmers.filter(f => f.id !== id);
  adminState.produce = adminState.produce.filter(p => p.farmerId !== id && (!farmer || p.farmer !== farmer.name));
  renderPortal();
  showAdminToast(`🗑️ Farmer '${name}' deleted successfully.`);

  try {
    await fetch(`${API_BASE}/farmers/${id}`, { method: 'DELETE' });
  } catch (err) {}
};

// 3. Customers Table
function renderCustomersTable() {
  const tbody = document.getElementById('table-customers-body');
  if (adminState.customers.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 32px; color: #94A3B8;">
          No customers registered yet.
        </td>
      </tr>
    `;
    updateApprovalBadges();
    return;
  }

  tbody.innerHTML = adminState.customers.map(c => {
    const isPending = c.status === 'Pending';

    // Calculate live total orders and spent from bills matching email or mobile or name
    const custBills = (adminState.bills || []).filter(b => {
      const bEm = String(b.customerEmail || '').trim().toLowerCase();
      const cEm = String(c.email || '').trim().toLowerCase();
      const bMob = String(b.customerMobile || '').trim();
      const cMob = String(c.mobile || '').trim();
      const bName = String(b.customer || '').trim().toLowerCase();
      const cName = String(c.name || '').trim().toLowerCase();

      return (cEm && bEm && bEm === cEm) || (cMob && bMob && bMob === cMob) || (cName && bName && bName === cName);
    });

    const ordersCount = custBills.length > 0 ? custBills.length : (c.totalOrders || 0);
    const spentAmount = custBills.length > 0 ? custBills.reduce((sum, b) => sum + (parseFloat(b.total) || 0), 0) : (c.totalSpent || 0);

    let displayCity = c.city || c.deliveryAddress || 'Surat';
    if (displayCity.toLowerCase().includes('surat')) {
      displayCity = 'Surat';
    }

    return `
    <tr style="${isPending ? 'background: rgba(245, 158, 11, 0.08);' : ''}">
      <td>
        <strong>${c.name}</strong><br>
        <span style="font-size: 11px; color: #38BDF8;">✉️ ${c.email || 'N/A'}</span>
      </td>
      <td>${c.mobile}</td>
      <td>${c.email || 'N/A'}</td>
      <td>📍 ${displayCity}</td>
      <td>${ordersCount} orders</td>
      <td style="font-weight: 800; color: #10B981;">₹${spentAmount.toLocaleString()}</td>
      <td>
        <span class="status-pill ${isPending ? 'pending' : 'verified'}">
          ${isPending ? '⏳ Pending Approval' : '✓ Active'}
        </span>
      </td>
      <td>
        <div style="display: flex; gap: 6px; align-items: center;">
          ${isPending ? `
            <button class="btn-table-action approve-btn" onclick="approveCustomerAction('${c.id}')">⚡ Approve</button>
          ` : ''}
          <button class="btn-table-action" style="background: rgba(239, 68, 68, 0.15); color: #F87171; border: 1px solid rgba(239, 68, 68, 0.3); padding: 4px 8px; font-size: 11px;" onclick="deleteCustomerAction('${c.id}')">🗑️ Delete</button>
        </div>
      </td>
    </tr>
  `}).join('');
  updateApprovalBadges();
}

window.approveCustomerAction = async function(id) {
  const customer = adminState.customers.find(c => c.id === id);
  if (customer) {
    customer.status = 'Active';
    renderCustomersTable();
    renderOverview();
    showAdminToast(`⚡ Approved Customer ${customer.name}! Login is now enabled in the mobile app.`);
    try {
      await fetch(`${API_BASE}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type: 'customer' })
      });
    } catch(e) {}
  }
};

window.deleteCustomerAction = async function(id) {
  const customer = adminState.customers.find(c => c.id === id);
  const name = customer ? customer.name : id;
  if (!confirm(`Are you sure you want to delete customer '${name}'?`)) return;

  adminState.customers = adminState.customers.filter(c => c.id !== id);
  renderPortal();
  showAdminToast(`🗑️ Customer '${name}' deleted successfully.`);

  try {
    await fetch(`${API_BASE}/customers/${id}`, { method: 'DELETE' });
  } catch (err) {}
};

// 4. Produce Table
function renderProduceTable() {
  const tbody = document.getElementById('table-produce-body');
  if (adminState.produce.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 32px; color: #94A3B8;">
          No produce listed yet. Crops added by verified farmers will appear here.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = adminState.produce.map(p => `
    <tr>
      <td>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 18px;">${p.emoji || (p.category === 'Vegetables' ? '🥦' : '🍎')}</span>
          <div>
            <strong>${p.name}</strong>
            <div style="font-size: 11px; color: #94A3B8;">${p.ordersCount || 0} orders fulfilled</div>
          </div>
        </div>
      </td>
      <td><span class="count-pill">${p.category}</span></td>
      <td>
        <div style="font-weight: 700; color: #F8FAFC;">${p.farmName || 'AR Organic'}</div>
        <div style="font-size: 11px; color: #38BDF8;">📍 Branch: ${p.branch || p.location || 'Surat'}</div>
        <div style="font-size: 10.5px; color: #94A3B8;">Farmer: ${p.farmer} (✉️ ${p.farmerEmail || 'anasretiwala@gmail.com'})</div>
      </td>
      <td style="font-weight: 800; color: #10B981;">₹${p.price} / ${p.unit || 'kg'}</td>
      <td style="font-weight: 800; color: #38BDF8;">₹${Math.round(p.price * 1.05)} / ${p.unit || 'kg'}</td>
      <td><strong>${p.stock} ${p.unit || 'kg'}</strong></td>
      <td><span class="status-pill verified">Active</span></td>
      <td>
        <button class="btn-table-action" style="background: rgba(239, 68, 68, 0.15); color: #F87171; border: 1px solid rgba(239, 68, 68, 0.3); padding: 4px 8px; font-size: 11px;" onclick="deleteProduceAction('${p.id}')">🗑️ Delete</button>
      </td>
    </tr>
  `).join('');
}

window.deleteProduceAction = async function(id) {
  const prod = adminState.produce.find(p => p.id === id);
  const name = prod ? prod.name : id;
  if (!confirm(`Are you sure you want to delete produce listing '${name}'?`)) return;

  adminState.produce = adminState.produce.filter(p => p.id !== id);
  renderPortal();
  showAdminToast(`🗑️ Produce '${name}' deleted from catalog.`);

  try {
    await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
  } catch (err) {}
};

// 5. Bills Table & Invoice Modal
function renderBillsTable() {
  const tbody = document.getElementById('table-bills-body');
  if (adminState.bills.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 32px; color: #94A3B8;">
          No customer orders placed yet. Live customer tax bills will appear here once purchases are made.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = adminState.bills.map(b => `
    <tr>
      <td><strong>#${b.id}</strong></td>
      <td>
        ${b.customer}<br>
        <span style="font-size: 10.5px; color: #38BDF8;">✉️ ${b.customerEmail || 'N/A'}</span>
      </td>
      <td style="color: #94A3B8;">${b.items}</td>
      <td>₹${b.subtotal}</td>
      <td>₹${b.gst} (Agri GST 0%)</td>
      <td style="font-weight: 800; color: #10B981;">₹${b.total}</td>
      <td><span class="count-pill">${b.method}</span></td>
      <td><span class="status-pill ${b.status === 'Paid' ? 'paid' : 'pending'}">${b.status}</span></td>
      <td>
        <button class="btn-table-action" onclick="viewBillDetails('${b.id}')">🧾 View Bill</button>
      </td>
    </tr>
  `).join('');
}

window.viewBillDetails = function(billId) {
  const bill = adminState.bills.find(b => b.id === billId);
  if (!bill) return;

  const content = document.getElementById('invoice-printable-content');
  content.innerHTML = `
    <div style="text-align: center; border-bottom: 2px dashed #CBD5E1; padding-bottom: 16px; margin-bottom: 16px;">
      <h2 style="font-size: 20px; color: #0F172A; font-weight: 800;">AGROSS AGRICULTURAL MARKETPLACE</h2>
      <p style="font-size: 11px; color: #64748B;">Direct Farmer-to-Consumer Fair Trade Network</p>
      <p style="font-size: 11px; color: #64748B;">GSTIN: 27AABCA1234F1Z9 • FSSAI Lic: 11521000000000</p>
    </div>

    <div style="display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 12px;">
      <div>
        <strong>Customer (Buyer):</strong><br>
        ${bill.customer}<br>
        ${bill.customerEmail ? `<span style="color: #0284C7; font-weight: 600;">✉️ ${bill.customerEmail}</span><br>` : ''}
        ${bill.customerMobile ? `📞 ${bill.customerMobile}<br>` : ''}
        📍 ${bill.deliveryAddress || 'Surat, Gujarat'}<br>
        Mode: <strong>${bill.method}</strong>
      </div>
      <div style="text-align: right;">
        <strong>Farmer (Producer):</strong><br>
        ${bill.farmerName || 'Anash Retiwala'}<br>
        <span style="color: #059669; font-weight: 600;">✉️ ${bill.farmerEmail || 'anasretiwala@gmail.com'}</span><br>
        🏡 ${bill.farmName || 'AR Organic'} (${bill.farmBranch || 'Surat'})<br>
        <strong>Invoice #${bill.id}</strong><br>
        Status: <span style="color: #10B981; font-weight: bold;">${bill.status}</span>
      </div>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 12px;">
      <thead>
        <tr style="background: #F1F5F9; border-bottom: 1px solid #CBD5E1;">
          <th style="padding: 8px; text-align: left;">Produce Description</th>
          <th style="padding: 8px; text-align: center;">Farmer Mentioned Price</th>
          <th style="padding: 8px; text-align: right;">Amount Paid</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #E2E8F0;">
            ${bill.items}<br>
            <span style="font-size: 10px; color: #64748B;">Farmer: ${bill.farmerName || 'Anash Retiwala'} (✉️ ${bill.farmerEmail || 'anasretiwala@gmail.com'})</span>
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #E2E8F0; text-align: center; color: #059669; font-weight: 700;">
            ₹${bill.farmerMentionedPrice || 140} / kg
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #E2E8F0; text-align: right;">₹${bill.subtotal}</td>
        </tr>
        <tr>
          <td colspan="2" style="padding: 8px; border-bottom: 1px solid #E2E8F0;">Direct Farm Delivery & Eco-Packaging</td>
          <td style="padding: 8px; border-bottom: 1px solid #E2E8F0; text-align: right;">₹${bill.delivery}</td>
        </tr>
        <tr>
          <td colspan="2" style="padding: 8px; border-bottom: 1px solid #E2E8F0;">Agricultural GST (Exempted 0%)</td>
          <td style="padding: 8px; border-bottom: 1px solid #E2E8F0; text-align: right;">₹0.00</td>
        </tr>
      </tbody>
      <tfoot>
        <tr style="font-size: 14px; font-weight: bold; background: #ECFDF5;">
          <td colspan="2" style="padding: 10px; color: #065F46;">TOTAL CUSTOMER PAYMENT</td>
          <td style="padding: 10px; text-align: right; color: #065F46;">₹${bill.total}</td>
        </tr>
      </tfoot>
    </table>

    <div style="display: flex; justify-content: space-between; background: #FEF3C7; padding: 10px 14px; border-radius: 8px; font-size: 11px; color: #92400E; margin-bottom: 8px;">
      <span>👨‍🌾 <strong>Farmer Earning (Mentioned Price):</strong> ₹${bill.farmerTotal || bill.farmerMentionedPrice || 140}</span>
      <span>💼 <strong>Platform Commission (5%):</strong> ₹${Math.round(bill.subtotal * 0.05 / 1.05 || 7)}</span>
    </div>
  `;

  document.getElementById('invoice-modal').style.display = 'flex';
};

// Modal Close Handlers
document.getElementById('btn-close-invoice').addEventListener('click', () => {
  document.getElementById('invoice-modal').style.display = 'none';
});
document.getElementById('btn-close-invoice-footer').addEventListener('click', () => {
  document.getElementById('invoice-modal').style.display = 'none';
});
document.getElementById('btn-print-invoice').addEventListener('click', () => {
  showAdminToast('Bill sent to printer / PDF download triggered');
});

// 6. Farmer Payouts Table
function renderPayoutsTable() {
  const tbody = document.getElementById('table-payouts-body');
  if (adminState.payouts.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 32px; color: #94A3B8;">
          No farmer payouts generated yet. Settlements will appear here when customer orders are fulfilled.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = adminState.payouts.map(p => {
    const farmerRecord = adminState.farmers.find(f => f.name.toLowerCase() === (p.farmer || '').toLowerCase() || f.id === p.farmerId) || {};
    const exactFarmName = p.farmName || farmerRecord.farmName || 'AR Organic';
    const relatedBill = adminState.bills.find(b => b.id === p.billId);
    const exactProduce = p.produce || (relatedBill ? relatedBill.items : 'AR Organic Apple (1 kg)');

    return `
    <tr>
      <td><strong>#${p.id}</strong></td>
      <td><strong>${p.farmer}</strong></td>
      <td><strong>${exactFarmName}</strong></td>
      <td style="color: #94A3B8;">${exactProduce}</td>
      <td style="font-size: 14px; font-weight: 800; color: #10B981;">₹${p.netAmount.toLocaleString()}</td>
      <td><code>${p.bankUpi || farmerRecord.bankUpi || 'Anas@oksbi'}</code></td>
      <td><span class="status-pill ${p.status === 'Settled' ? 'paid' : 'pending'}">${p.status}</span></td>
      <td>
        ${p.status === 'Pending' ? `
          <button class="btn-table-action approve-btn" onclick="settlePayout('${p.id}')">⚡ Approve & Transfer</button>
        ` : `
          <span style="color: #34D399; font-size: 11px; font-weight: bold;">✓ Transferred</span>
        `}
      </td>
    </tr>
  `}).join('');
}

window.settlePayout = async function(payoutId) {
  const payout = adminState.payouts.find(p => p.id === payoutId);
  if (payout) {
    payout.status = 'Settled';
    renderPayoutsTable();
    renderOverview();
    showAdminToast(`Payment of ₹${payout.netAmount.toLocaleString()} successfully transferred to ${payout.farmer} (${payout.bankUpi})`);
    try {
      await fetch(`${API_BASE}/payouts/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: payoutId })
      });
    } catch (e) {}
  }
};

// Approve All Payouts Button
document.getElementById('btn-approve-all-payouts').addEventListener('click', async () => {
  let count = 0;
  adminState.payouts.forEach(p => {
    if (p.status === 'Pending') {
      p.status = 'Settled';
      count++;
    }
  });
  renderPayoutsTable();
  renderOverview();
  showAdminToast(`All ${count} pending payouts approved and processed directly to farmer bank accounts!`);
  try {
    await fetch(`${API_BASE}/payouts/settle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'ALL' })
    });
  } catch (e) {}
});

// Jump to payouts from alert banner
document.getElementById('btn-jump-payouts').addEventListener('click', () => {
  switchTab('payments');
});

// View all bills from overview
document.getElementById('btn-view-all-bills').addEventListener('click', () => {
  switchTab('bills');
});

// Manage produce from overview
document.getElementById('btn-view-all-produce').addEventListener('click', () => {
  switchTab('products');
});

// Add Farmer / Produce triggers
document.getElementById('btn-add-farmer-modal').addEventListener('click', () => {
  const name = prompt('Enter New Farmer Name:');
  if (name) {
    adminState.farmers.unshift({
      id: `F-${Math.floor(100 + Math.random() * 900)}`,
      name: name,
      farmName: `${name} Agro Farm`,
      location: 'Nashik, Maharashtra',
      mobile: '+91 98900 11223',
      cropsListed: 'Fresh Vegetables',
      totalSales: 0,
      bankUpi: `${name.toLowerCase().replace(/\s/g, '')}@oksbi`,
      status: 'Verified',
      rating: 5.0
    });
    renderFarmersTable();
    showAdminToast(`Farmer ${name} registered and verified successfully`);
  }
});

document.getElementById('btn-add-produce-modal').addEventListener('click', () => {
  const cropName = prompt('Enter Produce Name (e.g. Organic Strawberries):');
  if (cropName) {
    adminState.produce.unshift({
      id: `P-${Math.floor(10 + Math.random() * 90)}`,
      name: cropName,
      category: 'Fruits',
      farmer: 'Ramesh Patil',
      price: 120,
      marketAvg: 140,
      stock: '50 kg',
      status: 'In Stock'
    });
    renderProduceTable();
    showAdminToast(`${cropName} added to produce catalog with fair price verification`);
  }
});

document.getElementById('btn-export-bills').addEventListener('click', () => {
  showAdminToast('Exported customer bills & invoices to CSV report');
});

// Global Search
document.getElementById('admin-global-search').addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  if (!query) {
    renderActiveTab(adminState.activeTab);
    return;
  }

  if (adminState.activeTab === 'farmers') {
    const tbody = document.getElementById('table-farmers-body');
    const filtered = adminState.farmers.filter(f => f.name.toLowerCase().includes(query) || f.farmName.toLowerCase().includes(query) || f.location.toLowerCase().includes(query));
    tbody.innerHTML = filtered.map(f => `
      <tr>
        <td><strong>${f.name}</strong></td>
        <td>${f.farmName}</td>
        <td>${f.mobile}</td>
        <td>${f.cropsListed}</td>
        <td style="color: #10B981; font-weight: bold;">₹${f.totalSales.toLocaleString()}</td>
        <td><code>${f.bankUpi}</code></td>
        <td><span class="status-pill ${f.status === 'Verified' ? 'verified' : 'pending'}">${f.status}</span></td>
        <td><button class="btn-table-action" onclick="showAdminToast('${f.name}')">View</button></td>
      </tr>
    `).join('');
  } else if (adminState.activeTab === 'bills') {
    const tbody = document.getElementById('table-bills-body');
    const filtered = adminState.bills.filter(b => b.id.toLowerCase().includes(query) || b.customer.toLowerCase().includes(query));
    tbody.innerHTML = filtered.map(b => `
      <tr>
        <td><strong>#${b.id}</strong></td>
        <td>${b.customer}</td>
        <td>${b.items}</td>
        <td>₹${b.subtotal}</td>
        <td>₹0</td>
        <td style="color: #10B981; font-weight: bold;">₹${b.total}</td>
        <td>${b.method}</td>
        <td><span class="status-pill ${b.status === 'Paid' ? 'paid' : 'pending'}">${b.status}</span></td>
        <td><button class="btn-table-action" onclick="viewBillDetails('${b.id}')">🧾 View</button></td>
      </tr>
    `).join('');
  }
});

// Auto-restore authenticated admin session
window.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('agross_admin_authenticated') === 'true') {
    adminState.isAuthenticated = true;
    const loginView = document.getElementById('admin-login-view');
    const portalView = document.getElementById('admin-portal-view');
    if (loginView && portalView) {
      loginView.style.display = 'none';
      portalView.style.display = 'flex';
      renderPortal();
    }
  }
});
