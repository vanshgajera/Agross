package com.agross.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.*
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.agross.app.data.CartItem
import com.agross.app.data.CustomerBill
import com.agross.app.data.MockDataProvider
import com.agross.app.data.Product
import com.agross.app.data.UserRole
import com.agross.app.ui.components.AgrossBottomNav
import com.agross.app.ui.navigation.Screen
import com.agross.app.ui.screens.*
import com.agross.app.ui.theme.AgrossTheme
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AgrossTheme {
                AgrossApp()
            }
        }
    }
}

@OptIn(ExperimentalAnimationApi::class)
@Composable
fun AgrossApp() {
    var currentScreen by remember { mutableStateOf<Screen>(Screen.Dashboard) }
    var currentRole by remember { mutableStateOf(UserRole.CUSTOMER) }
    var loggedInUser by remember { mutableStateOf<String?>(null) }
    
    // Customer Cart State (Starts 100% clean and empty)
    val cartItems = remember {
        mutableStateListOf<CartItem>()
    }

    var customerName by remember { mutableStateOf("Priyank Sharma") }
    var customerPhone by remember { mutableStateOf("9876543210") }
    var deliveryAddress by remember { mutableStateOf("Flat 402, Green Meadows, Ring Road, Surat, Gujarat") }

    val cartCount = cartItems.sumOf { it.quantity }
    val cartTotal = cartItems.sumOf { it.product.price * it.quantity } + if (cartItems.isEmpty() || cartItems.sumOf { it.product.price * it.quantity } >= 500.0) 0.0 else 30.0

    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    var farmerWithdrawnAmount by remember { mutableStateOf(0.0) }
    val payoutsList = remember { mutableStateListOf<PayoutRecord>() }
    val withdrawalsList = remember { mutableStateListOf<com.agross.app.data.WithdrawalRecord>() }

    val currentRoute = when (currentScreen) {
        is Screen.Dashboard -> "dashboard"
        is Screen.Market -> "market"
        is Screen.AddCrop -> "market"
        is Screen.Wallet -> "cart"
        is Screen.Cart -> "cart"
        is Screen.Payment -> "cart"
        is Screen.BillInvoice -> "cart"
        is Screen.EditProfile -> "profile"
        is Screen.Login, is Screen.Register -> "profile"
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        bottomBar = {
            if (currentScreen is Screen.Dashboard || currentScreen is Screen.Market) {
                AgrossBottomNav(
                    currentRoute = currentRoute,
                    currentRole = currentRole,
                    onNavigate = { route ->
                        when (route) {
                            "dashboard" -> currentScreen = Screen.Dashboard
                            "market" -> currentScreen = Screen.Market
                            "cart" -> {
                                if (currentRole == UserRole.FARMER) {
                                    currentScreen = Screen.Wallet
                                } else {
                                    currentScreen = Screen.Cart
                                }
                            }
                            "profile" -> {
                                if (loggedInUser == null) {
                                    currentScreen = Screen.Login(currentRole)
                                }
                            }
                        }
                    },
                    onOpenSellOrCart = {
                        if (currentRole == UserRole.FARMER) {
                            if (loggedInUser == null) {
                                currentScreen = Screen.Login(UserRole.FARMER)
                            } else {
                                currentScreen = Screen.Wallet
                            }
                        } else {
                            currentScreen = Screen.Cart
                        }
                    }
                )
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            AnimatedContent(
                targetState = currentScreen,
                label = "ScreenTransition"
            ) { screen ->
                when (screen) {
                    is Screen.Dashboard -> {
                        DashboardScreen(
                            currentRole = currentRole,
                            loggedInUser = loggedInUser,
                            cartCount = cartCount,
                            onNavigateToLogin = { role ->
                                currentScreen = Screen.Login(role)
                            },
                            onNavigateToRegister = { role ->
                                currentScreen = Screen.Register(role)
                            },
                            onLogout = {
                                loggedInUser = null
                            },
                            onRoleToggle = {
                                currentRole = if (currentRole == UserRole.FARMER) UserRole.CUSTOMER else UserRole.FARMER
                            },
                            onAddToCart = { product ->
                                val existing = cartItems.find { it.product.id == product.id }
                                if (existing != null) {
                                    existing.quantity++
                                } else {
                                    cartItems.add(CartItem(product, 1))
                                }
                                scope.launch {
                                    snackbarHostState.showSnackbar("Added ${product.name} to cart")
                                }
                            },
                            onProductClick = { product ->
                                currentScreen = Screen.Market
                            }
                        )
                    }

                    is Screen.Market -> {
                        MarketScreen(
                            currentRole = currentRole,
                            loggedInUser = loggedInUser,
                            cartCount = cartCount,
                            cartTotal = cartTotal,
                            onNavigateToHome = { currentScreen = Screen.Dashboard },
                            onNavigateToCart = { currentScreen = Screen.Cart },
                            onNavigateToLogin = { role -> currentScreen = Screen.Login(role) },
                            onNavigateToRegister = { role -> currentScreen = Screen.Register(role) },
                            onLogout = { loggedInUser = null },
                            onAddToCart = { product ->
                                val existing = cartItems.find { it.product.id == product.id }
                                if (existing != null) {
                                    existing.quantity++
                                } else {
                                    cartItems.add(CartItem(product, 1))
                                }
                                scope.launch {
                                    snackbarHostState.showSnackbar("Added ${product.name} to basket")
                                }
                            },
                            onProductClick = { product -> },
                            onNavigateToAddCrop = { currentScreen = Screen.AddCrop },
                            onEditProduct = { product -> currentScreen = Screen.EditCrop(product) },
                            onDeleteProduct = { product ->
                                allProducts.removeAll { it.id == product.id }
                                scope.launch {
                                    snackbarHostState.showSnackbar("Removed ${product.name}")
                                }
                            }
                        )
                    }

                    is Screen.AddCrop -> {
                        AddCropScreen(
                            farmerName = loggedInUser ?: "Farmer",
                            farmName = "Gajera Organic Farms",
                            farmLocation = "Surat Branch, Gujarat",
                            editingProduct = null,
                            onNavigateBack = { currentScreen = Screen.Market },
                            onCropPublished = { newProduct ->
                                allProducts.add(0, newProduct)
                                currentScreen = Screen.Market
                                scope.launch {
                                    snackbarHostState.showSnackbar("🌱 Published ${newProduct.name} to catalog")
                                }
                            }
                        )
                    }

                    is Screen.EditCrop -> {
                        AddCropScreen(
                            farmerName = loggedInUser ?: "Farmer",
                            farmName = "Gajera Organic Farms",
                            farmLocation = "Surat Branch, Gujarat",
                            editingProduct = screen.product,
                            onNavigateBack = { currentScreen = Screen.Market },
                            onCropPublished = { updatedProduct ->
                                val idx = allProducts.indexOfFirst { it.id == updatedProduct.id }
                                if (idx != -1) {
                                    allProducts[idx] = updatedProduct
                                }
                                currentScreen = Screen.Market
                                scope.launch {
                                    snackbarHostState.showSnackbar("✅ Updated ${updatedProduct.name}")
                                }
                            }
                        )
                    }

                    is Screen.Cart -> {
                        CartScreen(
                            cartItems = cartItems,
                            customerName = customerName,
                            customerPhone = customerPhone,
                            deliveryAddress = deliveryAddress,
                            onNavigateBack = { currentScreen = Screen.Market },
                            onUpdateQuantity = { prodId, delta ->
                                val item = cartItems.find { it.product.id == prodId }
                                if (item != null) {
                                    item.quantity += delta
                                    if (item.quantity <= 0) {
                                        cartItems.remove(item)
                                    }
                                }
                            },
                            onRemoveItem = { prodId ->
                                cartItems.removeAll { it.product.id == prodId }
                            },
                            onProceedToPayment = { name, phone, addr ->
                                customerName = name
                                customerPhone = phone
                                deliveryAddress = addr
                                currentScreen = Screen.Payment
                            },
                            onExploreMarket = { currentScreen = Screen.Market }
                        )
                    }

                    is Screen.Payment -> {
                        PaymentScreen(
                            cartItems = cartItems.toList(),
                            customerName = customerName,
                            customerPhone = customerPhone,
                            deliveryAddress = deliveryAddress,
                            onNavigateBack = { currentScreen = Screen.Cart },
                            onPaymentSuccess = { bill ->
                                cartItems.clear()
                                // When customer buys product -> add as Pending payout for farmer
                                val newPayout = com.agross.app.data.PayoutRecord(
                                    id = "PAY-${(1000..9999).random()}",
                                    farmer = bill.farmerName,
                                    farmName = bill.farmName,
                                    bankUpi = "Gajera@oksbi",
                                    billId = bill.id,
                                    netAmount = bill.subtotal,
                                    status = "Pending",
                                    date = bill.date
                                )
                                payoutsList.add(0, newPayout)
                                currentScreen = Screen.BillInvoice(bill)
                            }
                        )
                    }

                    is Screen.Wallet -> {
                        WalletScreen(
                            farmerName = loggedInUser ?: "vans gajere",
                            farmName = "Gajera Organic Farms",
                            bankUpi = "Gajera@oksbi",
                            payouts = payoutsList.toList(),
                            withdrawals = withdrawalsList.toList(),
                            farmerProducts = allProducts.filter { it.farmerName.equals(loggedInUser ?: "", ignoreCase = true) },
                            withdrawnAmount = farmerWithdrawnAmount,
                            onWithdrawAll = { withdrawAmt ->
                                val settledTotal = payoutsList.filter { it.status.equals("Settled", ignoreCase = true) }.sumOf { it.netAmount }
                                farmerWithdrawnAmount = settledTotal
                                val newWth = com.agross.app.data.WithdrawalRecord(
                                    id = "WTH-${(1000..9999).random()}",
                                    farmer = loggedInUser ?: "vans gajere",
                                    amount = withdrawAmt,
                                    bankUpi = "Gajera@oksbi",
                                    status = "Completed",
                                    date = java.text.SimpleDateFormat("yyyy-MM-dd HH:mm", java.util.Locale.getDefault()).format(java.util.Date())
                                )
                                withdrawalsList.add(0, newWth)
                                scope.launch {
                                    snackbarHostState.showSnackbar("💸 ₹${String.format("%.2f", withdrawAmt)} withdrawn to bank! Available balance is now ₹0.00.")
                                }
                            },
                            onNavigateBack = { currentScreen = Screen.Dashboard },
                            onNavigateToAddCrop = { currentScreen = Screen.AddCrop }
                        )
                    }

                    is Screen.BillInvoice -> {
                        BillInvoiceScreen(
                            bill = screen.bill,
                            onNavigateToMarket = { currentScreen = Screen.Market },
                            onNavigateToHome = { currentScreen = Screen.Dashboard }
                        )
                    }

                    is Screen.EditProfile -> {
                        EditProfileScreen(
                            currentRole = currentRole,
                            initialName = if (currentRole == UserRole.FARMER) (loggedInUser ?: "Anash Retiwala") else (loggedInUser ?: "urvish  jivani"),
                            initialPhone = if (currentRole == UserRole.FARMER) "9090909090" else "9878979890",
                            initialEmail = if (currentRole == UserRole.FARMER) "anasretiwala@gmail.com" else "urvishjivani@gmail.com",
                            initialAddressOrFarm = if (currentRole == UserRole.FARMER) "AR Organic" else deliveryAddress,
                            initialUpi = "Anas@oksbi",
                            onBack = { currentScreen = Screen.Dashboard },
                            onSave = { updatedName, updatedPhone, updatedEmail, updatedAddr, updatedUpi ->
                                loggedInUser = updatedName
                                customerName = updatedName
                                customerPhone = updatedPhone
                                deliveryAddress = updatedAddr
                                scope.launch {
                                    snackbarHostState.showSnackbar("✅ Profile updated successfully!")
                                }
                                currentScreen = Screen.Dashboard
                            }
                        )
                    }

                    is Screen.Login -> {
                        LoginScreen(
                            initialRole = screen.defaultRole,
                            onNavigateBack = {
                                currentScreen = Screen.Dashboard
                            },
                            onNavigateToRegister = { role ->
                                currentScreen = Screen.Register(role)
                            },
                            onLoginSuccess = { username, role ->
                                loggedInUser = username
                                currentRole = role
                                customerName = username
                                currentScreen = Screen.Dashboard
                            }
                        )
                    }

                    is Screen.Register -> {
                        RegisterScreen(
                            initialRole = screen.defaultRole,
                            onNavigateBack = {
                                currentScreen = Screen.Dashboard
                            },
                            onNavigateToLogin = { role ->
                                currentScreen = Screen.Login(role)
                            },
                            onRegisterSuccess = { newAccount ->
                                currentRole = newAccount.role
                                currentScreen = Screen.Login(newAccount.role)
                            }
                        )
                    }
                }
            }
        }
    }
}
