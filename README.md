# 🌱 Agross - Farm to Fork Agricultural Ecosystem

Agross is a full-stack agricultural commerce ecosystem connecting farmers directly to retail customers, backed by a centralized web administration portal.

```
Agross/
├── android-app/             # Kotlin Android App (Jetpack Compose & Material 3)
│   ├── app/                 # Mobile Application Module (Farmer & Customer Panels)
│   │   ├── src/main/java/com/agross/app/
│   │   │   ├── MainActivity.kt
│   │   │   ├── data/DataModels.kt
│   │   │   ├── ui/
│   │   │   │   ├── components/
│   │   │   │   │   ├── AgrossTopBar.kt     # Top Bar with Login/Register & Profile
│   │   │   │   │   ├── AgrossBottomNav.kt  # Bottom Bar with dynamic role tabs
│   │   │   │   │   └── ProductCard.kt      # Interactive produce card with pricing
│   │   │   │   ├── navigation/Screen.kt
│   │   │   │   ├── screens/
│   │   │   │   │   ├── DashboardScreen.kt  # Fresh Produce, Top Farmers, Search & Filters
│   │   │   │   │   ├── LoginScreen.kt      # Dual-Role Customer & Farmer Sign In
│   │   │   │   │   └── RegisterScreen.kt   # Dynamic Farmer vs Customer Sign Up
│   │   │   │   └── theme/
│   │   │   │       ├── Color.kt
│   │   │   │       ├── Theme.kt
│   │   │   │       └── Type.kt
│   │   │   └── AndroidManifest.xml
│   │   └── build.gradle.kts
│   ├── build.gradle.kts
│   └── settings.gradle.kts
│
├── backend/                 # Node.js + Express + MongoDB Unified REST API
│   └── README.md
│
└── web-admin/               # React Admin Dashboard (Web Portal)
    └── README.md
```

## Panels Overview

| Panel | Platform | Tech Stack | Key Responsibilities |
|---|---|---|---|
| **Farmer Panel** | Mobile App | Kotlin + Jetpack Compose | Register farm, list vegetables & fruits with pricing, track sales & bank payouts |
| **Customer Panel** | Mobile App | Kotlin + Jetpack Compose | Browse farm fresh produce, filter by category/location, add to cart & checkout |
| **Admin Panel** | Web Portal | React + Node.js | Manage farmers & customer accounts, moderate produce, view customer bills & approve farmer payouts |

## Getting Started with Android App

1. Open **Android Studio** (Hedgehog or newer recommended).
2. Choose **Open Project** and navigate to `/Users/pinkeshunadkat/Downloads/Agross/android-app`.
3. Allow Gradle to sync dependencies.
4. Run on an Android Emulator or physical device (API 24+).
