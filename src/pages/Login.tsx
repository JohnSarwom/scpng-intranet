import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, logger } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { LogIn, Loader2, AlertCircle } from 'lucide-react';

// MSAL Imports
import { useMsal } from "@azure/msal-react";
import { InteractionStatus, type AccountInfo } from "@azure/msal-browser"; // To check interaction status, Add AccountInfo type
import { loginRequest } from '@/integrations/microsoft/msalConfig'; // Import scopes from centralized config

export default function Login() {
  const navigate = useNavigate();
  const { instance, inProgress } = useMsal(); // Get MSAL instance and interaction status
  const [msalLoading, setMsalLoading] = useState(false); // Specific loading for MSAL interaction
  const [error, setError] = useState<string | null>(null);

  const handleMicrosoftLogin = async () => {
    if (inProgress !== InteractionStatus.None || msalLoading) {
      logger.info('MSAL interaction already in progress or loading.');
      return;
    }
    setMsalLoading(true);
    setError(null);
    logger.info('Initiating MSAL loginPopup');

    try {
      const msalResponse = await instance.loginPopup(loginRequest);
      logger.success('MSAL login successful', { username: msalResponse.account?.username });

      // Navigate immediately after successful MSAL login
      if (msalResponse.account) {
        const account = msalResponse.account;
        toast.success("Signed in successfully via Microsoft");

        // --- Simple Login Confirmation (Edge Function disabled for efficiency) --- 
        if (account.username) {
          // console.log(`[Login Page] ✅ MSAL login successful for: ${account.username}`);
          // Edge Function disabled - role-based auth handles all logging and RBAC
        } else {
          // console.warn('[Login Page] MSAL username missing, cannot invoke log function.');
        }
        // --- End Invoke Edge Function ---

        navigate('/', { replace: true }); // Navigate to the main app
      } else {
        logger.error('MSAL login succeeded but account info was missing.');
        setError('Authentication failed: Missing account information from Microsoft.');
      }
    } catch (msalError: any) {
      logger.error('MSAL loginPopup error', msalError);
      if (msalError.errorCode === 'user_cancelled') {
        setError('Microsoft sign-in was cancelled.');
      } else if (msalError.errorCode === 'popup_window_error') {
        setError('Popup window blocked or closed. Please allow popups for this site.');
      } else {
        setError(msalError.message || 'An error occurred during Microsoft sign-in.');
      }
    } finally {
      setMsalLoading(false);
    }
  };

  const renderError = () => {
    if (!error) return null;
    return (
      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-3 text-sm">
        <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
        <div>
          <p className="text-red-700 font-medium">Login Error</p>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#400010] p-4">
      <Card className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col items-center mb-6">
            <img
              src="/images/SCPNG Original Logo.png"
              alt="SCPNG Logo"
              className="w-24 h-auto mb-4"
            />
            <h1 className="text-2xl font-semibold text-center text-gray-800 mb-1">SCPNG Intranet Portal</h1>
            <p className="text-gray-500 text-sm text-center">Sign in to access the portal</p>
          </div>

          {renderError()}

          <Button
            variant="outline"
            className="w-full mt-6 bg-white border-gray-300 hover:bg-gray-50 text-gray-700 flex items-center justify-center gap-2"
            onClick={handleMicrosoftLogin}
            disabled={inProgress !== InteractionStatus.None || msalLoading}
          >
            {msalLoading || inProgress !== InteractionStatus.None ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 21 21" aria-hidden="true"><path fill="#f25022" d="M1 1h9v9H1z" /><path fill="#00a4ef" d="M1 11h9v9H1z" /><path fill="#7fba00" d="M11 1h9v9h-9z" /><path fill="#ffb900" d="M11 11h9v9h-9z" /></svg>
            )}
            <span>Sign in with Microsoft</span>
          </Button>

          <div className="mt-6 border-t pt-4">
            <p className="text-xs text-center text-gray-500">
              Authorized personnel only. &copy; SCPNG Intranet Portal {new Date().getFullYear()}
            </p>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
