import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface MicrosoftAPIConfig {
  clientId: string;
  authorityUrl: string;
  redirectUri: string;
  permissions: string[];
  apiEndpoint: string;
  last_tested: string | null;
  test_success: boolean;
  confirmed: boolean;
  last_confirmed: string | null;
}

interface TestResult {
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
}

interface MicrosoftAPIConfigProps {
  availablePermissions?: { value: string; label: string }[];
}

const MicrosoftAPIConfig: React.FC<MicrosoftAPIConfigProps> = ({
  availablePermissions = [
    { value: 'User.Read', label: 'User Profile (User.Read)' },
    { value: 'Files.Read.All', label: 'Read All Files (Files.Read.All)' },
    { value: 'Files.ReadWrite.All', label: 'Read/Write All Files (Files.ReadWrite.All)' },
    { value: 'Sites.Read.All', label: 'Read All Sites (Sites.Read.All)' },
    { value: 'Sites.ReadWrite.All', label: 'Read/Write All Sites (Sites.ReadWrite.All)' },
    { value: 'Mail.Read', label: 'Read Mail (Mail.Read)' },
    { value: 'Calendars.Read', label: 'Read Calendar (Calendars.Read)' },
    { value: 'People.Read', label: 'Read People (People.Read)' },
    { value: 'Directory.Read.All', label: 'Read Directory (Directory.Read.All)' }
  ]
}) => {
  const [msConfig, setMsConfig] = useState<MicrosoftAPIConfig>({
    clientId: '',
    authorityUrl: 'https://login.microsoftonline.com/common',
    redirectUri: 'https://unitopia-hub.vercel.app/',
    permissions: ['User.Read'],
    apiEndpoint: 'https://graph.microsoft.com/v1.0',
    last_tested: null,
    test_success: false,
    confirmed: false,
    last_confirmed: null
  });
  
  const [msTestResult, setMsTestResult] = useState<TestResult>({
    status: 'idle'
  });
  
  // Load configuration from localStorage
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const storedConfig = localStorage.getItem('microsoft_config');
        if (storedConfig) {
          const parsedConfig = JSON.parse(storedConfig);
          setMsConfig(parsedConfig);
        }
      } catch (error) {
        console.error('Error loading Microsoft config:', error);
        toast.error('Failed to load Microsoft configuration');
      }
    };
    
    loadConfig();
  }, []);

  const handleMicrosoftPermissionToggle = (permission: string) => {
    setMsConfig(prev => {
      if (prev.permissions.includes(permission)) {
        return {
          ...prev,
          permissions: prev.permissions.filter(p => p !== permission)
        };
      } else {
        return {
          ...prev,
          permissions: [...prev.permissions, permission]
        };
      }
    });
  };

  const handleSaveConfig = async () => {
    try {
      // Save to localStorage
      localStorage.setItem('microsoft_config', JSON.stringify(msConfig));
      toast.success('Microsoft configuration saved successfully');
    } catch (error) {
      console.error('Error saving Microsoft config:', error);
      toast.error('Failed to save Microsoft configuration');
    }
  };

  const handleTestConnection = async () => {
    setMsTestResult({ status: 'loading' });
    try {
      // Test Microsoft Graph API connection
      if (!window.msalInstance) {
        throw new Error('MSAL instance not found');
      }

      const response = await window.msalInstance.acquireTokenSilent({
        scopes: msConfig.permissions
      });

      const result = await fetch(msConfig.apiEndpoint, {
        headers: {
          Authorization: `Bearer ${response.accessToken}`
        }
      });

      if (!result.ok) {
        throw new Error(`Failed to connect to Microsoft Graph API: ${result.statusText}`);
      }

      setMsTestResult({
        status: 'success',
        message: 'Successfully connected to Microsoft Graph API'
      });
      
      setMsConfig(prev => ({
        ...prev,
        last_tested: new Date().toISOString(),
        test_success: true
      }));
      
      toast.success('Successfully connected to Microsoft Graph API');
    } catch (error) {
      console.error('Error testing connection:', error);
      setMsTestResult({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to connect to Microsoft Graph API'
      });
      toast.error('Failed to connect to Microsoft Graph API');
      
      setMsConfig(prev => ({
        ...prev,
        last_tested: new Date().toISOString(),
        test_success: false
      }));
    }
  };

  const handleQuickSetup = () => {
    // Set the predefined configuration values
    setMsConfig({
      clientId: '648a96d7-e3f5-4e13-8084-ba0b74dbb56f',
      apiEndpoint: 'https://graph.microsoft.com/v1.0',
      permissions: ['User.Read'],
      redirectUri: 'https://unitopia-hub.vercel.app/',
      authorityUrl: 'https://login.microsoftonline.com/b173aac7-6781-4d49-a037-d874bd4a09ab',
      last_tested: null,
      test_success: false,
      confirmed: false,
      last_confirmed: null
    });
    
    toast.success('Quick setup values loaded. Please save and test the configuration.');
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <h3 className="text-lg font-medium text-blue-800">Microsoft Graph API Configuration</h3>
        <p className="text-sm text-blue-700 mt-1">
          Configure connection settings for Microsoft services integration (Graph API, SharePoint, OneDrive, etc.)
        </p>
        {msConfig.confirmed && (
          <div className="mt-2 flex items-center text-green-700">
            <Check size={16} className="mr-2" />
            <span className="text-xs">Configuration active and confirmed</span>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Microsoft Graph API Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="ms-client-id">Client ID <span className="text-red-500">*</span></Label>
              <Input 
                id="ms-client-id" 
                placeholder="Enter your application's Client ID" 
                value={msConfig.clientId}
                onChange={e => setMsConfig(prev => ({ ...prev, clientId: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                The Client ID from your registered Azure AD application
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ms-authority">Authority URL</Label>
              <Input 
                id="ms-authority" 
                placeholder="https://login.microsoftonline.com/{tenant_id}"
                value={msConfig.authorityUrl}
                onChange={e => setMsConfig(prev => ({ ...prev, authorityUrl: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Use 'common' for multi-tenant or your specific tenant ID
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ms-redirect">Redirect URI</Label>
              <Input 
                id="ms-redirect" 
                placeholder="Enter redirect URI"
                value={msConfig.redirectUri}
                onChange={e => setMsConfig(prev => ({ ...prev, redirectUri: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Must match a redirect URI registered in your Azure AD app
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>API Permissions</Label>
              <div className="grid grid-cols-2 gap-2">
                {availablePermissions.map(permission => (
                  <div key={permission.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`permission-${permission.value}`}
                      checked={msConfig.permissions.includes(permission.value)}
                      onChange={() => handleMicrosoftPermissionToggle(permission.value)}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor={`permission-${permission.value}`} className="text-sm">
                      {permission.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button onClick={handleSaveConfig}>
                Save Configuration
              </Button>
              <Button onClick={handleTestConnection} variant="outline">
                Test Connection
              </Button>
              <Button onClick={handleQuickSetup} variant="ghost">
                Quick Setup
              </Button>
            </div>
            
            {msTestResult.status !== 'idle' && (
              <div className={`flex items-center ${
                msTestResult.status === 'success' ? 'text-green-600' : 
                msTestResult.status === 'error' ? 'text-red-600' : 
                'text-gray-600'
              }`}>
                {msTestResult.status === 'success' ? (
                  <Check size={16} className="mr-2" />
                ) : msTestResult.status === 'error' ? (
                  <X size={16} className="mr-2" />
                ) : null}
                <span className="text-sm">
                  {msTestResult.status === 'loading' ? 'Testing connection...' : 
                   msTestResult.status === 'success' ? 'Connection successful' :
                   msTestResult.message}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MicrosoftAPIConfig;
