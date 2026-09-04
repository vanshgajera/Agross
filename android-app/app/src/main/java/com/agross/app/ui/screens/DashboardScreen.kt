package com.agross.app.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material.icons.outlined.Tune
import androidx.compose.material.icons.outlined.Verified
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
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
fun DashboardScreen(
    currentRole: UserRole,
    loggedInUser: String?,
    cartCount: Int,
    onNavigateToLogin: (UserRole) -> Unit,
    onNavigateToRegister: (UserRole) -> Unit,
    onLogout: () -> Unit,
    onRoleToggle: () -> Unit,
    onAddToCart: (Product) -> Unit,
    onProductClick: (Product) -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }
    var selectedCategoryId by remember { mutableStateOf("1") }

    val prodsList = MockDataProvider.featuredProducts
    val dynamicCategories = remember(prodsList) {
        val vegCount = prodsList.count { it.category.contains("veg", ignoreCase = true) }
        val fruitCount = prodsList.count { it.category.contains("fruit", ignoreCase = true) }
        val grainCount = prodsList.count { it.category.contains("grain", ignoreCase = true) || it.category.contains("pulse", ignoreCase = true) }
        val herbCount = prodsList.count { it.category.contains("herb", ignoreCase = true) || it.category.contains("spice", ignoreCase = true) }

        listOf(
            com.agross.app.data.Category("1", "All", "🌱", prodsList.size),
            com.agross.app.data.Category("2", "Vegetables", "🥦", vegCount),
            com.agross.app.data.Category("3", "Fruits", "🍎", fruitCount),
            com.agross.app.data.Category("4", "Grains & Pulses", "🌾", grainCount),
            com.agross.app.data.Category("5", "Organic Herbs", "🌿", herbCount)
        )
    }

    val filteredProducts = remember(searchQuery, selectedCategoryId) {
        prodsList.filter { product ->
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
    }

    Scaffold(
        topBar = {
            AgrossTopBar(
                currentRole = currentRole,
                loggedInUser = loggedInUser,
                cartCount = cartCount,
                onLoginClick = { onNavigateToLogin(UserRole.CUSTOMER) },
                onRegisterClick = { onNavigateToRegister(UserRole.FARMER) },
                onCartClick = { /* Handle cart view */ },
                onLogoutClick = onLogout,
                onRoleToggleClick = onRoleToggle
            )
        },
        containerColor = AgriBackground
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding),
            contentPadding = PaddingValues(bottom = 24.dp)
        ) {
            // 1. Search Bar & Filter Strip
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            brush = Brush.verticalGradient(
                                colors = listOf(AgriGreenMedium, AgriGreenPrimary)
                            )
                        )
                        .padding(horizontal = 16.dp, vertical = 8.dp)
                ) {
                    OutlinedTextField(
                        value = searchQuery,
                        onValueChange = { searchQuery = it },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp),
                        placeholder = {
                            Text(
                                "Search fresh tomatoes, apples, farmers...",
                                fontSize = 13.sp,
                                color = TextMuted
                            )
                        },
                        leadingIcon = {
                            Icon(
                                imageVector = Icons.Outlined.Search,
                                contentDescription = "Search",
                                tint = AgriGreenPrimary
                            )
                        },
                        trailingIcon = {
                            IconButton(onClick = { /* Open filters modal */ }) {
                                Icon(
                                    imageVector = Icons.Outlined.Tune,
                                    contentDescription = "Filter",
                                    tint = AgriGreenPrimary
                                )
                            }
                        },
                        shape = RoundedCornerShape(26.dp),
                        colors = TextFieldDefaults.colors(
                            focusedContainerColor = Color.White,
                            unfocusedContainerColor = Color.White,
                            disabledContainerColor = Color.White,
                            focusedIndicatorColor = Color.Transparent,
                            unfocusedIndicatorColor = Color.Transparent
                        ),
                        singleLine = true
                    )
                }
            }

            // 2. Promotional Banner (Dynamic for Customer vs Farmer Role)
            item {
                Spacer(modifier = Modifier.height(12.dp))
                val isFarmer = currentRole == UserRole.FARMER
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    shape = RoundedCornerShape(20.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 3.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(
                                brush = Brush.horizontalGradient(
                                    colors = if (isFarmer) 
                                        listOf(Color(0xFF065F46), Color(0xFF047857))
                                        else listOf(AgriGreenPrimary, Color(0xFF0F5132))
                                )
                            )
                            .padding(20.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Surface(
                                    shape = RoundedCornerShape(6.dp),
                                    color = HarvestAmber
                                ) {
                                    Text(
                                        text = if (isFarmer) "🌾 COMMUNITY BENCHMARK" else "0% COMMISSION",
                                        color = Color.Black,
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.ExtraBold,
                                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                    )
                                }
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(
                                    text = if (isFarmer) "Live Network Harvest\n& Market Rates" else "Direct From Farm\nTo Your Kitchen",
                                    color = Color.White,
                                    fontSize = 20.sp,
                                    fontWeight = FontWeight.Bold,
                                    lineHeight = 24.sp
                                )
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(
                                    text = if (isFarmer) 
                                        "See all listed crops across the network. Compare pricing and market demand." 
                                        else "Farmers get 100% fair price. Customers get daily morning freshness.",
                                    color = Color.White.copy(alpha = 0.85f),
                                    fontSize = 12.sp
                                )
                                Spacer(modifier = Modifier.height(10.dp))
                                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    Button(
                                        onClick = { 
                                            if (isFarmer) onNavigateToRegister(UserRole.FARMER) 
                                            else onNavigateToRegister(UserRole.CUSTOMER) 
                                        },
                                        shape = RoundedCornerShape(12.dp),
                                        colors = ButtonDefaults.buttonColors(
                                            containerColor = if (isFarmer) HarvestAmber else Color.White,
                                            contentColor = if (isFarmer) Color.Black else AgriGreenPrimary
                                        ),
                                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                                        modifier = Modifier.height(34.dp)
                                    ) {
                                        Text(
                                            if (isFarmer) "+ Add My Crop" else "Shop Fresh", 
                                            fontSize = 12.sp, 
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                }
                            }

                            // Banner Illustration
                            Text(
                                text = if (isFarmer) "🚜🌾" else "🚜🌱",
                                fontSize = 52.sp,
                                modifier = Modifier.padding(start = 8.dp)
                            )
                        }
                    }
                }
            }

            // 3. Farmer Portal Quick Spotlight Banner
            item {
                Spacer(modifier = Modifier.height(14.dp))
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp)
                        .clickable { onNavigateToRegister(UserRole.FARMER) },
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = BadgeOrangeBg.copy(alpha = 0.6f)
                    ),
                    border = BorderStroke(1.dp, HarvestAmber.copy(alpha = 0.6f))
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.weight(1f)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(46.dp)
                                    .clip(CircleShape)
                                    .background(HarvestAmber),
                                contentAlignment = Alignment.Center
                            ) {
                                Text("👨‍🌾", fontSize = 24.sp)
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Column {
                                Text(
                                    text = "Are You a Farmer?",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 15.sp,
                                    color = Color(0xFF78350F)
                                )
                                Text(
                                    text = "Sell vegetables & fruits directly. Daily bank payouts.",
                                    fontSize = 12.sp,
                                    color = Color(0xFF92400E)
                                )
                            }
                        }

                        Button(
                            onClick = { onNavigateToRegister(UserRole.FARMER) },
                            shape = RoundedCornerShape(14.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = SunOrange,
                                contentColor = Color.White
                            ),
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                            modifier = Modifier.height(34.dp)
                        ) {
                            Text("Sell Now", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            // 4. Categories Carousel
            item {
                Spacer(modifier = Modifier.height(18.dp))
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Categories",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = TextDark
                    )
                    Text(
                        text = "View All",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = AgriGreenPrimary
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(dynamicCategories) { cat ->
                        val isSelected = cat.id == selectedCategoryId
                        FilterChip(
                            selected = isSelected,
                            onClick = { selectedCategoryId = cat.id },
                            label = {
                                Text(
                                    text = "${cat.emoji}  ${cat.name} (${cat.itemCount})",
                                    fontSize = 13.sp,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                                )
                            },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = AgriGreenPrimary,
                                selectedLabelColor = Color.White,
                                containerColor = Color.White,
                                labelColor = TextDark
                            ),
                            border = FilterChipDefaults.filterChipBorder(
                                enabled = true,
                                selected = isSelected,
                                borderColor = AgriBorder,
                                selectedBorderColor = AgriGreenPrimary
                            ),
                            shape = RoundedCornerShape(20.dp)
                        )
                    }
                }
            }

            // 5. Fresh Harvest Produce Section Header
            item {
                Spacer(modifier = Modifier.height(20.dp))
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "Today's Fresh Harvest",
                                style = MaterialTheme.typography.titleLarge,
                                fontWeight = FontWeight.Bold,
                                color = TextDark
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("🥬", fontSize = 18.sp)
                        }
                        Text(
                            text = "Picked today by local farmers in your district",
                            fontSize = 12.sp,
                            color = TextLight
                        )
                    }
                }
                Spacer(modifier = Modifier.height(12.dp))
            }

            // 6. Product Cards Grid
            item {
                Column(
                    modifier = Modifier.padding(horizontal = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // Render products in 2-column rows
                    val chunked = filteredProducts.chunked(2)
                    chunked.forEach { rowItems ->
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            rowItems.forEach { product ->
                                Box(modifier = Modifier.weight(1f)) {
                                    ProductCard(
                                        product = product,
                                        onAddToCart = onAddToCart,
                                        onItemClick = onProductClick
                                    )
                                }
                            }
                            if (rowItems.size == 1) {
                                Spacer(modifier = Modifier.weight(1f))
                            }
                        }
                    }
                }
            }

            // 7. Top Verified Farmers Spotlight
            item {
                Spacer(modifier = Modifier.height(24.dp))
                Text(
                    text = "Top Rated Farmers",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = TextDark,
                    modifier = Modifier.padding(horizontal = 16.dp)
                )
                Text(
                    text = "Trusted by thousands of local buyers with verified farms",
                    fontSize = 12.sp,
                    color = TextLight,
                    modifier = Modifier.padding(horizontal = 16.dp)
                )
                Spacer(modifier = Modifier.height(12.dp))

                LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(MockDataProvider.topFarmers) { farmer ->
                        Card(
                            modifier = Modifier.width(220.dp),
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = Color.White),
                            border = BorderStroke(1.dp, AgriBorder)
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Box(
                                        modifier = Modifier
                                            .size(40.dp)
                                            .clip(CircleShape)
                                            .background(AgriGreenPastel),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text("🧑‍🌾", fontSize = 20.sp)
                                    }
                                    Spacer(modifier = Modifier.width(10.dp))
                                    Column {
                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            Text(
                                                text = farmer.name,
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 14.sp,
                                                color = TextDark
                                            )
                                            Spacer(modifier = Modifier.width(4.dp))
                                            Icon(
                                                imageVector = Icons.Outlined.Verified,
                                                contentDescription = "Verified",
                                                tint = AgriEmeraldAccent,
                                                modifier = Modifier.size(14.dp)
                                            )
                                        }
                                        Text(
                                            text = farmer.farmName,
                                            fontSize = 11.sp,
                                            color = TextMedium
                                        )
                                    }
                                }
                                Spacer(modifier = Modifier.height(8.dp))
                                Divider(color = AgriBorder.copy(alpha = 0.5f))
                                Spacer(modifier = Modifier.height(8.dp))
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(
                                        text = "★ ${farmer.rating} (${farmer.experienceYears}y exp)",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = HarvestAmber
                                    )
                                    Text(
                                        text = "${farmer.totalCropsSupplied}+ delivered",
                                        fontSize = 11.sp,
                                        color = AgriGreenMedium,
                                        fontWeight = FontWeight.Medium
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
