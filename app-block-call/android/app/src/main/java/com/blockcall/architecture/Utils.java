package com.blockcall.architecture;

import android.content.ContentResolver;
import android.content.Context;
import android.database.Cursor;
import android.net.Uri;
import android.provider.ContactsContract;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import android.provider.Settings;
import android.util.Log;

public class Utils {
    public static boolean isDeveloperModeEnabled(Context context) {
        try {
            int developerModeEnabled = Settings.Global.getInt(
                    context.getContentResolver(),
                    Settings.Global.DEVELOPMENT_SETTINGS_ENABLED,
                    0
            );
            return developerModeEnabled == 1;
        } catch (Exception e) {
            Log.e("DeveloperModeChecker", "Setting not found", e);
            return false;
        }
    }

    public static ContactInfo getContactInfo(Context context, String phoneNumber) {
        String contactName = "Unknown";
        String photoUri = null;
        ContentResolver contentResolver = context.getContentResolver();
        Uri uri = Uri.withAppendedPath(ContactsContract.PhoneLookup.CONTENT_FILTER_URI, Uri.encode(phoneNumber));
        Cursor cursor = contentResolver.query(uri, new String[]{
                ContactsContract.PhoneLookup.DISPLAY_NAME,
                ContactsContract.PhoneLookup.PHOTO_URI
        }, null, null, null);

        if (cursor != null) {
            if (cursor.moveToFirst()) {
                contactName = cursor.getString(cursor.getColumnIndex(ContactsContract.PhoneLookup.DISPLAY_NAME));
                photoUri = cursor.getString(cursor.getColumnIndex(ContactsContract.PhoneLookup.PHOTO_URI));
            }
            cursor.close();
        }

        return new ContactInfo(contactName, photoUri); // Return contact name and photo URI
    }

    public static List<SmsMessage> getSmsMessagesByThreadId(Context context, long threadId) {
        List<SmsMessage> messages = new ArrayList<>();
        Uri uri = Uri.parse("content://sms/");
        String selection = "thread_id = ?";
        String[] selectionArgs = new String[]{String.valueOf(threadId)};

        ContentResolver contentResolver = context.getContentResolver();
        Cursor cursor = contentResolver.query(uri, null, selection, selectionArgs, null);
        if (cursor != null) {
            while (cursor.moveToNext()) {
                SmsMessage sms = new SmsMessage();
                sms.setId(cursor.getString(cursor.getColumnIndexOrThrow("_id")));
                sms.setAddress(cursor.getString(cursor.getColumnIndexOrThrow("address")));
                sms.setBody(cursor.getString(cursor.getColumnIndexOrThrow("body")));
                sms.setDate(cursor.getLong(cursor.getColumnIndexOrThrow("date")));
                sms.setType(cursor.getInt(cursor.getColumnIndexOrThrow("type")));

                sms.setRead(cursor.getInt(cursor.getColumnIndexOrThrow("read")));
                sms.setStatus(cursor.getString(cursor.getColumnIndexOrThrow("status")));

                messages.add(sms);
            }
            cursor.close();
        }
        return messages;
    }

    public static boolean isWritableMapEmpty(WritableMap writableMap) {
        if (writableMap == null) {
            return true; // Consider null as empty
        }

        ReadableMapKeySetIterator iterator = writableMap.keySetIterator();
        return !iterator.hasNextKey(); // If there are no keys, the map is empty
    }

    public static WritableArray removeDuplicates(WritableArray originalArray) {
        // Create a HashSet to store unique values
        Set<String> uniqueSet = new HashSet<>();

        // Iterate over the original array and add items to the HashSet
        for (int i = 0; i < originalArray.size(); i++) {
            String item = originalArray.getString(i);
            uniqueSet.add(item);
        }

        // Create a new WritableArray to store the unique values
        WritableArray newArray = Arguments.createArray();

        // Add unique values to the new WritableArray
        for (String item : uniqueSet) {
            newArray.pushString(item);
        }

        return newArray;
    }

    public static WritableMap createResponseArray(Boolean status, double executionTime, WritableArray data, String message) {
        WritableMap response = Arguments.createMap();
        response.putBoolean("status", status);
        response.putDouble("executionTime", executionTime  / (1000 * 60) ); // convert to minute
        response.putArray("data", data);
        response.putString("message", message);
        return response;
    }

    public static WritableMap createResponseMap(Boolean status, double executionTime, WritableMap data, String message) {
        WritableMap response = Arguments.createMap();
        response.putBoolean("status", status);
        response.putDouble("executionTime", executionTime  / (1000 * 60) ); // convert to minute
        response.putMap("data", data);
        response.putString("message", message);
        return response;
    }

    public static WritableMap createResponseInt(Boolean status, double executionTime, int data, String message) {
        WritableMap response = Arguments.createMap();
        response.putBoolean("status", status);
        response.putDouble("executionTime", executionTime  / (1000 * 60) ); // convert to minute
        response.putInt("data", data);
        response.putString("message", message);
        return response;
    }
}
