Repro for react-native-audio-api: onEnded subscriptions are never removed.

npm install && npx expo install --fix && npx expo run:android (or run:ios)

The counter shows Hermes js_externalBytes. With onEnded ON it climbs ~12 MB/s; toggle it OFF and it stays flat.
