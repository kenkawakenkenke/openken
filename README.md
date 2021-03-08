# Overview

OpenKen is a project to allow the world (and family) to spy on Ken's sensor data at https://open-ken.web.app. This is primarily to collectively watch over his health but also to just see what happens when the world can watch you.

# Architecture

Components:

- Fitbit (App on fitbit streams sensor data (heartrate, sleep) to data collector)
- Android app (App on Ken's phone streams sensor data (location, phone use) to data collector)
- Data Collector (Firestore DB to collect raw sensor data)
- Data Presenter (Cloud functions aggregate sensor data to create presentation data for the Peeker.)
- Ken Peeker (Web frontend on Firebase Hosting)

# Setup

```
git clone https://github.com/kenkawakenkenke/openken.git
```
