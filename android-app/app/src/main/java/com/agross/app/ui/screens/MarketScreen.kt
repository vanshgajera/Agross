package com.agross.app.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.agross.app.data.MockDataProvider
import com.agross.app.data.Product
import com.agross.app.data.UserRole
import com.agross.app.ui.components.AgrossTopBar
import com.agross.app.ui.components.ProductCard
import com.agross.app.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MarketScreen(
    currentRole: UserRole,
    loggedInUser: String?,
    cartCount: Int,
    cartTotal: Double,
    onNavigateToHome: () -> Unit,
    onNavigateToCart: () -> Unit,
    onNavigateToLogin: (UserRole) -> Unit,
    onNavigateToRegister: (UserRole) -> Unit,
    onLogout: () -> Unit,
    onAddToCart: (Product) -> Unit,
    onProductClick: (Product) -> Unit,
    onNavigateToAddCrop: () -> Unit = {},
    onEditProduct: (Product) -> Unit = {},
    onDeleteProduct: (Product) -> Unit = {}
) {
    var searchQuery by remember { mutableStateOf("") }
    var selectedCategoryId by remember { mutableStateOf("1") }
    var selectedSort by remember { mutableStateOf("featured") }

    val allProducts = remember { MockDataProvider.featuredProducts }

    val isFarmerMode = currentRole == UserRole.FARMER

    val baseProductsList = remember(allProducts, isFarmerMode, loggedInUser) {
        if (isFarmerMode) {
            if (loggedInUser.isNullOrBlank()) emptyList() else allProducts.filter { it.farmerName.equals(loggedInUser, ignoreCase = true) }
        } else {
            allProducts
        }
    }

    val dynamicCategories = remember(baseProductsList) {
        val vegCount = baseProductsList.count { it.category.contains("veg", ignoreCase = true) }
        val fruitCount = baseProductsList.count { it.category.contains("fruit", ignoreCase = true) }
        val grainCount = baseProductsList.count { it.category.contains("grain", ignoreCase = true) || it.category.contains("pulse", ignoreCase = true) }
        val herbCount = baseProductsList.count { it.category.contains("herb", ignoreCase = true) || it.category.contains("spice", ignoreCase = true) }

        listOf(
            com.agross.app.data.Category("1", "All", "🌱", baseProductsList.size),
            com.agross.app.data.Category("2", "Vegetables", "🥦", vegCount),
            com.agross.app.data.Category("3", "Fruits", "🍎", fruitCount),
            com.agross.app.data.Category("4", "Grains & Pulses", "🌾", grainCount),
            com.agross.app.data.Category("5", "Organic Herbs", "🌿", herbCount)
        )
    }

    val displayedProducts = remember(baseProductsList, searchQuery, selectedCategoryId, selectedSort) {
        val filtered = baseProductsList.filter { product ->
            val matchesCategory = when (selectedCategoryId) {
                "2" -> product.category.contains("veg", ignoreCase = true)
                "3" -> product.category.contains("fruit", ignoreCase = true)
                "4" -> product.category.contains("grain", ignoreCase = true) || product.category.contains("pulse", ignoreCase = true)
                "5" -> product.category.contains("herb", ignoreCase = true) || product.category.contains("spice", ignoreCase = true)
                else -> true
            }
            val matchesSearch = product.name.contains(searchQuery, ignoreCase = true) ||
                    product.farmerName.contains(searchQuery, ignoreCase = true) ||
                    product.location.contains(searchQuery, ignoreCase = true)
            matchesCategory && matchesSearch
        }

        when (selectedSort) {
            "price_asc" -> filtered.sortedBy { it.price }
            "price_desc" -> filtered.sortedByDescending { it.price }
            "rating" -> filtered.sortedByDescending { it.rating }
            else -> filtered
        }
    }

    Scaffold(
        topBar = {
            AgrossTopBar(
                currentRole = currentRole,
                loggedInUser = loggedInUser,
                cartCount = cartCount,
                onLoginClick = { onNavigateToLogin(if (isFarmerMode) UserRole.FARMER else UserRole.CUSTOMER) },
                onRegisterClick = { onNavigateToRegister(UserRole.FARMER) },
                onCartClick = onNavigateToCart,
                onLogoutClick = onLogout,
                onRoleToggleClick = {}
            )
        },
        containerColor = AgriBackground
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            // Header Banner
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        brush = Brush.verticalGradient(
                            colors = if (isFarmerMode) listOf(HarvestAmber, HarvestDark) else listOf(AgriGreenPrimary, AgriGreenMedium)
                        )
                    )
                    .padding(16.dp)
            ) {
                Column {
                    Text(
                        text = if (isFarmerMode) "👨‍🌾 My Farm Produce Catalog" else "🌾 Farm Direct Marketplace",
                        color = Color.White,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = if (isFarmerMode) 
                            "Showing only your actively listed farm produce" 
                            else "100% Direct Farmer Produce from verified local farms",
                        color = Color.White.copy(alpha = 0.85f),
                        fontSize = 11.5.sp
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    // Search Bar
                    OutlinedTextField(
                        value = searchQuery,
                        onValueChange = { searchQuery = it },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp),
                        placeholder = {
                            Text(
                                if (isFarmerMode) "Search your listed crops..." else "Search tomatoes, broccoli, farmers...",
                                fontSize = 12.sp,
                                color = TextMuted
                            )
                        },
                        leadingIcon = {
                            Icon(
                                imageVector = Icons.Outlined.Search,
                                contentDescription = "Search",
                                tint = if (isFarmerMode) HarvestAmber else AgriGreenPrimary,
                                modifier = Modifier.size(18.dp)
                            )
                        },
                        trailingIcon = {
                            if (searchQuery.isNotEmpty()) {
                                IconButton(onClick = { searchQuery = "" }) {
                                    Icon(
                                        imageVector = Icons.Default.Close,
                                        contentDescription = "Clear",
                                        tint = TextMuted,
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                            }
                        },
                        singleLine = true,
                        shape = RoundedCornerShape(12.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor = Color.White,
                            unfocusedContainerColor = Color.White,
                            focusedBorderColor = HarvestAmber,
                            unfocusedBorderColor = Color.Transparent
                        )
                    )
                }
            }

            // Category filter strip with dynamic counts for both panels
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp, vertical = 10.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                dynamicCategories.forEach { category ->
                    val isSelected = selectedCategoryId == category.id
                    Surface(
                        modifier = Modifier.clickable { selectedCategoryId = category.id },
                        shape = RoundedCornerShape(20.dp),
                        color = if (isSelected) AgriGreenPrimary else Color.White,
                        border = BorderStroke(
                            1.dp,
                            if (isSelected) AgriGreenPrimary else BorderSubtle
                        ),
                        shadowElevation = if (isSelected) 2.dp else 0.dp
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 14.dp, vertical = 7.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(category.emoji, fontSize = 14.sp)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "${category.name} (${category.itemCount})",
                                fontSize = 12.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                color = if (isSelected) Color.White else TextDark
                            )
                        }
                    }
                }
            }

            // Results count and sorting
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = if (isFarmerMode) "My Listed Crops (${displayedProducts.size})" else "Showing ${displayedProducts.size} Items",
                    fontSize = 12.5.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextDark
                )

                if (isFarmerMode) {
                    Button(
                        onClick = onNavigateToAddCrop,
                        colors = ButtonDefaults.buttonColors(containerColor = HarvestAmber),
                        shape = RoundedCornerShape(8.dp),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                        modifier = Modifier.height(32.dp)
                    ) {
                        Text("+ Add Crop", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = TextDark)
                    }
                }
            }

            // If farmer has no products, show empty state
            if (displayedProducts.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(24.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        border = BorderStroke(1.dp, BorderSubtle)
                    ) {
                        Column(
                            modifier = Modifier.padding(32.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text("🌱👨‍🌾", fontSize = 46.sp)
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                if (isFarmerMode) "No Crops Listed in Your Catalog" else "No Produce Found",
                                fontSize = 17.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextDark
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                if (isFarmerMode) 
                                    "Your farm catalog is currently empty. List your fresh harvest (vegetables, fruits, grains) to start receiving direct retail orders."
                                    else "No produce matching '$searchQuery'. Try adjusting your filters.",
                                fontSize = 12.sp,
                                color = TextMedium,
                                textAlign = TextAlign.Center
                            )
                            Spacer(modifier = Modifier.height(18.dp))
                            if (isFarmerMode) {
                                Button(
                                    onClick = onNavigateToAddCrop,
                                    colors = ButtonDefaults.buttonColors(containerColor = HarvestAmber),
                                    shape = RoundedCornerShape(12.dp)
                                ) {
                                    Text("+ List Your First Crop Now", fontWeight = FontWeight.Bold, color = TextDark)
                                }
                            }
                        }
                    }
                }
            } else {
                // Responsive Products Grid
                LazyVerticalGrid(
                    columns = GridCells.Adaptive(minSize = 145.dp),
                    modifier = Modifier
                        .fillMaxSize()
                        .weight(1f)
                        .padding(horizontal = 12.dp),
                    contentPadding = PaddingValues(bottom = if (!isFarmerMode && cartCount > 0) 80.dp else 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(displayedProducts) { product ->
                        ProductCard(
                            product = product,
                            isFarmerMode = isFarmerMode,
                            onAddToCart = { onAddToCart(product) },
                            onItemClick = { onProductClick(product) },
                            onEditClick = { onEditProduct(product) },
                            onDeleteClick = { onDeleteProduct(product) }
                        )
                    }
                }
            }
        }

        // Floating Cart Bar (for customer mode)
        if (!isFarmerMode && cartCount > 0) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
                    .padding(16.dp),
                contentAlignment = Alignment.BottomCenter
            ) {
                Button(
                    onClick = onNavigateToCart,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp)
                        .shadow(8.dp, RoundedCornerShape(16.dp)),
                    colors = ButtonDefaults.buttonColors(containerColor = AgriGreenPrimary),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Surface(
                                shape = CircleShape,
                                color = Color.White.copy(alpha = 0.25f)
                            ) {
                                Text(
                                    text = "$cartCount",
                                    color = Color.White,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                                )
                            }
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                "View Basket",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }
                        Text(
                            text = "₹${"%.0f".format(cartTotal)} →",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = Color.White
                        )
                    }
                }
            }
        }
    }
}
