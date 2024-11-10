// App.tsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import { useState, useEffect } from 'react';
import Main from './Main';
import AuthenticatedView from './AuthenticatedView';
import CallbackHandler from './CallbackHandler';

import './App.css';
import 'tailwindcss/tailwind.css';

// Create a wrapper component to handle routing logic
function AppRoutes() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Check for existing token on load
    window.electron.ipcRenderer
      .invoke('get-token')
      .then((storedToken: any) => {
        if (storedToken) {
          setToken(storedToken);
        }
        setLoading(false);
        return 0;
      })
      .catch((err: any) => {
        console.error(err);
        setLoading(false);
      });

    // Listen for token updates
    const cleanup = window.electron.ipcRenderer.on(
      'token-updated',
      (newToken) => {
        setToken(newToken);
      },
    );

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  useEffect(() => {
    if (!token && location.pathname === '/dashboard') {
      console.log("Cleared");
      // If token is cleared and we're on dashboard, redirect to home
      window.location.href = '/';
    }
  }, [token, location.pathname]);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Debug output
  console.log('Current path:', location.pathname);
  console.log('Current token:', token);

  return (
    <Routes>
      <Route
        path="/"
        element={token ? <AuthenticatedView token={token} /> : <Main />}
      />
      <Route path="/callback" element={<CallbackHandler />} />
      <Route path="/dashboard" element={<AuthenticatedView token={token} />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
