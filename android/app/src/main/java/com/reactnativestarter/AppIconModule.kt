package com.reactnativestarter

import android.content.ComponentName
import android.content.Context
import android.content.SharedPreferences
import android.content.pm.PackageManager
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.fbreact.specs.NativeAppIconModuleSpec
class AppIconModule(reactContext: ReactApplicationContext) : NativeAppIconModuleSpec(reactContext) {

    private val sharedPreferences: SharedPreferences = reactContext.getSharedPreferences("AppIconPrefs", Context.MODE_PRIVATE)

    companion object {
        const val NAME = "AppIconModule"
        const val PREF_KEY_ICON = "ACTIVE_ICON"

        val ICONS = mapOf(
            "default" to ".MainActivityDefault",
            "premium" to ".MainActivityPremium",
            "dark" to ".MainActivityDark",
            "gold" to ".MainActivityGold",
            "holiday" to ".MainActivityHoliday",
            "christmas" to ".MainActivityChristmas",
            "diwali" to ".MainActivityDiwali",
            "diwali-gold" to ".MainActivityDiwaliGold",
            "christmas-gold" to ".MainActivityChristmasGold",
            "holi" to ".MainActivityHoli",
            "holi-gold" to ".MainActivityHoliGold",
            "halloween" to ".MainActivityHalloween",
            "halloween-gold" to ".MainActivityHalloweenGold",
            "newyear" to ".MainActivityNewyear",
            "newyear-gold" to ".MainActivityNewyearGold"
        )
    }

    override fun getName(): String {
        return NAME
    }

    override fun changeIcon(iconName: String, promise: Promise) {
        val activityClass = ICONS[iconName.lowercase()]
        if (activityClass == null) {
            promise.reject("INVALID_ICON", "Icon '$iconName' is not supported.")
            return
        }

        try {
            val context = reactApplicationContext
            val packageManager = context.packageManager
            val packageName = context.packageName

            // Disable all other aliases first
            ICONS.values.forEach { alias ->
                if (alias != activityClass) {
                    val componentName = ComponentName(packageName, "$packageName$alias")
                    packageManager.setComponentEnabledSetting(
                        componentName,
                        PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
                        PackageManager.DONT_KILL_APP
                    )
                }
            }

            // Enable the target alias
            val targetComponent = ComponentName(packageName, "$packageName$activityClass")
            packageManager.setComponentEnabledSetting(
                targetComponent,
                PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
                PackageManager.DONT_KILL_APP
            )

            // Persist the selection
            sharedPreferences.edit().putString(PREF_KEY_ICON, iconName.lowercase()).apply()

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("CHANGE_ICON_FAILED", e.message, e)
        }
    }

    override fun getCurrentIcon(promise: Promise) {
        val currentIcon = sharedPreferences.getString(PREF_KEY_ICON, "default")
        promise.resolve(currentIcon)
    }

    override fun getAvailableIcons(promise: Promise) {
        val array = com.facebook.react.bridge.WritableNativeArray()
        ICONS.keys.forEach { array.pushString(it) }
        promise.resolve(array)
    }

    override fun resetIcon(promise: Promise) {
        changeIcon("default", promise)
    }
}
