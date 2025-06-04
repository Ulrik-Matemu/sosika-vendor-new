import { messaging } from "../lib/firebase";
import axios from "axios";
import { getToken } from 'firebase/messaging';

const API_URL = import.meta.env.VITE_API_URL;

export const setupPushNotifications = async () => {
    try {
      // Check if service workers are supported
      if ('serviceWorker' in navigator) {
        // First, unregister any existing firebase-messaging-sw.js
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          if (registration.scope.includes('firebase-messaging-sw.js')) {
            await registration.unregister();
            console.log('Unregistered old Firebase service worker');
          }
        }

        // Register Firebase messaging service worker
        console.log('Attempting to register Firebase messaging service worker...');
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('Firebase messaging service worker registered:', registration.scope);

        // Request notification permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          throw new Error('Notification permission not granted');
        }

        // Get FCM token with the registered service worker
        const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
        console.log('Getting FCM token with VAPID key:', vapidKey);

        const token = await getToken(messaging, {
          vapidKey: vapidKey,
          serviceWorkerRegistration: registration
        });

        console.log('FCM Token:', token);
        localStorage.setItem('fcmToken', token);
        // Save this token to your server for sending notifications
        await submitFcmToken(token);
      }
    } catch (error) {
      console.error('Error setting up push notifications:', error);
    }
  }


 export const submitFcmToken = async (fcmToken: string) => {
  const userId = localStorage.getItem("vendorId");
  if (!userId) {
    console.error("User ID not found");
    return;
  }

  try {
    const response = await axios.post(`${API_URL}/auth/fcm-token`, {
      userId,
      fcmToken,
      role: "vendor", // Include role
    }, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("FCM token updated successfully:", response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error updating FCM token:", error.response?.data || error.message);
    } else {
      console.error("Unexpected error:", error);
    }
  }
};
