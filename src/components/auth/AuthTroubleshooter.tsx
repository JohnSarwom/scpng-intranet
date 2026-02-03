import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { runMsalDiagnostics, fixCommonMsalIssues, attemptPopupLogin } from '@/integrations/microsoft/msalDiagnostics';
import microsoftAuthConfig from '@/config/microsoft-auth';

const AuthTroubleshooter: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  const runDiagnostics = async () => {
    setIsLoading(true);
    
    try {
      const results = await runMsalDiagnostics();
      setDiagnosticResults(results);
      
      if (!results.success) {
        toast.warning('Authentication issues detected');
      } else {
        toast.success('Authentication setup looks good');
      }
    } catch (error) {
      console.error('Error running diagnostics:', error);
      toast.error('Failed to run diagnostics');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fixIssues = async () => {
    setIsLoading(true);
    
    try {
      const success = await fixCommonMsalIssues();
      
      if (success) {
        toast.success('Fixed common authentication issues');
        
        // Run diagnostics again to update the results
        const updatedResults = await runMsalDiagnostics();
        setDiagnosticResults(updatedResults);
      } else {
        toast.error('Failed to fix issues');
      }
    } catch (error) {
      console.error('Error fixing issues:', error);
      toast.error('Error fixing authentication issues');
    } finally {
      setIsLoading(false);
    }
  };
  
  const tryPopupLogin = async () => {
    setIsLoading(true);
    
    try {
      const response = await attemptPopupLogin();
      
      if (response) {
        toast.success('Login successful!');
        // Run diagnostics again to update the results
        const updatedResults = await runMsalDiagnostics();
        setDiagnosticResults(updatedResults);
      } else {
        toast.error('Login failed or was cancelled');
      }
    } catch (error) {
      console.error('Error with popup login:', error);
      toast.error('Login attempt failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    // Run diagnostics on mount
    runDiagnostics();
  }, []);
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Authentication Troubleshooter</h2>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Configuration</h3>
        <div className="bg-gray-100 p-3 rounded">
          <p><strong>Client ID:</strong> {microsoftAuthConfig.clientId}</p>
          <p><strong>Redirect URI:</strong> {microsoftAuthConfig.redirectUri}</p>
          <p><strong>Current Origin:</strong> {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</p>
        </div>
      </div>
      
      {diagnosticResults && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Diagnostic Results</h3>
          
          <div className={`p-3 rounded mb-2 ${diagnosticResults.success ? 'bg-green-100' : 'bg-red-100'}`}>
            <p><strong>Status:</strong> {diagnosticResults.success ? 'Good' : 'Issues Detected'}</p>
          </div>
          
          {diagnosticResults.issues.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold mb-1">Issues:</h4>
              <ul className="list-disc ml-5">
                {diagnosticResults.issues.map((issue: string, i: number) => (
                  <li key={i} className="text-red-600">{issue}</li>
                ))}
              </ul>
            </div>
          )}
          
          {diagnosticResults.recommendations.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold mb-1">Recommendations:</h4>
              <ul className="list-disc ml-5">
                {diagnosticResults.recommendations.map((rec: string, i: number) => (
                  <li key={i} className="text-blue-600">{rec}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Toggle to show/hide technical details */}
          <button 
            onClick={() => setShowDetails(!showDetails)} 
            className="text-sm text-blue-500 hover:underline mb-2"
          >
            {showDetails ? 'Hide Details' : 'Show Technical Details'}
          </button>
          
          {showDetails && (
            <div className="overflow-auto max-h-60 bg-gray-800 text-white p-3 rounded font-mono text-xs">
              <pre>{JSON.stringify(diagnosticResults.details, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
      
      <div className="flex flex-wrap gap-2 mt-4">
        <button 
          onClick={runDiagnostics} 
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
        >
          {isLoading ? 'Running...' : 'Run Diagnostics'}
        </button>
        
        <button 
          onClick={fixIssues} 
          disabled={isLoading || !diagnosticResults}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
        >
          Fix Common Issues
        </button>
        
        <button 
          onClick={tryPopupLogin} 
          disabled={isLoading}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
        >
          Try Popup Login
        </button>
      </div>
      
      <div className="mt-6 text-sm text-gray-600">
        <p><strong>Note:</strong> If you're having persistent issues, try:</p>
        <ol className="list-decimal ml-5 mt-2">
          <li>Clearing your browser cache and cookies</li>
          <li>Ensuring the redirect URI in Azure AD exactly matches the one above</li>
          <li>Checking that you're using the correct tenant ID and client ID</li>
          <li>Verifying that the application has proper consent and permissions</li>
        </ol>
      </div>
    </div>
  );
};

export default AuthTroubleshooter; 