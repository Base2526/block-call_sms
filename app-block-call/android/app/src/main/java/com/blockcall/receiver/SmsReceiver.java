package com.blockcall.receiver;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;
import android.content.ContentResolver;
import android.net.Uri;
import android.content.ContentValues;
import android.os.Bundle;
import android.telephony.SmsMessage;
import android.app.PendingIntent;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import com.blockcall.MainActivity;
import com.blockcall.R;

public class SmsReceiver extends BroadcastReceiver {
    private static String TAG = SmsReceiver.class.getName();
    private static final String CHANNEL_ID = "sms_channel";

    @Override
    public void onReceive(Context context, Intent intent) {
        Log.d("SmsReceiver", "Broadcast received " + intent.getAction());

        // Extract SMS data
        Bundle bundle = intent.getExtras();
        if (bundle != null) {
            Object[] pdus = (Object[]) bundle.get("pdus");
            if (pdus != null) {
                for (Object pdu : pdus) {
                    SmsMessage smsMessage = SmsMessage.createFromPdu((byte[]) pdu);
                    String sender = smsMessage.getDisplayOriginatingAddress();
                    String message = smsMessage.getMessageBody();
                    long timestamp = smsMessage.getTimestampMillis();

                    // Log received SMS
                    Log.d("SmsReceiver", "Sender: " + sender + ", Message: " + message);

                    // Save SMS to content://sms/
                    saveSmsToDatabase(context, sender, message, timestamp);

                    // Trigger local notification
                    showNotification(context, sender, message);
                }
            }
        }

    }

    private void saveSmsToDatabase(Context context, String sender, String message, long timestamp) {
        ContentResolver contentResolver = context.getContentResolver();
        ContentValues values = new ContentValues();
        values.put("address", sender);  // Sender's phone number
        values.put("body", message);    // SMS message content
        values.put("date", timestamp);  // Timestamp of the message
        values.put("read", 0);          // 0 for unread, 1 for read
        values.put("type", 1);          // 1 for inbox

        Uri uri = contentResolver.insert(Uri.parse("content://sms/inbox"), values);

        if (uri != null) {
            Log.d("SmsReceiver", "SMS saved to " + uri.toString());
        } else {
            Log.d("SmsReceiver", "Failed to save SMS.");
        }
    }

    private void showNotification(Context context, String sender, String messageBody) {
        // Intent for opening the app when the notification is tapped
        Intent intent = new Intent(context, MainActivity.class);
        intent.putExtra("sender", sender);
        intent.putExtra("messageBody", messageBody);
        intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT);

        // Intent for initiating a call
        Intent callIntent = new Intent(Intent.ACTION_DIAL);
        callIntent.setData(Uri.parse("tel:" + sender)); // Assuming 'sender' is the phone number
        PendingIntent callPendingIntent = PendingIntent.getActivity(context, 1, callIntent, PendingIntent.FLAG_UPDATE_CURRENT);

        // Intent for marking as read (this could be a broadcast or another activity)
        Intent markAsReadIntent = new Intent(context, MainActivity.class); // Replace with your receiver or handler
        markAsReadIntent.putExtra("messageBody", messageBody);
        PendingIntent markAsReadPendingIntent = PendingIntent.getBroadcast(context, 2, markAsReadIntent, PendingIntent.FLAG_UPDATE_CURRENT);

        // Intent for replying to the message
        Intent replyIntent = new Intent(context, MainActivity.class); // Replace with your reply activity
        replyIntent.putExtra("messageBody", messageBody);
        PendingIntent replyPendingIntent = PendingIntent.getActivity(context, 3, replyIntent, PendingIntent.FLAG_UPDATE_CURRENT);

        // Build the notification with actions
        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle("New SMS from " + sender)
                .setContentText(messageBody)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setAutoCancel(true)
                .setContentIntent(pendingIntent)
                .addAction(R.mipmap.ic_launcher, "Call", callPendingIntent) // Add Call action
                .addAction(R.mipmap.ic_launcher, "Mark as Read", markAsReadPendingIntent) // Add Mark as Read action
                .addAction(R.mipmap.ic_launcher, "Reply", replyPendingIntent); // Add Reply action

        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(context);
        notificationManager.notify(1, builder.build());
    }
}
