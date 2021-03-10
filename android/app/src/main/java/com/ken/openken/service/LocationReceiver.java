package com.ken.openken.service;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.location.LocationProvider;
import android.os.Bundle;
import android.util.Log;

import androidx.core.app.ActivityCompat;

import static android.content.Context.LOCATION_SERVICE;

public class LocationReceiver implements LocationListener {
    private static final int MIN_TIME_MS = 30000;
    private static final float MIN_DISTANCE_M = 1;

    interface LocationCallback {
        void onReceivedLocation(Location location);
    }

    private final Context context;
    private final LocationCallback callback;

    private final LocationManager locationManager;

    public LocationReceiver(Context context, LocationCallback callback) {
        this.context = context;
        this.callback = callback;
        this.locationManager = (LocationManager) context.getSystemService(LOCATION_SERVICE);
    }

    public void start() {
        if (ActivityCompat.checkSelfPermission(context,
                Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            locationManager.requestLocationUpdates(
                    LocationManager.NETWORK_PROVIDER,
//                    LocationManager.GPS_PROVIDER,
                    MIN_TIME_MS,
                    MIN_DISTANCE_M, this);
        }
    }

    public void stop() {
        locationManager.removeUpdates(this);
    }

    @Override
    public void onLocationChanged(Location location) {
        this.callback.onReceivedLocation(location);
    }

    @Override
    public void onProviderDisabled(String provider) {
        Log.w("zzz", "LocationProvider disabled: " + provider);
    }

    @Override
    public void onProviderEnabled(String provider) {
        Log.w("zzz", "LocationProvider enabled: " + provider);
    }

    @Override
    public void onStatusChanged(String provider, int status, Bundle extras) {
        switch (status) {
            case LocationProvider.AVAILABLE:
                Log.w("zzz", "LocationProvider AVAILABLE");
                break;
            case LocationProvider.OUT_OF_SERVICE:
                Log.w("zzz", "LocationProvider OUT_OF_SERVICE");
                break;
            case LocationProvider.TEMPORARILY_UNAVAILABLE:
                Log.w("zzz", "LocationProvider TEMPORARILY_UNAVAILABLE");
                break;
        }
    }
}
