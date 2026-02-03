import { createClient, SupabaseClient } from '@supabase/supabase-js';
import supabaseConfig from '@/config/supabase';

// Create a single supabase client for interacting with your database
let supabase: SupabaseClient;

// Initialize the Supabase client
export const initSupabase = (): SupabaseClient => {
    if (supabase) {
        return supabase;
    }

    supabase = createClient(
        supabaseConfig.url,
        supabaseConfig.anonKey
    );

    return supabase;
};

// Get the supabase client, initializing it if needed
export const getSupabaseClient = (): SupabaseClient => {
    if (!supabase) {
        return initSupabase();
    }
    return supabase;
};

// CRUD operations for notes
export const notesService = {
    // Get all notes for a user
    getNotes: async (userEmail: string) => {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(supabaseConfig.tables.notes)
            .select('*')
            .eq('user_email', userEmail);

        if (error) {
            console.error('Error fetching notes:', error);
            throw error;
        }

        return data || [];
    },

    // Add a new note
    addNote: async (userEmail: string, content: string) => {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(supabaseConfig.tables.notes)
            .insert([{
                content,
                user_email: userEmail
            }]);

        if (error) {
            console.error('Error adding note:', error);
            throw error;
        }

        return data;
    },

    // Update a note
    updateNote: async (id: string, content: string) => {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(supabaseConfig.tables.notes)
            .update({ content })
            .eq('id', id);

        if (error) {
            console.error('Error updating note:', error);
            throw error;
        }

        return data;
    },

    // Delete a note
    deleteNote: async (id: string) => {
        const supabase = getSupabaseClient();
        const { error } = await supabase
            .from(supabaseConfig.tables.notes)
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting note:', error);
            throw error;
        }

        return true;
    }
};

// Service for licenses
export const licensesService = {
    addLicense: async (licenseData: any, licenseTypeId: string) => {
        const supabase = getSupabaseClient();
        const dataToInsert = {
            ...licenseData,
            license_type_id: licenseTypeId,
            // Ensure date fields are handled correctly, convert if necessary
            // For example, if your Supabase column is DATE/TIMESTAMP and formData has strings:
            // issued_date: licenseData.issuedDate ? new Date(licenseData.issuedDate).toISOString() : null,
            // expiry_date: licenseData.expiryDate ? new Date(licenseData.expiryDate).toISOString() : null,
        };

        // Remove fields not intended for direct DB insertion if they exist in licenseData
        // For example, if `selectedLicenseType` object is part of licenseData from the form state
        // delete dataToInsert.selectedLicenseType; 

        const { data, error } = await supabase
            .from(supabaseConfig.tables.licenses)
            .insert([dataToInsert])
            .select(); // Add .select() to get the inserted data back

        if (error) {
            console.error('Error adding license:', error);
            throw error;
        }
        return data;
    },

    // Get all licenses
    getLicenses: async () => {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from(supabaseConfig.tables.licenses)
            .select('*')
            .order('created_at', { ascending: false }); // Optional: order by creation date

        if (error) {
            console.error('Error fetching licenses:', error);
            // It might be better to throw the error to let the calling component handle UI updates (e.g., show error message)
            // For now, returning empty array to prevent crashes, but consider error propagation.
            return [];
        }
        return data || [];
    },
};

// Initialize Supabase on import
initSupabase();

export default getSupabaseClient;
