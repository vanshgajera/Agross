package com.agross.app.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.CheckCircle
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.agross.app.data.CustomerBill
import com.agross.app.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BillInvoiceScreen(
    bill: CustomerBill,
    onNavigateToMarket: () -> Unit,
    onNavigateToHome: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "🧾 Tax Invoice & Receipt",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextDark
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateToHome) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Close",
                            tint = TextDark
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
            )
        },
        containerColor = AgriBackground
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Confirmation Header Card
            item {
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    color = Color.White,
                    border = BorderStroke(1.dp, BorderSubtle),
                    shadowElevation = 2.dp
                ) {
                    Column(
                        modifier = Modifier.padding(18.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Surface(
                            shape = RoundedCornerShape(20.dp),
                            color = AgriGreenPastel
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Outlined.CheckCircle,
                                    contentDescription = "Success",
                                    tint = AgriGreenPrimary,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    "ORDER CONFIRMED & PAID",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = AgriGreenPrimary
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))
                        Text(
                            "🌱 AGROSS FARM TO FORK",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = AgriGreenPrimary
                        )
                        Text(
                            "Official GST Tax Invoice",
                            fontSize = 12.sp,
                            color = TextMedium
                        )
                    }
                }
            }

            // Invoice Metadata
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, BorderSubtle)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text("Invoice Number", fontSize = 11.sp, color = TextMedium)
                                Text("#${bill.id}", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = TextDark)
                            }
                            Column(horizontalAlignment = Alignment.End) {
                                Text("Date & Time", fontSize = 11.sp, color = TextMedium)
                                Text(bill.date, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = TextDark)
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))
                        Divider(color = BorderSubtle)
                        Spacer(modifier = Modifier.height(10.dp))

                        // Customer info
                        Text(
                            "👤 BILLED TO (CUSTOMER)",
                            fontSize = 10.5.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextMedium
                        )
                        Text(
                            bill.customerName,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextDark
                        )
                        Text(
                            "✉️ ${bill.customerEmail} • 📱 ${bill.customerPhone}",
                            fontSize = 11.5.sp,
                            color = Color(0xFF0284C7),
                            fontWeight = FontWeight.Medium
                        )
                        Text(
                            "📍 ${bill.deliveryAddress}",
                            fontSize = 11.5.sp,
                            color = TextMedium
                        )

                        Spacer(modifier = Modifier.height(10.dp))
                        Divider(color = BorderSubtle)
                        Spacer(modifier = Modifier.height(10.dp))

                        // Farmer info
                        Text(
                            "👨‍🌾 FULFILLED BY (FARMER)",
                            fontSize = 10.5.sp,
                            fontWeight = FontWeight.Bold,
                            color = AgriGreenPrimary
                        )
                        Text(
                            "${bill.farmerName} (${bill.farmName})",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextDark
                        )
                        Text(
                            "✉️ ${bill.farmerEmail}",
                            fontSize = 11.5.sp,
                            color = AgriGreenPrimary,
                            fontWeight = FontWeight.Medium
                        )
                        Text(
                            "🏡 Branch: ${bill.farmBranch}",
                            fontSize = 11.5.sp,
                            color = TextMedium
                        )
                    }
                }
            }

            // Itemized Produce List
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, BorderSubtle)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            "📦 Itemized Farm Produce",
                            fontSize = 13.5.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextDark
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        bill.items.forEach { item ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        "${item.product.emoji} ${item.product.name}",
                                        fontSize = 12.5.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = TextDark
                                    )
                                    Text(
                                        "${item.quantity} ${item.product.unit} × ₹${item.product.price.toInt()}",
                                        fontSize = 11.sp,
                                        color = TextMedium
                                    )
                                }
                                Text(
                                    "₹${"%.0f".format(item.lineTotal)}",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TextDark
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))
                        Divider(color = BorderSubtle)
                        Spacer(modifier = Modifier.height(10.dp))

                        // Subtotals
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Produce Subtotal", fontSize = 12.sp, color = TextMedium)
                            Text("₹${"%.0f".format(bill.subtotal)}", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = TextDark)
                        }

                        Spacer(modifier = Modifier.height(4.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Farm Packaging & Transit", fontSize = 12.sp, color = TextMedium)
                            Text(
                                if (bill.deliveryFee == 0.0) "FREE" else "₹${"%.0f".format(bill.deliveryFee)}",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (bill.deliveryFee == 0.0) AgriGreenPrimary else TextDark
                            )
                        }

                        Spacer(modifier = Modifier.height(4.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Agricultural GST (0%)", fontSize = 12.sp, color = TextMedium)
                            Text("₹0.00", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = AgriGreenPrimary)
                        }

                        Spacer(modifier = Modifier.height(8.dp))
                        Divider(color = BorderSubtle)
                        Spacer(modifier = Modifier.height(8.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Grand Total Paid", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = TextDark)
                            Text(
                                "₹${"%.0f".format(bill.total)}",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = AgriGreenPrimary
                            )
                        }
                    }
                }
            }

            // Action Buttons
            item {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Button(
                        onClick = onNavigateToMarket,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = AgriGreenPrimary),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("🌾 Continue Shopping in Market", fontWeight = FontWeight.Bold)
                    }

                    OutlinedButton(
                        onClick = onNavigateToHome,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp),
                        shape = RoundedCornerShape(12.dp),
                        border = BorderStroke(1.dp, AgriGreenPrimary)
                    ) {
                        Text("🏠 Return to Home Dashboard", color = AgriGreenPrimary, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
