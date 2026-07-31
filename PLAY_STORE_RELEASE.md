# Play Store Release

## Current Android Setup

- App name: `Neon Switch`
- App ID: `com.mateu.neonswitch`
- Web assets: `dist/`
- Android project: `android/`
- Orientation: portrait
- Minimum Android: API 24
- Target SDK: API 36

## Required Local Tools

- Node.js 22 or newer for Capacitor 8.
- Android Studio with a JDK 21 runtime.
- Android SDK platform 36 installed.

The current machine has Java 17 on `PATH`, so the native Gradle bundle stops at `invalid source release: 21`. Open the project with a current Android Studio, or install/configure JDK 21 and set `JAVA_HOME` before running the bundle command.

## Commands

```bash
pnpm install
pnpm build:release
pnpm android:assets
pnpm android:sync
```

Open Android Studio:

```bash
pnpm android:open
```

Generate an App Bundle from Android Studio:

`Build > Generate Signed App Bundle / APK > Android App Bundle`

The Play Store upload artifact is an `.aab`.

## Signing

Create a private upload keystore locally, then copy:

```text
android/keystore.properties.example -> android/keystore.properties
```

Fill the real passwords and `storeFile` path in `android/keystore.properties`. Do not commit the real file or `.jks`.

## Store Checklist

- Test on at least one physical Android device.
- Create screenshots for phone listing.
- Create a 512x512 high-res icon from `assets/icon-only.png`.
- Prepare short description, full description, privacy policy URL, content rating, and data safety form.
- Upload the signed `.aab` to internal or closed testing first.
