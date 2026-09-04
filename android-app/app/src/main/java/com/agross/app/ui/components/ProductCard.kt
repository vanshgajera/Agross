package com.agross.app.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.outlined.LocationOn
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.agross.app.data.Product
import com.agross.app.ui.theme.*

@Composable
fun ProductCard(
    product: Product,
    isFarmerMode: Boolean = false,
    onAddToCart: (Product) -> Unit = {},
    onItemClick: (Product) -> Unit = {},
    onEditClick: ((Product) -> Unit)? = null,
    onDeleteClick: ((Product) -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    var isAdded by remember { mutableStateOf(false) }

    Card(
        modifier = modifier
            .fillMaxWidth()
            .clickable { onItemClick(product) },
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color.White
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = 2.dp,
            pressedElevation = 6.dp
        ),
        border = BorderStroke(1.dp, AgriBorder.copy(alpha = 0.7f))
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp)
        ) {
            // Image / Emoji Showcase with Badges
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(120.dp)
                    .clip(RoundedCornerShape(14.dp))
                    .background(AgriSurfaceVariant),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = product.emoji,
                    fontSize = 54.sp
                )

                // Top Left Badges (Organic / Fresh)
                Row(
                    modifier = Modifier
                        .align(Alignment.TopStart)
                        .padding(8.dp),
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = if (isFarmerMode) HarvestAmber else BadgeGreenBg
                    ) {
                        Text(
                            text = if (isFarmerMode) "My Harvest" else "100% Organic",
                            color = if (isFarmerMode) HarvestDark else BadgeGreenText,
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Category tag
            Text(
                text = product.category.uppercase(),
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                color = AgriGreenMedium,
                letterSpacing = 0.5.sp
            )

            // Product Title
            Text(
                text = product.name,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = TextDark,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )

            // Farmer Info & Location
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(vertical = 3.dp)
            ) {
                Icon(
                    imageVector = Icons.Outlined.LocationOn,
                    contentDescription = null,
                    tint = TextLight,
                    modifier = Modifier.size(13.dp)
                )
                Spacer(modifier = Modifier.width(3.dp))
                Text(
                    text = if (isFarmerMode) "🏡 ${product.farmName.ifEmpty { "My Farm" }}" else "${product.farmerName} • ${product.location}",
                    fontSize = 11.sp,
                    color = TextLight,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Clean Price Display and Actions
            val displayPrice = if (isFarmerMode) product.price else product.price * 1.05

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Row(verticalAlignment = Alignment.Bottom) {
                        Text(
                            text = "₹${"%.0f".format(displayPrice)}",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = AgriGreenPrimary
                        )
                        Text(
                            text = "/${product.unit}",
                            fontSize = 12.sp,
                            color = TextMedium,
                            fontWeight = FontWeight.Medium,
                            modifier = Modifier.padding(bottom = 1.dp)
                        )
                    }
                }

                if (isFarmerMode) {
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        // Edit Button
                        IconButton(
                            onClick = { onEditClick?.invoke(product) },
                            modifier = Modifier
                                .size(32.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(Color(0xFFCCFBF1))
                        ) {
                            Icon(
                                imageVector = Icons.Default.Edit,
                                contentDescription = "Edit Crop",
                                tint = Color(0xFF0F766E),
                                modifier = Modifier.size(16.dp)
                            )
                        }

                        // Delete Button
                        IconButton(
                            onClick = { onDeleteClick?.invoke(product) },
                            modifier = Modifier
                                .size(32.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(Color(0xFFFEE2E2))
                        ) {
                            Icon(
                                imageVector = Icons.Default.Delete,
                                contentDescription = "Delete Crop",
                                tint = Color(0xFFEF4444),
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                } else {
                    // Add to Cart Button
                    IconButton(
                        onClick = {
                            isAdded = true
                            onAddToCart(product)
                        },
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(if (isAdded) AgriGreenPrimary else AgriSurfaceVariant)
                    ) {
                        Icon(
                            imageVector = if (isAdded) Icons.Default.Check else Icons.Default.Add,
                            contentDescription = "Add to Cart",
                            tint = if (isAdded) Color.White else AgriGreenPrimary,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            }
        }
    }
}
