// FolderManagement.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, X, FolderPlus, ArrowLeft } from 'lucide-react';

interface FolderConfig {
  foldersToWatch: string[];
}

export default function FolderManagement() {
  const [folders, setFolders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const navigate = useNavigate();

  const loadFolders = async () => {
    try {
      const config =
        await window.electron.ipcRenderer.invoke('get-watch-config');
      setFolders(config.foldersToWatch || []);
    } catch (error) {
      console.error('Error loading folders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFolders();
  }, []);

  const handleAddFolder = async () => {
    setIsAdding(true);
    try {
      const result = await window.electron.ipcRenderer.invoke('select-folder');
      if (result.canceled || !result.folderPath) return;

      const { folderPath, fileCount } = result;

      const confirmed = await window.electron.ipcRenderer.invokeWithData(
        'show-confirmation',
        {
          message: `There are ${fileCount} file(s) in the directory:\n${folderPath}\n\nAre you sure you want to sync this folder?`,
          title: 'Confirm Folder Sync',
        },
      );

      if (!confirmed) return;

      await window.electron.ipcRenderer.invokeWithData(
        'add-watch-folder',
        folderPath,
      );
      await loadFolders();
      await window.electron.ipcRenderer.invoke('restart-sync');
    } catch (error) {
      console.error('Error adding folder:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveFolder = async (folder: string) => {
    try {
      await window.electron.ipcRenderer.invokeWithData(
        'remove-watch-folder',
        folder,
      );
      await loadFolders();
      await window.electron.ipcRenderer.invoke('restart-sync');
    } catch (error) {
      console.error('Error removing folder:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-t-transparent border-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="mr-4 p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">Manage Folders</h1>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Watched Folders</h2>
            <button
              onClick={handleAddFolder}
              disabled={isAdding}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors"
            >
              {isAdding ? (
                <>
                  <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <FolderPlus size={20} />
                  Add Folder
                </>
              )}
            </button>
          </div>

          {folders.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Folder size={48} className="mx-auto mb-4 opacity-50" />
              <p>No folders added yet</p>
              <p className="text-sm mt-2">
                Click the Add Folder button to start syncing
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {folders.map((folder) => (
                <div
                  key={folder}
                  className="flex items-center justify-between bg-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center gap-3">
                    <Folder size={20} className="text-blue-400" />
                    <span className="text-sm font-medium truncate max-w-lg">
                      {folder}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveFolder(folder)}
                    className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                    title="Remove folder"
                  >
                    <X size={20} className="text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
