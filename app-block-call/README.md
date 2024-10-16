NPM
  npm outdated  : check all version in package.json

ANDROID

Edit & Rebuild android
step & enjoy
 - cd android && ./gradlew clean && cd .. && npx react-native run-android 

Debug APK
step
 - cd android & ./gradlew assembleDebug & yourProject/android/app/build/outputs/apk/debug/app-debug.apk

 Debug APK
step
 - cd android & ./gradlew assembleRelease & yourProject/android/app/build/outputs/apk/release/app-release.apk

Debug real device with wifi
Error : Could not connect to React Native development server on Android
- Open the in-app Developer menu.
- Go to Dev Settings → Debug server host for device.
- Type in your machine's IP address and the port of the local dev server (e.g. 10.0.1.1:8081).
- Go back to the Developer menu and select Reload JS.

Move device & run normal
cd android
./gradlew wrapper --gradle-version 7.5.1  


/////////////////// @@@@@@@@@@
To resolve this, you can follow these steps:

Check the AndroidManifest in the library: Go to the node_modules/react-native-gesture-handler/android/src/main/AndroidManifest.xml file and see if the <manifest> tag includes a package attribute. It should look like this:

xml
Copy code
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.swmansion.gesturehandler">
/////////////////// @@@@@@@@@@



IOS


More example about RN : https://github.com/JianlongCao/React-native-resources/tree/master