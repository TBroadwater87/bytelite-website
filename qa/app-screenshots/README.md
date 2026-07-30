# Cordel Connect app screenshot walkthrough — session log (2026-07-30)

## Status: blocked, partial

## What happened

1. Located the APK referenced as "the latest build" (`D:\HeartStrings_ByteOracle_Integration\app\android\app\build\outputs\apk\release\app-release.apk`) and installed it on a dedicated QA emulator (`HeartStrings_Connect_QA_STABLE`, Android 36.1). This build turned out to be **stale**: package `com.heartstrings.app`, versionName 1.0.0 (versionCode 1), first installed on this AVD 2026-07-27, and still HeartStrings-branded throughout its (unexplored) UI.
2. The same emulator already had a **much newer, already-installed** app: package `com.cordel.app`, versionName 1.7.1 (versionCode 22). This is the real current build and is correctly Cordel-branded — confirmed directly on its login screen (Cordel wordmark/heart-infinity logo, no HeartStrings text anywhere). Switched the walkthrough to this app.
3. Captured the reachable pre-authentication screens:
   - `01_cordel_current_screen.png` — Email sign-in (default tab)
   - `02_login_phone_tab.png` — Phone sign-in tab
   - `03_login_email_tab_back.png` — back to Email tab
   - `04_forgot_password_screen.png` — Forgot Password flow (not submitted — no reset email was triggered)
4. Found a **"DEV: Quick Login"** button — a developer-provided test-auth bypass built into the app itself. Used this instead of typing any password (I do not enter credentials into login fields, including test ones).
5. **Blocked here.** Quick Login failed with `Dev Login Error: Network Error`. Diagnosis: the emulator can reach its own host gateway (`10.0.2.2`, ping succeeds) but has no route to the real internet (`8.8.8.8` and `1.1.1.1` both 100% packet loss). The app's backend is a real cloud API (`API_BASE_URL=https://api.thebytelite.com` per `.env.example`), not a local dev server, so this network gap blocks all backend-dependent functionality — which is effectively the entire authenticated app (Discover, Matches, Messages, Profile, Settings, Safety Center, Blind Dates, Game Room, ByteOracle, everything under the six nav sections visible on the website's Alya & Aion page screenshot).
   - Tried: restarting the adb daemon (it had also crashed once mid-session, likely host resource pressure from the long-running dev session), toggling airplane mode via `adb shell settings` (the broadcast itself was permission-denied on this system image and made no difference regardless).
   - Not tried: Windows Firewall / VPN rules on the host that might be scoping outbound traffic from the emulator process — did not investigate further without checking in first, since that's a host-security-config change outside this repo.

## What's NOT done

Everything requiring sign-in: Discover, Matches, Messages, Profile & Edit Profile, Settings (Account, Notifications), Subscription, Safety Center, Emergency Contacts, Blocked Users, Blind Dates, Availability, Game Room, Photo Styles, Dating Preferences, Logout — none of these were reached. This is the large majority of "every screen, every menu, every button, every option."

## Next steps (need a decision)

- Fix the emulator's outbound networking (likely a host Windows Firewall or VPN client scoping rule) and resume, or
- Point `DEV_API_URL` / `API_BASE_URL` at a reachable staging backend for this AVD, or
- Get real sign-in credentials entered on-device by a human (I won't type credentials myself) and resume the walkthrough from an authenticated state.
