import { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { getGraphClient } from '@/services/graphService';

export interface GraphProfile {
    displayName: string;
    givenName: string;
    surname: string;
    mail: string;
    jobTitle: string;
    department: string; // Maps to "Unit" in our context
    officeLocation: string; // Maps to "Division" in our context
    mobilePhone: string;
    faxNumber: string; // Maps to "Payroll Number"
    id: string;
}

export const useGraphProfile = () => {
    const { instance, accounts } = useMsal();
    const [profile, setProfile] = useState<GraphProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (accounts.length === 0) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const client = await getGraphClient(instance);
                if (!client) {
                    throw new Error('Failed to initialize Graph Client');
                }

                const userProfile = await client.api('/me')
                    .select('id,displayName,givenName,surname,mail,jobTitle,department,officeLocation,mobilePhone,faxNumber')
                    .get();

                setProfile(userProfile as GraphProfile);
                setError(null);
            } catch (err: any) {
                console.error('Error fetching graph profile:', err);
                setError(err.message || 'Failed to fetch profile');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [instance, accounts]);

    return { profile, loading, error };
};
