package com.blockcall.receiver;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.telephony.SmsMessage;
import android.widget.Toast;

public class DefaultSmsReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        // Check if the intent action is SMS_RECEIVED
        if (intent.getAction().equals("android.provider.Telephony.SMS_RECEIVED")) {
            // Retrieve SMS messages from the intent
            Object[] pdus = (Object[]) intent.getExtras().get("pdus");
            if (pdus != null) {
                for (Object pdu : pdus) {
                    SmsMessage smsMessage = SmsMessage.createFromPdu((byte[]) pdu);
                    String messageBody = smsMessage.getMessageBody();
                    String sender = smsMessage.getDisplayOriginatingAddress();

                    // Show a toast with the SMS sender and content
                    Toast.makeText(context, "SMS from: " + sender + "\nMessage: " + messageBody, Toast.LENGTH_LONG).show();

                    // You can handle the received SMS here, e.g., save to database, etc.
                }
            }
        }
    }
}
