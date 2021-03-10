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

import com.google.firebase.functions.FirebaseFunctions;
import com.ken.openken.R;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

public class DataLoggerService extends Service {
    private final FirebaseFunctions functions;
    private LocationReceiver locationReceiver;

    // Received data.
    private Location latestLocation;
    private String latestActivityState;

    public DataLoggerService() {
        super();
        functions = FirebaseFunctions.getInstance("asia-northeast1");
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        // Start a foreground notification to let us keep collecting location in the (sort of) background.
        startForegroundNotification(intent);

        locationReceiver = new LocationReceiver(this, location -> {
            latestLocation = location;
            notifyDataUpdate();
        });
        locationReceiver.start();

        ActivityDetectionService.startActivityDetectionService(this,newActivityState -> {
            latestActivityState = newActivityState;
            notifyDataUpdate();
        } );
        return START_NOT_STICKY;
    }

    private void startForegroundNotification(Intent intent) {
        String channelId = "default";
        String title = getString(R.string.app_name);
        PendingIntent pendingIntent =
                PendingIntent.getActivity(this, 0,
                        intent, PendingIntent.FLAG_UPDATE_CURRENT);
        NotificationManager notificationManager =
                (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        NotificationChannel channel = new NotificationChannel(
                channelId, title, NotificationManager.IMPORTANCE_DEFAULT);
        channel.setDescription("Silent Notification");
        channel.setSound(null, null);
        channel.enableLights(false);
        channel.setLightColor(Color.BLUE);
        channel.enableVibration(false);

        notificationManager.createNotificationChannel(channel);
        Notification notification = new Notification.Builder(this, channelId)
                .setContentTitle(title)
                .setSmallIcon(android.R.drawable.ic_menu_mylocation)
                .setContentText("OpenKenデータ収集サービスが動いています")
                .setAutoCancel(true)
                .setContentIntent(pendingIntent)
                .setWhen(System.currentTimeMillis())
                .build();
        startForeground(1, notification);
    }

    public void notifyDataUpdate() {
        Log.w("zzz", "data update: "
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
            data.put("location", locationData);
        }
        functions
                .getHttpsCallable("submitMobileData")
                .call(data);
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
