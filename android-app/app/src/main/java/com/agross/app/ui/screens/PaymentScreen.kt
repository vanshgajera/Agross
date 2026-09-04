package com.agross.app.ui.screens

import androidx.compose.animation.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.agross.app.data.CartItem
import com.agross.app.data.CustomerBill
import com.agross.app.data.PaymentMethodOption
import com.agross.app.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PaymentScreen(
    cartItems: List<CartItem>,
    customerName: String,
    customerPhone: String,
    deliveryAddress: String,
    onNavigateBack: () -> Unit,
    onPaymentSuccess: (CustomerBill) -> Unit
) {
    val subtotal = remember(cartItems) { cartItems.sumOf { it.product.price * it.quantity } }
    val deliveryFee = remember(subtotal) { if (subtotal == 0.0) 0.0 else if (subtotal >= 500.0) 0.0 else 30.0 }
    val total = subtotal + deliveryFee

    var selectedMethodId by remember { mutableStateOf("upi") }
    var isProcessing by remember { mutableStateOf(false) }
    var processingStep by remember { mutableStateOf("Connecting to Payment Gateway...") }
    val scope = rememberCoroutineScope()

    val paymentOptions = remember {
        listOf(
            PaymentMethodOption("upi", "UPI Instant (Recommended)", "Google Pay, PhonePe, Paytm & QR Code", "⚡", isRecommended = true),
            PaymentMethodOption("card", "Credit / Debit Card", "Visa, Mastercard, RuPay & Maestro", "💳"),
            PaymentMethodOption("netbanking", "Net Banking", "SBI, HDFC, ICICI, Axis & 50+ Banks", "🏛️"),
            PaymentMethodOption("cod", "Cash on Delivery (COD)", "Pay cash or UPI upon doorstep arrival", "💵")
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "💳 Select Payment Method",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextDark
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack, enabled = !isProcessing) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Back",
                            tint = TextDark
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
            )
        },
        containerColor = AgriBackground
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(16.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Amount to Pay Banner
                item {
                    Surface(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        color = AgriGreenPastel,
                        border = BorderStroke(1.dp, AgriGreenMedium.copy(alpha = 0.3f))
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    "Total Payable Amount",
                                    fontSize = 11.5.sp,
                                    color = AgriGreenPrimary,
                                    fontWeight = FontWeight.SemiBold
                                )
                                Text(
                                    "₹${"%.0f".format(total)}",
                                    fontSize = 24.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = AgriGreenPrimary
                                )
                            }
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = AgriGreenPrimary
                            ) {
                                Text(
                                    "${cartItems.sumOf { it.quantity }} Produce Items",
                                    color = Color.White,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                                )
                            }
                        }
                    }
                }

                // Payment Options
                items(paymentOptions.size) { index ->
                    val opt = paymentOptions[index]
                    val isSelected = selectedMethodId == opt.id

                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable(enabled = !isProcessing) { selectedMethodId = opt.id },
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = if (isSelected) AgriGreenPastel.copy(alpha = 0.5f) else Color.White
                        ),
                        border = BorderStroke(
                            if (isSelected) 1.5.dp else 1.dp,
                            if (isSelected) AgriGreenPrimary else BorderSubtle
                        )
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            // Icon Box
                            Surface(
                                modifier = Modifier.size(40.dp),
                                shape = RoundedCornerShape(10.dp),
                                color = if (isSelected) Color.White else AgriBackground
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    Text(opt.iconEmoji, fontSize = 20.sp)
                                }
                            }

                            Spacer(modifier = Modifier.width(12.dp))

                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = opt.title,
                                    fontSize = 13.5.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TextDark
                                )
                                Text(
                                    text = opt.subtitle,
                                    fontSize = 11.sp,
                                    color = TextMedium
                                )
                            }

                            RadioButton(
                                selected = isSelected,
                                onClick = { if (!isProcessing) selectedMethodId = opt.id },
                                colors = RadioButtonDefaults.colors(
                                    selectedColor = AgriGreenPrimary
                                )
                            )
                        }
                    }
                }

                // Security Note
                item {
                    Surface(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        color = Color.White,
                        border = BorderStroke(1.dp, BorderSubtle)
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center
                        ) {
                            Icon(
                                imageVector = Icons.Outlined.Lock,
                                contentDescription = "Secure",
                                tint = AgriGreenPrimary,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                "256-Bit SSL Encrypted Direct Farmer Settlement",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = AgriGreenPrimary
                            )
                        }
                    }
                }
            }

            // Bottom Action Area
            Column(modifier = Modifier.fillMaxWidth()) {
                if (isProcessing) {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 8.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center
                        ) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(20.dp),
                                color = AgriGreenPrimary,
                                strokeWidth = 2.dp
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                processingStep,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = AgriGreenPrimary
                            )
                        }
                    }
                }

                Button(
                    onClick = {
                        if (!isProcessing) {
                            isProcessing = true
                            scope.launch {
                                processingStep = "Connecting to Payment Gateway..."
                                delay(600)
                                processingStep = "Verifying Farm Produce Order..."
                                delay(600)
                                processingStep = "Payment Approved! Generating Bill..."
                                delay(500)

                                val primaryFarmer = cartItems.firstOrNull()?.product?.farmerName ?: "vans gajere"
                                val primaryFarm = cartItems.firstOrNull()?.product?.farmName ?: "Gajera Organic Farms"
                                val primaryBranch = cartItems.firstOrNull()?.product?.branch ?: "Surat Branch, Gujarat"

                                val sdf = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault())
                                val generatedBill = CustomerBill(
                                    id = "AGR-${(1000..9999).random()}",
                                    date = sdf.format(Date()),
                                    customerName = customerName.ifBlank { "Customer" },
                                    customerPhone = customerPhone.ifBlank { "9876543210" },
                                    deliveryAddress = deliveryAddress.ifBlank { "Surat, Gujarat" },
                                    items = cartItems,
                                    subtotal = subtotal,
                                    deliveryFee = deliveryFee,
                                    total = total,
                                    paymentMethod = paymentOptions.find { it.id == selectedMethodId }?.title?.split(" ")?.first() ?: "UPI",
                                    status = "Paid",
                                    farmerName = primaryFarmer,
                                    farmName = primaryFarm,
                                    farmBranch = primaryBranch
                                )

                                isProcessing = false
                                onPaymentSuccess(generatedBill)
                            }
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = AgriGreenPrimary),
                    shape = RoundedCornerShape(14.dp),
                    enabled = !isProcessing
                ) {
                    Text(
                        if (isProcessing) "Authorizing..." else "Pay ₹${"%.0f".format(total)} & Generate Tax Bill",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
            }
        }
    }
}
