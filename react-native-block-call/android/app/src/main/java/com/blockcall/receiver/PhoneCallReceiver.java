package com.blockcall.receiver;

import android.Manifest;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.telecom.TelecomManager;
import android.telephony.SmsMessage;
import android.telephony.TelephonyManager;
import android.util.Log;
import androidx.core.app.ActivityCompat;

import com.blockcall.architecture.DatabaseHelper;
import com.blockcall.architecture.Utils;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import org.json.JSONException;

public class PhoneCallReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        Log.d("PhoneCallReceiver", "Broadcast received " + intent.getAction());

        switch (intent.getAction()){
            case "android.intent.action.PHONE_STATE":{
                String state = intent.getStringExtra(TelephonyManager.EXTRA_STATE);
                if (TelephonyManager.EXTRA_STATE_RINGING.equals(state)) {
                    // Check permissions using the context parameter
                    if (ActivityCompat.checkSelfPermission(context, Manifest.permission.READ_SMS) != PackageManager.PERMISSION_GRANTED &&
                            ActivityCompat.checkSelfPermission(context, Manifest.permission.READ_PHONE_NUMBERS) != PackageManager.PERMISSION_GRANTED &&
                            ActivityCompat.checkSelfPermission(context, Manifest.permission.READ_PHONE_STATE) != PackageManager.PERMISSION_GRANTED) {
                        // Log the request for permissions
                        Log.d("PhoneCallReceiver", "requestPermissions");
                        return;
                    }

                    String incomingNumber = intent.getStringExtra(TelephonyManager.EXTRA_INCOMING_NUMBER);
                    // Log or handle the incoming number
                    if (incomingNumber != null) {
                        // Do something with the incoming number
                        Log.d("PhoneCallReceiver", "Incoming number: " + incomingNumber);
                        try {
                            if (isBlockedNumber(context, incomingNumber)) {
                                Log.d("PhoneCallReceiver", "Blocking number: " + incomingNumber);
                                endCall(context);
                            }
                        } catch (JSONException e) {
                            throw new RuntimeException(e);
                        }
                    } else {
                        Log.e("PhoneCallReceiver", "Handle the null case");
                    }
                }
                break;
            }
            case "android.provider.Telephony.SMS_RECEIVED":{
                Bundle bundle = intent.getExtras();
                if (bundle != null) {
                    Object[] pdus = (Object[]) bundle.get("pdus");
                    if (pdus != null) {
                        for (Object pdu : pdus) {
                            SmsMessage smsMessage = SmsMessage.createFromPdu((byte[]) pdu);
                            String messageBody = smsMessage.getMessageBody();
                            String sender = smsMessage.getDisplayOriginatingAddress();
                            // Handle the message here
                            System.out.println("SMS received from: " + sender + " Message: " + messageBody);
                        }
                    }
                }
            }
        }
    }

    private boolean isBlockedNumber(Context context, String incomingNumber) throws JSONException {
        // Replace this with your logic to check against a list of blocked numbers

        WritableMap check = (new DatabaseHelper(context)).getDataByPhoneNumber(incomingNumber);
        Log.i("PhoneCallReceiver ", check.toString());

        return !Utils.isWritableMapEmpty(check);
    }

    private void endCall(Context context) {
        // Logic to end the call (requires special permissions on Android 9 and above)
        TelecomManager telecomManager = (TelecomManager) context.getSystemService(Context.TELECOM_SERVICE);
        if (telecomManager != null) {
//            ComponentName compName = new ComponentName(context, EndCallService.class);
            if (ActivityCompat.checkSelfPermission(context, Manifest.permission.ANSWER_PHONE_CALLS) != PackageManager.PERMISSION_GRANTED) {
                // TODO: Consider calling
                //    ActivityCompat#requestPermissions
                // here to request the missing permissions, and then overriding
                //   public void onRequestPermissionsResult(int requestCode, String[] permissions,
                //                                          int[] grantResults)
                // to handle the case where the user grants the permission. See the documentation
                // for ActivityCompat#requestPermissions for more details.
                Log.i("", "");
                return;
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                telecomManager.endCall(); // This requires the caller to be the default phone app
            }
        }

//        Intent intent = new Intent(context, EndCallService.class);
//        context.startService(intent);
//        EndCallService service = new EndCallService();
//        service.endCall();
    }
}

