import { runMsalDiagnostics, attemptPopupLogin, fixCommonMsalIssues } from '@/integrations/microsoft/msalDiagnostics';

const checkAuthStatus = async () => {
  console.log('Checking authentication status...');
  
  try {
    const diagnostics = await runMsalDiagnostics();
    
    console.log('Authentication diagnostics:', diagnostics);
    
    if (!diagnostics.success) {
      console.log('Attempting to fix authentication issues...');
      
      diagnostics.issues.forEach(issue => console.warn(`Issue: ${issue}`));
      diagnostics.recommendations.forEach(rec => console.info(`Recommendation: ${rec}`));
      
      await fixCommonMsalIssues();
    }
    
    if (diagnostics.details.accounts > 0) {
      console.log('User appears to be logged in already');
    }
  } catch (error) {
    console.error('Error checking authentication status:', error);
  }
};

const handleLoginWithPopup = async () => {
  try {
    const response = await attemptPopupLogin();
    
    if (response) {
      console.log('Successfully logged in with popup');
    } else {
      console.log('Popup login failed or was cancelled');
    }
  } catch (error) {
    console.error('Error during popup login:', error);
  }
}; 