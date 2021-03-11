package com.ken.openken.service;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.location.Location;
import android.os.Looper;

import androidx.core.app.ActivityCompat;

import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;

public class LocationReceiver {
    private static final int MIN_TIME_MS = 30000;

    interface LocationCallback {
        void onReceivedLocation(Location location);
    }

    private final Context context;
    private final LocationCallback callback;

    private final com.google.android.gms.location.LocationCallback
            fusedLocationCallback = new com.google.android.gms.location.LocationCallback() {
        @Override
        public void onLocationResult(LocationResult locationResult) {
            if (locationResult == null) {
                return;
            }
            Location latestLocation = locationResult.getLastLocation();
            if (latestLocation == null) {
                return;
            }
            callback.onReceivedLocation(latestLocation);
        }
    };

    private FusedLocationProviderClient fusedLocationClient;

    public LocationReceiver(Context context, LocationCallback callback) {
        this.context = context;
        this.callback = callback;
        this.fusedLocationClient = LocationServices.getFusedLocationProviderClient(context);
    }

    public void start() {
        if (ActivityCompat.checkSelfPermission(context,
                Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            return;
        }
        LocationRequest locationRequest = LocationRequest.create();
        locationRequest.setInterval(MIN_TIME_MS);
        locationRequest.setPriority(LocationRequest.PRIORITY_HIGH_ACCURACY);

        fusedLocationClient.requestLocationUpdates(locationRequest,
                fusedLocationCallback,
                Looper.getMainLooper());
    }

    public void stop() {
        fusedLocationClient.removeLocationUpdates(fusedLocationCallback);
    }
}
