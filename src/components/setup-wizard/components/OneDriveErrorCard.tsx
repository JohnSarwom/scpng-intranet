import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

interface OneDriveErrorCardProps {
  error: string;
  retry?: () => void;
  fallback?: () => void;
  details?: any;
}

const OneDriveErrorCard: React.FC<OneDriveErrorCardProps> = ({ error, retry, fallback, details }) => {
  const isRedirectUriError = error.includes('redirect URI') || 
                             error.includes('redirectUri') || 
                             error.includes('AADSTS50011') ||
                             (details?.error?.message && 
                              details.error.message.includes('redirect'));

  const currentUri = typeof window !== 'undefined' ? window.location.origin : '';
  
  return (
    <Card className="w-full border-red-200 bg-red-50 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-red-700 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          OneDrive Connection Error
        </CardTitle>
        <CardDescription className="text-red-600">
          {isRedirectUriError ? 'Redirect URI mismatch detected' : 'Failed to connect to Microsoft'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isRedirectUriError ? (
          <div className="space-y-4">
            <Alert variant="destructive">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Redirect URI Configuration Error</AlertTitle>
              <AlertDescription className="mt-2">
                Your app's redirect URI is not properly configured in Azure Active Directory.
              </AlertDescription>
            </Alert>
            
            <div className="rounded-md bg-white p-3 border border-red-200">
              <h4 className="font-medium text-sm text-red-800 mb-2">How to fix this issue:</h4>
              <ol className="list-decimal pl-5 text-sm space-y-2 text-red-700">
                <li>
                  Log in to the <a href="https://portal.azure.com" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">Azure Portal</a>
                </li>
                <li>Go to Azure Active Directory &gt; App registrations</li>
                <li>Find and select your application</li>
                <li>In the left menu, click on "Authentication"</li>
                <li>Under "Redirect URIs", add the following URI:
                  <code className="block mt-1 p-2 bg-gray-100 rounded text-sm font-mono break-all">
                    {currentUri}
                  </code>
                </li>
                <li>Save your changes</li>
              </ol>
            </div>
            
            <p className="text-sm text-red-600">
              Error details: {error}
            </p>
          </div>
        ) : (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </CardContent>
      <CardFooter className="flex gap-2 pt-2">
        {retry && (
          <Button 
            variant="default"
            onClick={retry}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Try Again
          </Button>
        )}
        {fallback && (
          <Button 
            variant="outline" 
            onClick={fallback}
            className="border-red-200 text-red-700 hover:bg-red-50"
          >
            Use Local Storage Instead
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default OneDriveErrorCard; 