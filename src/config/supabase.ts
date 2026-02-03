// Supabase configuration
const supabaseConfig = {
    url: import.meta.env.VITE_SUPABASE_URL || "",
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",

    // Tables configuration
    tables: {
        notes: "notes",
        users: "users",
        // Division related tables
        divisions: "divisions",
        division_memberships: "division_memberships",
        staff_members: "staff_members",
        organization_units: "organization_units",
        // Unit tables
        unit_tasks: "unit_tasks",
        unit_projects: "unit_projects",
        unit_risks: "unit_risks",
        unit_assets: "unit_assets",
        unit_kras: "unit_kras",
        unit_kpis: "unit_kpis",
        // Report tables
        report_templates: "report_templates",
        reports: "reports",
        scheduled_reports: "scheduled_reports",
        // AI Chat tables
        ai_chat_messages: "ai_chat_messages",
        ai_chat_contexts: "ai_chat_contexts",
        // Licensing table
        licenses: "licenses"
    }
};

// Log configuration in development
if (process.env.NODE_ENV === 'development') {
    console.log('Supabase config loaded');
}

export default supabaseConfig;
