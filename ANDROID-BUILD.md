# PlantHub Android build

Capacitor 7 packages the existing React/Vite frontend into an installable Android application.
The website remains supported; the Android-specific connection setup runs only in a native WebView.

## Before building

- Install Node.js, JDK 21, Android SDK Platform 35, Android Build Tools 35, and command-line tools.
- Run `npm install`.
- Native app ID: `com.planthub.users`.
- The app's first launch asks for an HTTPS backend URL (root URL, without /api).
- The backend needs to be accessible from the Android phone and allow CORS origin `https://localhost` when deployed with strict CORS.
- If connecting through a private Tailscale address, Tailscale must be connected on Android too.

## Build

```powershell
npm run build
npx cap sync android
cd android
.\gradlew.bat assembleDebug
```

The debug APK is `android/app/build/outputs/apk/debug/app-debug.apk`.
Use a release keystore and Gradle release signing config for future production release and update-in-place installs.

## Backend configuration

For a new installation, the Android app shows a server-address screen.
Only HTTPS is accepted to avoid exposing user tokens on plaintext connections.
The app validates `<origin>/api/health` before storing the backend URL locally.
You may optionally set `VITE_ANDROID_BACKEND_HTTP_URL` during the build to preconfigure the URL.

Note: This is a wrapped frontend; mobile push notifications, camera/microphone permissions,
file pickers and OAuth redirects can require separate native integration and device testing.
