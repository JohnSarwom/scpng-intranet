import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Cloud, Loader2 } from 'lucide-react';

interface OneDriveAuthProps {
  handleAuthenticate: () => Promise<void>;
  isAuthenticating: boolean;
  authError: string | null;
}

const OneDriveAuth: React.FC<OneDriveAuthProps> = ({
  handleAuthenticate,
  isAuthenticating,
  authError
}) => {
  return (
    <Card className="p-6">
      <div className="flex items-start space-x-4 mb-6">
        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
          <Cloud className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold">Connect to Microsoft</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Use your Microsoft account to store data in OneDrive
          </p>
          
          <Button
            onClick={handleAuthenticate}
            disabled={isAuthenticating}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isAuthenticating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Cloud className="mr-2 h-4 w-4" />
                Connect with Microsoft
              </>
            )}
          </Button>
        </div>
      </div>
      
      {authError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm mt-4">
          <p>Error: {authError}</p>
        </div>
      )}
    </Card>
  );
};

export default OneDriveAuth; 