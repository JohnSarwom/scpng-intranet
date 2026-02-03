import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface TableErrorMessageProps {
  error: Error | null;
  entityName: string;
  onRetry?: () => void;
}

const TableErrorMessage: React.FC<TableErrorMessageProps> = ({ 
  error, 
  entityName,
  onRetry 
}) => {
  if (!error) return null;
  
  // Extract the most useful part of the error message
  let errorMessage = error.message;
  let hintMessage = '';
  let errorCode = '';
  
  // Try to parse Supabase error format
  try {
    const errorObj = JSON.parse(error.message);
    if (errorObj.message) {
      errorMessage = errorObj.message;
      errorCode = errorObj.code || '';
      
      if (errorObj.hint) {
        hintMessage = errorObj.hint;
      }
      
      // Handle specific error codes
      if (errorObj.code === '42703') { // Column doesn't exist
        errorMessage = `Database column mismatch: ${errorObj.message}`;
        if (errorObj.hint) {
          hintMessage = `Suggestion: ${errorObj.hint}`;
        }
      } else if (errorObj.code === '42P01') { // Table doesn't exist
        errorMessage = `Table not found: ${errorObj.message}`;
        hintMessage = 'The database table may need to be created.';
      }
    }
  } catch (e) {
    // Not a JSON error, use original message
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error loading {entityName}</AlertTitle>
      <AlertDescription>
        <div className="mt-2">
          <p>{errorMessage}</p>
          {hintMessage && <p className="text-xs mt-1">{hintMessage}</p>}
          {errorCode && <p className="text-xs text-muted-foreground mt-1">Error code: {errorCode}</p>}
        </div>
        {onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2" 
            onClick={onRetry}
          >
            <RefreshCw className="h-3 w-3 mr-2" />
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default TableErrorMessage; 