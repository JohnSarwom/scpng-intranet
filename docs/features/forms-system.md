# Forms System Documentation

## Overview

The Forms system is a comprehensive solution for creating, managing, and processing organizational forms within the unitopia-hub intranet. It provides a flexible, division-based approach to form management with role-based access control and workflow integration capabilities.

## Architecture

### Core Components

#### 1. Type System (`src/types/forms.ts`)
- **FormFieldType**: Comprehensive enum of supported field types
- **FormField**: Individual field configuration with validation and conditional logic
- **FormSection**: Grouping of related fields with collapsible sections
- **FormTemplate**: Complete form definition with workflow and permissions
- **FormSubmission**: Submission data with approval workflow tracking

#### 2. Form Templates (`src/config/formTemplates.ts`)
- Pre-configured templates for common organizational forms
- Helper functions for creating standard field types
- Default approval workflows and notification configurations
- Division-specific form categorization

#### 3. Form Components
- **FormRenderer** (`src/components/forms/FormRenderer.tsx`): Core form rendering engine
- **FormField** (`src/components/forms/FormField.tsx`): Individual field component with type-specific rendering
- **FormModal** (`src/components/forms/FormModal.tsx`): Modal wrapper for form display

#### 4. Main Interface (`src/pages/Forms.tsx`)
- Division-based form filtering
- Category-organized form display
- Search and discovery functionality
- Integration with form rendering system

## Features

### 1. Supported Field Types

| Field Type | Description | Validation Options |
|------------|-------------|-------------------|
| `text` | Single-line text input | Required, min/max length, pattern |
| `textarea` | Multi-line text input | Required, min/max length |
| `email` | Email address input | Required, email format validation |
| `phone` | Phone number input | Required, phone format validation |
| `number` | Numeric input | Required, min/max value |
| `currency` | Currency input with PGK prefix | Required, min/max value |
| `date` | Date picker | Required, min/max date |
| `time` | Time input | Required |
| `datetime` | Date and time input | Required |
| `select` | Single selection dropdown | Required |
| `multiselect` | Multiple selection checkboxes | Required |
| `radio` | Radio button group | Required |
| `checkbox` | Single checkbox | Required |
| `file` | File upload with preview | Required, file type restrictions |
| `url` | URL input | Required, URL format validation |

### 2. Advanced Features

#### Conditional Logic
Forms support conditional field visibility based on other field values:

```typescript
{
  showWhen: {
    field: 'leave_type',
    operator: 'equals',
    value: 'sick'
  }
}
```

Supported operators:
- `equals` / `notEquals`: Exact value matching
- `contains`: Array or string contains value
- `isEmpty` / `isNotEmpty`: Value presence checking

#### Validation System
Multi-level validation with custom error messages:

```typescript
validation: [
  { type: 'required', message: 'This field is required' },
  { type: 'minLength', value: 10, message: 'Minimum 10 characters' },
  { type: 'pattern', value: '^[A-Z]', message: 'Must start with capital letter' }
]
```

#### Auto-save Functionality
- Forms automatically save as drafts every 3 seconds
- Manual save option available
- Progress tracking and completion percentage

### 3. Division-Based Access Control

Forms are organized by organizational divisions:

1. **Executive Division**: High-level policy and budget requests
2. **Corporate Services Division**: HR, IT, and procurement forms
3. **Legal Services Division**: Legal advice and contract reviews
4. **Licensing Market & Supervision Division**: Market-related forms
5. **Research & Publication Division**: Research and publication requests
6. **Secretariat Unit**: Administrative support forms

Access control is enforced at multiple levels:
- **View**: Who can see the form exists
- **Fill**: Who can fill out the form
- **Approve**: Who can approve submissions
- **Admin**: Who can edit the form template

### 4. Workflow Integration

Forms support multi-step approval workflows:

```typescript
approvalSteps: [
  {
    id: 'supervisor_approval',
    order: 1,
    title: 'Supervisor Approval',
    approverRole: 'supervisor',
    required: true,
    timeoutDays: 3
  }
]
```

Features:
- Sequential approval steps
- Role-based approver assignment
- Timeout and escalation handling
- Delegation support
- Email notifications

## Default Form Templates

### 1. Leave Application Form
- **Purpose**: Request time off (annual, sick, personal leave)
- **Sections**: Employee info, leave details, coverage arrangements, attachments
- **Approval**: Supervisor → Manager → HR
- **Division**: Corporate Services

### 2. Asset Request Form
- **Purpose**: Request purchase of assets or equipment
- **Sections**: Requestor info, asset details, business justification, vendor info
- **Approval**: Supervisor → Manager → Finance → Executive (for high-value)
- **Division**: Corporate Services

### 3. IT Support Request Form
- **Purpose**: Request IT support, software, or system access
- **Sections**: User info, request details, system info, attachments
- **Approval**: IT Team Review
- **Division**: Corporate Services

### 4. Training Request Form
- **Purpose**: Request approval for professional development
- **Sections**: Employee info, training details, justification, alternatives, attachments
- **Approval**: Supervisor → Manager → HR
- **Division**: Corporate Services

## Usage Guide

### For End Users

1. **Accessing Forms**: Navigate to Forms section in the main sidebar
2. **Finding Forms**: Use category tabs or search functionality
3. **Filling Forms**: Click "Fill Form" to open the form modal
4. **Auto-save**: Forms automatically save progress every 3 seconds
5. **Manual Save**: Use "Save Draft" to manually save progress
6. **Submission**: Complete all required fields and click "Submit Form"

### For Administrators

#### Creating New Form Templates

1. **Define Form Structure**: Create sections and fields in configuration
2. **Set Permissions**: Define who can view, fill, and approve
3. **Configure Workflow**: Set up approval steps and notifications
4. **Test Form**: Validate functionality before deployment

Example minimal form template:

```typescript
const newFormTemplate: FormTemplate = {
  id: 'example-form',
  title: 'Example Form',
  description: 'A simple example form',
  version: '1.0',
  divisionId: 'corporate-services-division',
  category: 'general',
  estimatedTime: '5 minutes',
  status: 'active',
  
  sections: [
    {
      id: 'basic_info',
      title: 'Basic Information',
      fields: [
        {
          id: 'name',
          name: 'name',
          label: 'Full Name',
          type: 'text',
          required: true,
          width: 'full'
        }
      ]
    }
  ],
  
  workflowEnabled: false,
  
  permissions: {
    view: ['all_employees'],
    fill: ['all_employees'],
    approve: [],
    admin: ['system_admin']
  },
  
  createdBy: 'admin',
  createdAt: new Date().toISOString()
};
```

#### Managing Form Categories

Categories are defined in `src/config/formTemplates.ts`:

```typescript
export const formCategories = [
  {
    id: 'hr',
    name: 'Human Resources',
    description: 'Employee-related forms and requests',
    icon: 'Users',
    color: '#10B981',
    templates: ['leave_application', 'training_request']
  }
];
```

## Future Enhancement Plans

### Phase 4: Form Builder Interface
- Visual drag-and-drop form builder
- Real-time preview functionality
- Template library management
- Version control and rollback

### Phase 5: Advanced Workflow Integration
- Microsoft Power Automate integration
- SharePoint list creation
- Automated email notifications
- Digital signatures

### Phase 6: Analytics and Reporting
- Form submission analytics
- Completion rate tracking
- Workflow performance metrics
- Custom reporting dashboards

### Phase 7: Mobile Optimization
- Responsive form rendering
- Offline form filling capability
- Mobile-specific field types
- Touch-optimized interactions

## Technical Implementation Details

### Form Rendering Engine

The FormRenderer component uses React Hook Form for:
- Form state management
- Real-time validation
- Performance optimization
- Integration with UI components

Key features:
- Multi-section navigation with progress tracking
- Conditional field rendering
- Auto-save with debouncing
- Error handling and recovery

### Field Type System

Each field type is implemented with:
- Type-specific validation rules
- Consistent styling and behavior
- Accessibility compliance
- Error state handling

### Data Flow

1. **Template Loading**: Forms load from configuration files
2. **User Interaction**: React Hook Form manages state
3. **Validation**: Real-time validation with custom rules
4. **Auto-save**: Periodic draft saving to prevent data loss
5. **Submission**: Final validation and workflow initiation

### Security Considerations

- Role-based access control at template level
- Field-level permissions for sensitive data
- Input sanitization and validation
- Secure file upload handling

## Database Schema

### Tables (Future Implementation)

```sql
-- Form templates
CREATE TABLE form_templates (
  id VARCHAR PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT,
  version VARCHAR,
  division_id VARCHAR,
  category VARCHAR,
  status VARCHAR,
  template_data JSONB,
  permissions JSONB,
  created_by VARCHAR,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Form submissions
CREATE TABLE form_submissions (
  id UUID PRIMARY KEY,
  template_id VARCHAR REFERENCES form_templates(id),
  submitted_by VARCHAR,
  submitted_at TIMESTAMP,
  status VARCHAR,
  form_data JSONB,
  current_step VARCHAR,
  workflow_data JSONB
);

-- Approval tracking
CREATE TABLE form_approvals (
  id UUID PRIMARY KEY,
  submission_id UUID REFERENCES form_submissions(id),
  step_id VARCHAR,
  approved_by VARCHAR,
  approved_at TIMESTAMP,
  comments TEXT,
  signature TEXT
);
```

## API Endpoints (Future Implementation)

```typescript
// Form template management
GET    /api/forms/templates
GET    /api/forms/templates/:id
POST   /api/forms/templates
PUT    /api/forms/templates/:id
DELETE /api/forms/templates/:id

// Form submissions
GET    /api/forms/submissions
POST   /api/forms/submissions
GET    /api/forms/submissions/:id
PUT    /api/forms/submissions/:id

// Workflow management
POST   /api/forms/submissions/:id/approve
POST   /api/forms/submissions/:id/reject
GET    /api/forms/submissions/:id/history
```

## Testing Strategy

### Unit Tests
- Field validation logic
- Form rendering components
- Utility functions

### Integration Tests
- Form submission workflow
- Multi-section navigation
- Auto-save functionality

### End-to-End Tests
- Complete form filling process
- Approval workflow simulation
- Error handling scenarios

## Deployment and Configuration

### Environment Variables
```env
REACT_APP_FORMS_AUTO_SAVE_INTERVAL=3000
REACT_APP_FORMS_MAX_FILE_SIZE=10485760
REACT_APP_FORMS_ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,png
```

### Feature Flags
- Enable/disable auto-save
- Enable/disable file uploads
- Enable/disable workflow integration

## Conclusion

The Forms system provides a robust, scalable foundation for organizational form management. The modular architecture allows for easy extension and customization while maintaining consistency across the application.

The system successfully integrates with the existing unitopia-hub architecture, following established patterns for navigation, UI components, and access control. Future phases will add advanced features like visual form building, workflow automation, and comprehensive analytics. 