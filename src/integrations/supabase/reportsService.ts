import { getSupabaseClient } from './supabaseClient';
import supabaseConfig from '@/config/supabase';
import { ReportTemplate, Report, ScheduledReport } from '@/types/reports';

// Define the reports service for interacting with Supabase
export const reportsService = {
    // Get all report templates
    getReportTemplates: async () => {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from('report_templates')
            .select('*');

        if (error) {
            console.error('Error fetching report templates:', error);
            throw error;
        }

        return data || [];
    },

    // Get a single report template by ID
    getReportTemplate: async (id: string) => {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from('report_templates')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching report template:', error);
            throw error;
        }

        return data;
    },

    // Create a new report template
    createReportTemplate: async (template: Omit<ReportTemplate, 'id'>) => {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from('report_templates')
            .insert([template])
            .select();

        if (error) {
            console.error('Error creating report template:', error);
            throw error;
        }

        return data?.[0];
    },

    // Update an existing report template
    updateReportTemplate: async (id: string, template: Partial<ReportTemplate>) => {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from('report_templates')
            .update(template)
            .eq('id', id)
            .select();

        if (error) {
            console.error('Error updating report template:', error);
            throw error;
        }

        return data?.[0];
    },

    // Delete a report template
    deleteReportTemplate: async (id: string) => {
        const supabase = getSupabaseClient();
        const { error } = await supabase
            .from('report_templates')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting report template:', error);
            throw error;
        }

        return true;
    },

    // Save a generated report
    saveReport: async (report: Omit<Report, 'id'>) => {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from('reports')
            .insert([report])
            .select();

        if (error) {
            console.error('Error saving report:', error);
            throw error;
        }

        return data?.[0];
    },

    // Get a specific report by ID
    getReport: async (id: string) => {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from('reports')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching report:', error);
            throw error;
        }

        return data;
    },

    // Get all reports (with optional filtering by user)
    getReports: async (userEmail?: string) => {
        const supabase = getSupabaseClient();
        let query = supabase
            .from('reports')
            .select('*');

        if (userEmail) {
            query = query.eq('created_by', userEmail);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching reports:', error);
            throw error;
        }

        return data || [];
    },

    // Create a scheduled report
    createScheduledReport: async (scheduledReport: Omit<ScheduledReport, 'id'>) => {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from('scheduled_reports')
            .insert([scheduledReport])
            .select();

        if (error) {
            console.error('Error creating scheduled report:', error);
            throw error;
        }

        return data?.[0];
    },

    // Get all scheduled reports
    getScheduledReports: async () => {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from('scheduled_reports')
            .select('*');

        if (error) {
            console.error('Error fetching scheduled reports:', error);
            throw error;
        }

        return data || [];
    },

    // Update a scheduled report
    updateScheduledReport: async (id: string, updates: Partial<ScheduledReport>) => {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from('scheduled_reports')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) {
            console.error('Error updating scheduled report:', error);
            throw error;
        }

        return data?.[0];
    },

    // Delete a scheduled report
    deleteScheduledReport: async (id: string) => {
        const supabase = getSupabaseClient();
        const { error } = await supabase
            .from('scheduled_reports')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting scheduled report:', error);
            throw error;
        }

        return true;
    }
};

export default reportsService;
