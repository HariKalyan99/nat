# scroll view vs faltlist

| Feature                   | ScrollView                          | FlatList                                              |
| ------------------------- | ----------------------------------- | ----------------------------------------------------- |
| **Use case**              | Small, static lists                 | Large, dynamic lists                                  |
| **Rendering**             | Renders *all* items at once         | Renders only visible items ("virtualized")            |
| **Performance**           | Bad with large lists (memory heavy) | Great with large lists                                |
| **Scrolling direction**   | Vertical & horizontal               | Vertical (default) but supports horizontal            |
| **Built-in optimization** | None                                | Built-in windowing, recycling, virtualization         |
| **Keys**                  | No `keyExtractor` needed            | Requires unique keys for each item                    |
| **Headers/Footers**       | You manually add them               | Built-in `ListHeaderComponent`, `ListFooterComponent` |
| **Pull to refresh**       | You build manually                  | Built-in support (`refreshing`, `onRefresh`)          |


| Library             | Suitable for                                                 |
| ------------------- | ------------------------------------------------------------ |
| `expo-secure-store` | Sensitive data (tokens, secrets, passwords)                  |
| `AsyncStorage`      | Non-sensitive data (user settings, preferences)              |
| `MMKV`              | High-performance general storage (non-sensitive, fast reads) |
# Beyond 100mb storage

| Library             | Use Case               | Size                           |
| ------------------- | ---------------------- | ------------------------------ |
| `expo-sqlite`       | Structured DB          | ✅ 100MB easily                 |
| `react-native-mmkv` | Key-value store (fast) | ✅ 100MB possible but not ideal |


| Scenario              | Best Solution           |
| --------------------- | ----------------------- |
| Large files           | `expo-file-system`      |
| Structured large data | `expo-sqlite`           |
| Sensitive files       | FileSystem + encryption |
| Token storage         | `expo-secure-store`     |


✅ If you store data on expo-file-system:
1️⃣ It is stored locally on the device.
You do not have to fetch it from the backend every time — unless you want to update it.

Once the file is downloaded or generated and stored via FileSystem, it stays there.

You can read/write directly from expo-file-system without involving the backend.

| Scenario                   | Behavior                             |
| -------------------------- | ------------------------------------ |
| App closed & reopened      | ✅ Data persists                      |
| App updated (minor update) | ✅ Data persists                      |
| User uninstalls app        | ❌ Data is deleted                    |
| Device storage full        | ⚠ OS might clean non-essential files |
| Cross-device sync          | ❌ Not possible — only local          |

✅ ✅ ✅ In simple words:
You don't have to fetch every time.

You should design logic to cache locally after first fetch.

Backend fetch happens only when:

file missing

file outdated (you implement versioning)

user triggers refresh



🔒 If your data is sensitive:
You must encrypt before writing to expo-file-system because it’s not secure by default.

Use a library like expo-crypto or a simple AES encryption before writing.

✅ Will storing data with expo-file-system increase the APK size?
👉 Short answer: NO — not directly.

🔑 Why?
expo-file-system stores files after the app is installed, on device storage (sandboxed).

The APK (or AAB) only includes your app code, assets (that you bundle at build time), and dependencies.

Files you download at runtime and store with expo-file-system are not part of the APK size.

✅ What actually increases APK size:

| Increases APK size            | Does NOT increase APK size           |
| ----------------------------- | ------------------------------------ |
| Bundled images, videos, audio | Files downloaded at runtime          |
| Included fonts                | Files written via `expo-file-system` |
| Large npm libraries           | Server-fetched data                  |
| Heavy dependencies            | Data you store locally after install |

Example

| Action                                                                            | APK Size Impact                                       |
| --------------------------------------------------------------------------------- | ----------------------------------------------------- |
| You include a 100MB video file in your `assets/` folder                           | APK size increases by 100MB                           |
| You download 100MB file from backend at runtime and store with `expo-file-system` | APK size stays the same — device storage used instead |

✅ ⚠ However:
Even though APK size stays small, the device storage usage grows when you store large files with expo-file-system.

You are responsible for managing:

Storage usage

Cleanup logic

Disk full handling

✅ TL;DR Rule:
👉 APK size ≠ Device storage size

Your APK remains small.

But user’s device storage fills as you store large files.


challenge


✅ What happens if the device storage is full when you're using expo-file-system?
👉 If you try to write files and device storage is full:

FileSystem will throw an error.

You can (and should) catch that error and handle it gracefully.


try {
  await FileSystem.writeAsStringAsync(fileUri, data);
} catch (error) {
  console.error("Failed to write file:", error);
  // Handle: Show user message, free up space, retry later, etc.
}


| Scenario                     | Outcome                          |
| ---------------------------- | -------------------------------- |
| Device has enough free space | ✅ Write succeeds                 |
| Device nearly full           | ✅ May succeed if space is enough |
| Device full                  | ❌ Write fails, throws error      |



✅ Will OS automatically delete files?
On iOS:
Files in documentDirectory are persistent. They won’t be automatically deleted even if the device is full.
OS may eventually show “Storage Full” notifications to the user.

On Android:
Similar — your app’s private storage won’t be cleaned automatically unless:

The user manually clears app data

You store files in cacheDirectory (which is subject to OS cleanup)

✅ Safe locations inside expo-file-system:

| Directory            | Behavior            | Use case           |
| -------------------- | ------------------- | ------------------ |
| `documentDirectory`  | Persistent          | Long-term files    |
| `cacheDirectory`     | May be auto-cleaned | Temporary files    |
| `temporaryDirectory` | Very short-lived    | Temporary sessions |



✅ Best practice when dealing with large files:
1️⃣ Always check available storage before downloading large files
There’s no official Expo API yet for free disk space (sadly 😅), but you can use native modules or third-party libraries for free space detection.

2️⃣ Handle write errors gracefully
Always wrap writeAsStringAsync() / writeAsBlobAsync() in try-catch.

3️⃣ Implement cleanup policy
For large files:

Keep track of downloaded files.

Delete old, unused files.

Allow user to manually clear downloaded files.


✅ The real production answer:
👉 You should not assume the device can safely store 100MB at all times.

Always build fallback logic.

Warn the user if download fails due to storage limits.

Implement file management UI if you expect to store large content.


| Reality                                             | Implication |
| --------------------------------------------------- | ----------- |
| FileSystem writes fail when storage full            | ✅ Yes       |
| You can safely catch & handle errors                | ✅ Yes       |
| OS won’t magically delete `documentDirectory` files | ✅ Correct   |
| You should not assume 100MB always fits             | ✅ Correct   |

# moredetails
# https://chatgpt.com/c/68576840-3cfc-8007-8464-c895f971975a 



# pressable vs touchableOpacity
| Feature       | `TouchableOpacity`      | `Pressable`                                     |
| ------------- | ----------------------- | ----------------------------------------------- |
| Introduced    | Old (core RN)           | New (since RN 0.63+)                            |
| Animations    | Built-in opacity effect | Fully customizable (any style changes)          |
| Feedback      | Only opacity            | Any visual feedback (scale, color, shadow, etc) |
| Flexibility   | Limited                 | Extremely flexible                              |
| Accessibility | Basic                   | Better                                          |
| Recommended?  | Legacy, still usable    | ✅ Preferred for new apps                        |


✅ TouchableOpacity gives you a quick drop-in button that dims on press.

✅ Pressable gives you full control over what happens on press, hover, focus, long press, etc.


| Situation                                                     | Use                |
| ------------------------------------------------------------- | ------------------ |
| You need quick, simple button                                 | `TouchableOpacity` |
| You need full customization (animation, scale, color changes) | ✅ `Pressable`      |
| You want better accessibility support (hover, focus)          | ✅ `Pressable`      |
| You’re building a modern app (Expo, Convex, Clerk stack)      | ✅ `Pressable`      |



# Expo Image for caching and performance and React native with simplified and minimal configuration



# splash screen --> initial logo screen for a while



# adaptive-icon png and icon png 

| Asset               | Platform          | Purpose                      |
| ------------------- | ----------------- | ---------------------------- |
| `icon.png`          | iOS & Android     | Default app icon             |
| `adaptive-icon.png` | Android (API 26+) | Modern Android adaptive icon |
 

 ✅ 1️⃣ icon.png
Simple square icon (1024x1024 recommended).

Used by:

iOS (required)

Older Android versions (fallback)

Must have full background, as iOS doesn't allow transparency.

Example in app.json or app.config.js:





✅ 2️⃣ adaptive-icon.png
Only for modern Android (Oreo / API 26+).

Supports adaptive shapes:

Circle

Rounded square

Squircle

Teardrop

Android system crops & masks it based on device launcher settings.

Allows foreground + background separation for animations & parallax.


 ✅ Simple rule:
| Platform | Required file                             |
| -------- | ----------------------------------------- |
| iOS      | `icon.png`                                |
| Android  | `icon.png` + optional `adaptive-icon.png` |


✅ Recommended sizes:
| File                                  | Size                |
| ------------------------------------- | ------------------- |
| `icon.png`                            | 1024x1024           |
| `adaptive-icon.png` (foregroundImage) | 432x432             |
| Background color                      | Flat color or image |

⚠ Common mistake:
People sometimes use transparent adaptive-icon.png with no background color — this leads to ugly default grey backgrounds on Android.

Always provide a solid background color if foreground image has transparency.




✅ What is react-native-reanimated?
A high-performance animation library for React Native.

It allows smooth, 60 FPS animations, even for complex transitions.

Runs most animations directly on the native UI thread (not JS thread), which avoids common performance problems in React Native.


✅ Why do we need Reanimated?

| Without Reanimated              | With Reanimated                          |
| ------------------------------- | ---------------------------------------- |
| Animations run on JS thread     | Animations run on native thread          |
| Can stutter with heavy logic    | Very smooth even with complex animations |
| Lag possible on low-end devices | Smooth even under heavy load             |


✅ Typical use cases:
Smooth gestures (swipes, drags, pan, pull-to-refresh)

Interactive animations (cards, lists, modals)

Complex sequences (timings, springs, delays)

Shared element transitions

Parallax effects



✅ Reanimated vs Animated API


| Feature          | `Animated` (built-in) | `Reanimated` (3rd party)  |
| ---------------- | --------------------- | ------------------------- |
| Performance      | OK for simple         | ✅ Superior                |
| Native thread?   | ❌ Mostly JS thread    | ✅ Native thread           |
| Complex gestures | ❌ Difficult           | ✅ Very good               |
| Modern API       | Limited               | ✅ Excellent (hooks based) |


npx expo install react-native-reanimated


✅ ⚠ Gotchas:
Must wrap your app with Reanimated's Babel plugin (Expo handles this automatically).

Be very careful with worklets (functions that run on native thread).

Sometimes debugging becomes harder because part of your logic runs outside JS thread.



✅ If you’re using Expo + Clerk + Convex stack:
Reanimated works perfectly.

Great for building modern smooth UIs, e.g., swipe cards, pull to refresh, parallax headers, etc.

## check: https://docs.swmansion.com/react-native-reanimated/