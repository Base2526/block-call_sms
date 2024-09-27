package com.blockcall.architecture;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import java.util.List;

public class DatabaseHelper extends SQLiteOpenHelper {
    private static String TAG = DatabaseHelper.class.getName();
    private static final int DATABASE_VERSION = 1; // Increment this when upgrading

    private static Context context = null;
    private static final String DATABASE_NAME = "blockcall.db";

    private static final String TABLE_NAME = "BLOCK";
    private static final String COL_ID = "ID";
    private static final String COL_PHONE_NUMBER = "PHONE_NUMBER";
    private static final String COL_DETAIL = "DETAIL";
    private static final String COL_REPORTER = "REPORTER";
    private static final String COL_STATUS = "STATUS";
    private static final String COL_CREATE_AT = "CREATE_AT";
    private static final String COL_UPDATE_AT = "UPDATE_AT";
    private static final String COL_TYPE   = "TYPE";

    private static final String COL_NAME = "NAME";
    private static final String COL_PHOTO_URI = "PHOTO_URI";

    public DatabaseHelper(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
        this.context = context;
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        db.execSQL("CREATE TABLE " + TABLE_NAME + " ("+
                                        COL_ID +" INTEGER PRIMARY KEY AUTOINCREMENT, "+
                                        COL_PHONE_NUMBER +" TEXT, "+
                                        COL_DETAIL +" TEXT, "+
                                        COL_REPORTER +" TEXT, "+
                                        COL_TYPE +" TEXT, "+
                                        COL_STATUS +" INTEGER DEFAULT 1, "+
                                        COL_CREATE_AT +" DATE DEFAULT CURRENT_TIMESTAMP, " +
                                        COL_UPDATE_AT +" DATE DEFAULT CURRENT_TIMESTAMP)");
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        //  db.execSQL("DROP TABLE IF EXISTS " + TABLE_NAME);
        //  onCreate(db);
        // Log.i(TAG, "oldVersion :" + oldVersion + ", newVersion :" + newVersion);
//        if (newVersion  == 2) {
//            // Add a new column 'age' to the existing table
//            db.execSQL("ALTER TABLE "+ TABLE_NAME +" ADD COLUMN " + COL_TYPE + " TEXT ");
//        }
    }

    // Add a new entry
    public int addBlockNumberData(DataItem i) {
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues contentValues = new ContentValues();
        contentValues.put(COL_PHONE_NUMBER, i.getPhoneNumber());
        contentValues.put(COL_TYPE, i.getType());
        contentValues.put(COL_DETAIL, i.getDetail());
        contentValues.put(COL_REPORTER, i.getReporter());

        long result = db.insert(TABLE_NAME, null, contentValues);
//        return result != -1; // returns true if insert was successful

        return (int)result;
    }

    public boolean addBlockNumberDatas(List<DataItem> datas) {
        SQLiteDatabase db = this.getWritableDatabase();
        db.beginTransaction(); // Start transaction
        try {
            for (DataItem data : datas) {
                ContentValues contentValues = new ContentValues();
                contentValues.put(COL_PHONE_NUMBER, data.getPhoneNumber());
                contentValues.put(COL_DETAIL, data.getDetail());
                contentValues.put(COL_REPORTER, data.getReporter());
                long result = db.insert(TABLE_NAME, null, contentValues);
                if (result == -1) {
                    return false; // If any insert fails, rollback transaction
                }
            }
            db.setTransactionSuccessful(); // Mark transaction as successful
        } finally {
            db.endTransaction(); // End transaction
        }
        return true; // All inserts were successful
    }

    // Get entry by ID
    public WritableMap getBlockNumberDataById(String id) {
        SQLiteDatabase db = this.getWritableDatabase();
        Cursor cursor = db.rawQuery("SELECT * FROM " + TABLE_NAME + " WHERE ID = ?", new String[]{id});

        WritableMap item = Arguments.createMap();
        if (cursor != null) {
            if (cursor.moveToFirst()) {
//                String result = "{ \""+COL_ID+"\": \"" + cursor.getString(0)
//                                + "\", \""+COL_PHONE_NUMBER+"\": \"" + cursor.getString(1) + "\""
//                                + "\", \""+COL_DETAIL+"\": \"" + cursor.getString(2) + "\""
//                                + "\", \""+ COL_REPORTER +"\": \"" + cursor.getString(3) + "\" }";
//                return result; // return JSON string

                item.putString(COL_ID, String.valueOf(cursor.getInt(0))); // Assuming ID is an integer
                item.putString(COL_PHONE_NUMBER, cursor.getString(1));
                item.putString(COL_DETAIL, cursor.getString(2));
                item.putString(COL_REPORTER, cursor.getString(3));

                item.putString(COL_CREATE_AT, cursor.getString(5));
                item.putString(COL_UPDATE_AT, cursor.getString(6));

                ContactInfo contactInfo =  Utils.getContactInfo(context, cursor.getString(1));
                item.putString(COL_NAME, contactInfo.name);
                item.putString(COL_PHOTO_URI, contactInfo.photoUri);

                cursor.close();

                return item;

            }
            cursor.close();
        }
//        return "{}"; // return empty JSON if not found

        return item;
    }

    // Get entry by phone number
    public WritableMap getDataByPhoneNumber(String phoneNumber) {
        SQLiteDatabase db = this.getWritableDatabase();
        Cursor cursor = db.rawQuery("SELECT * FROM " + TABLE_NAME + " WHERE PHONE_NUMBER = ?", new String[]{phoneNumber});

//        WritableArray results = Arguments.createArray();
        WritableMap item = Arguments.createMap();
        if (cursor != null) {
            if (cursor.moveToFirst()) {
//                String result = "{ \""+ COL_ID +"\": \"" + cursor.getString(0)
//                                + "\", \""+ COL_PHONE_NUMBER +"\": \"" + cursor.getString(1) + "\" "
//                                + "\", \""+ COL_DETAIL +"\": \"" + cursor.getString(2) + "\" "
//                                + "\", \""+ COL_REPORTER +"\": \"" + cursor.getString(3) + "\" }";
//                cursor.close();
//                return result; // return JSON string

//                WritableMap item = Arguments.createMap();

                item.putString(COL_ID, String.valueOf(cursor.getInt(0))); // Assuming ID is an integer
                item.putString(COL_PHONE_NUMBER, cursor.getString(1));
                item.putString(COL_DETAIL, cursor.getString(2));

//                results.pushMap(item);

                return item;
            }
            cursor.close();
        }
        return item; // return empty JSON if not found
    }

    // Get all entries
    public WritableArray getBlockNumberAllData() {
        SQLiteDatabase db = this.getWritableDatabase();
        Cursor cursor = db.rawQuery("SELECT * FROM " + TABLE_NAME, null);
        WritableArray results = Arguments.createArray();

        while (cursor.moveToNext()) {
//            Log.i(TAG, cursor.toString());
            WritableMap item = Arguments.createMap();
            item.putString(COL_ID, String.valueOf(cursor.getInt(0))); // Assuming ID is an integer
            item.putString(COL_PHONE_NUMBER, cursor.getString(1));
            item.putString(COL_DETAIL, cursor.getString(2));
            item.putString(COL_REPORTER, cursor.getString(3));

            item.putString(COL_CREATE_AT, cursor.getString(5));
            item.putString(COL_UPDATE_AT, cursor.getString(6));

            // Fetch contact name associated with the number
            ContactInfo contactInfo =  Utils.getContactInfo(context, cursor.getString(1));
            item.putString(COL_NAME, contactInfo.name);
            item.putString(COL_PHOTO_URI, contactInfo.photoUri);

            results.pushMap(item);
        }
        cursor.close(); // Always close the cursor to avoid memory leaks
        return results;
    }

    // Update an entry
    public boolean updateBlockNumberData(DataItem i) {
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues contentValues = new ContentValues();
//        contentValues.put(COL_1, i.getId());
        contentValues.put(COL_PHONE_NUMBER, i.getPhoneNumber());
        contentValues.put(COL_DETAIL, i.getDetail());
        contentValues.put(COL_REPORTER, i.getReporter());
        db.update(TABLE_NAME, contentValues, "ID = ?", new String[]{String.valueOf(i.getId())});
        return true;
    }

    // Delete an entry
    public Integer deleteBlockNumberData(String phoneNumber) {
        SQLiteDatabase db = this.getWritableDatabase();
        return db.delete(TABLE_NAME, COL_PHONE_NUMBER + " = ?", new String[]{phoneNumber});
    }

    // Delete all data
    public Integer deleteAllBlockNumberData() {
        SQLiteDatabase db = this.getWritableDatabase();
        return db.delete(TABLE_NAME, null, null);
    }

    public boolean isPhoneNumberExists(String phoneNumber) {
        SQLiteDatabase db = this.getReadableDatabase();
        Cursor cursor = db.rawQuery("SELECT 1 FROM "+ TABLE_NAME +" WHERE " + COL_PHONE_NUMBER + " = ?", new String[]{phoneNumber});
        boolean exists = cursor.moveToFirst();
        cursor.close();
        return exists;
    }
}

