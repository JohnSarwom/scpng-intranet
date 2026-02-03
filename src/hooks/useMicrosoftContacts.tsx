import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';

export interface MicrosoftContact {
  id: string;
  displayName: string;
  jobTitle?: string;
  department?: string;
  businessPhones?: string[];
  mobilePhone?: string;
  officeLocation?: string;
  emailAddresses?: {
    address: string;
    name: string;
  }[];
  userPrincipalName?: string;
  mail?: string;
  givenName?: string;
  surname?: string;
  companyName?: string;
  preferredLanguage?: string;
  photo?: string;
}

export const useMicrosoftContacts = () => {
  const { instance, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [contacts, setContacts] = useState<MicrosoftContact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = useCallback(async () => {
    if (!isAuthenticated) {
      // Not authenticated yet, wait
      return;
    }

    if (inProgress !== InteractionStatus.None) {
      // Interaction in progress, wait
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await instance.acquireTokenSilent({
        scopes: ['User.Read', 'People.Read', 'Directory.Read.All']
      });

      const result = await fetch('https://graph.microsoft.com/v1.0/users?$select=id,displayName,givenName,surname,mail,jobTitle,department,officeLocation,businessPhones,mobilePhone,userPrincipalName,preferredLanguage,companyName', {
        headers: {
          Authorization: `Bearer ${response.accessToken}`
        }
      });

      if (!result.ok) {
        throw new Error(`Failed to fetch organization contacts: ${result.statusText}`);
      }

      const data = await result.json();

      const transformedContacts = data.value.map((user: any) => ({
        id: user.id,
        displayName: user.displayName || `${user.givenName || ''} ${user.surname || ''}`.trim(),
        jobTitle: user.jobTitle,
        department: user.department,
        businessPhones: user.businessPhones,
        mobilePhone: user.mobilePhone,
        officeLocation: user.officeLocation,
        emailAddresses: user.mail ? [{ address: user.mail, name: user.displayName }] : undefined,
        userPrincipalName: user.userPrincipalName,
        mail: user.mail,
        givenName: user.givenName,
        surname: user.surname,
        companyName: user.companyName,
        preferredLanguage: user.preferredLanguage
      }));

      setContacts(transformedContacts);
    } catch (error) {
      console.error('Error fetching organization contacts:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch organization contacts');
      // Only show toast on actual error, not just missing auth which might happen during init
      if (isAuthenticated) {
        toast.error('Failed to fetch organization contacts from Microsoft');
      }
    } finally {
      setIsLoading(false);
    }
  }, [instance, isAuthenticated, inProgress]);

  useEffect(() => {
    if (isAuthenticated && inProgress === InteractionStatus.None && contacts.length === 0) {
      fetchContacts();
    }
  }, [isAuthenticated, inProgress, fetchContacts, contacts.length]);

  return {
    contacts,
    isLoading,
    error,
    refetch: fetchContacts
  };
};

export default useMicrosoftContacts;