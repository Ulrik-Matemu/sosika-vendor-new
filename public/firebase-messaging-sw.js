// firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

// Initialize Firebase with your config
firebase.initializeApp({
  apiKey: 'AIzaSyAf-TlhfJJfQwEgmTxN9jPm7cDmqjQmz9w',
  authDomain: 'sosika-6442a.firebaseapp.com',
  projectId: 'sosika-6442a',
  messagingSenderId: '981492231480',
  appId: '1:981492231480:web:f48eb11971394be1e5e5cd',
});

// Get Firebase Messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message:", payload);
  
  const notificationTitle = payload.notification?.title || payload.data?.title || "New Notification";
  const notificationBody = payload.notification?.body || payload.data?.body || "";
  const notificationIcon = payload.notification?.icon || payload.data?.icon || "/sosika.png";
  
  return self.registration.showNotification(notificationTitle, {
    body: notificationBody,
    icon: notificationIcon,
    data: payload.data || {}
  });
});

// Install event - immediately activate the service worker
self.addEventListener("install", (event) => {
  console.log("[firebase-messaging-sw.js] Installing Firebase messaging service worker");
  self.skipWaiting();
});

// Activate event - claim clients so the SW is in control
self.addEventListener("activate", (event) => {
  console.log("[firebase-messaging-sw.js] Activating Firebase messaging service worker");
  event.waitUntil(self.clients.claim());
});

// Handle push events
self.addEventListener('push', function(event) {
  console.log('[firebase-messaging-sw.js] Push event received:', event);
  // Handle push event as needed
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("[firebase-messaging-sw.js] Notification clicked");
  event.notification.close();
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});

// PWA installability: listen for beforeinstallprompt and cache event
self.addEventListener('beforeinstallprompt', function(event) {
  console.log('[firebase-messaging-sw.js] beforeinstallprompt event fired');
  // Optionally, you can cache the event for custom install UI
  self.deferredPrompt = event;
});