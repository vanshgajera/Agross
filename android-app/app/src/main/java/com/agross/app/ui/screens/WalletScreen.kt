package com.agross.app.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.agross.app.data.PayoutRecord
import com.agross.app.data.Product
import com.agross.app.data.WithdrawalRecord
import com.agross.app.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WalletScreen(
    farmerName: String = "vans gajere",
    farmName: String = "Gajera Organic Farms",
    bankUpi: String = "Gajera@oksbi",
    payouts: List<PayoutRecord>,
    withdrawals: List<WithdrawalRecord>,
    farmerProducts: List<Product>,
    withdrawnAmount: Double,
    onWithdrawAll: (Double) -> Unit,
    onNavigateBack: () -> Unit,
    onNavigateToAddCrop: () -> Unit
) {
    // 1. Pending Payments (When customer places order -> shown as Pending waiting for Admin Approval)
    val pendingAmount = payouts
        .filter { it.status.equals("Pending", ignoreCase = true) }
        .sumOf { it.netAmount }

    // 2. Settled Payments (When Admin approves & transfers in Admin Portal)
    val settledAmount = payouts
        .filter { it.status.equals("Settled", ignoreCase = true) }
        .sumOf { it.netAmount }

    // 3. Total Withdrawn
    val totalWithdrawn = withdrawals.sumOf { it.amount }.coerceAtLeast(withdrawnAmount)

    // 4. Available Balance to Withdraw (Settled total minus already withdrawn amount)
    val availableBalance = maxOf(0.0, settledAmount - totalWithdrawn)

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "💰 Earnings Wallet",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(
                            Icons.Default.ArrowBack,
                            contentDescription = "Back",
                            tint = Color.White
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = PrimaryGreen
                )
            )
        },
        containerColor = BackgroundLight
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // 1. Wallet Hero Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = PrimaryGreenDark),
                    elevation = CardDefaults.cardElevation(defaultElevation = 6.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .background(
                                Brush.linearGradient(
                                    listOf(PrimaryGreenDark, PrimaryGreen)
                                )
                            )
                            .padding(20.dp)
                    ) {
                        Text(
                            "Available Farmer Earning Balance",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color.White.copy(alpha = 0.85f)
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            "₹${String.format("%.2f", availableBalance)}",
                            fontSize = 32.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = Color.White
                        )

                        Spacer(modifier = Modifier.height(16.dp))
                        Divider(color = Color.White.copy(alpha = 0.2f))
                        Spacer(modifier = Modifier.height(14.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text(
                                    "⏳ Pending",
                                    fontSize = 11.sp,
                                    color = Color.White.copy(alpha = 0.8f)
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    "₹${String.format("%.2f", pendingAmount)}",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = HarvestAmber
                                )
                            }

                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text(
                                    "✓ Settled",
                                    fontSize = 11.sp,
                                    color = Color.White.copy(alpha = 0.8f)
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    "₹${String.format("%.2f", settledAmount)}",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF6EE7B7)
                                )
                            }

                            Column(horizontalAlignment = Alignment.End) {
                                Text(
                                    "💸 Withdrawn",
                                    fontSize = 11.sp,
                                    color = Color.White.copy(alpha = 0.8f)
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    "₹${String.format("%.2f", totalWithdrawn)}",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF93C5FD)
                                )
                            }
                        }
                    }
                }
            }

            // 2. Bank UPI Strip & Withdraw Action
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, BorderSubtle)
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
                            Surface(
                                shape = CircleShape,
                                color = Color(0xFFECFDF5),
                                modifier = Modifier.size(40.dp)
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    Text("💳", fontSize = 18.sp)
                                }
                            }
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text(
                                    "Direct Bank Payout Account",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TextDark
                                )
                                Text(
                                    "UPI: $bankUpi • 0% Cut",
                                    fontSize = 11.sp,
                                    color = PrimaryGreen,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }
                        }

                        Button(
                            onClick = {
                                if (availableBalance > 0) {
                                    onWithdrawAll(availableBalance)
                                }
                            },
                            enabled = availableBalance > 0,
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (availableBalance > 0) PrimaryGreen else Color(0xFF94A3B8),
                                disabledContainerColor = Color(0xFFE2E8F0)
                            ),
                            shape = RoundedCornerShape(10.dp),
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Text(
                                if (availableBalance > 0) "Withdraw All" else "Withdrawn",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (availableBalance > 0) Color.White else Color(0xFF64748B)
                            )
                        }
                    }
                }
            }

            // 3. Pending Orders Notice
            if (pendingAmount > 0) {
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFFFEF3C7)),
                        border = BorderStroke(1.5.dp, HarvestAmber)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text("⏳", fontSize = 18.sp)
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    "Pending Customer Orders: ₹${String.format("%.2f", pendingAmount)}",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF78350F)
                                )
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                "Customer placed orders for your produce. Amount is in Pending status until Agross Admin approves and releases payout.",
                                fontSize = 11.sp,
                                color = Color(0xFF92400E),
                                lineHeight = 15.sp
                            )
                        }
                    }
                }
            }

            // 4. Withdrawal Success Notice
            if (totalWithdrawn > 0 && availableBalance == 0.0) {
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFFECFDF5)),
                        border = BorderStroke(1.5.dp, PrimaryGreen)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text("✓", fontSize = 18.sp, color = PrimaryGreen, fontWeight = FontWeight.Bold)
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    "All Settled Funds Withdrawn (Available: ₹0.00)",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF065F46)
                                )
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                "You have withdrawn all admin-settled earnings to UPI $bankUpi. Total settled by admin remains ₹${String.format("%.2f", settledAmount)}.",
                                fontSize = 11.sp,
                                color = Color(0xFF047857),
                                lineHeight = 15.sp
                            )
                        }
                    }
                }
            }

            // 5. Direct Bank Withdrawal History Section
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        "💸 Direct Bank Withdrawal History (${withdrawals.size})",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextDark
                    )
                    Text(
                        "RTGS / UPI",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = PrimaryGreen
                    )
                }
            }

            if (withdrawals.isEmpty()) {
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        border = BorderStroke(1.dp, BorderSubtle)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(18.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text("💵", fontSize = 28.sp)
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                "No withdrawal history yet",
                                fontSize = 12.5.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextDark
                            )
                            Text(
                                "Transferred funds will appear here when you withdraw",
                                fontSize = 11.sp,
                                color = TextMedium
                            )
                        }
                    }
                }
            } else {
                items(withdrawals) { w ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        border = BorderStroke(1.dp, PrimaryGreen.copy(alpha = 0.4f))
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.weight(1f)
                            ) {
                                Surface(
                                    shape = CircleShape,
                                    color = Color(0xFFECFDF5),
                                    modifier = Modifier.size(36.dp)
                                ) {
                                    Box(contentAlignment = Alignment.Center) {
                                        Text("🏦", fontSize = 16.sp)
                                    }
                                }
                                Spacer(modifier = Modifier.width(10.dp))
                                Column {
                                    Text(
                                        "Direct Bank Withdrawal #${w.id}",
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = TextDark
                                    )
                                    Text(
                                        "${w.date} • Payout UPI: ${w.bankUpi}",
                                        fontSize = 10.5.sp,
                                        color = TextMedium
                                    )
                                }
                            }

                            Column(horizontalAlignment = Alignment.End) {
                                Text(
                                    "-₹${String.format("%.2f", w.amount)}",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = PrimaryGreen
                                )
                                Text(
                                    "✓ Transferred to Bank",
                                    fontSize = 9.5.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF059669)
                                )
                            }
                        }
                    }
                }
            }

            // 6. Recent Customer Orders & Settlements
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        "Customer Orders & Admin Settlements (${payouts.size})",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextDark
                    )
                    Text(
                        "Live Sync",
                        fontSize = 11.sp,
                        color = TextMedium
                    )
                }
            }

            if (payouts.isEmpty()) {
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        border = BorderStroke(1.dp, BorderSubtle)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text("🌱", fontSize = 32.sp)
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                "No orders yet",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextDark
                            )
                            Text(
                                "Customer purchases will appear here as Pending",
                                fontSize = 11.sp,
                                color = TextMedium
                            )
                        }
                    }
                }
            } else {
                items(payouts) { p ->
                    val isSettled = p.status.equals("Settled", ignoreCase = true)
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        border = BorderStroke(1.dp, BorderSubtle)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.weight(1f)
                            ) {
                                Surface(
                                    shape = CircleShape,
                                    color = if (isSettled) Color(0xFFECFDF5) else Color(0xFFFEF3C7),
                                    modifier = Modifier.size(36.dp)
                                ) {
                                    Box(contentAlignment = Alignment.Center) {
                                        Text(if (isSettled) "🏛️" else "🛒", fontSize = 16.sp)
                                    }
                                }
                                Spacer(modifier = Modifier.width(10.dp))
                                Column {
                                    Text(
                                        if (isSettled) "Admin Settlement #${p.id}" else "Customer Order #${p.billId.ifEmpty { p.id }}",
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = TextDark
                                    )
                                    Text(
                                        "${p.date} • Bank UPI: ${p.bankUpi}",
                                        fontSize = 10.5.sp,
                                        color = TextMedium
                                    )
                                }
                            }

                            Column(horizontalAlignment = Alignment.End) {
                                Text(
                                    "+₹${String.format("%.2f", p.netAmount)}",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = if (isSettled) PrimaryGreen else HarvestAmber
                                )
                                Text(
                                    if (isSettled) "✓ Settled by Admin" else "⏳ Pending Admin Approval",
                                    fontSize = 9.5.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isSettled) PrimaryGreen else Color(0xFFD97706)
                                )
                            }
                        }
                    }
                }
            }

            // 7. Back Button
            item {
                Button(
                    onClick = onNavigateBack,
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp)
                ) {
                    Text(
                        "← Back to Produce Marketplace",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
            }
        }
    }
}
