// src/App.tsx
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TabsDemo } from './pages/login';
import { Dashboard } from './pages/dashboard';
import Orders from './pages/orders';
import VendorProfile from './pages/profile';
import { useEffect } from 'react';
import { onMessage } from 'firebase/messaging';
import { messaging } from './lib/firebase';
import { setupPushNotifications } from './services/push-notifications';
import { AuthProvider } from './contexts/AuthContext';
import { AuthRedirect } from './pages/AuthRedirect'; // 👈 new import

function App() {
  useEffect(() => {
    setupPushNotifications();
    onMessage(messaging, (payload) => {
      console.log("Message received. ", payload);
      const title = payload.notification?.title || "New Notification";
      const options = {
        body: payload.notification?.body,
        icon: payload.notification?.icon,
      };
      new Notification(title, options);
    });
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AuthRedirect />} /> {/* 🔁 Conditional redirect */}
          <Route path="/login" element={<TabsDemo />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<VendorProfile />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
