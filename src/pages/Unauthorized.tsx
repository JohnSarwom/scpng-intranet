import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Home, ArrowLeft, Mail, RefreshCw } from 'lucide-react';
import { useRoleBasedAuth } from '@/hooks/useRoleBasedAuth';

const Unauthorized = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshRole } = useRoleBasedAuth();
  
  const fromPath = location.state?.from?.pathname || '/';

  const handleRefresh = async () => {
    await refreshRole();
    // Optionally navigate back to the attempted path
    navigate(fromPath);
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="bg-card p-8 rounded-lg shadow-lg max-w-lg w-full">
        <div className="flex justify-center mb-6">
          <ShieldAlert className="h-16 w-16 text-destructive" />
        </div>
        
        <h1 className="text-2xl font-bold mb-4 text-center">Access Denied</h1>
        
        <p className="text-muted-foreground mb-6 text-center">
          You don't have permission to access this resource.
        </p>

        {user && (
          <div className="bg-muted p-4 rounded-lg mb-6 space-y-2">
            <h3 className="font-medium">Your Current Access Level:</h3>
            <div className="text-sm space-y-1">
              <div><strong>Role:</strong> {user.role_name}</div>
              {user.division_name && (
                <div><strong>Division:</strong> {user.division_name}</div>
              )}
              <div><strong>Email:</strong> {user.user_email}</div>
            </div>
          </div>
        )}

        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg mb-6">
          <h3 className="font-medium mb-2">What you can do:</h3>
          <ul className="text-sm space-y-1">
            <li>• Contact your system administrator to request access</li>
            <li>• Verify you're logged in with the correct account</li>
            <li>• Try refreshing your permissions</li>
          </ul>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
          <Button 
            variant="default"
            onClick={() => navigate('/')}
            className="flex items-center"
          >
            <Home className="mr-2 h-4 w-4" />
            Go to Dashboard
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleRefresh}
            className="flex items-center"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Access
          </Button>
        </div>

        <div className="text-center">
          <Button 
            onClick={() => window.location.href = `mailto:admin@scpng.gov.pg?subject=Access Request&body=I need access to: ${encodeURIComponent(fromPath)}`}
            variant="link"
            className="text-sm"
          >
            <Mail className="h-4 w-4 mr-2" />
            Request Access via Email
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized; 