package com.agross.app.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.agross.app.data.AccountStatus
import com.agross.app.data.MockDataProvider
import com.agross.app.data.UserAccount
import com.agross.app.data.UserRole
import com.agross.app.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RegisterScreen(
    initialRole: UserRole = UserRole.FARMER,
    onNavigateBack: () -> Unit,
    onNavigateToLogin: (UserRole) -> Unit,
    onRegisterSuccess: (UserAccount) -> Unit
) {
    var selectedRole by remember { mutableStateOf(initialRole) }

    // Common fields
    var fullName by remember { mutableStateOf("") }
    var mobileNumber by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var isPasswordVisible by remember { mutableStateOf(false) }
    var agreeTerms by remember { mutableStateOf(true) }

    // Customer fields
    var deliveryAddress by remember { mutableStateOf("") }
    var pincode by remember { mutableStateOf("") }

    // Farmer fields
    var farmName by remember { mutableStateOf("") }
    var villageDistrict by remember { mutableStateOf("") }
    var farmProduceType by remember { mutableStateOf("Both Vegetables & Fruits") }
    var upiIdForPayouts by remember { mutableStateOf("") }

    var errorMessage by remember { mutableStateOf<String?>(null) }
    var showApprovalNoticeDialog by remember { mutableStateOf(false) }
    var registeredAccount by remember { mutableStateOf<UserAccount?>(null) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Create Account",
                        color = Color.White,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Back",
                            tint = Color.White
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = AgriGreenPrimary
                )
            )
        },
        containerColor = AgriBackground
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
        ) {
            // Header Hero Banner
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        brush = Brush.verticalGradient(
                            colors = listOf(AgriGreenPrimary, AgriGreenMedium)
                        )
                    )
                    .padding(horizontal = 20.dp, vertical = 18.dp)
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
                    Text(
                        text = "Join Agross Community",
                        color = Color.White,
                        fontSize = 24.sp,
                        fontWeight = FontWeight.ExtraBold
                    )
                    Text(
                        text = "Choose your role to get started with the freshest agri-marketplace",
                        color = Color.White.copy(alpha = 0.85f),
                        fontSize = 13.sp,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(top = 4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Role Chooser Cards
            Column(modifier = Modifier.padding(horizontal = 16.dp)) {
                Text(
                    text = "I am registering as:",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextDark,
                    modifier = Modifier.padding(bottom = 10.dp)
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // Farmer Option Card
                    Card(
                        modifier = Modifier
                            .weight(1f)
                            .clickable { selectedRole = UserRole.FARMER },
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = if (selectedRole == UserRole.FARMER) BadgeOrangeBg.copy(alpha = 0.8f) else Color.White
                        ),
                        border = BorderStroke(
                            2.dp,
                            if (selectedRole == UserRole.FARMER) HarvestAmber else AgriBorder
                        )
                    ) {
                        Column(
                            modifier = Modifier.padding(14.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text("👨‍🌾", fontSize = 32.sp)
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "Farmer",
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp,
                                color = if (selectedRole == UserRole.FARMER) Color(0xFF78350F) else TextDark
                            )
                            Text(
                                text = "Sell fresh produce\nDirect bank payout",
                                fontSize = 11.sp,
                                color = TextMedium,
                                textAlign = TextAlign.Center,
                                lineHeight = 14.sp
                            )
                        }
                    }

                    // Customer Option Card
                    Card(
                        modifier = Modifier
                            .weight(1f)
                            .clickable { selectedRole = UserRole.CUSTOMER },
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = if (selectedRole == UserRole.CUSTOMER) AgriSurfaceVariant else Color.White
                        ),
                        border = BorderStroke(
                            2.dp,
                            if (selectedRole == UserRole.CUSTOMER) AgriGreenPrimary else AgriBorder
                        )
                    ) {
                        Column(
                            modifier = Modifier.padding(14.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text("🛒", fontSize = 32.sp)
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "Customer",
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp,
                                color = if (selectedRole == UserRole.CUSTOMER) AgriGreenPrimary else TextDark
                            )
                            Text(
                                text = "Buy fresh vegetables\nDirect from farms",
                                fontSize = 11.sp,
                                color = TextMedium,
                                textAlign = TextAlign.Center,
                                lineHeight = 14.sp
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Registration Form Card
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 3.dp),
                border = BorderStroke(1.dp, AgriBorder.copy(alpha = 0.7f))
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp)
                ) {
                    // Common Field: Full Name
                    Text("Full Name", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = TextDark)
                    Spacer(modifier = Modifier.height(4.dp))
                    OutlinedTextField(
                        value = fullName,
                        onValueChange = { fullName = it },
                        modifier = Modifier.fillMaxWidth(),
                        placeholder = { Text(if (selectedRole == UserRole.FARMER) "e.g. Ramesh Patil" else "e.g. Priya Sharma", fontSize = 13.sp, color = TextMuted) },
                        leadingIcon = { Icon(Icons.Outlined.Person, contentDescription = null, tint = AgriGreenMedium) },
                        shape = RoundedCornerShape(12.dp),
                        singleLine = true
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    // Common Field: Mobile Number
                    Text("Mobile Number (for OTP & Order updates)", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = TextDark)
                    Spacer(modifier = Modifier.height(4.dp))
                    OutlinedTextField(
                        value = mobileNumber,
                        onValueChange = { mobileNumber = it },
                        modifier = Modifier.fillMaxWidth(),
                        placeholder = { Text("10-digit mobile number", fontSize = 13.sp, color = TextMuted) },
                        leadingIcon = { Icon(Icons.Outlined.Phone, contentDescription = null, tint = AgriGreenMedium) },
                        shape = RoundedCornerShape(12.dp),
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone)
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    // Common Field: Email (Optional for Farmers)
                    Text(
                        text = if (selectedRole == UserRole.FARMER) "Email Address (Optional)" else "Email Address",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = TextDark
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    OutlinedTextField(
                        value = email,
                        onValueChange = { email = it },
                        modifier = Modifier.fillMaxWidth(),
                        placeholder = { Text("your.email@example.com", fontSize = 13.sp, color = TextMuted) },
                        leadingIcon = { Icon(Icons.Outlined.Email, contentDescription = null, tint = AgriGreenMedium) },
                        shape = RoundedCornerShape(12.dp),
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
                    )

                    // ROLE-SPECIFIC FIELDS: FARMER
                    AnimatedVisibility(visible = selectedRole == UserRole.FARMER) {
                        Column {
                            Spacer(modifier = Modifier.height(14.dp))
                            Text("Farm Name / Orchard Name", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = TextDark)
                            Spacer(modifier = Modifier.height(4.dp))
                            OutlinedTextField(
                                value = farmName,
                                onValueChange = { farmName = it },
                                modifier = Modifier.fillMaxWidth(),
                                placeholder = { Text("e.g. Green Valley Organic Farms", fontSize = 13.sp, color = TextMuted) },
                                leadingIcon = { Icon(Icons.Outlined.Agriculture, contentDescription = null, tint = HarvestAmber) },
                                shape = RoundedCornerShape(12.dp),
                                singleLine = true
                            )

                            Spacer(modifier = Modifier.height(14.dp))
                            Text("Farm Location / Village & District", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = TextDark)
                            Spacer(modifier = Modifier.height(4.dp))
                            OutlinedTextField(
                                value = villageDistrict,
                                onValueChange = { villageDistrict = it },
                                modifier = Modifier.fillMaxWidth(),
                                placeholder = { Text("e.g. Ozar Village, Nashik, Maharashtra", fontSize = 13.sp, color = TextMuted) },
                                leadingIcon = { Icon(Icons.Outlined.LocationOn, contentDescription = null, tint = HarvestAmber) },
                                shape = RoundedCornerShape(12.dp),
                                singleLine = true
                            )

                            Spacer(modifier = Modifier.height(14.dp))
                            Text("UPI ID or Bank Account (For direct crop payouts)", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = TextDark)
                            Spacer(modifier = Modifier.height(4.dp))
                            OutlinedTextField(
                                value = upiIdForPayouts,
                                onValueChange = { upiIdForPayouts = it },
                                modifier = Modifier.fillMaxWidth(),
                                placeholder = { Text("e.g. farmername@oksbi or account number", fontSize = 13.sp, color = TextMuted) },
                                leadingIcon = { Icon(Icons.Outlined.Payments, contentDescription = null, tint = HarvestAmber) },
                                shape = RoundedCornerShape(12.dp),
                                singleLine = true
                            )
                        }
                    }

                    // ROLE-SPECIFIC FIELDS: CUSTOMER
                    AnimatedVisibility(visible = selectedRole == UserRole.CUSTOMER) {
                        Column {
                            Spacer(modifier = Modifier.height(14.dp))
                            Text("Delivery Address", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = TextDark)
                            Spacer(modifier = Modifier.height(4.dp))
                            OutlinedTextField(
                                value = deliveryAddress,
                                onValueChange = { deliveryAddress = it },
                                modifier = Modifier.fillMaxWidth(),
                                placeholder = { Text("Flat/House No, Street, Landmark", fontSize = 13.sp, color = TextMuted) },
                                leadingIcon = { Icon(Icons.Outlined.Home, contentDescription = null, tint = AgriGreenMedium) },
                                shape = RoundedCornerShape(12.dp),
                                singleLine = true
                            )

                            Spacer(modifier = Modifier.height(14.dp))
                            Text("Pincode / Area Code", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = TextDark)
                            Spacer(modifier = Modifier.height(4.dp))
                            OutlinedTextField(
                                value = pincode,
                                onValueChange = { pincode = it },
                                modifier = Modifier.fillMaxWidth(),
                                placeholder = { Text("e.g. 400001", fontSize = 13.sp, color = TextMuted) },
                                leadingIcon = { Icon(Icons.Outlined.PinDrop, contentDescription = null, tint = AgriGreenMedium) },
                                shape = RoundedCornerShape(12.dp),
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // Password
                    Text("Password", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = TextDark)
                    Spacer(modifier = Modifier.height(4.dp))
                    OutlinedTextField(
                        value = password,
                        onValueChange = { password = it },
                        modifier = Modifier.fillMaxWidth(),
                        placeholder = { Text("At least 6 characters", fontSize = 13.sp, color = TextMuted) },
                        leadingIcon = { Icon(Icons.Outlined.Lock, contentDescription = null, tint = AgriGreenMedium) },
                        trailingIcon = {
                            IconButton(onClick = { isPasswordVisible = !isPasswordVisible }) {
                                Icon(
                                    imageVector = if (isPasswordVisible) Icons.Filled.Visibility else Icons.Filled.VisibilityOff,
                                    contentDescription = null,
                                    tint = TextLight
                                )
                            }
                        },
                        visualTransformation = if (isPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                        shape = RoundedCornerShape(12.dp),
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password)
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    // Terms checkbox
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Checkbox(
                            checked = agreeTerms,
                            onCheckedChange = { agreeTerms = it },
                            colors = CheckboxDefaults.colors(checkedColor = AgriGreenPrimary)
                        )
                        Text(
                            text = "I agree to Agross Fair-Trade Terms & Privacy Policy",
                            fontSize = 12.sp,
                            color = TextDark
                        )
                    }

                    // Error message
                    if (errorMessage != null) {
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = errorMessage ?: "",
                            color = FreshTomatoRed,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }

                    Spacer(modifier = Modifier.height(18.dp))

                    // Register Button
                    Button(
                        onClick = {
                            if (fullName.isBlank()) {
                                errorMessage = "Please enter your full name"
                            } else if (mobileNumber.isBlank()) {
                                errorMessage = "Please enter your mobile number"
                            } else if (!agreeTerms) {
                                errorMessage = "Please agree to the Agross terms"
                            } else {
                                val newAccount = UserAccount(
                                    id = "U-${System.currentTimeMillis() % 10000}",
                                    name = fullName,
                                    identifier = mobileNumber,
                                    email = email.ifBlank { null },
                                    role = selectedRole,
                                    status = AccountStatus.PENDING_APPROVAL,
                                    farmName = if (selectedRole == UserRole.FARMER) farmName else null,
                                    branch = if (selectedRole == UserRole.FARMER) villageDistrict else null,
                                    location = if (selectedRole == UserRole.FARMER) villageDistrict else null,
                                    bankUpi = if (selectedRole == UserRole.FARMER) upiIdForPayouts else null,
                                    deliveryAddress = if (selectedRole == UserRole.CUSTOMER) deliveryAddress else null
                                )
                                MockDataProvider.registerUser(newAccount)
                                registeredAccount = newAccount
                                showApprovalNoticeDialog = true
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp),
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (selectedRole == UserRole.FARMER) HarvestAmber else AgriGreenPrimary,
                            contentColor = if (selectedRole == UserRole.FARMER) Color.Black else Color.White
                        ),
                        elevation = ButtonDefaults.buttonElevation(defaultElevation = 3.dp)
                    ) {
                        Text(
                            text = if (selectedRole == UserRole.FARMER) "Register as Farmer & Start Selling" else "Create Customer Account & Shop Fresh",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }

            // Approval Notice Dialog
            if (showApprovalNoticeDialog) {
                AlertDialog(
                    onDismissRequest = { /* Force explicit button press */ },
                    icon = {
                        Text(
                            text = if (selectedRole == UserRole.FARMER) "👨‍🌾" else "🛒",
                            fontSize = 40.sp
                        )
                    },
                    title = {
                        Text(
                            text = "Registration Submitted for Admin Approval",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            textAlign = TextAlign.Center
                        )
                    },
                    text = {
                        Column {
                            Text(
                                text = "Welcome to Agross, ${fullName}! Your ${if (selectedRole == UserRole.FARMER) "Farmer" else "Customer"} registration details have been sent to the Admin Panel for verification.",
                                fontSize = 13.sp,
                                color = TextDark
                            )
                            Spacer(modifier = Modifier.height(10.dp))
                            Surface(
                                shape = RoundedCornerShape(10.dp),
                                color = BadgeOrangeBg,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(
                                    modifier = Modifier.padding(10.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text("⏳", fontSize = 16.sp)
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = "Status: Pending Admin Approval.\nYou can log in once the admin verifies your account.",
                                        fontSize = 11.5.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = BadgeOrangeText
                                    )
                                }
                            }
                        }
                    },
                    confirmButton = {
                        Button(
                            onClick = {
                                showApprovalNoticeDialog = false
                                registeredAccount?.let { onRegisterSuccess(it) }
                                onNavigateToLogin(selectedRole)
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = AgriGreenPrimary),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text("Go to Login Page", fontWeight = FontWeight.Bold)
                        }
                    }
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Footer: Already have account
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 24.dp),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Already have an account?",
                    fontSize = 14.sp,
                    color = TextMedium
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = "Sign In",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = AgriGreenPrimary,
                    modifier = Modifier.clickable { onNavigateToLogin(selectedRole) }
                )
            }
        }
    }
}
