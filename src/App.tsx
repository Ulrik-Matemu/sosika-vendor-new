import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { TabsDemo } from '../src/pages/login'
import { Dashboard } from './pages/dashboard'
import  Orders  from './pages/orders'
import VendorProfile from './pages/profile'
import { useEffect } from 'react'
import { onMessage } from 'firebase/messaging'
import { messaging } from './lib/firebase'
import { setupPushNotifications } from './services/push-notifications'


function App() {
  useEffect(() => {
    setupPushNotifications();
    const listenForForegroundMessages = () => {
      console.log("Listening for foreground messages...");
      onMessage(messaging, (payload) => {
        console.log("Message received. ", payload);
        // Customize notification here
        const notificationTitle = payload.notification?.title || "New Notification";
        const notificationOptions = {
          body: payload.notification?.body,
          icon: payload.notification?.icon,
        };
    
        new Notification(notificationTitle, notificationOptions);
      });
    };
    listenForForegroundMessages();

    onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
    });

  }, []);


  return (
    <Router>
      <Routes>
        <Route path="/" element={<TabsDemo />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path='/orders' element={<Orders />} />
        <Route path='/profile' element={<VendorProfile />} />
      </Routes>
    </Router>
  )
}

export default App
