export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            ai_chat_contexts: {
                Row: {
                    conversation_id: string
                    created_at: string | null
                    report_id: string | null
                    updated_at: string | null
                    user_id: string
                }
                Insert: {
                    conversation_id?: string
                    created_at?: string | null
                    report_id?: string | null
                    updated_at?: string | null
                    user_id: string
                }
                Update: {
                    conversation_id?: string
                    created_at?: string | null
                    report_id?: string | null
                    updated_at?: string | null
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "ai_chat_contexts_report_id_fkey"
                        columns: ["report_id"]
                        isOneToOne: false
                        referencedRelation: "reports"
                        referencedColumns: ["id"]
                    },
                ]
            }
            ai_chat_messages: {
                Row: {
                    content: string
                    conversation_id: string
                    id: string
                    report_context: Json | null
                    role: string
                    timestamp: string | null
                }
                Insert: {
                    content: string
                    conversation_id: string
                    id?: string
                    report_context?: Json | null
                    role: string
                    timestamp?: string | null
                }
                Update: {
                    content?: string
                    conversation_id?: string
                    id?: string
                    report_context?: Json | null
                    role?: string
                    timestamp?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "ai_chat_messages_conversation_id_fkey"
                        columns: ["conversation_id"]
                        isOneToOne: false
                        referencedRelation: "ai_chat_contexts"
                        referencedColumns: ["conversation_id"]
                    },
                ]
            }
            app_config: {
                Row: {
                    created_at: string | null
                    id: string
                    key: string
                    updated_at: string | null
                    value: Json
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    key: string
                    updated_at?: string | null
                    value: Json
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    key?: string
                    updated_at?: string | null
                    value?: Json
                }
                Relationships: []
            }
            assets: {
                Row: {
                    admin_comments: string | null
                    asset_id: string | null
                    assigned_date: string | null
                    assigned_to: string
                    assigned_to_email: string | null
                    barcode_url: string | null
                    condition: string | null
                    created_at: string
                    depreciated_value: number | null
                    description: string | null
                    division: string | null
                    expiry_date: string | null
                    id: number
                    image_url: string | null
                    invoice_url: string | null
                    last_updated: string | null
                    last_updated_by: string | null
                    life_expectancy_years: number | null
                    name: string
                    notes: string | null
                    purchase_cost: number | null
                    purchase_date: string | null
                    serial_number: string | null
                    type: string | null
                    unit: string | null
                    vendor: string | null
                    warranty_expiry_date: string | null
                    ytd_usage: string | null
                }
                Insert: {
                    admin_comments?: string | null
                    asset_id?: string | null
                    assigned_date?: string | null
                    assigned_to: string
                    assigned_to_email?: string | null
                    barcode_url?: string | null
                    condition?: string | null
                    created_at?: string
                    depreciated_value?: number | null
                    description?: string | null
                    division?: string | null
                    expiry_date?: string | null
                    id?: number
                    image_url?: string | null
                    invoice_url?: string | null
                    last_updated?: string | null
                    last_updated_by?: string | null
                    life_expectancy_years?: number | null
                    name: string
                    notes?: string | null
                    purchase_cost?: number | null
                    purchase_date?: string | null
                    serial_number?: string | null
                    type?: string | null
                    unit?: string | null
                    vendor?: string | null
                    warranty_expiry_date?: string | null
                    ytd_usage?: string | null
                }
                Update: {
                    admin_comments?: string | null
                    asset_id?: string | null
                    assigned_date?: string | null
                    assigned_to?: string
                    assigned_to_email?: string | null
                    barcode_url?: string | null
                    condition?: string | null
                    created_at?: string
                    depreciated_value?: number | null
                    description?: string | null
                    division?: string | null
                    expiry_date?: string | null
                    id?: number
                    image_url?: string | null
                    invoice_url?: string | null
                    last_updated?: string | null
                    last_updated_by?: string | null
                    life_expectancy_years?: number | null
                    name?: string
                    notes?: string | null
                    purchase_cost?: number | null
                    purchase_date?: string | null
                    serial_number?: string | null
                    type?: string | null
                    unit?: string | null
                    vendor?: string | null
                    warranty_expiry_date?: string | null
                    ytd_usage?: string | null
                }
                Relationships: []
            }
            business_unit_links: {
                Row: {
                    created_at: string | null
                    id: string
                    page_id: string
                    source: string
                    title: string
                    unit_id: string
                    updated_at: string | null
                    url: string
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    page_id: string
                    source: string
                    title: string
                    unit_id: string
                    updated_at?: string | null
                    url: string
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    page_id?: string
                    source?: string
                    title?: string
                    unit_id?: string
                    updated_at?: string | null
                    url?: string
                }
                Relationships: []
            }
            division_memberships: {
                Row: {
                    created_at: string | null
                    division_id: string | null
                    id: number
                    role: string
                    user_id: string
                }
                Insert: {
                    created_at?: string | null
                    division_id?: string | null
                    id?: number
                    role: string
                    user_id: string
                }
                Update: {
                    created_at?: string | null
                    division_id?: string | null
                    id?: number
                    role?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "division_memberships_division_id_fkey"
                        columns: ["division_id"]
                        isOneToOne: false
                        referencedRelation: "divisions"
                        referencedColumns: ["id"]
                    },
                ]
            }
            divisions: {
                Row: {
                    code: string | null
                    created_at: string | null
                    description: string | null
                    id: string
                    manager: string | null
                    name: string
                    updated_at: string | null
                }
                Insert: {
                    code?: string | null
                    created_at?: string | null
                    description?: string | null
                    id: string
                    manager?: string | null
                    name: string
                    updated_at?: string | null
                }
                Update: {
                    code?: string | null
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    manager?: string | null
                    name?: string
                    updated_at?: string | null
                }
                Relationships: []
            }
            documents: {
                Row: {
                    created_at: string | null
                    id: string
                    modified: string | null
                    name: string
                    owner: string
                    shared: boolean | null
                    size: string
                    type: string
                    unit_id: string | null
                    url: string | null
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    modified?: string | null
                    name: string
                    owner: string
                    shared?: boolean | null
                    size: string
                    type: string
                    unit_id?: string | null
                    url?: string | null
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    modified?: string | null
                    name?: string
                    owner?: string
                    shared?: boolean | null
                    size?: string
                    type?: string
                    unit_id?: string | null
                    url?: string | null
                }
                Relationships: []
            }
            ms_auth_log: {
                Row: {
                    azure_oid: string | null
                    email: string | null
                    first_seen_at: string | null
                    id: number
                    last_seen_at: string | null
                    provider: string | null
                    raw_user_metadata: Json | null
                    supabase_user_id: string | null
                }
                Insert: {
                    azure_oid?: string | null
                    email?: string | null
                    first_seen_at?: string | null
                    id?: number
                    last_seen_at?: string | null
                    provider?: string | null
                    raw_user_metadata?: Json | null
                    supabase_user_id?: string | null
                }
                Update: {
                    azure_oid?: string | null
                    email?: string | null
                    first_seen_at?: string | null
                    id?: number
                    last_seen_at?: string | null
                    provider?: string | null
                    raw_user_metadata?: Json | null
                    supabase_user_id?: string | null
                }
                Relationships: []
            }
            notes: {
                Row: {
                    content: string | null
                    created_at: string
                    id: number
                    name: string
                    type: string | null
                    updated_at: string | null
                    user_email: string | null
                }
                Insert: {
                    content?: string | null
                    created_at?: string
                    id?: number
                    name?: string
                    type?: string | null
                    updated_at?: string | null
                    user_email?: string | null
                }
                Update: {
                    content?: string | null
                    created_at?: string
                    id?: number
                    name?: string
                    type?: string | null
                    updated_at?: string | null
                    user_email?: string | null
                }
                Relationships: []
            }
            organization_units: {
                Row: {
                    code: string | null
                    created_at: string
                    description: string | null
                    id: string
                    manager: string | null
                    name: string
                    updated_at: string
                }
                Insert: {
                    code?: string | null
                    created_at?: string
                    description?: string | null
                    id?: string
                    manager?: string | null
                    name: string
                    updated_at?: string
                }
                Update: {
                    code?: string | null
                    created_at?: string
                    description?: string | null
                    id?: string
                    manager?: string | null
                    name?: string
                    updated_at?: string
                }
                Relationships: []
            }
            report_templates: {
                Row: {
                    content_schema: Json
                    created_at: string | null
                    created_by: string | null
                    description: string | null
                    id: string
                    name: string
                    type: string
                    updated_at: string | null
                }
                Insert: {
                    content_schema: Json
                    created_at?: string | null
                    created_by?: string | null
                    description?: string | null
                    id?: string
                    name: string
                    type: string
                    updated_at?: string | null
                }
                Update: {
                    content_schema?: Json
                    created_at?: string | null
                    created_by?: string | null
                    description?: string | null
                    id?: string
                    name?: string
                    type?: string
                    updated_at?: string | null
                }
                Relationships: []
            }
            reports: {
                Row: {
                    ai_analysis: boolean | null
                    ai_insights: Json | null
                    content: Json
                    created_at: string | null
                    created_by: string
                    date_range: Json | null
                    id: string
                    name: string
                    template_id: string | null
                }
                Insert: {
                    ai_analysis?: boolean | null
                    ai_insights?: Json | null
                    content: Json
                    created_at?: string | null
                    created_by: string
                    date_range?: Json | null
                    id?: string
                    name: string
                    template_id?: string | null
                }
                Update: {
                    ai_analysis?: boolean | null
                    ai_insights?: Json | null
                    content?: Json
                    created_at?: string | null
                    created_by?: string
                    date_range?: Json | null
                    id?: string
                    name?: string
                    template_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "reports_template_id_fkey"
                        columns: ["template_id"]
                        isOneToOne: false
                        referencedRelation: "report_templates"
                        referencedColumns: ["id"]
                    },
                ]
            }
            scheduled_reports: {
                Row: {
                    created_at: string | null
                    created_by: string
                    frequency: string
                    id: string
                    include_ai_analysis: boolean | null
                    is_active: boolean | null
                    name: string
                    next_run: string
                    parameters: Json | null
                    recipients: Json
                    template_id: string
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    created_by: string
                    frequency: string
                    id?: string
                    include_ai_analysis?: boolean | null
                    is_active?: boolean | null
                    name: string
                    next_run: string
                    parameters?: Json | null
                    recipients: Json
                    template_id: string
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    created_by?: string
                    frequency?: string
                    id?: string
                    include_ai_analysis?: boolean | null
                    is_active?: boolean | null
                    name?: string
                    next_run?: string
                    parameters?: Json | null
                    recipients?: Json
                    template_id?: string
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "scheduled_reports_template_id_fkey"
                        columns: ["template_id"]
                        isOneToOne: false
                        referencedRelation: "report_templates"
                        referencedColumns: ["id"]
                    },
                ]
            }
            staff_members: {
                Row: {
                    business_phone: string | null
                    created_at: string | null
                    division_id: string | null
                    email: string
                    id: number
                    job_title: string | null
                    mobile: string | null
                    name: string
                    office_location: string | null
                    unit: string | null
                    updated_at: string | null
                }
                Insert: {
                    business_phone?: string | null
                    created_at?: string | null
                    division_id?: string | null
                    email: string
                    id?: number
                    job_title?: string | null
                    mobile?: string | null
                    name: string
                    office_location?: string | null
                    unit?: string | null
                    updated_at?: string | null
                }
                Update: {
                    business_phone?: string | null
                    created_at?: string | null
                    division_id?: string | null
                    email?: string
                    id?: number
                    job_title?: string | null
                    mobile?: string | null
                    name?: string
                    office_location?: string | null
                    unit?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "staff_members_division_id_fkey"
                        columns: ["division_id"]
                        isOneToOne: false
                        referencedRelation: "divisions"
                        referencedColumns: ["id"]
                    },
                ]
            }
            ticket_messages: {
                Row: {
                    attachments: Json | null
                    content: string
                    created_at: string | null
                    created_by: number | null
                    id: string
                    ticket_id: string
                    type: string
                }
                Insert: {
                    attachments?: Json | null
                    content: string
                    created_at?: string | null
                    created_by?: number | null
                    id?: string
                    ticket_id: string
                    type: string
                }
                Update: {
                    attachments?: Json | null
                    content?: string
                    created_at?: string | null
                    created_by?: number | null
                    id?: string
                    ticket_id?: string
                    type?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "ticket_messages_created_by_fkey"
                        columns: ["created_by"]
                        isOneToOne: false
                        referencedRelation: "staff_members"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "ticket_messages_ticket_id_fkey"
                        columns: ["ticket_id"]
                        isOneToOne: false
                        referencedRelation: "tickets"
                        referencedColumns: ["id"]
                    },
                ]
            }
            tickets: {
                Row: {
                    assignee_id: number | null
                    code: string
                    created_at: string | null
                    department: string | null
                    description: string | null
                    due_date: string | null
                    id: string
                    priority: string
                    requester_id: number | null
                    status: string
                    title: string
                    type: string | null
                    updated_at: string | null
                }
                Insert: {
                    assignee_id?: number | null
                    code: string
                    created_at?: string | null
                    department?: string | null
                    description?: string | null
                    due_date?: string | null
                    id?: string
                    priority: string
                    requester_id?: number | null
                    status: string
                    title: string
                    type?: string | null
                    updated_at?: string | null
                }
                Update: {
                    assignee_id?: number | null
                    code?: string
                    created_at?: string | null
                    department?: string | null
                    description?: string | null
                    due_date?: string | null
                    id?: string
                    priority?: string
                    requester_id?: number | null
                    status?: string
                    title?: string
                    type?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "tickets_assignee_id_fkey"
                        columns: ["assignee_id"]
                        isOneToOne: false
                        referencedRelation: "staff_members"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "tickets_requester_id_fkey"
                        columns: ["requester_id"]
                        isOneToOne: false
                        referencedRelation: "staff_members"
                        referencedColumns: ["id"]
                    },
                ]
            }
            unit_kpis: {
                Row: {
                    actual: string | null
                    assigned_to_email: string | null
                    assignees: Json | null
                    checklist: Json | null
                    comments: string | null
                    cost_associated: number | null
                    created_at: string | null
                    date: string | null
                    description: string | null
                    division_id: string | null
                    id: string
                    kra_id: string | null
                    name: string
                    start_date: string | null
                    status: string | null
                    target: string | null
                    target_date: string | null
                    unit: string | null
                    unit_id: string | null
                    updated_at: string | null
                }
                Insert: {
                    actual?: string | null
                    assigned_to_email?: string | null
                    assignees?: Json | null
                    checklist?: Json | null
                    comments?: string | null
                    cost_associated?: number | null
                    created_at?: string | null
                    date?: string | null
                    description?: string | null
                    division_id?: string | null
                    id?: string
                    kra_id?: string | null
                    name: string
                    start_date?: string | null
                    status?: string | null
                    target?: string | null
                    target_date?: string | null
                    unit?: string | null
                    unit_id?: string | null
                    updated_at?: string | null
                }
                Update: {
                    actual?: string | null
                    assigned_to_email?: string | null
                    assignees?: Json | null
                    checklist?: Json | null
                    comments?: string | null
                    cost_associated?: number | null
                    created_at?: string | null
                    date?: string | null
                    description?: string | null
                    division_id?: string | null
                    id?: string
                    kra_id?: string | null
                    name?: string
                    start_date?: string | null
                    status?: string | null
                    target?: string | null
                    target_date?: string | null
                    unit?: string | null
                    unit_id?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "unit_kpis_division_id_fkey"
                        columns: ["division_id"]
                        isOneToOne: false
                        referencedRelation: "divisions"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "unit_kpis_kra_id_fkey"
                        columns: ["kra_id"]
                        isOneToOne: false
                        referencedRelation: "unit_kras"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "unit_kpis_unit_id_fkey"
                        columns: ["unit_id"]
                        isOneToOne: false
                        referencedRelation: "organization_units"
                        referencedColumns: ["id"]
                    },
                ]
            }
            unit_kras: {
                Row: {
                    assigned_to_email: string | null
                    created_at: string | null
                    description: string | null
                    division_id: string | null
                    id: string
                    objective_id: string | null
                    title: string
                    unit: string | null
                    unit_id: string | null
                    unit_name: string | null
                    updated_at: string | null
                }
                Insert: {
                    assigned_to_email?: string | null
                    created_at?: string | null
                    description?: string | null
                    division_id?: string | null
                    id?: string
                    objective_id?: string | null
                    title: string
                    unit?: string | null
                    unit_id?: string | null
                    unit_name?: string | null
                    updated_at?: string | null
                }
                Update: {
                    assigned_to_email?: string | null
                    created_at?: string | null
                    description?: string | null
                    division_id?: string | null
                    id?: string
                    objective_id?: string | null
                    title?: string
                    unit?: string | null
                    unit_id?: string | null
                    unit_name?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "unit_kras_division_id_fkey"
                        columns: ["division_id"]
                        isOneToOne: false
                        referencedRelation: "divisions"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "unit_kras_objective_id_fkey"
                        columns: ["objective_id"]
                        isOneToOne: false
                        referencedRelation: "unit_objectives"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "unit_kras_unit_id_fkey"
                        columns: ["unit_id"]
                        isOneToOne: false
                        referencedRelation: "organization_units"
                        referencedColumns: ["id"]
                    },
                ]
            }
            unit_objectives: {
                Row: {
                    assigned_to_email: string | null
                    created_at: string
                    description: string | null
                    id: string
                    status: string | null
                    title: string
                    unit: string | null
                    unit_name: string | null
                }
                Insert: {
                    assigned_to_email?: string | null
                    created_at?: string
                    description?: string | null
                    id?: string
                    status?: string | null
                    title: string
                    unit?: string | null
                    unit_name?: string | null
                }
                Update: {
                    assigned_to_email?: string | null
                    created_at?: string
                    description?: string | null
                    id?: string
                    status?: string | null
                    title?: string
                    unit?: string | null
                    unit_name?: string | null
                }
                Relationships: []
            }
            unit_projects: {
                Row: {
                    assigned_to_email: string | null
                    budget: number | null
                    budget_spent: number | null
                    checklist: Json | null
                    created_at: string | null
                    description: string | null
                    division_id: string | null
                    end_date: string | null
                    id: string
                    manager: string | null
                    name: string
                    progress: number | null
                    start_date: string | null
                    status: string
                    unit: string | null
                    unit_id: string | null
                    updated_at: string | null
                }
                Insert: {
                    assigned_to_email?: string | null
                    budget?: number | null
                    budget_spent?: number | null
                    checklist?: Json | null
                    created_at?: string | null
                    description?: string | null
                    division_id?: string | null
                    end_date?: string | null
                    id?: string
                    manager?: string | null
                    name: string
                    progress?: number | null
                    start_date?: string | null
                    status: string
                    unit?: string | null
                    unit_id?: string | null
                    updated_at?: string | null
                }
                Update: {
                    assigned_to_email?: string | null
                    budget?: number | null
                    budget_spent?: number | null
                    checklist?: Json | null
                    created_at?: string | null
                    description?: string | null
                    division_id?: string | null
                    end_date?: string | null
                    id?: string
                    manager?: string | null
                    name?: string
                    progress?: number | null
                    start_date?: string | null
                    status?: string
                    unit?: string | null
                    unit_id?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "unit_projects_division_id_fkey"
                        columns: ["division_id"]
                        isOneToOne: false
                        referencedRelation: "divisions"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "unit_projects_unit_id_fkey"
                        columns: ["unit_id"]
                        isOneToOne: false
                        referencedRelation: "organization_units"
                        referencedColumns: ["id"]
                    },
                ]
            }
            unit_risks: {
                Row: {
                    assigned_to_email: string | null
                    category: string | null
                    checklist: Json | null
                    created_at: string | null
                    description: string | null
                    division_id: string | null
                    id: string
                    identification_date: string | null
                    impact: string | null
                    likelihood: string | null
                    mitigation_plan: string | null
                    owner: string | null
                    project_id: string | null
                    project_name: string | null
                    status: string | null
                    title: string
                    unit: string | null
                    unit_id: string | null
                    updated_at: string | null
                }
                Insert: {
                    assigned_to_email?: string | null
                    category?: string | null
                    checklist?: Json | null
                    created_at?: string | null
                    description?: string | null
                    division_id?: string | null
                    id?: string
                    identification_date?: string | null
                    impact?: string | null
                    likelihood?: string | null
                    mitigation_plan?: string | null
                    owner?: string | null
                    project_id?: string | null
                    project_name?: string | null
                    status?: string | null
                    title: string
                    unit?: string | null
                    unit_id?: string | null
                    updated_at?: string | null
                }
                Update: {
                    assigned_to_email?: string | null
                    category?: string | null
                    checklist?: Json | null
                    created_at?: string | null
                    description?: string | null
                    division_id?: string | null
                    id?: string
                    identification_date?: string | null
                    impact?: string | null
                    likelihood?: string | null
                    mitigation_plan?: string | null
                    owner?: string | null
                    project_id?: string | null
                    project_name?: string | null
                    status?: string | null
                    title?: string
                    unit?: string | null
                    unit_id?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "fk_risk_project"
                        columns: ["project_id"]
                        isOneToOne: false
                        referencedRelation: "unit_projects"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "unit_risks_division_id_fkey"
                        columns: ["division_id"]
                        isOneToOne: false
                        referencedRelation: "divisions"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "unit_risks_unit_id_fkey"
                        columns: ["unit_id"]
                        isOneToOne: false
                        referencedRelation: "organization_units"
                        referencedColumns: ["id"]
                    },
                ]
            }
            unit_tasks: {
                Row: {
                    assigned_to: string | null
                    assigned_to_email: string | null
                    assignee: string | null
                    checklist: Json | null
                    completion_percentage: number | null
                    created_at: string | null
                    description: string | null
                    division_id: string | null
                    division_id_backup: string | null
                    due_date: string | null
                    id: string
                    priority: string | null
                    project_id: string | null
                    project_name: string | null
                    start_date: string | null
                    status: string
                    title: string
                    unit: string | null
                    unit_id: string | null
                    updated_at: string | null
                }
                Insert: {
                    assigned_to?: string | null
                    assigned_to_email?: string | null
                    assignee?: string | null
                    checklist?: Json | null
                    completion_percentage?: number | null
                    created_at?: string | null
                    description?: string | null
                    division_id?: string | null
                    division_id_backup?: string | null
                    due_date?: string | null
                    id?: string
                    priority?: string | null
                    project_id?: string | null
                    project_name?: string | null
                    start_date?: string | null
                    status: string
                    title: string
                    unit?: string | null
                    unit_id?: string | null
                    updated_at?: string | null
                }
                Update: {
                    assigned_to?: string | null
                    assigned_to_email?: string | null
                    assignee?: string | null
                    checklist?: Json | null
                    completion_percentage?: number | null
                    created_at?: string | null
                    description?: string | null
                    division_id?: string | null
                    division_id_backup?: string | null
                    due_date?: string | null
                    id?: string
                    priority?: string | null
                    project_id?: string | null
                    project_name?: string | null
                    start_date?: string | null
                    status?: string
                    title?: string
                    unit?: string | null
                    unit_id?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "fk_task_project"
                        columns: ["project_id"]
                        isOneToOne: false
                        referencedRelation: "unit_projects"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "unit_tasks_division_id_fkey"
                        columns: ["division_id"]
                        isOneToOne: false
                        referencedRelation: "divisions"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "unit_tasks_unit_id_fkey"
                        columns: ["unit_id"]
                        isOneToOne: false
                        referencedRelation: "organization_units"
                        referencedColumns: ["id"]
                    },
                ]
            }
            user_login_log: {
                Row: {
                    id: number
                    login_timestamp: string | null
                    user_email: string | null
                    user_id: string | null
                }
                Insert: {
                    id?: number
                    login_timestamp?: string | null
                    user_email?: string | null
                    user_id?: string | null
                }
                Update: {
                    id?: number
                    login_timestamp?: string | null
                    user_email?: string | null
                    user_id?: string | null
                }
                Relationships: []
            }
            user_profiles: {
                Row: {
                    created_at: string
                    department: string | null
                    email: string | null
                    first_name: string | null
                    id: string
                    is_admin: boolean | null
                    last_name: string | null
                    position: string | null
                    updated_at: string
                }
                Insert: {
                    created_at?: string
                    department?: string | null
                    email?: string | null
                    first_name?: string | null
                    id: string
                    is_admin?: boolean | null
                    last_name?: string | null
                    position?: string | null
                    updated_at?: string
                }
                Update: {
                    created_at?: string
                    department?: string | null
                    email?: string | null
                    first_name?: string | null
                    id?: string
                    is_admin?: boolean | null
                    last_name?: string | null
                    position?: string | null
                    updated_at?: string
                }
                Relationships: []
            }
            user_status: {
                Row: {
                    last_seen: string
                    status: Database["public"]["Enums"]["user_activity_status"] | null
                    user_id: string
                }
                Insert: {
                    last_seen?: string
                    status?: Database["public"]["Enums"]["user_activity_status"] | null
                    user_id: string
                }
                Update: {
                    last_seen?: string
                    status?: Database["public"]["Enums"]["user_activity_status"] | null
                    user_id?: string
                }
                Relationships: []
            }
            user_unit_memberships: {
                Row: {
                    created_at: string
                    id: string
                    role: string
                    unit_id: string
                    user_id: string
                }
                Insert: {
                    created_at?: string
                    id?: string
                    role: string
                    unit_id: string
                    user_id: string
                }
                Update: {
                    created_at?: string
                    id?: string
                    role?: string
                    unit_id?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "user_unit_memberships_unit_id_fkey"
                        columns: ["unit_id"]
                        isOneToOne: false
                        referencedRelation: "organization_units"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            calculate_depreciated_value: {
                Args: { purchase_date: string; cost: number; life_years: number }
                Returns: number
            }
            debug_jwt: {
                Args: Record<PropertyKey, never>
                Returns: string
            }
            get_my_full_name_lowercase: {
                Args: Record<PropertyKey, never>
                Returns: string
            }
            get_user_division_ids: {
                Args: { p_user_email: string }
                Returns: {
                    division_id: string
                }[]
            }
            get_user_divisions: {
                Args: { user_email: string }
                Returns: {
                    id: string
                    name: string
                    description: string
                    color: string
                    role: string
                }[]
            }
            get_user_id_by_email: {
                Args: { p_user_email: string }
                Returns: string
            }
            is_admin: {
                Args: Record<PropertyKey, never>
                Returns: boolean
            }
        }
        Enums: {
            user_activity_status: "online" | "offline"
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
    DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
    EnumName extends DefaultSchemaEnumNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
    ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
    public: {
        Enums: {
            user_activity_status: ["online", "offline"],
        },
    },
} as const
