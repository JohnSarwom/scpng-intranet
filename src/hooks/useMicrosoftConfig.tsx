import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface MicrosoftConfig {
  clientId: string;
  authority: string;
  redirectUri: string;
  postLogoutRedirectUri: string;
  permissions: string[];
}

const defaultConfig: MicrosoftConfig = {
  clientId: '2c2f8f3c-0000-0000-0000-000000000000',
  authority: 'https://login.microsoftonline.com/common',
  redirectUri: 'https://unitopia-hub.vercel.app/',
  postLogoutRedirectUri: 'https://unitopia-hub.vercel.app/',
  permissions: [
    'User.Read',
    'Files.Read.All',
    'Sites.Read.All',
    'profile',
    'email',
    'offline_access'
  ]
};

export const useMicrosoftConfig = () => {
  const [config, setConfig] = useState<MicrosoftConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const storedConfig = localStorage.getItem('microsoft_config');
      if (storedConfig) {
        setConfig(JSON.parse(storedConfig));
      }
    } catch (error) {
      console.error('Error loading Microsoft config:', error);
      toast.error('Failed to load Microsoft configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = async (newConfig: Partial<MicrosoftConfig>) => {
    try {
      const updatedConfig = { ...config, ...newConfig };
      localStorage.setItem('microsoft_config', JSON.stringify(updatedConfig));
      setConfig(updatedConfig);
      toast.success('Microsoft configuration updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating Microsoft config:', error);
      toast.error('Failed to update Microsoft configuration');
      return false;
    }
  };

  const resetConfig = async () => {
    try {
      localStorage.setItem('microsoft_config', JSON.stringify(defaultConfig));
      setConfig(defaultConfig);
      toast.success('Microsoft configuration reset to defaults');
      return true;
    } catch (error) {
      console.error('Error resetting Microsoft config:', error);
      toast.error('Failed to reset Microsoft configuration');
      return false;
    }
  };

  return {
    config,
    isLoading,
    updateConfig,
    resetConfig
  };
};

export default useMicrosoftConfig;
