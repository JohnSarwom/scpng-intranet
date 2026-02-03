// Form field types and interfaces
export type FormFieldType = 
  | 'text' 
  | 'textarea' 
  | 'email' 
  | 'phone' 
  | 'number' 
  | 'date' 
  | 'select' 
  | 'multiselect' 
  | 'checkbox' 
  | 'radio' 
  | 'file' 
  | 'signature' 
  | 'currency'
  | 'url'
  | 'time'
  | 'datetime'
  | 'datetime-local'
  | 'checkbox-group'
  | 'radio-group'
  | 'hidden';

export interface FormFieldOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface FormValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'min' | 'max' | 'email' | 'custom';
  value?: any;
  message: string;
}

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: FormFieldType;
  description?: string;
  placeholder?: string;
  defaultValue?: any;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  hidden?: boolean;
  
  // Field-specific properties
  options?: FormFieldOption[]; // For select, multiselect, radio
  accept?: string; // For file uploads
  multiple?: boolean; // For file uploads and multiselect
  rows?: number; // For textarea
  min?: number | string; // For number, date, time
  max?: number | string; // For number, date, time
  step?: number; // For number
  pattern?: string; // For text validation
  
  // Validation rules
  validation?: FormValidationRule[];
  
  // Conditional logic
  showWhen?: {
    field: string;
    operator: 'equals' | 'notEquals' | 'contains' | 'isEmpty' | 'isNotEmpty';
    value: any;
  };
  
  // Layout and styling
  width?: 'full' | 'half' | 'third' | 'quarter';
  className?: string;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  collapsible?: boolean;
  collapsed?: boolean;
  fields: FormField[];
}

export interface FormTemplate {
  id: string;
  title: string;
  description: string;
  version: string;
  divisionId: string;
  departmentId?: string;
  category: string;
  estimatedTime: string;
  status: 'active' | 'draft' | 'archived';
  lastUpdated: string;
  requiredApprovals?: string[];
  
  // Form structure
  sections: FormSection[];
  
  // Workflow configuration
  workflowEnabled: boolean;
  approvalSteps?: ApprovalStep[];
  notifications?: NotificationConfig[];
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
  tags?: string[];
  
  // Permissions
  permissions: {
    view: string[]; // Role names or user emails
    fill: string[]; // Who can fill out the form
    approve: string[]; // Who can approve submissions
    admin: string[]; // Who can edit the form template
  };
  
  // Integration settings
  microsoftWorkflowId?: string;
  automationTriggers?: AutomationTrigger[];
}

export interface ApprovalStep {
  id: string;
  order: number;
  title: string;
  approverRole?: string;
  approverEmail?: string;
  required: boolean;
  allowDelegation: boolean;
  timeoutDays?: number;
  escalationRole?: string;
}

export interface NotificationConfig {
  trigger: 'submission' | 'approval' | 'rejection' | 'reminder';
  recipients: string[]; // Email addresses or role names
  template: string;
  delay?: number; // Minutes after trigger
}

export interface AutomationTrigger {
  event: 'submission' | 'approval' | 'rejection';
  action: 'email' | 'webhook' | 'workflow' | 'integration';
  config: Record<string, any>;
}

export interface FormSubmission {
  id: string;
  formTemplateId: string;
  submittedBy: string;
  submittedAt: string;
  data: Record<string, any>; // Form field values
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'withdrawn';
  
  // Workflow tracking
  currentStep?: string;
  approvals?: FormApproval[];
  rejections?: FormRejection[];
  
  // Attachments
  attachments?: FormAttachment[];
  
  // Audit trail
  history: FormSubmissionHistory[];
  
  // Integration data
  externalReferenceId?: string;
  microsoftWorkflowInstanceId?: string;
}

export interface FormApproval {
  id: string;
  stepId: string;
  approvedBy: string;
  approvedAt: string;
  comments?: string;
  signature?: string; // Base64 encoded signature
}

export interface FormRejection {
  id: string;
  stepId: string;
  rejectedBy: string;
  rejectedAt: string;
  reason: string;
  comments?: string;
}

export interface FormAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface FormSubmissionHistory {
  id: string;
  action: 'created' | 'updated' | 'submitted' | 'approved' | 'rejected' | 'withdrawn';
  performedBy: string;
  performedAt: string;
  details?: string;
  previousData?: Record<string, any>;
  newData?: Record<string, any>;
}

// Form builder interfaces
export interface FormBuilderState {
  template: Partial<FormTemplate>;
  selectedSection?: string;
  selectedField?: string;
  previewMode: boolean;
  isDirty: boolean;
}

export interface FormBuilderAction {
  type: 'ADD_SECTION' | 'UPDATE_SECTION' | 'DELETE_SECTION' | 
        'ADD_FIELD' | 'UPDATE_FIELD' | 'DELETE_FIELD' | 'MOVE_FIELD' |
        'UPDATE_TEMPLATE' | 'SET_PREVIEW_MODE' | 'SELECT_SECTION' | 'SELECT_FIELD';
  payload?: any;
}

// Form renderer interfaces
export interface FormRendererProps {
  template: FormTemplate;
  initialData?: Record<string, any>;
  mode: 'fill' | 'review' | 'readonly';
  onSubmit?: (data: Record<string, any>) => void;
  onSave?: (data: Record<string, any>) => void;
  onCancel?: () => void;
  className?: string;
}

export interface FormContextValue {
  formData: Record<string, any>;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isDirty: boolean;
  updateField: (name: string, value: any) => void;
  validateField: (name: string) => string | null;
  validateForm: () => boolean;
  resetForm: () => void;
  submitForm: () => void;
}

// Default form templates for common use cases
export interface DefaultFormTemplates {
  leave_application: FormTemplate;
  asset_request: FormTemplate;
  it_support: FormTemplate;
  training_request: FormTemplate;
  vendor_registration: FormTemplate;
  expense_claim: FormTemplate;
}

export type FormPermissionLevel = 'view' | 'fill' | 'approve' | 'admin';

export interface FormPermission {
  userId?: string;
  role?: string;
  division?: string;
  level: FormPermissionLevel;
}
