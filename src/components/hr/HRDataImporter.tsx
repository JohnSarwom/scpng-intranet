/**
 * HR Data Importer Component
 * One-click import of employee data to SharePoint
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useHRService } from '@/hooks/useHRService';
import { useEmployees } from '@/contexts/EmployeesContext';

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

const INITIAL_LEAVE_BALANCES = [
  { type: 'Annual Leave', entitlement: 20 },
  { type: 'Sick Leave', entitlement: 10 },
  { type: 'Compassionate Leave', entitlement: 5 },
  { type: 'Carers Leave', entitlement: 5 },
  { type: 'Study Leave', entitlement: 0 },
  { type: 'Maternity Leave', entitlement: 0 },
  { type: 'Paternity Leave', entitlement: 0 },
  { type: 'Leave Without Pay', entitlement: 0 },
  { type: 'Recreational Leave', entitlement: 0 },
  { type: 'Leave For Breast Feeding', entitlement: 0 },
];

const HRDataImporter: React.FC = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const { createEmployee, createLeaveBalance, isInitialized } = useHRService();
  const { employees, isLoading: isLoadingEmployees } = useEmployees();

  const handleImport = async () => {
    if (employees.length === 0) {
      toast.error("No employees found in Microsoft Graph to import.");
      return;
    }

    setIsImporting(true);
    setProgress(0);
    setResult(null);

    const importResult: ImportResult = {
      success: 0,
      failed: 0,
      errors: [],
    };

    try {
      // Filter employees who have a Fax Number (Employee ID)
      const validEmployees = employees.filter(e => e.faxNumber);
      const total = validEmployees.length;

      if (total === 0) {
        toast.warning("No employees found with a Fax Number (Employee ID).");
        setIsImporting(false);
        return;
      }

      for (let i = 0; i < total; i++) {
        const emp = validEmployees[i];
        const employeeId = emp.faxNumber!; // We filtered for this

        try {
          // 1. Create Employee Record
          await createEmployee({
            employeeId: employeeId,
            firstName: emp.givenName,
            lastName: emp.surname,
            email: emp.mail,
            phone: emp.businessPhones?.[0],
            mobilePhone: emp.mobilePhone,
            department: emp.department, // Unit
            jobTitle: emp.jobTitle,
            officeLocation: emp.officeLocation, // Division
            startDate: new Date().toISOString(), // Default to today if unknown
            employmentStatus: 'Active',
            employmentType: 'Permanent',
          });

          // 2. Create Leave Balances
          const currentYear = new Date().getFullYear();
          for (const balance of INITIAL_LEAVE_BALANCES) {
            await createLeaveBalance(
              employeeId,
              balance.type,
              balance.entitlement,
              currentYear
            );
          }

          importResult.success++;
          // toast.success(`Imported: ${emp.displayName}`); // Too noisy for many users
        } catch (error: unknown) {
          const msg = error instanceof Error ? error.message : String(error);
          importResult.failed++;
          importResult.errors.push(`${emp.displayName}: ${msg}`);
          console.error(`Failed to import ${emp.displayName}:`, error);
        }

        // Update progress
        setProgress(Math.round(((i + 1) / total) * 100));
      }

      setResult(importResult);

      if (importResult.failed === 0) {
        toast.success(`Successfully imported ${importResult.success} employees and initialized balances!`);
      } else {
        toast.warning(`Imported ${importResult.success} employees, ${importResult.failed} failed`);
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      toast.error(`Import failed: ${msg}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import Employee Data & Balances
        </CardTitle>
        <CardDescription>
          Import employees from Microsoft Graph (using Fax Number as ID) and initialize leave balances.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Import Button */}
        <div className="flex gap-4">
          <Button
            onClick={handleImport}
            disabled={!isInitialized || isImporting || isLoadingEmployees}
            className="w-full"
          >
            {!isInitialized || isLoadingEmployees ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-pulse" />
                Loading Data...
              </>
            ) : isImporting ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-pulse" />
                Importing... {progress}%
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Import {employees.filter(e => e.faxNumber).length} Employees (with Fax #)
              </>
            )}
          </Button>
        </div>

        {/* Progress Bar */}
        {isImporting && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground text-center">
              Processing employees and creating balances... {progress}%
            </p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-3">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                Successfully imported: <strong>{result.success}</strong> employees
              </AlertDescription>
            </Alert>

            {result.failed > 0 && (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription>
                  Failed to import: <strong>{result.failed}</strong> employees
                </AlertDescription>
              </Alert>
            )}

            {result.errors.length > 0 && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription>
                  <p className="font-semibold mb-2">Errors:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {result.errors.slice(0, 5).map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                    {result.errors.length > 5 && (
                      <li>... and {result.errors.length - 5} more</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h4 className="font-semibold text-sm mb-2">What will be imported:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Employees from Microsoft Graph who have a <strong>Fax Number</strong>.</li>
            <li>• <strong>Fax Number</strong> will be used as the <strong>Employee ID</strong>.</li>
            <li>• Basic profile data (Name, Email, Job Title, Department).</li>
            <li>• <strong>Leave Balances</strong> will be initialized for:</li>
            <ul className="list-disc list-inside pl-4 mt-1">
              {INITIAL_LEAVE_BALANCES.slice(0, 4).map(b => (
                <li key={b.type}>{b.type}: {b.entitlement} days</li>
              ))}
              <li>...and others (0 days)</li>
            </ul>
          </ul>
          <p className="text-xs text-muted-foreground mt-3">
            <strong>Note:</strong> Ensure 'HR_Employees' and 'HR_LeaveBalances' lists exist.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default HRDataImporter;
