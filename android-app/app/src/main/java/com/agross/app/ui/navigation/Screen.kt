package com.agross.app.ui.navigation

import com.agross.app.data.CustomerBill
import com.agross.app.data.UserRole

sealed class Screen(val route: String) {
    object Dashboard : Screen("dashboard")
    object Market : Screen("market")
    object Cart : Screen("cart")
    object Payment : Screen("payment")
    object AddCrop : Screen("add_crop")
    data class EditCrop(val product: com.agross.app.data.Product) : Screen("edit_crop")
    object Wallet : Screen("wallet")
    data class BillInvoice(val bill: CustomerBill) : Screen("bill_invoice")
    object EditProfile : Screen("edit_profile")
    data class Login(val defaultRole: UserRole = UserRole.CUSTOMER) : Screen("login")
    data class Register(val defaultRole: UserRole = UserRole.FARMER) : Screen("register")
}
