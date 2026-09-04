package com.agross.app.data

enum class UserRole(val displayName: String) {
    GUEST("Guest"),
    CUSTOMER("Customer"),
    FARMER("Farmer")
}

enum class AccountStatus(val displayName: String) {
    PENDING_APPROVAL("Pending Admin Approval"),
    APPROVED("Approved & Active"),
    REJECTED("Rejected")
}

data class UserAccount(
    val id: String,
    val name: String,
    val identifier: String, // phone or email
    val email: String? = null,
    val role: UserRole,
    val status: AccountStatus = AccountStatus.PENDING_APPROVAL,
    val farmName: String? = null,
    val branch: String? = null,
    val location: String? = null,
    val bankUpi: String? = null,
    val deliveryAddress: String? = null
)

data class Category(
    val id: String,
    val name: String,
    val emoji: String,
    val itemCount: Int,
    val isSelected: Boolean = false
)

data class Product(
    val id: String,
    val name: String,
    val category: String,
    val price: Double,
    val originalPrice: Double? = null,
    val unit: String = "kg",
    val farmerName: String,
    val farmName: String = "",
    val branch: String = "",
    val location: String,
    val rating: Double,
    val reviewCount: Int,
    val isOrganic: Boolean = true,
    val isFreshHarvest: Boolean = true,
    val stockAvailableKg: Int,
    val ordersCount: Int = 0,
    val emoji: String,
    val imageUrl: String? = null,
    val description: String = ""
)

data class FarmerProfile(
    val id: String,
    val name: String,
    val farmName: String,
    val location: String,
    val state: String,
    val rating: Double,
    val totalCropsSupplied: Int,
    val experienceYears: Int,
    val verified: Boolean = true,
    val status: AccountStatus = AccountStatus.APPROVED
)

object MockDataProvider {
    val categories = listOf(
        Category("1", "All", "🌱", 42, isSelected = true),
        Category("2", "Vegetables", "🥦", 18),
        Category("3", "Fruits", "🍎", 14),
        Category("4", "Grains & Pulses", "🌾", 6),
        Category("5", "Organic Herbs", "🌿", 4)
    )

    val featuredProducts = listOf(
        Product(
            id = "p1",
            name = "Organic Farm Tomatoes",
            category = "Vegetables",
            price = 35.0,
            originalPrice = 45.0,
            unit = "kg",
            farmerName = "Ramesh Patil",
            location = "Nashik, MH",
            rating = 4.9,
            reviewCount = 128,
            isOrganic = true,
            isFreshHarvest = true,
            stockAvailableKg = 150,
            emoji = "🍅",
            description = "Naturally ripened, pesticide-free fresh farm tomatoes picked this morning."
        ),
        Product(
            id = "p2",
            name = "Shimla Royal Apples",
            category = "Fruits",
            price = 140.0,
            originalPrice = 170.0,
            unit = "kg",
            farmerName = "Suresh Sharma",
            location = "Shimla, HP",
            rating = 4.8,
            reviewCount = 94,
            isOrganic = true,
            isFreshHarvest = true,
            stockAvailableKg = 80,
            emoji = "🍎",
            description = "Crisp, sweet, directly harvested high-altitude orchard apples."
        ),
        Product(
            id = "p3",
            name = "Crisp Green Capsicum",
            category = "Vegetables",
            price = 48.0,
            originalPrice = 60.0,
            unit = "kg",
            farmerName = "Baburao Shinde",
            location = "Pune, MH",
            rating = 4.7,
            reviewCount = 65,
            isOrganic = false,
            isFreshHarvest = true,
            stockAvailableKg = 60,
            emoji = "🫑",
            description = "Freshly harvested crunchy green bell peppers."
        ),
        Product(
            id = "p4",
            name = "Nagpur Sweet Oranges",
            category = "Fruits",
            price = 85.0,
            originalPrice = 100.0,
            unit = "kg",
            farmerName = "Devendra Joshi",
            location = "Nagpur, MH",
            rating = 4.9,
            reviewCount = 142,
            isOrganic = true,
            isFreshHarvest = true,
            stockAvailableKg = 200,
            emoji = "🍊",
            description = "Juicy and vitamin C packed farm-picked Nagpur santra."
        ),
        Product(
            id = "p5",
            name = "Fresh Spinach (Palak)",
            category = "Vegetables",
            price = 20.0,
            originalPrice = 30.0,
            unit = "bunch",
            farmerName = "Kishore Kumar",
            location = "Surat, GJ",
            rating = 4.6,
            reviewCount = 53,
            isOrganic = true,
            isFreshHarvest = true,
            stockAvailableKg = 90,
            emoji = "🥬",
            description = "Zero chemical tender palak leaves, harvested at dawn."
        ),
        Product(
            id = "p6",
            name = "Alphonso Mangoes (Ratnagiri)",
            category = "Fruits",
            price = 650.0,
            originalPrice = 800.0,
            unit = "dozen",
            farmerName = "Ganesh Sawant",
            location = "Ratnagiri, MH",
            rating = 5.0,
            reviewCount = 210,
            isOrganic = true,
            isFreshHarvest = true,
            stockAvailableKg = 40,
            emoji = "🥭",
            description = "Authentic GI-tagged Ratnagiri Hapus mangoes directly from farmer grove."
        )
    )

    val topFarmers = listOf(
        FarmerProfile(
            id = "f1",
            name = "Ramesh Patil",
            farmName = "Patil Organic Acres",
            location = "Nashik",
            state = "Maharashtra",
            rating = 4.9,
            totalCropsSupplied = 1840,
            experienceYears = 14
        ),
        FarmerProfile(
            id = "f2",
            name = "Suresh Sharma",
            farmName = "Valley Apple Orchards",
            location = "Shimla",
            state = "Himachal Pradesh",
            rating = 4.8,
            totalCropsSupplied = 920,
            experienceYears = 11
        ),
        FarmerProfile(
            id = "f3",
            name = "Sunita Devi",
            farmName = "Green Leaf Cooperative",
            location = "Varanasi",
            state = "Uttar Pradesh",
            rating = 4.95,
            totalCropsSupplied = 2300,
            experienceYears = 16
        )
    )

    val registeredUsers = mutableListOf(
        UserAccount(
            id = "F-106",
            name = "vans gajere",
            identifier = "9870011223",
            email = "vanshgajera@example.com",
            role = UserRole.FARMER,
            status = AccountStatus.APPROVED,
            farmName = "Gajera Organic Farms",
            branch = "Surat Branch, Gujarat",
            location = "Surat, Gujarat",
            bankUpi = "Gajera@oksbi"
        )
    )

    fun registerUser(account: UserAccount) {
        registeredUsers.add(0, account)
    }

    fun findUser(identifier: String): UserAccount? {
        val clean = identifier.trim()
        return registeredUsers.find { 
            it.identifier.equals(clean, ignoreCase = true) ||
            (it.email != null && it.email.equals(clean, ignoreCase = true))
        }
    }

    fun approveUser(id: String) {
        val index = registeredUsers.indexOfFirst { it.id == id }
        if (index != -1) {
            val user = registeredUsers[index]
            registeredUsers[index] = user.copy(status = AccountStatus.APPROVED)
        }
    }
}

data class CartItem(
    val product: Product,
    var quantity: Int = 1
) {
    val lineTotal: Double
        get() = product.price * quantity
}

data class PaymentMethodOption(
    val id: String,
    val title: String,
    val subtitle: String,
    val iconEmoji: String,
    val isRecommended: Boolean = false
)

data class CustomerBill(
    val id: String,
    val date: String,
    val customerName: String,
    val customerPhone: String,
    val customerEmail: String = "urvishjivani@gmail.com",
    val deliveryAddress: String,
    val items: List<CartItem>,
    val farmerMentionedPrice: Double = 140.0,
    val subtotal: Double,
    val deliveryFee: Double,
    val total: Double,
    val paymentMethod: String,
    val status: String = "Paid",
    val farmerName: String = "Anash Retiwala",
    val farmerEmail: String = "anasretiwala@gmail.com",
    val farmName: String = "AR Organic",
    val farmBranch: String = "Surat"
)

data class PayoutRecord(
    val id: String,
    val farmer: String,
    val farmName: String,
    val bankUpi: String,
    val billId: String,
    val netAmount: Double,
    val status: String = "Pending", // "Pending" or "Settled"
    val date: String
)

data class WithdrawalRecord(
    val id: String,
    val farmer: String,
    val amount: Double,
    val bankUpi: String,
    val status: String = "Completed",
    val date: String
)
