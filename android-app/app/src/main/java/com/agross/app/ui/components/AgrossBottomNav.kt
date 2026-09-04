package com.agross.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.agross.app.data.UserRole
import com.agross.app.ui.theme.*

@Composable
fun AgrossBottomNav(
    currentRoute: String,
    currentRole: UserRole,
    onNavigate: (String) -> Unit,
    onOpenSellOrCart: () -> Unit
) {
    NavigationBar(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(12.dp)
            .clip(RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp)),
        containerColor = Color.White,
        tonalElevation = 8.dp
    ) {
        // Home
        NavigationBarItem(
            selected = currentRoute == "dashboard",
            onClick = { onNavigate("dashboard") },
            icon = {
                Icon(
                    imageVector = if (currentRoute == "dashboard") Icons.Filled.Home else Icons.Outlined.Home,
                    contentDescription = "Home"
                )
            },
            label = { Text("Home", fontSize = 11.sp) },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = AgriGreenPrimary,
                selectedTextColor = AgriGreenPrimary,
                indicatorColor = AgriGreenPastel,
                unselectedIconColor = TextMedium,
                unselectedTextColor = TextMedium
            )
        )

        // Categories / Marketplace
        NavigationBarItem(
            selected = currentRoute == "market",
            onClick = { onNavigate("market") },
            icon = {
                Icon(
                    imageVector = if (currentRoute == "market") Icons.Filled.Storefront else Icons.Outlined.Storefront,
                    contentDescription = "Market"
                )
            },
            label = { Text("Market", fontSize = 11.sp) },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = AgriGreenPrimary,
                selectedTextColor = AgriGreenPrimary,
                indicatorColor = AgriGreenPastel,
                unselectedIconColor = TextMedium,
                unselectedTextColor = TextMedium
            )
        )

        // Dynamic Role-based Tab (Farmer sells, Customer orders)
        if (currentRole == UserRole.FARMER) {
            NavigationBarItem(
                selected = currentRoute == "farmer_crops",
                onClick = onOpenSellOrCart,
                icon = {
                    Icon(
                        imageVector = Icons.Filled.Agriculture,
                        contentDescription = "Sell Crops"
                    )
                },
                label = { Text("Sell Crops", fontSize = 11.sp) },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = HarvestAmber,
                    selectedTextColor = HarvestAmber,
                    indicatorColor = BadgeOrangeBg,
                    unselectedIconColor = TextMedium,
                    unselectedTextColor = TextMedium
                )
            )
        } else {
            NavigationBarItem(
                selected = currentRoute == "cart",
                onClick = onOpenSellOrCart,
                icon = {
                    Icon(
                        imageVector = if (currentRoute == "cart") Icons.Filled.ShoppingCart else Icons.Outlined.ShoppingCart,
                        contentDescription = "My Cart"
                    )
                },
                label = { Text("My Cart", fontSize = 11.sp) },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = AgriGreenPrimary,
                    selectedTextColor = AgriGreenPrimary,
                    indicatorColor = AgriGreenPastel,
                    unselectedIconColor = TextMedium,
                    unselectedTextColor = TextMedium
                )
            )
        }

        // Profile / Account
        NavigationBarItem(
            selected = currentRoute == "profile" || currentRoute == "login" || currentRoute == "register",
            onClick = { onNavigate("profile") },
            icon = {
                Icon(
                    imageVector = Icons.Outlined.Person,
                    contentDescription = "Account"
                )
            },
            label = { Text("Account", fontSize = 11.sp) },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = AgriGreenPrimary,
                selectedTextColor = AgriGreenPrimary,
                indicatorColor = AgriGreenPastel,
                unselectedIconColor = TextMedium,
                unselectedTextColor = TextMedium
            )
        )
    }
}
