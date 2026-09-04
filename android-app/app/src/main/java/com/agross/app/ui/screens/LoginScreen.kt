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
import com.agross.app.data.UserRole
import com.agross.app.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    initialRole: UserRole = UserRole.CUSTOMER,
    onNavigateBack: () -> Unit,
    onNavigateToRegister: (UserRole) -> Unit,
    onLoginSuccess: (String, UserRole) -> Unit
) {
    var selectedRole by remember { mutableStateOf(if (initialRole == UserRole.FARMER) UserRole.FARMER else UserRole.CUSTOMER) }
    var identifier by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var isPasswordVisible by remember { mutableStateOf(false) }
    var rememberMe by remember { mutableStateOf(true) }
    var isOtpMode by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var isAccountPendingApproval by remember { mutableStateOf(false) }
    var pendingAccountName by remember { mutableStateOf("") }

    val primaryAccent = if (selectedRole == UserRole.FARMER) HarvestAmber else AgriGreenPrimary

    Scaffold(
        topBar = {
            TopAppBar(
                title = { },
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
            // Brand Banner Header
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        brush = Brush.verticalGradient(
                            colors = listOf(AgriGreenPrimary, AgriGreenMedium)
                        )
                    )
                    .padding(horizontal = 24.dp, vertical = 20.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Box(
                        modifier = Modifier
                            .size(68.dp)
                            .clip(CircleShape)
                            .background(Color.White.copy(alpha = 0.2f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = if (selectedRole == UserRole.FARMER) "👨‍🌾" else "🛒",
                            fontSize = 36.sp
                        )
                    }
                    Spacer(modifier = Modifier.height(10.dp))
                    Text(
                        text = if (selectedRole == UserRole.FARMER) "Farmer Portal Login" else "Customer Portal Login",
                        color = Color.White,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = if (selectedRole == UserRole.FARMER)
                            "Manage your produce, price quotes & payments"
                        else
                            "Order fresh farm vegetables & fruits directly",
                        color = Color.White.copy(alpha = 0.85f),
                        fontSize = 13.sp,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(top = 4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Main Login Card
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
                border = BorderStroke(1.dp, AgriBorder.copy(alpha = 0.6f))
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(24.dp)
                ) {
                    // Segmented Role Switcher
                    Text(
                        text = "Select Your Role",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = TextLight,
                        modifier = Modifier.padding(bottom = 8.dp)
                    )

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(AgriSurfaceVariant)
                            .padding(4.dp),
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        // Customer Tab
                        Surface(
                            modifier = Modifier
                                .weight(1f)
                                .fillMaxHeight()
                                .clickable { selectedRole = UserRole.CUSTOMER },
                            shape = RoundedCornerShape(10.dp),
                            color = if (selectedRole == UserRole.CUSTOMER) AgriGreenPrimary else Color.Transparent
                        ) {
                            Row(
                                modifier = Modifier.fillMaxSize(),
                                horizontalArrangement = Arrangement.Center,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text("🛒", fontSize = 14.sp)
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "Customer",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (selectedRole == UserRole.CUSTOMER) Color.White else TextDark
                                )
                            }
                        }

                        // Farmer Tab
                        Surface(
                            modifier = Modifier
                                .weight(1f)
                                .fillMaxHeight()
                                .clickable { selectedRole = UserRole.FARMER },
                            shape = RoundedCornerShape(10.dp),
                            color = if (selectedRole == UserRole.FARMER) HarvestAmber else Color.Transparent
                        ) {
                            Row(
                                modifier = Modifier.fillMaxSize(),
                                horizontalArrangement = Arrangement.Center,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text("👨‍🌾", fontSize = 14.sp)
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "Farmer",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (selectedRole == UserRole.FARMER) Color.Black else TextDark
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    // Input 1: Phone / Email
                    Text(
                        text = if (selectedRole == UserRole.FARMER) "Mobile Number or Kisan ID" else "Mobile Number or Email",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = TextDark,
                        modifier = Modifier.padding(bottom = 6.dp)
                    )
                    OutlinedTextField(
                        value = identifier,
                        onValueChange = {
                            identifier = it
                            errorMessage = null
                        },
                        modifier = Modifier.fillMaxWidth(),
                        placeholder = {
                            Text(
                                if (selectedRole == UserRole.FARMER) "Enter 10-digit mobile number" else "e.g. 9876543210 or email",
                                color = TextMuted,
                                fontSize = 14.sp
                            )
                        },
                        leadingIcon = {
                            Icon(
                                imageVector = if (selectedRole == UserRole.FARMER) Icons.Outlined.Phone else Icons.Outlined.Email,
                                contentDescription = null,
                                tint = AgriGreenMedium
                            )
                        },
                        shape = RoundedCornerShape(14.dp),
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // Input 2: Password / OTP
                    AnimatedVisibility(visible = !isOtpMode) {
                        Column {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "Password",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = TextDark
                                )
                                Text(
                                    text = "Forgot Password?",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = AgriGreenPrimary,
                                    modifier = Modifier.clickable { /* Handle forgot password */ }
                                )
                            }
                            Spacer(modifier = Modifier.height(6.dp))
                            OutlinedTextField(
                                value = password,
                                onValueChange = {
                                    password = it
                                    errorMessage = null
                                },
                                modifier = Modifier.fillMaxWidth(),
                                placeholder = { Text("Enter your password", color = TextMuted, fontSize = 14.sp) },
                                leadingIcon = {
                                    Icon(
                                        imageVector = Icons.Outlined.Lock,
                                        contentDescription = null,
                                        tint = AgriGreenMedium
                                    )
                                },
                                trailingIcon = {
                                    IconButton(onClick = { isPasswordVisible = !isPasswordVisible }) {
                                        Icon(
                                            imageVector = if (isPasswordVisible) Icons.Filled.Visibility else Icons.Filled.VisibilityOff,
                                            contentDescription = if (isPasswordVisible) "Hide password" else "Show password",
                                            tint = TextLight
                                        )
                                    }
                                },
                                visualTransformation = if (isPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                                shape = RoundedCornerShape(14.dp),
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password)
                            )
                        }
                    }

                    // Pending Approval Notice Banner
                    if (isAccountPendingApproval) {
                        Spacer(modifier = Modifier.height(10.dp))
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = BadgeOrangeBg,
                            border = BorderStroke(1.dp, HarvestAmber),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text("⏳", fontSize = 18.sp)
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = "Account Verification Pending",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 13.sp,
                                        color = Color(0xFF78350F)
                                    )
                                }
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "Dear $pendingAccountName, your ${selectedRole.displayName} account registration is awaiting Admin verification. Once approved by the Agross Admin, your login will be activated immediately.",
                                    fontSize = 11.5.sp,
                                    color = Color(0xFF92400E),
                                    lineHeight = 16.sp
                                )
                            }
                        }
                    }

                    // Error Feedback
                    if (errorMessage != null) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = errorMessage ?: "",
                            color = FreshTomatoRed,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Remember Me & OTP Switch
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Checkbox(
                                checked = rememberMe,
                                onCheckedChange = { rememberMe = it },
                                colors = CheckboxDefaults.colors(checkedColor = AgriGreenPrimary)
                            )
                            Text(
                                text = "Remember me",
                                fontSize = 13.sp,
                                color = TextDark
                            )
                        }

                        Text(
                            text = if (isOtpMode) "Use Password" else "Login via OTP",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = AgriGreenMedium,
                            modifier = Modifier.clickable { isOtpMode = !isOtpMode }
                        )
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    // Radiant Login Button
                    Button(
                        onClick = {
                            if (identifier.isBlank()) {
                                errorMessage = "Please enter your mobile number or email"
                                isAccountPendingApproval = false
                            } else {
                                val existingUser = MockDataProvider.findUser(identifier)
                                if (existingUser != null) {
                                    when (existingUser.status) {
                                        AccountStatus.PENDING_APPROVAL -> {
                                            isAccountPendingApproval = true
                                            pendingAccountName = existingUser.name
                                            errorMessage = null
                                        }
                                        AccountStatus.REJECTED -> {
                                            isAccountPendingApproval = false
                                            errorMessage = "Your registration was rejected by Admin. Please contact Agross support."
                                        }
                                        AccountStatus.APPROVED -> {
                                            isAccountPendingApproval = false
                                            errorMessage = null
                                            onLoginSuccess(existingUser.name, existingUser.role)
                                        }
                                    }
                                } else {
                                    isAccountPendingApproval = false
                                    errorMessage = "Account not found for this mobile/email. Please register first."
                                }
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
                        elevation = ButtonDefaults.buttonElevation(defaultElevation = 2.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Login,
                                contentDescription = null,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = if (selectedRole == UserRole.FARMER) "Sign In to Farmer Panel" else "Sign In to Customer Panel",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    // Social login divider
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Divider(modifier = Modifier.weight(1f), color = AgriBorder)
                        Text(
                            text = "Or continue with",
                            fontSize = 12.sp,
                            color = TextLight,
                            modifier = Modifier.padding(horizontal = 12.dp)
                        )
                        Divider(modifier = Modifier.weight(1f), color = AgriBorder)
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Quick login buttons
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        OutlinedButton(
                            onClick = { onLoginSuccess("Google User", selectedRole) },
                            modifier = Modifier
                                .weight(1f)
                                .height(46.dp),
                            shape = RoundedCornerShape(14.dp),
                            border = BorderStroke(1.dp, AgriBorder)
                        ) {
                            Text("🌐 Google", fontSize = 13.sp, color = TextDark, fontWeight = FontWeight.SemiBold)
                        }

                        OutlinedButton(
                            onClick = { onLoginSuccess("Verified Mobile", selectedRole) },
                            modifier = Modifier
                                .weight(1f)
                                .height(46.dp),
                            shape = RoundedCornerShape(14.dp),
                            border = BorderStroke(1.dp, AgriBorder)
                        ) {
                            Text("📱 Fast OTP", fontSize = 13.sp, color = TextDark, fontWeight = FontWeight.SemiBold)
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Footer: Navigate to Register
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 24.dp),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Don't have an account?",
                    fontSize = 14.sp,
                    color = TextMedium
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = "Register Now",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = AgriGreenPrimary,
                    modifier = Modifier.clickable { onNavigateToRegister(selectedRole) }
                )
            }
        }
    }
}
