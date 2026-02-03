import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMsal } from '@azure/msal-react';
import { Client } from '@microsoft/microsoft-graph-client';
import { getGraphClient } from '@/services/graphService';

export interface Employee {
  id: string;
  displayName: string;
  givenName: string;
  surname: string;
  mail: string;
  jobTitle?: string;
  department?: string;
  officeLocation?: string;
  mobilePhone?: string;
  businessPhones?: string[];
  faxNumber?: string;
}

interface EmployeesContextType {
  employees: Employee[];
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  refreshEmployees: () => Promise<void>;
}

const EmployeesContext = createContext<EmployeesContextType | undefined>(undefined);

export const EmployeesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { instance } = useMsal();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [graphClient, setGraphClient] = useState<Client | null>(null);

  // Initialize Graph Client once
  useEffect(() => {
    const initGraphClient = async () => {
      try {
        const client = await getGraphClient(instance);
        setGraphClient(client);
        console.log('✅ Graph Client initialized for Employees');
      } catch (err: any) {
        console.error('❌ Failed to initialize Graph Client:', err);
        setError(`Failed to initialize: ${err.message}`);
      }
    };

    if (instance) {
      initGraphClient();
    }
  }, [instance]);

  // Helper to normalize office location to division ID
  const getDivisionIdFromOffice = (office?: string): string | null => {
    if (!office) return null;
    // Normalize: "Corporate Services Division" -> "corporate-services-division"
    return office.toLowerCase()
      .trim()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Fetch employees from Microsoft Graph
  const fetchEmployees = async () => {
    if (!graphClient) {
      console.warn('Graph client not initialized yet');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[EmployeesContext] Fetching employees from Microsoft Graph...');

      // Fetch all users from Microsoft Graph
      const response = await graphClient
        .api('/users')
        .select('id,displayName,givenName,surname,mail,jobTitle,department,officeLocation,mobilePhone,businessPhones,faxNumber')
        .top(999) // Get up to 999 users
        .get();

      const allEmployees: Employee[] = response.value.map((user: any) => ({
        id: user.id,
        displayName: user.displayName,
        givenName: user.givenName,
        surname: user.surname,
        mail: user.mail,
        jobTitle: user.jobTitle,
        department: user.department,
        officeLocation: user.officeLocation,
        mobilePhone: user.mobilePhone,
        businessPhones: user.businessPhones || [],
        faxNumber: user.faxNumber,
      }));

      console.log(`[EmployeesContext] Fetched ${allEmployees.length} total employees from Microsoft Graph`);

      // Apply the same filtering logic as Contacts page
      // Filter out external contacts - must have both Division (Office) and Unit (Department)
      const validEmployees = allEmployees.filter(employee => {
        const hasDivision = !!getDivisionIdFromOffice(employee.officeLocation);
        const hasUnit = !!employee.department;
        return hasDivision && hasUnit;
      });

      console.log(`✅ Filtered to ${validEmployees.length} valid employees (with both division and department)`);
      console.log(`[EmployeesContext] Excluded ${allEmployees.length - validEmployees.length} employees without proper division/unit`);

      setEmployees(validEmployees);
      setIsInitialized(true);
    } catch (err: any) {
      console.error('❌ Error fetching employees:', err);
      setError(`Failed to fetch employees: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch employees when graph client is ready
  useEffect(() => {
    if (graphClient && !isInitialized) {
      fetchEmployees();
    }
  }, [graphClient]);

  const refreshEmployees = async () => {
    await fetchEmployees();
  };

  return (
    <EmployeesContext.Provider
      value={{
        employees,
        isLoading,
        isInitialized,
        error,
        refreshEmployees,
      }}
    >
      {children}
    </EmployeesContext.Provider>
  );
};

export const useEmployees = () => {
  const context = useContext(EmployeesContext);
  if (context === undefined) {
    throw new Error('useEmployees must be used within an EmployeesProvider');
  }
  return context;
};
