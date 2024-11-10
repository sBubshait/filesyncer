// ConfigureAWS.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface AWSConfig {
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  region: string;
}

type ValidationStatus = 'idle' | 'testing' | 'valid' | 'invalid';

export default function ConfigureAWS() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<AWSConfig>({
    accessKeyId: '',
    secretAccessKey: '',
    bucketName: '',
    region: 'us-east-1',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validationStatus, setValidationStatus] =
    useState<ValidationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Load existing config on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const savedConfig =
          await window.electron.ipcRenderer.invoke('get-aws-config');
        console.log(savedConfig);
        if (savedConfig) {
          setConfig(savedConfig);
        }
      } catch (error) {
        console.error('Error loading AWS config:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  const handleTestCredentials = async () => {
    setValidationStatus('testing');
    setErrorMessage('');

    try {
      // Send credentials to your API for testing
      const response = await window.electron.ipcRenderer.invokeWithData(
        'validate-aws-config',
        config,
      );

      if (response.success) {
        setValidationStatus('valid');
      } else {
        setValidationStatus('invalid');
        setErrorMessage(response.error || 'Invalid AWS credentials');
      }
    } catch (error: any) {
      setValidationStatus('invalid');
      setErrorMessage(error.message || 'Failed to test AWS credentials');
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      await window.electron.ipcRenderer.invokeWithData(
        'store-aws-config',
        config,
      );
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving AWS config:', error);
      alert('Failed to save AWS configuration. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Reset validation status when any field changes
    setValidationStatus('idle');
    setErrorMessage('');
  };

  const isFormFilled =
    config.accessKeyId &&
    config.secretAccessKey &&
    config.bucketName &&
    config.region;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Loading configuration...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-md mx-auto pt-10">
        <h1 className="text-3xl font-bold mb-8 text-center">
          AWS Configuration
        </h1>

        <form className="space-y-6">
          <div>
            <label
              htmlFor="accessKeyId"
              className="block text-sm font-medium mb-2"
            >
              Access Key ID
            </label>
            <input
              type="text"
              id="accessKeyId"
              name="accessKeyId"
              value={config.accessKeyId}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label
              htmlFor="secretAccessKey"
              className="block text-sm font-medium mb-2"
            >
              Secret Access Key
            </label>
            <input
              type="password"
              id="secretAccessKey"
              name="secretAccessKey"
              value={config.secretAccessKey}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label
              htmlFor="bucketName"
              className="block text-sm font-medium mb-2"
            >
              AWS Bucket Name
            </label>
            <input
              type="text"
              id="bucketName"
              name="bucketName"
              value={config.bucketName}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="region" className="block text-sm font-medium mb-2">
              AWS Region
            </label>
            <input
              type="text"
              id="region"
              name="region"
              value={config.region}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          {errorMessage && (
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-3 text-sm text-red-200">
              {errorMessage}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleTestCredentials}
              disabled={
                !isFormFilled || validationStatus === 'testing' || saving
              }
              className={`flex-1 py-3 rounded-lg transition-colors ${
                validationStatus === 'testing'
                  ? 'bg-yellow-600 cursor-wait'
                  : validationStatus === 'valid'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-blue-600 hover:bg-blue-700'
              } disabled:bg-gray-600 disabled:cursor-not-allowed`}
            >
              {validationStatus === 'testing'
                ? 'Testing Credentials...'
                : validationStatus === 'valid'
                  ? '✓ Credentials Verified'
                  : 'Verify Credentials'}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>

          {validationStatus === 'valid' && (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition-colors disabled:bg-green-800 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving Configuration...' : 'Save Configuration'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
