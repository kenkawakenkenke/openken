package com.ken.openken.service;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.location.Location;
import android.os.IBinder;
import android.util.Log;

import androidx.annotation.NonNull;

import com.google.android.gms.tasks.Continuation;
import com.google.android.gms.tasks.Task;
import com.google.firebase.functions.FirebaseFunctions;
import com.google.firebase.functions.HttpsCallableResult;
import com.ken.openken.R;

import java.time.Duration;
import java.time.Instant;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

public class DataLoggerService extends Service {
    private final FirebaseFunctions functions;
    private LocationReceiver locationReceiver;

    // Received data.
    private Location latestLocation;
    private String latestActivityState;
    private Instant tLastSent;

    public DataLoggerService() {
        super();
        functions = FirebaseFunctions.getInstance("asia-northeast1");
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        // Start a foreground notification to let us keep collecting location in the (sort of) background.
//        startForegroundNotification(intent);
        startForegroundNotification("OpenKenデータ収集サービスが動いています");

        locationReceiver = new LocationReceiver(this, location -> {
            latestLocation = location;
            notifyDataUpdate("location");
        });
        locationReceiver.start();

        ActivityDetectionService.startActivityDetectionService(this, newActivityState -> {
            latestActivityState = newActivityState;
            notifyDataUpdate("activity");
        });
        return START_NOT_STICKY;
    }

    private void startForegroundNotification(String message) {
//    private void startForegroundNotification(Intent intent) {
        String channelId = "default";
        String title = getString(R.string.app_name);
//        PendingIntent pendingIntent =
//                PendingIntent.getActivity(this, 0,
//                        intent, PendingIntent.FLAG_UPDATE_CURRENT);
        NotificationManager notificationManager =
                (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        NotificationChannel channel = new NotificationChannel(
                channelId, title, NotificationManager.IMPORTANCE_MIN);
        channel.setDescription("Silent Notification");
        channel.setSound(null, null);
        channel.setLockscreenVisibility(Notification.VISIBILITY_SECRET);
        channel.enableLights(false);
        channel.setLightColor(Color.BLUE);
        channel.enableVibration(false);

        notificationManager.createNotificationChannel(channel);
        Notification notification = new Notification.Builder(this, channelId)
                .setContentTitle(title)
                .setSmallIcon(android.R.drawable.ic_menu_mylocation)
                .setContentText(message)
                .setAutoCancel(true)
//                .setContentIntent(pendingIntent)
                .setWhen(System.currentTimeMillis())
                .build();
        startForeground(1, notification);
    }

    final long MIN_TIME_BETWEEN_SENDS_SEC = 20;

    public void notifyDataUpdate(String updatedDataset) {
        Instant now = Instant.now();
        if (tLastSent != null) {
            long timeElapsed = Duration.between(tLastSent, now).getSeconds();
            if (timeElapsed < MIN_TIME_BETWEEN_SENDS_SEC) {
                Log.w("zzz", "Only "+timeElapsed+" seconds, ignoring.");
                return;
            }
        }
        tLastSent = now;

        Log.w("zzz", "data update for "+updatedDataset+": "
            + "activity="+ latestActivityState
            +" location="+latestLocation);

        Map<String, Object> data = new HashMap<>();
        data.put("timestamp", new Date().getTime());
        if (latestActivityState!=null) {
            data.put("activity", latestActivityState);
        }
        if (latestLocation != null) {
            Map<String, Object> locationData = new HashMap<>();
            locationData.put("latitude", latestLocation.getLatitude());
            locationData.put("longitude", latestLocation.getLongitude());
            locationData.put("accuracy", latestLocation.getAccuracy());
            locationData.put("altitude", latestLocation.getAltitude());
            locationData.put("speed", latestLocation.getSpeed());
            locationData.put("bearing", latestLocation.getBearing());
            locationData.put("provider", latestLocation.getProvider());
            data.put("location", locationData);
        }
        functions
                .getHttpsCallable("submitMobileData")
                .call(data)
                .continueWith(new Continuation<HttpsCallableResult, String>() {
                    @Override
                    public String then(@NonNull Task<HttpsCallableResult> task) throws Exception {
                        ZonedDateTime zonedDateTime = ZonedDateTime.now();
                        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM/dd HH:mm:ss");
                        String timeStr = zonedDateTime.format(formatter);
                        try {
                            startForegroundNotification(timeStr+" updated "+updatedDataset);

                            String result = (String) task.getResult().getData();
//                            Log.w("zzz", "result: " + result);
                            return result;
                        }catch(Exception e) {
                            Log.w("zzz", "exception in getresult: "+e);
                            startForegroundNotification(timeStr+" updated "+updatedDataset+" but failed send");
                        }
                        return "";
                    }
                });
    }

    @Override
    public void onDestroy() {
        super.onDestroy();

        locationReceiver.stop();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
