import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const DatabaseTab: React.FC = () => {
  const testConnection = async () => {
    try {
      // Test Microsoft Graph API connection
      if (!window.msalInstance) {
        throw new Error('MSAL instance not found');
      }

      const response = await window.msalInstance.acquireTokenSilent({
        scopes: ['User.Read']
      });

      const result = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
          Authorization: `Bearer ${response.accessToken}`
        }
      });

      if (!result.ok) {
        throw new Error(`Failed to connect to Microsoft Graph API: ${result.statusText}`);
      }

      toast.success('Successfully connected to Microsoft Graph API');
    } catch (error) {
      console.error('Error testing connection:', error);
      toast.error('Failed to connect to Microsoft Graph API');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Microsoft Graph API</h3>
              <p className="text-sm text-gray-500">Test connection to Microsoft services</p>
            </div>
            <Button onClick={testConnection}>
              Test Connection
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseTab;
