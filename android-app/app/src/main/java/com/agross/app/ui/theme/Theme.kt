package com.agross.app.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val LightColorScheme = lightColorScheme(
    primary = AgriGreenPrimary,
    onPrimary = AgriCardBackground,
    primaryContainer = AgriGreenPastel,
    onPrimaryContainer = AgriGreenPrimary,
    secondary = AgriEmeraldAccent,
    onSecondary = AgriCardBackground,
    secondaryContainer = BadgeGreenBg,
    onSecondaryContainer = BadgeGreenText,
    tertiary = HarvestAmber,
    onTertiary = AgriCardBackground,
    background = AgriBackground,
    onBackground = TextDark,
    surface = AgriCardBackground,
    onSurface = TextDark,
    surfaceVariant = AgriSurfaceVariant,
    onSurfaceVariant = TextMedium,
    outline = AgriBorder
)

@Composable
fun AgrossTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = LightColorScheme
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as? Activity)?.window
            window?.let {
                it.statusBarColor = AgriGreenPrimary.toArgb()
                WindowCompat.getInsetsController(it, view).isAppearanceLightStatusBars = false
            }
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = AgrossTypography,
        content = content
    )
}
