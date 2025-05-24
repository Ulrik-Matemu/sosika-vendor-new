// src/utils/requestPermission.ts
import { getToken } from "firebase/messaging";
import { messaging } from "../lib/firebase";

export const requestPermission = async () => {
  console.log("Requesting permission...");
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    console.log("Notification permission granted.");

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });

    if (token) {
      console.log("FCM Token:", token);
      // send this token to your backend to send push messages later
    } else {
      console.warn("No FCM token retrieved.");
    }
  } else {
    console.warn("Permission not granted.");
  }
};
