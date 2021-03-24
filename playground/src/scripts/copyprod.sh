#!/bin/sh

gcloud config set project open-ken
gcloud firestore export gs://openken-dev-prodexport
latestexport=$(gsutil ls gs://openken-dev-prodexport | tail -n 1)
echo $latestexport
mkdir -p data/exported
rm -fr data/exported/*
gsutil -m cp -r $latestexport data/exported/

exported=$(ls data/exported|tail -n 1)
mv data/exported/$exported data/exported/latest

echo "You can now use:"
echo "firebase emulators:start --import=data/exported/latest"