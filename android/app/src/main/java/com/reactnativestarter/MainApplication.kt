package com.reactnativestarter

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          add(AppIconPackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)

    // Restore the active app icon to prevent launcher bugs after app updates
    try {
        val prefs = getSharedPreferences("AppIconPrefs", android.content.Context.MODE_PRIVATE)
        val activeIcon = prefs.getString(AppIconModule.PREF_KEY_ICON, "default")
        val activityClass = AppIconModule.ICONS[activeIcon] ?: ".MainActivityDefault"
        
        val packageManager = packageManager
        AppIconModule.ICONS.values.forEach { alias ->
            if (alias != activityClass) {
                packageManager.setComponentEnabledSetting(
                    android.content.ComponentName(packageName, "$packageName$alias"),
                    android.content.pm.PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
                    android.content.pm.PackageManager.DONT_KILL_APP
                )
            }
        }
        packageManager.setComponentEnabledSetting(
            android.content.ComponentName(packageName, "$packageName$activityClass"),
            android.content.pm.PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
            android.content.pm.PackageManager.DONT_KILL_APP
        )
    } catch (e: Exception) {
        // Ignore
    }
  }
}
