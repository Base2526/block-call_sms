package com.blockcall.architecture;

import com.blockcall.MainActivity;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import android.content.ContentResolver;
import android.content.Context;
import android.database.Cursor;
import android.net.Uri;
import android.provider.CallLog;
import android.telephony.SmsManager;
import android.util.Log;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import android.provider.Telephony;
import android.app.role.RoleManager;
import android.content.Intent;
import android.os.Build;
import android.app.Activity;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;

public class DatabaseModule extends ReactContextBaseJavaModule {
    private static String TAG = DatabaseHelper.class.getName();
    private static final int REQUEST_CODE_DEFAULT_SMS = 101;
    private final DatabaseHelper databaseHelper;

    private final ReactApplicationContext reactContext;
    private ActivityResultLauncher<Intent> roleRequestLauncher;
    public DatabaseModule(ReactApplicationContext reactContext) {
        super(reactContext);
        databaseHelper = new DatabaseHelper(reactContext);

        this.reactContext = reactContext;

//        Activity currentActivity = getCurrentActivity();
//        if (currentActivity != null) {
//            roleRequestLauncher = currentActivity.registerForActivityResult(
//                    new ActivityResultContracts.StartActivityForResult(),
//                    result -> {
//                        if (result.getResultCode() == REQUEST_CODE_DEFAULT_SMS) {
//                            Log.i(TAG, "Successfully became the default SMS app");
//                        } else {
//                            Log.e(TAG, "Failed to become the default SMS app");
//                        }
//                    }
//            );
//        }
    }

    @Override
    public String getName() {
        return "DatabaseHelper";
    }

    @ReactMethod
    public void isDeveloperModeEnabled(Promise promise) {
        boolean isEnabled = Utils.isDeveloperModeEnabled(getReactApplicationContext());
        promise.resolve(isEnabled);
    }

    @ReactMethod
    public void addBlockNumberData(ReadableMap itemMap, Promise promise) {
        long startTime = System.currentTimeMillis();
        try {
            String phoneNumber = itemMap.getString("PHONE_NUMBER");
            // Check if the phone number already exists in the database
            if (databaseHelper.isPhoneNumberExists(phoneNumber)) {

                long endTime = System.currentTimeMillis();
                long executionTime = endTime - startTime;
                promise.reject("DUPLICATE_ERROR", "Phone number already exists");
                return;
            }

            DataItem item = new DataItem();
            item.setPhoneNumber(phoneNumber);
            item.setType(String.valueOf(itemMap.getInt("TYPE")));
            item.setDetail(itemMap.getString("DETAIL"));
            item.setReporter(itemMap.getString("REPORTER"));

            int result = databaseHelper.addBlockNumberData(item);

            long endTime = System.currentTimeMillis();
            long executionTime = endTime - startTime;
            if (result != -1) {

                WritableMap cursor = databaseHelper.getBlockNumberDataById(Integer.toString(result));

                promise.resolve(Utils.createResponseMap(true, executionTime, cursor, ""));
            } else {
                promise.reject("LOGS_ERROR", "Failed to insert data");
            }
        } catch (Exception e) {
            long endTime = System.currentTimeMillis();
            long executionTime = endTime - startTime;
            promise.reject("LOGS_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void addBlockNumberDatas(ReadableArray items, Promise promise) {
        List<DataItem> itemList = new ArrayList<>();
        for (int i = 0; i < items.size(); i++) {
            ReadableMap itemMap = items.getMap(i);
            int id = itemMap.getInt("id");
            String name = itemMap.getString("name");
            String type = itemMap.getString("type");
            String detail = itemMap.getString("detail");
            String reporter = itemMap.getString("reporter");
            DataItem item = new DataItem(id, name, type, detail, reporter);
            itemList.add(item);
        }
        boolean success = databaseHelper.addBlockNumberDatas(itemList);
        promise.resolve(success);
    }

    @ReactMethod
    public void getBlockNumberDataById(String id,Promise promise) {
        long startTime = System.currentTimeMillis();
        try {
            WritableMap cursor = databaseHelper.getBlockNumberDataById(id);
            promise.resolve(cursor);

            long endTime = System.currentTimeMillis();
            long executionTime = endTime - startTime;
            promise.resolve( Utils.createResponseMap(true, executionTime, cursor, ""));
        } catch (Exception e) {
            long endTime = System.currentTimeMillis();
            long executionTime = endTime - startTime;
            promise.reject("LOGS_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void getBlockNumberDataByName(String phoneNumber, Promise promise) {
        long startTime = System.currentTimeMillis();
        try {
            WritableMap cursor = databaseHelper.getDataByPhoneNumber(phoneNumber);
//            promise.resolve(cursor);
            
            long endTime = System.currentTimeMillis();
            long executionTime = endTime - startTime;
            promise.resolve( Utils.createResponseMap(true, executionTime, cursor, ""));
        } catch (Exception e) {
            long endTime = System.currentTimeMillis();
            long executionTime = endTime - startTime;
            promise.reject("LOGS_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void getBlockNumberAllData(Promise promise) {
        long startTime = System.currentTimeMillis();
        try {
            WritableArray cursor = databaseHelper.getBlockNumberAllData();
//            promise.resolve(cursor);
            long endTime = System.currentTimeMillis();
            long executionTime = endTime - startTime;
            promise.resolve( Utils.createResponseArray(true, executionTime, cursor, ""));
        } catch (Exception e) {
            long endTime = System.currentTimeMillis();
            long executionTime = endTime - startTime;
            promise.reject("LOGS_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void updateBlockNumberData(DataItem item, Promise promise) {
        boolean result = databaseHelper.updateBlockNumberData(item);
        promise.resolve(result);
    }

    @ReactMethod
    public void deleteBlockNumberData(String phoneNumber, Promise promise) {
        long startTime = System.currentTimeMillis();
        try {
            Integer result = databaseHelper.deleteBlockNumberData(phoneNumber);
//            promise.resolve(result);

            long endTime = System.currentTimeMillis();
            long executionTime = endTime - startTime;
            promise.resolve(Utils.createResponseInt(true, executionTime, 0, ""));
        } catch (Exception e) {
            long endTime = System.currentTimeMillis();
            long executionTime = endTime - startTime;
            promise.reject("LOGS_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void deleteAllBlockNumberData(Promise promise) {
        long startTime = System.currentTimeMillis();
        try {
            Integer result = databaseHelper.deleteAllBlockNumberData();
//            promise.resolve(result);

            long endTime = System.currentTimeMillis();
            long executionTime = endTime - startTime;
            promise.resolve(Utils.createResponseInt(true, executionTime, 0, ""));
        } catch (Exception e) {
            long endTime = System.currentTimeMillis();
            long executionTime = endTime - startTime;
            promise.reject("LOGS_ERROR", e.getMessage());
        }
    }

    /*
    CallLog.Calls.TYPE
    -  CallLog.Calls.INCOMING_TYPE (1): Incoming call.
    -  CallLog.Calls.OUTGOING_TYPE (2): Outgoing call.
    -  CallLog.Calls.MISSED_TYPE (3): Missed call.
    -  CallLog.Calls.REJECTED_TYPE (4): Rejected call.
    -  CallLog.Calls.BLOCKED_TYPE (5): Blocked call.
    * */
    @ReactMethod
    public void fetchCallLogs(Promise promise) {
        long startTime = System.currentTimeMillis();
        try {
            Uri callLogUri = Uri.parse("content://call_log/calls");
            ContentResolver contentResolver = getReactApplicationContext().getContentResolver();
            Cursor cursor = contentResolver.query(callLogUri, null, null, null, null);

            if (cursor != null) {
                // Use a HashMap to group call logs by phone number
                HashMap<String, WritableArray> groupedCallLogs = new HashMap<>();

                while (cursor.moveToNext()) {
                    String id = cursor.getString(cursor.getColumnIndexOrThrow(CallLog.Calls._ID));
                    String number = cursor.getString(cursor.getColumnIndexOrThrow(CallLog.Calls.NUMBER));
                    String type = cursor.getString(cursor.getColumnIndexOrThrow(CallLog.Calls.TYPE));
                    String date = cursor.getString(cursor.getColumnIndexOrThrow(CallLog.Calls.DATE));

                    // Fetch contact name and photo associated with the number
                    ContactInfo contactInfo = Utils.getContactInfo(getReactApplicationContext(), number);

                    // Create a WritableMap for each CallItem
                    WritableMap callItem = Arguments.createMap();
                    callItem.putString("id", id);
                    callItem.putString("name", contactInfo.name);
                    callItem.putString("photoUri", contactInfo.photoUri);
                    callItem.putString("number", number);
                    callItem.putString("type", type);
                    callItem.putString("date", date);

                    // Check if the number is already in the grouped map
                    if (!groupedCallLogs.containsKey(number)) {
                        groupedCallLogs.put(number, Arguments.createArray());
                    }

                    // Add the call item to the corresponding group in the HashMap
                    groupedCallLogs.get(number).pushMap(callItem);
                }

                cursor.close();

                // Create a WritableArray to return the grouped call logs
                WritableArray groupedCallList = Arguments.createArray();

                for (Map.Entry<String, WritableArray> entry : groupedCallLogs.entrySet()) {
                    WritableMap group = Arguments.createMap();
                    group.putString("number", entry.getKey());
                    group.putArray("callLogs", entry.getValue());
                    groupedCallList.pushMap(group);
                }

                long endTime = System.currentTimeMillis();
                long executionTime = endTime - startTime;
                promise.resolve(Utils.createResponseArray(true, executionTime, groupedCallList, ""));
            }
        } catch (Exception e) {
            long endTime = System.currentTimeMillis();
            long executionTime = endTime - startTime;
            promise.reject("LOGS_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void fetchCallLogByNumber(String phoneNumber, Promise promise) {
        long startTime = System.currentTimeMillis();
        try {
            Uri callLogUri = Uri.parse("content://call_log/calls");
            ContentResolver contentResolver = getReactApplicationContext().getContentResolver();

            // Modify the selection query to filter by the provided phone number
            String selection = CallLog.Calls.NUMBER + "=?";
            String[] selectionArgs = new String[]{phoneNumber};

            Cursor cursor = contentResolver.query(callLogUri, null, selection, selectionArgs, null);

            if (cursor != null) {
                // Use a HashMap to group call logs by phone number
                HashMap<String, WritableArray> groupedCallLogs = new HashMap<>();

                while (cursor.moveToNext()) {
                    String id = cursor.getString(cursor.getColumnIndexOrThrow(CallLog.Calls._ID));
                    String number = cursor.getString(cursor.getColumnIndexOrThrow(CallLog.Calls.NUMBER));
                    String type = cursor.getString(cursor.getColumnIndexOrThrow(CallLog.Calls.TYPE));
                    String date = cursor.getString(cursor.getColumnIndexOrThrow(CallLog.Calls.DATE));

                    // Fetch contact name and photo associated with the number
                    ContactInfo contactInfo = Utils.getContactInfo(getReactApplicationContext(), number);

                    // Create a WritableMap for each CallItem
                    WritableMap callItem = Arguments.createMap();
                    callItem.putString("id", id);
                    callItem.putString("name", contactInfo.name);
                    callItem.putString("photoUri", contactInfo.photoUri);
                    callItem.putString("number", number);
                    callItem.putString("type", type);
                    callItem.putString("date", date);

                    // Check if the number is already in the grouped map
                    if (!groupedCallLogs.containsKey(number)) {
                        groupedCallLogs.put(number, Arguments.createArray());
                    }

                    // Add the call item to the corresponding group in the HashMap
                    groupedCallLogs.get(number).pushMap(callItem);
                }

                cursor.close();

                // Create a WritableArray to return the grouped call logs
                WritableArray groupedCallList = Arguments.createArray();

                for (Map.Entry<String, WritableArray> entry : groupedCallLogs.entrySet()) {
                    WritableMap group = Arguments.createMap();
                    group.putString("number", entry.getKey());
                    group.putArray("callLogs", entry.getValue());
                    groupedCallList.pushMap(group);
                }

                long endTime = System.currentTimeMillis();
                long executionTime = endTime - startTime;
                promise.resolve(Utils.createResponseArray(true, executionTime, groupedCallList, ""));
            } else {
                promise.resolve(Utils.createResponseArray(false, 0, null, "No call logs found for the number."));
            }
        } catch (Exception e) {
            long endTime = System.currentTimeMillis();
            long executionTime = endTime - startTime;
            promise.reject("LOGS_ERROR", e.getMessage());
        }
    }


    @ReactMethod
    public void fetchSmsLogs(Promise promise) {
        long startTime = System.currentTimeMillis();
        try {
            Uri smsUri = Uri.parse("content://sms/");
            Cursor cursor = getReactApplicationContext().getContentResolver().query(smsUri, null, null, null, null);

            if (cursor != null) {
                // A map to hold SMS grouped by address
                HashMap<String, WritableArray> smsMap = new HashMap<>();

                while (cursor.moveToNext()) {
                    String id = cursor.getString(cursor.getColumnIndexOrThrow("_id"));
                    String address = cursor.getString(cursor.getColumnIndexOrThrow("address"));
                    String body = cursor.getString(cursor.getColumnIndexOrThrow("body"));
                    String date = cursor.getString(cursor.getColumnIndexOrThrow("date"));
                    String type = cursor.getString(cursor.getColumnIndexOrThrow("type"));
                    int read = cursor.getInt(cursor.getColumnIndexOrThrow("read"));
                    String status = cursor.getString(cursor.getColumnIndexOrThrow("status"));
                    String thread_id = cursor.getString(cursor.getColumnIndexOrThrow("thread_id"));

                    // Fetch contact name associated with the number
                    ContactInfo contactInfo =  Utils.getContactInfo(getReactApplicationContext(), address);

                    // Create a WritableMap for each smsItem
                    WritableMap smsItem = Arguments.createMap();
                    smsItem.putString("id", id);
                    smsItem.putString("address", address);
                    smsItem.putString("body", body);
                    smsItem.putString("date", date);
                    smsItem.putString("name", contactInfo.name); // Add contact name
                    smsItem.putString("photoUri", contactInfo.photoUri); // Add contact photo URI
                    smsItem.putString("type", type);
                    smsItem.putInt("read", read);
                    smsItem.putString("status", status);
                    smsItem.putString("thread_id", thread_id);

                    // Add the smsItem to the corresponding WritableArray in the map
                    if (!smsMap.containsKey(address)) {
                        smsMap.put(address, Arguments.createArray());
                    }
                    smsMap.get(address).pushMap(smsItem);
                }
                cursor.close();

                // Convert the map to a WritableArray for the response
                WritableArray groupedSmsList = Arguments.createArray();
                for (Map.Entry<String, WritableArray> entry : smsMap.entrySet()) {
                    WritableMap groupedSms = Arguments.createMap();

                    WritableArray messages = entry.getValue();

                    groupedSms.putString("id", messages.getMap(0).getString("id"));
                    groupedSms.putString("address", entry.getKey());
                    groupedSms.putArray("messages", messages);
                    groupedSmsList.pushMap(groupedSms);
                }

                long endTime = System.currentTimeMillis();
                long executionTime = endTime - startTime;
                promise.resolve(Utils.createResponseArray(true, executionTime, groupedSmsList, ""));
            } else {
                long endTime = System.currentTimeMillis();
                long executionTime = endTime - startTime;

                promise.reject("LOGS_ERROR", "Failed to retrieve SMS logs.");
            }
        } catch (Exception e) {
            long endTime = System.currentTimeMillis();
            long executionTime = endTime - startTime;
            promise.reject("LOGS_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void fetchSmsThreadIdLogs(String number, Promise promise) {
        long startTime = System.currentTimeMillis();
        try {
            Log.d("fetchSmsThreadIdLogs", "start :" + number );
            Uri smsUri = Uri.parse("content://sms/");
            String[] projection = new String[] { "_id", "address", "body", "date" }; // Specify the columns you want to retrieve
            String selection = "address = ?";
            String[] selectionArgs = new String[] { number }; // Replace with the address you want to filter by

            Cursor cursor = getReactApplicationContext().getContentResolver().query(smsUri, null, selection, selectionArgs, null);

//            WritableArray threadIds = Arguments.createArray();
            String thread_id = "0";
            if (cursor != null) {
                try {
                    while (cursor.moveToNext()) {
//                        String id = cursor.getString(cursor.getColumnIndex("_id"));
//                        String address = cursor.getString(cursor.getColumnIndex("address"));
//                        String body = cursor.getString(cursor.getColumnIndex("body"));
//                        long date = cursor.getLong(cursor.getColumnIndex("date"));

                        String id =  cursor.getString(cursor.getColumnIndexOrThrow("_id"));
                        thread_id = cursor.getString(cursor.getColumnIndexOrThrow("thread_id"));

                        // Process the SMS data
//                        Log.d("fetchSmsThreadIdLogs", "thread_id: " + thread_id );

//                        threadId.add(thread_id);

//                        threadIds.pushString(thread_id);
                    }

//                    WritableArray newThreadIds = Utils.removeDuplicates(threadIds);

                    long endTime = System.currentTimeMillis();
                    long executionTime = endTime - startTime;
                    promise.resolve(Utils.createResponseInt(true, executionTime, Integer.parseInt(thread_id), ""));
                } catch (Exception e) {
                    long endTime = System.currentTimeMillis();
                    long executionTime = endTime - startTime;
                    promise.reject("LOGS_ERROR",  e.getMessage());
                } finally {
                    cursor.close();
                }
            }

            long endTime = System.currentTimeMillis();
            long executionTime = endTime - startTime;
            promise.resolve(Utils.createResponseInt(true, executionTime, Integer.parseInt(thread_id), ""));
        } catch (Exception e) {
            Log.e("fetchSmsThreadIdLogs",  e.getMessage() );
            long endTime = System.currentTimeMillis();
            long executionTime = endTime - startTime;
            promise.reject("LOGS_ERROR",  e.getMessage());
        }
    }

    /*
    Telephony.Sms.TYPE
        Telephony.Sms.MESSAGE_TYPE_INBOX – Represents an incoming SMS message. 
        Telephony.Sms.MESSAGE_TYPE_SENT – Represents an SMS message that has been sent.
        Telephony.Sms.MESSAGE_TYPE_DRAFT – Represents an SMS draft.
        Telephony.Sms.MESSAGE_TYPE_OUTBOX – Represents an SMS message that is in the outbox, waiting to be sent.
    */
    @ReactMethod
    public void fetchSmsMessagesByThreadId(String threadId, Promise promise){
        try {
            List<SmsMessage> messages = Utils.getSmsMessagesByThreadId(getReactApplicationContext(), Long.parseLong(threadId));
            WritableArray writableArray = Arguments.createArray();
            for (SmsMessage sms : messages) {
                WritableMap smsMap = Arguments.createMap();
                smsMap.putString("id", sms.getId());
                smsMap.putString("address", sms.getAddress());
                smsMap.putString("body", sms.getBody());
                smsMap.putDouble("date", sms.getDate());
                smsMap.putInt("type", sms.getType());

                // Fetch contact name associated with the number
                ContactInfo contactInfo =  Utils.getContactInfo(getReactApplicationContext(), sms.getAddress());

                smsMap.putString("name", contactInfo.name); // Add contact name
                smsMap.putString("photoUri", contactInfo.photoUri); // Add contact photo URI

                smsMap.putInt("read", sms.isRead());
                smsMap.putString("status", sms.getStatus());

                writableArray.pushMap(smsMap);
            }
            promise.resolve(writableArray);
        } catch (Exception e) {
            promise.reject("ERROR",  e.getMessage());
        }
    }

    @ReactMethod
    public void sendTextSMS(String phoneNumber, String message, Promise promise){
        long startTime = System.currentTimeMillis();

        SmsManager smsManager = SmsManager.getDefault();
        try {
            smsManager.sendTextMessage(phoneNumber, null, message, null, null);

            long endTime = System.currentTimeMillis();
            long executionTime = endTime - startTime;
            promise.resolve(Utils.createResponseInt(true, executionTime,  0, ""));
        } catch (Exception e) {
            promise.reject("ERROR", e);
        }
    }

    @ReactMethod
    public void removeCallLogByNumber(String phoneNumber, Promise promise) {
        long startTime = System.currentTimeMillis();
        try {
            ContentResolver contentResolver = getReactApplicationContext().getContentResolver();
            Uri callUri = CallLog.Calls.CONTENT_URI;

            String where = CallLog.Calls.NUMBER + "=?";
            String[] selectionArgs = { phoneNumber };

            int rowsDeleted = contentResolver.delete(callUri, where, selectionArgs);

            if (rowsDeleted > 0) {
//                promise.resolve("Deleted " + rowsDeleted + " call log entries for " + phoneNumber);

                long endTime = System.currentTimeMillis();
                long executionTime = endTime - startTime;
                promise.resolve(Utils.createResponseInt(true, executionTime,  rowsDeleted, ""));
            } else {
                promise.reject("Error", "No call logs found for the given phone number.");
            }
        } catch (SecurityException e) {
            promise.reject("PermissionError", "You do not have the necessary permissions.");
        } catch (Exception e) {
            Log.e(TAG, "Error removing call log", e);
            promise.reject("Error", e.getMessage());
        }
    }

    @ReactMethod
    public void removeAllCallLog(Promise promise) {
        long startTime = System.currentTimeMillis();
        try {
            ContentResolver contentResolver = getReactApplicationContext().getContentResolver();
            Uri callUri = CallLog.Calls.CONTENT_URI;
            int rowsDeleted = contentResolver.delete(callUri, null, null);
            if (rowsDeleted > 0) {
                long endTime = System.currentTimeMillis();
                long executionTime = endTime - startTime;
                promise.resolve(Utils.createResponseInt(true, executionTime,  rowsDeleted, ""));
            } else {
                promise.reject("Error", "No call logs found for the given phone number.");
            }
        } catch (SecurityException e) {
            promise.reject("PermissionError", "You do not have the necessary permissions.");
        } catch (Exception e) {
            Log.e(TAG, "Error removing call log", e);
            promise.reject("Error", e.getMessage());
        }
    }

    @ReactMethod
    public void removeSmsByAddress(String address, Promise promise) {
        long startTime = System.currentTimeMillis();

        ContentResolver contentResolver = getReactApplicationContext().getContentResolver();
        Uri smsUri = Uri.parse("content://sms/");
        Cursor cursor = contentResolver.query(smsUri, null, Telephony.Sms.ADDRESS + " = ?", new String[]{address}, null);

        try {
            if (cursor != null && cursor.moveToFirst()) {
                do {
                    long id = cursor.getLong(cursor.getColumnIndexOrThrow(Telephony.Sms._ID));
                    int rowsDeleted = contentResolver.delete(Uri.parse("content://sms/" + id), null, null);

                    if (rowsDeleted > 0) {
                        Log.i(TAG, "Message deleted successfully, ID: " + id );

                    } else {
                        Log.i(TAG, "Failed to delete message, ID: " + id );
                    }

                } while (cursor.moveToNext());

                long endTime = System.currentTimeMillis();
                long executionTime = endTime - startTime;
                promise.resolve(Utils.createResponseInt(true, executionTime,  1, ""));
            }

            long endTime = System.currentTimeMillis();
            long executionTime = endTime - startTime;
            promise.resolve(Utils.createResponseInt(true, executionTime,  0, "No SMS found for the given address."));
        } catch (Exception e) {
            promise.reject("Error", e.getMessage());
        } finally {
            if (cursor != null) {
                cursor.close();
            }
        }
    }

    @ReactMethod
    public void removeAllSms(Promise promise){
        long startTime = System.currentTimeMillis();

        ContentResolver contentResolver = getReactApplicationContext().getContentResolver();
        Uri smsUri = Uri.parse("content://sms/");

        try {
            // Attempt to delete all SMS messages
            int deletedCount = contentResolver.delete(smsUri, null, null);
            if (deletedCount > 0) {
                System.out.println("Successfully deleted all SMS messages.");
            } else {
                System.out.println("No SMS messages to delete.");
            }

            long endTime = System.currentTimeMillis();
            long executionTime = endTime - startTime;
            promise.resolve(Utils.createResponseInt(true, executionTime,  1, ""));
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Error deleting SMS messages. Ensure the app is set as the default SMS app.");

            promise.reject("Error", e.getMessage());
        }
    }

    @ReactMethod
    public void requestDefaultSmsRole(Promise promise) {
        // Create an instance of ActivityResultLauncher
        MainActivity activity = (MainActivity) getCurrentActivity();
        if (activity != null) {
            activity.requestDefaultSmsRole();
        }
    }

    @ReactMethod
    public void isAvailableSmsRole(Promise promise) {
        long startTime = System.currentTimeMillis();
        try {
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    RoleManager roleManager = (RoleManager) getCurrentActivity().getSystemService(Context.ROLE_SERVICE);
                    boolean isRoleAvailable = roleManager.isRoleAvailable(RoleManager.ROLE_SMS);

                    if(isRoleAvailable){
                        boolean isRoleHeld = roleManager.isRoleHeld(RoleManager.ROLE_SMS);
                        promise.resolve(isRoleHeld);
                    }
                }else{
                    String defaultSmsPackage = Telephony.Sms.getDefaultSmsPackage(reactContext);
                    boolean isRoleAvailable = defaultSmsPackage != null && defaultSmsPackage.equals(reactContext.getPackageName());

                    promise.resolve(isRoleAvailable);
                }
            } catch (Exception e) {
                promise.reject("ROLE_CHECK_ERROR", "Failed to check SMS role", e);
            }

        } catch (Exception e) {
            Log.e("isAvailableSmsRole",  e.getMessage() );
            promise.reject("LOGS_ERROR",  e.getMessage());
        }
    }
}
