// AuthenticatedView.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthenticatedView({ token }: { token: string | null }) {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      // Clear token from .env and state
      await window.electron.ipcRenderer.invoke('clear-token');

      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <h1 className="text-4xl font-bold text-white mb-4">Welcome Back!</h1>
        <div className="bg-gray-800 p-4 rounded-lg mb-8">
          <p className="text-gray-300">Your access token:</p>
          <code className="block mt-2 p-2 bg-gray-700 rounded overflow-auto max-w-xl">
            {token}
          </code>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Sign Out
        </button>

        <button
          type="button"
          onClick={() => navigate('/configureAWS')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors mt-4"
        >
          Configure AWS
        </button>
      </div>
    </div>
  );
}
