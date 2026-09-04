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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.agross.app.data.Product
import com.agross.app.ui.theme.*

data class CropPreset(val name: String, val emoji: String, val defaultUnit: String, val suggestedPrice: Double, val imageUrl: String? = null)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddCropScreen(
    farmerName: String?,
    farmName: String?,
    farmLocation: String?,
    editingProduct: Product? = null,
    onNavigateBack: () -> Unit,
    onCropPublished: (Product) -> Unit
) {
    val isEditing = editingProduct != null

    var selectedCategory by remember { mutableStateOf(editingProduct?.category ?: "Vegetables") }
    var productName by remember { mutableStateOf(editingProduct?.name ?: "") }
    var selectedEmoji by remember { mutableStateOf(editingProduct?.emoji ?: "🥦") }
    var imageUrl by remember { mutableStateOf(editingProduct?.imageUrl) }
    var priceText by remember { mutableStateOf(editingProduct?.price?.let { if (it % 1.0 == 0.0) it.toInt().toString() else it.toString() } ?: "") }
    var unit by remember { mutableStateOf(editingProduct?.unit ?: "kg") }
    var stockText by remember { mutableStateOf((editingProduct?.stockAvailableKg ?: 100).toString()) }
    var currentFarmName by remember { mutableStateOf(editingProduct?.farmName ?: farmName ?: "Gajera Organic Farms") }
    var currentBranch by remember { mutableStateOf(editingProduct?.branch ?: editingProduct?.location ?: farmLocation ?: "Surat Branch, Gujarat") }
    var description by remember { mutableStateOf(editingProduct?.description?.ifEmpty { "Naturally ripened farm-fresh produce harvested this morning." } ?: "Naturally ripened farm-fresh produce harvested this morning.") }

    val categoriesList = listOf(
        Pair("Vegetables", "🥦"),
        Pair("Fruits", "🍎"),
        Pair("Grains & Pulses", "🌾"),
        Pair("Organic Herbs", "🌿")
    )

    val presetsByCategory = mapOf(
        "Vegetables" to listOf(
            CropPreset("Fresh Organic Broccoli", "🥦", "kg", 30.0, "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=500&auto=format&fit=crop&q=80"),
            CropPreset("Farm Fresh Tomatoes", "🍅", "kg", 35.0, "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80"),
            CropPreset("Crisp Green Capsicum", "🫑", "kg", 48.0, "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=500&auto=format&fit=crop&q=80"),
            CropPreset("Fresh Spinach (Palak)", "🥬", "bunch", 20.0, "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop&q=80"),
            CropPreset("Organic Red Onions", "🧅", "kg", 28.0, "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&auto=format&fit=crop&q=80"),
            CropPreset("Farm Fresh Potatoes", "🥔", "kg", 25.0, "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=80"),
            CropPreset("Sweet Orange Carrots", "🥕", "kg", 40.0, "https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?w=500&auto=format&fit=crop&q=80"),
            CropPreset("Green Cucumbers", "🥒", "kg", 30.0, "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=500&auto=format&fit=crop&q=80")
        ),
        "Fruits" to listOf(
            CropPreset("Shimla Royal Apples", "🍎", "kg", 140.0, "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=80"),
            CropPreset("Ratnagiri Alphonso Mangoes", "🥭", "dozen", 650.0, "https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&auto=format&fit=crop&q=80"),
            CropPreset("Nagpur Sweet Oranges", "🍊", "kg", 85.0, "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=500&auto=format&fit=crop&q=80"),
            CropPreset("Robusta Fresh Bananas", "🍌", "dozen", 45.0, "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=80"),
            CropPreset("Organic Red Papaya", "🍈", "kg", 35.0, "https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=500&auto=format&fit=crop&q=80"),
            CropPreset("Black Seedless Grapes", "🍇", "kg", 110.0, "https://images.unsplash.com/photo-1596363505729-4190a9506133?w=500&auto=format&fit=crop&q=80"),
            CropPreset("Mahabaleshwar Strawberries", "🍓", "box", 90.0, "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500&auto=format&fit=crop&q=80")
        ),
        "Grains & Pulses" to listOf(
            CropPreset("Sharbati Whole Wheat", "🌾", "kg", 42.0, "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=80"),
            CropPreset("Dehradun Basmati Rice", "🍚", "kg", 95.0, "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80"),
            CropPreset("Unpolished Moong Dal", "🌱", "kg", 120.0, "https://images.unsplash.com/photo-1585994192701-f1a505c8574a?w=500&auto=format&fit=crop&q=80"),
            CropPreset("Organic Pearl Millet (Bajra)", "🌾", "kg", 38.0, "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=80"),
            CropPreset("Desi Toor Dal", "🥣", "kg", 140.0, "https://images.unsplash.com/photo-1585994192701-f1a505c8574a?w=500&auto=format&fit=crop&q=80")
        ),
        "Organic Herbs" to listOf(
            CropPreset("Fresh Green Coriander (Dhania)", "🌿", "bunch", 15.0, "https://images.unsplash.com/photo-1589135233689-d5626244ec5f?w=500&auto=format&fit=crop&q=80"),
            CropPreset("Aromatic Mint Leaves (Pudina)", "🍃", "bunch", 15.0, "https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=500&auto=format&fit=crop&q=80"),
            CropPreset("Organic Holy Tulsi", "🌱", "bunch", 25.0, "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop&q=80"),
            CropPreset("Fresh Curry Leaves", "🌿", "bunch", 10.0, "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=80"),
            CropPreset("Organic Garlic Cloves", "🧄", "kg", 160.0, "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=500&auto=format&fit=crop&q=80")
        )
    )

    val currentPresets = presetsByCategory[selectedCategory] ?: emptyList()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        if (isEditing) "✏️ Edit Crop Details" else "🌱 List New Farm Crop",
                        fontWeight = FontWeight.Bold,
                        fontSize = 17.sp,
                        color = Color.White
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = AgriGreenPrimary)
            )
        },
        containerColor = AgriBackground
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Step 1: Product Photo Preview
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, BorderSubtle)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                "1. Product Photo / Image",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = TextDark
                            )
                            Text(
                                "📸 Farm Fresh",
                                fontSize = 11.sp,
                                color = AgriGreenMedium,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Surface(
                            shape = RoundedCornerShape(14.dp),
                            color = Color(0xFFF8FAFC),
                            border = BorderStroke(1.5.dp, Color(0xFFCBD5E1)),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(120.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text(selectedEmoji, fontSize = 42.sp)
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        if (imageUrl != null) "✓ Farm Photo Attached" else "Select crop preset or enter details",
                                        fontSize = 11.sp,
                                        color = TextMedium,
                                        fontWeight = FontWeight.Medium
                                    )
                                }
                            }
                        }
                    }
                }
            }

            // Step 2: Select Category
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, BorderSubtle)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            "2. Select Crop Category",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            color = TextDark
                        )
                        Spacer(modifier = Modifier.height(10.dp))
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .horizontalScroll(rememberScrollState()),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            categoriesList.forEach { (catName, emoji) ->
                                val isSelected = selectedCategory == catName
                                Surface(
                                    modifier = Modifier.clickable {
                                        selectedCategory = catName
                                        selectedEmoji = emoji
                                    },
                                    shape = RoundedCornerShape(12.dp),
                                    color = if (isSelected) AgriGreenPrimary else AgriSurfaceVariant,
                                    border = BorderStroke(1.dp, if (isSelected) AgriGreenPrimary else Color.Transparent)
                                ) {
                                    Row(
                                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(emoji, fontSize = 16.sp)
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text(
                                            catName,
                                            fontSize = 12.sp,
                                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                            color = if (isSelected) Color.White else TextDark
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Step 3: Quick Product Name Suggestions for Category
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
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                "3. Choose Crop / Product Name",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = TextDark
                            )
                            Text(
                                "Quick Picks",
                                fontSize = 11.sp,
                                color = AgriGreenMedium,
                                fontWeight = FontWeight.Bold
                            )
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            "Tap popular produce or enter custom name below:",
                            fontSize = 11.sp,
                            color = TextMedium
                        )
                        Spacer(modifier = Modifier.height(10.dp))

                        // Quick Pick Chips
                        LazyRow(
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            items(currentPresets) { preset ->
                                val isSelected = productName == preset.name
                                Surface(
                                    modifier = Modifier.clickable {
                                        productName = preset.name
                                        selectedEmoji = preset.emoji
                                        unit = preset.defaultUnit
                                        imageUrl = preset.imageUrl
                                        if (priceText.isBlank()) {
                                            priceText = preset.suggestedPrice.toInt().toString()
                                        }
                                    },
                                    shape = RoundedCornerShape(8.dp),
                                    color = if (isSelected) HarvestAmber else Color(0xFFF1F5F9),
                                    border = BorderStroke(1.dp, if (isSelected) HarvestDark else BorderSubtle)
                                ) {
                                    Row(
                                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(preset.emoji, fontSize = 13.sp)
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text(
                                            preset.name,
                                            fontSize = 11.sp,
                                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                            color = TextDark
                                        )
                                    }
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        OutlinedTextField(
                            value = productName,
                            onValueChange = { productName = it },
                            modifier = Modifier.fillMaxWidth(),
                            label = { Text("Product / Crop Name") },
                            placeholder = { Text("e.g. Fresh Organic Broccoli") },
                            leadingIcon = { Text(selectedEmoji, fontSize = 20.sp, modifier = Modifier.padding(start = 8.dp)) },
                            singleLine = true,
                            shape = RoundedCornerShape(10.dp)
                        )
                    }
                }
            }

            // Step 4: Price, Unit & Stock
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, BorderSubtle)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            "4. Pricing & Harvest Stock",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            color = TextDark
                        )
                        Spacer(modifier = Modifier.height(10.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            OutlinedTextField(
                                value = priceText,
                                onValueChange = { priceText = it },
                                modifier = Modifier.weight(1f),
                                label = { Text("Farmer Price (₹)") },
                                placeholder = { Text("e.g. 30") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                singleLine = true,
                                shape = RoundedCornerShape(10.dp)
                            )

                            OutlinedTextField(
                                value = unit,
                                onValueChange = { unit = it },
                                modifier = Modifier.weight(1f),
                                label = { Text("Unit") },
                                placeholder = { Text("kg / dozen") },
                                singleLine = true,
                                shape = RoundedCornerShape(10.dp)
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        OutlinedTextField(
                            value = stockText,
                            onValueChange = { stockText = it },
                            modifier = Modifier.fillMaxWidth(),
                            label = { Text("Available Quantity / Stock") },
                            placeholder = { Text("e.g. 200") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true,
                            shape = RoundedCornerShape(10.dp)
                        )
                    }
                }
            }

            // Step 5: Farm Provenance
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    border = BorderStroke(1.dp, BorderSubtle)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            "5. Farm Provenance & Description",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            color = TextDark
                        )
                        Spacer(modifier = Modifier.height(10.dp))

                        OutlinedTextField(
                            value = currentFarmName,
                            onValueChange = { currentFarmName = it },
                            modifier = Modifier.fillMaxWidth(),
                            label = { Text("Farm / Orchard Name") },
                            singleLine = true,
                            shape = RoundedCornerShape(10.dp)
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        OutlinedTextField(
                            value = currentBranch,
                            onValueChange = { currentBranch = it },
                            modifier = Modifier.fillMaxWidth(),
                            label = { Text("Farm Location & Branch") },
                            singleLine = true,
                            shape = RoundedCornerShape(10.dp)
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        OutlinedTextField(
                            value = description,
                            onValueChange = { description = it },
                            modifier = Modifier.fillMaxWidth(),
                            label = { Text("Produce Description") },
                            shape = RoundedCornerShape(10.dp),
                            maxLines = 3
                        )
                    }
                }
            }

            // Step 6: Submit Button
            item {
                val isFormValid = productName.isNotBlank() && (priceText.toDoubleOrNull() ?: 0.0) > 0.0

                Button(
                    onClick = {
                        if (isFormValid) {
                            val price = priceText.toDoubleOrNull() ?: 30.0
                            val stock = stockText.toIntOrNull() ?: 50
                            val prodId = editingProduct?.id ?: "P-${System.currentTimeMillis() % 10000}"
                            val newProduct = Product(
                                id = prodId,
                                name = productName,
                                category = selectedCategory,
                                price = price,
                                originalPrice = price * 1.3,
                                unit = unit,
                                farmerName = editingProduct?.farmerName ?: farmerName ?: "Farmer",
                                farmName = currentFarmName,
                                branch = currentBranch,
                                location = currentBranch,
                                rating = editingProduct?.rating ?: 5.0,
                                reviewCount = editingProduct?.reviewCount ?: 12,
                                isOrganic = true,
                                emoji = selectedEmoji,
                                imageUrl = imageUrl,
                                description = description,
                                stockAvailableKg = stock,
                                ordersCount = editingProduct?.ordersCount ?: 0
                            )
                            onCropPublished(newProduct)
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isFormValid) AgriGreenPrimary else Color.Gray
                    ),
                    shape = RoundedCornerShape(16.dp),
                    enabled = isFormValid
                ) {
                    Text(
                        if (isEditing) "💾 Save & Update Crop Details" else "🌾 Publish Crop to My Catalog",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
                Spacer(modifier = Modifier.height(20.dp))
            }
        }
    }
}
