import { getSupabaseClient } from './supabaseClient';
import { Provider } from '@supabase/supabase-js';

// Function to sign in with a third-party provider
export const signInWithProvider = async (provider: Provider) => {
    try {
        console.log(`Initiating login with ${provider}...`);
        const supabase = getSupabaseClient();

        // Get the current URL for redirect
        const redirectTo = window.location.origin;
        console.log(`Using redirect URL: ${redirectTo}`);

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo,
            }
        });

        if (error) {
            console.error('Authentication error:', error);
            throw error;
        }

        console.log('Authentication successful, redirect URL:', data.url);
        return data;
    } catch (error) {
        console.error(`Error during ${provider} authentication:`, error);
        throw error;
    }
};

// Function to sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
    try {
        console.log('Initiating login with email...');
        const supabase = getSupabaseClient();

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error('Authentication error:', error);
            throw error;
        }

        console.log('Email authentication successful');
        return data;
    } catch (error) {
        console.error('Error during email authentication:', error);
        throw error;
    }
};

// Function to sign out
export const signOut = async () => {
    try {
        console.log('Signing out...');
        const supabase = getSupabaseClient();

        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Sign out error:', error);
            throw error;
        }

        console.log('Sign out successful');
        return true;
    } catch (error) {
        console.error('Error during sign out:', error);
        throw error;
    }
};

// Function to get current session
export const getCurrentSession = async () => {
    try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            console.error('Get session error:', error);
            throw error;
        }

        return data.session;
    } catch (error) {
        console.error('Error getting current session:', error);
        return null;
    }
};

// Function to get current user
export const getCurrentUser = async () => {
    try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.auth.getUser();

        if (error) {
            console.error('Get user error:', error);
            throw error;
        }

        return data.user;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
};

// Function to handle auth state change
export const setupAuthStateListener = (callback: (event: string, session: any) => void) => {
    const supabase = getSupabaseClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
            console.log('Auth state changed:', event);
            callback(event, session);
        }
    );

    return subscription;
};
