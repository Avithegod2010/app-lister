package expo.modules.installedapps

import android.app.WallpaperManager
import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.net.Uri
import android.os.Build
import android.provider.Settings
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import java.io.File
import java.io.FileOutputStream
import java.util.Locale

class AppInfo : Record {
  @Field var appName: String = ""
  @Field var packageName: String = ""
  @Field var versionName: String = ""
  @Field var versionCode: Long = 0
  @Field var installTime: Long = 0
  @Field var updateTime: Long = 0
  @Field var isSystem: Boolean = false
  @Field var minSdk: Int = 0
  @Field var targetSdk: Int = 0
  @Field var category: Int = 0
  @Field var apkPath: String = ""
  @Field var apkSizeBytes: Long = 0
  @Field var iconPath: String = ""
  @Field var installer: String = ""
  @Field var hasLauncher: Boolean = false
}

private const val ICON_SIZE = 128
private const val PROGRESS_STEP = 20

class InstalledAppsModule : Module() {
  private val context: Context
    get() = requireNotNull(appContext.reactContext) {
      "React context is not available"
    }

  override fun definition() = ModuleDefinition {
    Name("InstalledApps")
    Events("onScanProgress")

    AsyncFunction("getApps") { promise: Promise ->
      val appContext = context
      Thread {
        try {
          promise.resolve(scanApps(appContext))
        } catch (e: Exception) {
          promise.reject("SCAN_FAILED", e.message ?: "Failed to scan installed apps", e)
        }
      }.start()
    }

    Function("launchApp") { packageName: String ->
      val intent = context.packageManager.getLaunchIntentForPackage(packageName)
        ?: return@Function false
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      context.startActivity(intent)
      true
    }

    Function("openAppInfo") { packageName: String ->
      val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS)
      intent.data = Uri.parse("package:$packageName")
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      context.startActivity(intent)
    }

    Function("getWallpaperColor") { ->
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O_MR1) return@Function null
      try {
        val colors = WallpaperManager.getInstance(context)
          .getWallpaperColors(WallpaperManager.FLAG_SYSTEM)
          ?: return@Function null
        String.format(Locale.US, "#%08X", colors.primaryColor)
      } catch (_: Exception) {
        null
      }
    }
  }

  private fun scanApps(context: Context): List<AppInfo> {
    val pm = context.packageManager
    val packages = pm.getInstalledPackages(PackageManager.GET_META_DATA)
    val total = packages.size
    val result = ArrayList<AppInfo>(total)
    val iconDir = File(context.cacheDir, "app_icons")
    iconDir.mkdirs()

    packages.forEachIndexed { index, pkg ->
      try {
        pkg.applicationInfo?.let { result.add(toAppInfo(pm, pkg, it, iconDir)) }
      } catch (_: Exception) {
        // A single unreadable package must not abort the whole scan.
      }
      if ((index + 1) % PROGRESS_STEP == 0 || index == total - 1) {
        sendEvent("onScanProgress", mapOf("loaded" to result.size, "total" to total))
      }
    }
    return result
  }

  private fun toAppInfo(
    pm: PackageManager,
    pkg: PackageInfo,
    ai: ApplicationInfo,
    iconDir: File,
  ): AppInfo {
    val info = AppInfo()
    info.packageName = pkg.packageName
    info.appName = try {
      ai.loadLabel(pm).toString().trim().ifEmpty { pkg.packageName }
    } catch (_: Exception) {
      pkg.packageName
    }
    info.versionName = pkg.versionName ?: "?"
    info.versionCode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
      pkg.longVersionCode
    } else {
      @Suppress("DEPRECATION")
      pkg.versionCode.toLong()
    }
    info.installTime = pkg.firstInstallTime
    info.updateTime = pkg.lastUpdateTime
    info.isSystem = (ai.flags and ApplicationInfo.FLAG_SYSTEM) != 0
    info.minSdk = ai.minSdkVersion
    info.targetSdk = ai.targetSdkVersion
    info.category = ai.category
    info.apkPath = ai.sourceDir ?: ""
    info.apkSizeBytes = try {
      ai.sourceDir?.let { File(it).length() } ?: 0L
    } catch (_: Exception) {
      0L
    }
    info.iconPath = writeIcon(pm, ai, pkg.packageName, iconDir)
    info.installer = installerFor(pm, pkg.packageName)
    info.hasLauncher = pm.getLaunchIntentForPackage(pkg.packageName) != null
    return info
  }

  private fun installerFor(pm: PackageManager, packageName: String): String {
    return try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
        val source = pm.getInstallSourceInfo(packageName)
        source.installingPackageName ?: source.initiatingPackageName ?: ""
      } else {
        @Suppress("DEPRECATION")
        pm.getInstallerPackageName(packageName) ?: ""
      }
    } catch (_: Exception) {
      ""
    }
  }

  private fun writeIcon(pm: PackageManager, ai: ApplicationInfo, packageName: String, iconDir: File): String {
    return try {
      val file = File(iconDir, "$packageName.png")
      if (file.exists() && file.length() > 0) return file.absolutePath

      val drawable = ai.loadIcon(pm)
      val bitmap = Bitmap.createBitmap(ICON_SIZE, ICON_SIZE, Bitmap.Config.ARGB_8888)
      val canvas = Canvas(bitmap)
      drawable.setBounds(0, 0, ICON_SIZE, ICON_SIZE)
      drawable.draw(canvas)
      FileOutputStream(file).use { out ->
        bitmap.compress(Bitmap.CompressFormat.PNG, 100, out)
      }
      bitmap.recycle()
      file.absolutePath
    } catch (_: Exception) {
      ""
    }
  }
}
