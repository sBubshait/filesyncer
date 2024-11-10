import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CallbackHandler() {
  const navigate = useNavigate();
  console.log('Handler');
  useEffect(() => {
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('token='))
      ?.split('=')[1];

    if (token) {
      // Store token in .env file using electron IPC
      window.electron.ipcRenderer.sendMessage('store-token', token);
      navigate('/dashboard');
    } else {
      navigate('/ss');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 flex items-center justify-center">
      <p>Processing login...</p>
    </div>
  );
}
