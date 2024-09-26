package com.blockcall;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import android.Manifest;
import android.app.Activity;
import android.app.role.RoleManager;
import android.content.ContentResolver;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.CallLog;
import android.provider.Telephony;
import android.util.Log;
import android.widget.Toast;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import org.devio.rn.splashscreen.SplashScreen;

public class MainActivity extends ReactActivity {
  private static String TAG = MainActivity.class.getName();
  private static final int PERMISSIONS_REQUEST_CODE = 100;
  private static final int REQUEST_CODE_DEFAULT_SMS = 101;

  private static final String CHANNEL_ID = "sms_channel";

  private ActivityResultLauncher<Intent> roleRequestLauncher;

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "blockcall";
  }

  /**
   * Returns the instance of the {@link ReactActivityDelegate}. There the RootView is created and
   * you can specify the renderer you wish to use - the new renderer (Fabric) or the old renderer
   * (Paper).
   */
  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new MainActivityDelegate(this, getMainComponentName());
  }

  public static class MainActivityDelegate extends ReactActivityDelegate {
    public MainActivityDelegate(ReactActivity activity, String mainComponentName) {
      super(activity, mainComponentName);
    }

    @Override
    protected ReactRootView createRootView() {
      ReactRootView reactRootView = new ReactRootView(getContext());
      // If you opted-in for the New Architecture, we enable the Fabric Renderer.
      reactRootView.setIsFabric(BuildConfig.IS_NEW_ARCHITECTURE_ENABLED);
      return reactRootView;
    }

    @Override
    protected boolean isConcurrentRootEnabled() {
      // If you opted-in for the New Architecture, we enable Concurrent Root (i.e. React 18).
      // More on this on https://reactjs.org/blog/2022/03/29/react-v18.html
      return BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
    }
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    SplashScreen.show(this);  // here
    super.onCreate(savedInstanceState);
    // setContentView(R.layout.activity_main);

    launcher();
    requestPermissions();
    requestDefaultSmsRole();
  }

  private void launcher(){
    roleRequestLauncher = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(),
            result -> {
              if (result.getResultCode() == Activity.RESULT_OK) {
                // Successfully became the default SMS app
                Toast.makeText(this, "Successfully became the default SMS app.", Toast.LENGTH_SHORT).show();
              } else {
                // Failed to become the default SMS app
                Toast.makeText(this, "Failed to become the default SMS app.", Toast.LENGTH_SHORT).show();
              }
            }
    );
  }

  public void requestDefaultSmsRole(){
    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        RoleManager roleManager = (RoleManager) getSystemService(RoleManager.class);
        // Check if the app has permission to be the default SMS app
        boolean isRoleAvailable = roleManager.isRoleAvailable(RoleManager.ROLE_SMS);

        if (isRoleAvailable) {
          // Check whether your app is already holding the default SMS app role
          boolean isRoleHeld = roleManager.isRoleHeld(RoleManager.ROLE_SMS);

          if (!isRoleHeld) {
            Intent roleRequestIntent = roleManager.createRequestRoleIntent(RoleManager.ROLE_SMS);
            roleRequestLauncher.launch(roleRequestIntent);
          } else {
            // Permission for SMS is already granted
            Log.i(TAG, "Permission for SMS is already granted");
            Toast.makeText(this, "Permission for SMS is already granted.", Toast.LENGTH_SHORT).show();
          }
        }
      } else if (!isDefaultSmsApp()) {
        Intent intent = new Intent(Telephony.Sms.Intents.ACTION_CHANGE_DEFAULT);
        intent.putExtra(Telephony.Sms.Intents.EXTRA_PACKAGE_NAME, getPackageName());
        roleRequestLauncher.launch(intent);
      }
    } catch (Exception ex) {
      Log.e(TAG, ex.toString());
    }
  }

  private boolean isDefaultSmsApp() {
    return getPackageName().equals(Telephony.Sms.getDefaultSmsPackage(this));
  }

  private void requestPermissions() {
    String[] permissions = {
            Manifest.permission.READ_PHONE_STATE,
            Manifest.permission.READ_CALL_LOG,
            Manifest.permission.WRITE_CALL_LOG,
            Manifest.permission.RECEIVE_SMS,
            Manifest.permission.ANSWER_PHONE_CALLS,
            Manifest.permission.READ_SMS,
            Manifest.permission.SEND_SMS,
            Manifest.permission.READ_CONTACTS,
    };

    List<String> permissionsNeeded = new ArrayList<>();
    for (String permission : permissions) {
      if (ContextCompat.checkSelfPermission(this, permission) != PackageManager.PERMISSION_GRANTED) {
        permissionsNeeded.add(permission);
      }
    }

    if (!permissionsNeeded.isEmpty()) {
      ActivityCompat.requestPermissions(this, permissionsNeeded.toArray(new String[0]), PERMISSIONS_REQUEST_CODE);
    } else {
      // All permissions are already granted
      onPermissionsGranted();
    }
  }

  @Override
  public void onActivityResult(int requestCode, int resultCode, Intent data) {
    super.onActivityResult(requestCode, resultCode, data);
    if (requestCode == REQUEST_CODE_DEFAULT_SMS) {
      if (isDefaultSmsApp()) {
        // Successfully set as default SMS app
        Toast.makeText(this, "App is now set as the default SMS app", Toast.LENGTH_SHORT).show();
      } else {
        // Failed to set as default SMS app
        Toast.makeText(this, "Failed to set as default SMS app", Toast.LENGTH_SHORT).show();
      }
    }
  }

  @Override
  public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
    super.onRequestPermissionsResult(requestCode, permissions, grantResults);

    if (requestCode == PERMISSIONS_REQUEST_CODE) {
      boolean allGranted = true;
      for (int result : grantResults) {
        if (result != PackageManager.PERMISSION_GRANTED) {
          allGranted = false;
          break;
        }
      }

      if (allGranted) {
        // All permissions granted
        onPermissionsGranted();
      } else {
        // Handle the case where permissions are denied
        Toast.makeText(this, "Some permissions were denied", Toast.LENGTH_SHORT).show();
      }
    }
  }

  private void onPermissionsGranted() {
    // Your logic here, e.g., accessing contacts, starting the camera, or accessing location
    //    readOldSms();
    //    fetchOldCallLogs();
    Toast.makeText(this, "All permissions granted!", Toast.LENGTH_SHORT).show();
  }

  private void readOldSms() {
    Uri smsUri = Uri.parse("content://sms/");
    Cursor cursor = getContentResolver().query(smsUri, null, null, null, null);

    if (cursor != null) {
      while (cursor.moveToNext()) {
        String address = cursor.getString(cursor.getColumnIndexOrThrow("address"));
        String body = cursor.getString(cursor.getColumnIndexOrThrow("body"));
        String date = cursor.getString(cursor.getColumnIndexOrThrow("date"));

        // Log or display the SMS
        Log.d("OldSms", "From: " + address + ", Body: " + body + ", Date: " + date);
      }
      cursor.close();
    }
  }

  private void fetchOldCallLogs() {
    Uri callLogUri = Uri.parse("content://call_log/calls");
    ContentResolver contentResolver = getContentResolver();
    Cursor cursor = contentResolver.query(callLogUri, null, null, null, null);

    if (cursor != null) {
      while (cursor.moveToNext()) {
        String number = cursor.getString(cursor.getColumnIndexOrThrow(CallLog.Calls.NUMBER));
        String type = cursor.getString(cursor.getColumnIndexOrThrow(CallLog.Calls.TYPE));
        long date = cursor.getLong(cursor.getColumnIndexOrThrow(CallLog.Calls.DATE));

        // Process the call log data here
        Log.d("OldCallLog", "Number: " + number + ", Type: " + type + ", Date: " + new Date(date));
      }
      cursor.close();
    }
  }
}
