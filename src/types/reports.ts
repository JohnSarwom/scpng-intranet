// Report template interface
export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'system' | 'custom';
  content_schema: ReportContentSchema;
  created_by?: string;
  created_at: string;
  updated_at?: string;
}

// Report content schema definition
export interface ReportContentSchema {
  sections: ReportSection[];
  layout: 'standard' | 'compact' | 'detailed';
  include_kpis?: boolean;
  include_projects?: boolean;
  include_tasks?: boolean;
  include_risks?: boolean;
  include_logo?: boolean;
}

// Report section definition
export interface ReportSection {
  id: string;
  title: string;
  type: 'kpi' | 'project' | 'task' | 'risk' | 'custom';
  data_source?: string;
  visualization?: 'table' | 'chart' | 'metrics';
  chart_type?: 'bar' | 'line' | 'pie' | 'radar';
  filters?: Record<string, any>;
}

// Generated report interface
export interface Report {
  id: string;
  name: string;
  template_id: string;
  content: ReportContent;
  created_by: string;
  created_at: string;
  date_range?: {
    start_date: string;
    end_date: string;
  };
  ai_analysis?: boolean;
  ai_insights?: AIInsights;
}

// Report content interface
export interface ReportContent {
  sections: ReportSectionContent[];
  metadata: {
    generated_at: string;
    version: string;
  };
}

// Report section content interface
export interface ReportSectionContent {
  id: string;
  title: string;
  type: 'kpi' | 'project' | 'task' | 'risk' | 'custom';
  data: any[];
  summary?: string;
  visualization?: {
    type: 'table' | 'chart' | 'metrics';
    chart_type?: 'bar' | 'line' | 'pie' | 'radar';
    config?: Record<string, any>;
  };
}

// AI insights interface
export interface AIInsights {
  trends?: string[];
  risks?: string[];
  recommendations?: string[];
  predictions?: string[];
}

// Scheduled report interface
export interface ScheduledReport {
  id: string;
  name: string;
  template_id: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
  next_run: string;
  recipients: string[];
  created_by: string;
  created_at: string;
  updated_at?: string;
  is_active: boolean;
  parameters?: Record<string, any>;
  include_ai_analysis: boolean;
}

// AI Chat Message interface
export interface AIChatMessage {
  id: string;
  content: string;
  role: 'system' | 'user' | 'assistant';
  timestamp: string;
  conversation_id: string;
  report_context?: {
    report_id?: string;
    section_ids?: string[];
  };
}

// AI Chat context interface
export interface AIChatContext {
  conversation_id: string;
  report_id?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
} 