package com.ken.openken.service;

import android.app.IntentService;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;

import com.google.android.gms.location.ActivityRecognition;
import com.google.android.gms.location.ActivityRecognitionClient;
import com.google.android.gms.location.ActivityTransition;
import com.google.android.gms.location.ActivityTransitionEvent;
import com.google.android.gms.location.ActivityTransitionRequest;
import com.google.android.gms.location.ActivityTransitionResult;
import com.google.android.gms.location.DetectedActivity;
import com.google.android.gms.tasks.Task;

import java.util.ArrayList;
import java.util.List;

/**
 * A service for receiving activity recognition result updates, and then broadcasting them.
 */
public class ActivityDetectionService extends IntentService {

    private static final String TAG = ActivityDetectionService.class.getSimpleName();

    public ActivityDetectionService() {
        super("ActivityDetectionService");
    }

    public static String activityTypeName(int activityType) {
        switch(activityType) {
            case DetectedActivity.IN_VEHICLE:
                return "vehicle";
            case DetectedActivity.ON_BICYCLE:
                return "bicycle";
            case DetectedActivity.ON_FOOT:
                return "foot";
            case DetectedActivity.STILL:
                return "still";
            case DetectedActivity.UNKNOWN:
                return "unknown";
            case DetectedActivity.TILTING:
                return "tilting";
            case DetectedActivity.WALKING:
                return "walking";
            case DetectedActivity.RUNNING:
                return "running";
        }
        throw new IllegalArgumentException("unknown activity type:"+activityType);
    }
    public static String transitionTypeName(int transitionType) {
        switch(transitionType){
            case ActivityTransition.ACTIVITY_TRANSITION_ENTER:
                return "enter";
            case ActivityTransition.ACTIVITY_TRANSITION_EXIT:
                return "exit";
        }
        throw new IllegalArgumentException("unknown transition type:"+transitionType);
    }
    @Override
    protected void onHandleIntent(Intent intent) {
        if (intent==null || !ActivityTransitionResult.hasResult(intent)) {
            return;
        }
        ActivityTransitionResult result = ActivityTransitionResult.extractResult(intent);
        for (ActivityTransitionEvent event : result.getTransitionEvents()) {
//            Log.w("zzz", transitionTypeName(event.getTransitionType())+" "+activityTypeName(event.getActivityType()));
            if (event.getTransitionType() == ActivityTransition.ACTIVITY_TRANSITION_ENTER) {
                Intent broadcastIntent = new Intent();
                broadcastIntent.putExtra(MyBroadcastReceiver.KEY_ACTIVITY_STATE, activityTypeName(event.getActivityType()));
                broadcastIntent.setAction(MyBroadcastReceiver.BROADCAST_ACTION);
                getBaseContext().sendBroadcast(broadcastIntent);
            }
        }
    }

    private static class MyBroadcastReceiver extends BroadcastReceiver {
        private static String KEY_ACTIVITY_STATE = "newActivityState";
        private static String BROADCAST_ACTION = "activity_state_update_action";

        private final ResultCallback callback;
        public MyBroadcastReceiver(ResultCallback callback) {
            this.callback = callback;
        }
        @Override
        public void onReceive(Context context, Intent intent) {
            Bundle bundle = intent.getExtras();
            String newActivityState = bundle.getString(KEY_ACTIVITY_STATE);
            callback.onResult(newActivityState);
        }
    }

    /**
     * Interface for callbacks expecting new activity states.
     */
    public interface ResultCallback {
        public void onResult(String newActivityState);
    }

    /**
     * Registers the given callback to receive broadcasts when we detect a new activity.
     */
    public static void addBroadcastReceiver(Context context, ResultCallback callback) {
        MyBroadcastReceiver receiver = new MyBroadcastReceiver(callback);
        IntentFilter intentFilter = new IntentFilter();
        intentFilter.addAction(MyBroadcastReceiver.BROADCAST_ACTION);
        context.registerReceiver(receiver, intentFilter);
    }

    /**
     * Starts activity detection service, and sets us up to receive activity callbacks.
     */
    public static Task<Void> startActivityDetectionService(Context context, ActivityDetectionService.ResultCallback activityCallback) {
        List<ActivityTransition> transitions = new ArrayList<>();

        int[] activities = new int[]{
                DetectedActivity.IN_VEHICLE,
                DetectedActivity.ON_BICYCLE,
                DetectedActivity.STILL,
                DetectedActivity.WALKING,
                DetectedActivity.RUNNING
        };
        for(int activity : activities) {
            transitions.add(
                    new ActivityTransition.Builder()
                            .setActivityType(activity)
                            .setActivityTransition(ActivityTransition.ACTIVITY_TRANSITION_ENTER)
                            .build());
            transitions.add(
                    new ActivityTransition.Builder()
                            .setActivityType(activity)
                            .setActivityTransition(ActivityTransition.ACTIVITY_TRANSITION_EXIT)
                            .build());
        }
        ActivityTransitionRequest request = new ActivityTransitionRequest(transitions);

        ActivityDetectionService.addBroadcastReceiver(context, activityCallback);

        Intent intent = new Intent(context, ActivityDetectionService.class);
        PendingIntent transitionPendingIntent = PendingIntent.getService(context, 100, intent, PendingIntent.FLAG_UPDATE_CURRENT);

        ActivityRecognitionClient activityRecognitionClient = ActivityRecognition.getClient(context);
        return activityRecognitionClient.requestActivityTransitionUpdates(request, transitionPendingIntent);
    }
}