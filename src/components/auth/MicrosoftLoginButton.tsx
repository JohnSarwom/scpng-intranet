import React, { useState, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';
import microsoftAuthConfig from '@/config/microsoft-auth';
import { handleRedirectResponse } from '@/integrations/microsoft/msalService';

interface MicrosoftLoginButtonProps {
  className?: string;
  text?: string | ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

const MicrosoftLoginButton: React.FC<MicrosoftLoginButtonProps> = ({ 
  className = "w-full bg-[#0078d4] hover:bg-[#106ebe] text-white font-semibold py-3 px-4 rounded flex items-center justify-center gap-2",
  text = "Sign in with Microsoft",
  onClick,
  disabled = false
}) => {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {disabled ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Signing in...
        </span>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 23 23">
            <path fill="#fff" d="M11.5 0C5.149 0 0 5.149 0 11.5S5.149 23 11.5 23 23 17.851 23 11.5 17.851 0 11.5 0zm0 11.5V0c6.351 0 11.5 5.149 11.5 11.5H11.5z"/>
          </svg>
          {text}
        </>
      )}
    </button>
  );
};

export default MicrosoftLoginButton; 