// AuthenticatedView.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Square,
  Settings,
  LogOut,
  RefreshCw,
  Folder,
} from 'lucide-react';

type SyncStatus = 'awaiting_credentials' | 'syncing' | 'stopped';
type ActionType = 'none' | 'starting' | 'stopping' | 'restarting';

interface StatusDetails {
  status: SyncStatus;
  message: string;
  color: string;
}

export default function AuthenticatedView({ token }: { token: string | null }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState<SyncStatus>('stopped');
  const [currentAction, setCurrentAction] = useState<ActionType>('none');
  const [awsConfigured, setAwsConfigured] = useState(false);
  const [folderCount, setFolderCount] = useState<number>(0);

  const checkCurrentStatus = async () => {
    try {
      const hasAwsConfig =
        await window.electron.ipcRenderer.invoke('get-aws-config');
      setAwsConfigured(!!hasAwsConfig);

      if (!hasAwsConfig) {
        setStatus('awaiting_credentials');
        return;
      }

      const syncStatus =
        await window.electron.ipcRenderer.invoke('get-sync-status');
      setStatus(syncStatus ? 'syncing' : 'stopped');
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  const loadFolderCount = async () => {
    try {
      const config =
        await window.electron.ipcRenderer.invoke('get-watch-config');
      setFolderCount(config.foldersToWatch?.length || 0);
    } catch (error) {
      console.error('Error loading folder count:', error);
    }
  };

  // Status polling
  useEffect(() => {
    const checkStatus = async () => {
      await checkCurrentStatus();
      await loadFolderCount();
    };

    checkStatus();
    const interval = setInterval(checkStatus, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    try {
      await window.electron.ipcRenderer.invoke('clear-token');
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleToggleSync = async () => {
    if (currentAction !== 'none') return;

    try {
      if (status === 'syncing') {
        setCurrentAction('stopping');
        await window.electron.ipcRenderer.invoke('stop-sync');
        setStatus('stopped');
      } else {
        setCurrentAction('starting');
        await window.electron.ipcRenderer.invoke('start-sync');
        setStatus('syncing');
      }
    } catch (error) {
      console.error('Error toggling sync:', error);
      // Recheck status in case of error
      await checkCurrentStatus();
    } finally {
      setCurrentAction('none');
    }
  };

  const handleRestartSync = async () => {
    if (currentAction !== 'none') return;

    try {
      setCurrentAction('restarting');
      await window.electron.ipcRenderer.invoke('restart-sync');
      setStatus('syncing');
    } catch (error) {
      console.error('Error restarting sync:', error);
      await checkCurrentStatus();
    } finally {
      setCurrentAction('none');
    }
  };

  const getStatusDetails = (currentStatus: SyncStatus): StatusDetails => {
    switch (currentStatus) {
      case 'awaiting_credentials':
        return {
          status: 'awaiting_credentials',
          message: 'AWS Credentials Required',
          color: 'text-yellow-400',
        };
      case 'syncing':
        return {
          status: 'syncing',
          message: 'Actively Syncing',
          color: 'text-green-400',
        };
      case 'stopped':
        return {
          status: 'stopped',
          message: 'Sync Stopped',
          color: 'text-red-400',
        };
    }
  };

  const getActionMessage = (action: ActionType): string => {
    switch (action) {
      case 'starting':
        return 'Starting Sync...';
      case 'stopping':
        return 'Stopping Sync...';
      case 'restarting':
        return 'Restarting Sync...';
      default:
        return '';
    }
  };

  const statusDetails = getStatusDetails(status);
  const isLoading = currentAction !== 'none';

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Top Navigation */}
      <nav className="bg-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">FileSyncer</h1>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center gap-8">
          {/* Status Circle */}
          <div className="relative">
            <div
              className={`w-48 h-48 rounded-full flex items-center justify-center border-4 transition-colors ${
                isLoading
                  ? 'border-blue-500 animate-pulse'
                  : status === 'syncing'
                    ? 'border-green-500'
                    : status === 'awaiting_credentials'
                      ? 'border-yellow-500'
                      : 'border-red-500'
              }`}
            >
              <button
                onClick={handleToggleSync}
                disabled={status === 'awaiting_credentials' || isLoading}
                className={`w-36 h-36 rounded-full flex items-center justify-center transition-all transform hover:scale-105 ${
                  status === 'awaiting_credentials'
                    ? 'bg-gray-700 cursor-not-allowed'
                    : 'bg-gray-700 hover:bg-gray-600 cursor-pointer'
                }`}
              >
                {isLoading ? (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-t-transparent border-blue-500 rounded-full animate-spin mb-2" />
                    <span className="text-sm text-gray-300">
                      {getActionMessage(currentAction)}
                    </span>
                  </div>
                ) : status === 'syncing' ? (
                  <Square size={48} className="text-white" />
                ) : (
                  <Play size={48} className="text-white ml-2" />
                )}
              </button>
            </div>
          </div>

          {/* Status Text */}
          <div className="text-center">
            <h2 className={`text-2xl font-semibold ${statusDetails.color}`}>
              {isLoading
                ? getActionMessage(currentAction)
                : statusDetails.message}
            </h2>
            {status === 'awaiting_credentials' && (
              <p className="text-gray-400 mt-2">
                Please configure your AWS credentials to begin syncing
              </p>
            )}
          </div>

          {status === 'syncing' && (
            <p className="text-gray-300" style={{ marginTop: '-1.5rem' }}>
              Watching {folderCount} folder{folderCount !== 1 ? 's' : ''}
            </p>
          )}

          {/* Quick Actions */}
          <div className="bg-gray-800 rounded-lg p-4 mt-4 text-center">
            <h3 className="text-lg font-medium text-white mb-2">
              Quick Actions
            </h3>
            <div className="flex flex-col items-center space-y-3 mt-4">
              {status === 'syncing' && (
                <button
                  type="button"
                  onClick={handleRestartSync}
                  className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <RefreshCw
                    size={20}
                    className={
                      currentAction === 'restarting' ? 'animate-spin' : ''
                    }
                  />
                  Restart Sync
                </button>
              )}
              {(status === 'syncing' || status === 'stopped') && (
                <button
                  type="button"
                  onClick={() => navigate('/folders')}
                  className="w-full flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Folder size={20} />
                  Manage Folders ({folderCount})
                </button>
              )}
              <button
                type="button"
                onClick={() => navigate('/configureAWS')}
                className="w-full flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Settings size={20} />
                Configure AWS
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
