# IT Request Form SharePoint Submission with User Data Integration

## 1. Overview

This document outlines the implementation for integrating user data from Microsoft Graph API into the IT Equipment & Access Request Form submission process. The goal is to automatically include the requester's `Name`, `Email`, `Job Title`, and `Department` with the form data when it's submitted to the SharePoint list, without adding these fields to the visible form itself.

## 2. SharePoint List Details

-   **Site Path:** `/sites/scpngintranet`
-   **List Name:** `IT_Request_Access_List`
-   **Column Mapping:**
    -   `Title`: To be used for a generated request title.
    -   `Name`: The user's full display name.
    -   `Email`: The user's email address.
    -   `Job_x0020_Title`: The user's job title.
    -   `Department`: The user's department.
    -   Other form fields will be mapped to their corresponding columns.

**Note:** All data submitted to the SharePoint list must be in text (string) format.

## 3. Implementation Steps

The implementation will be done in the `src/components/forms/ITRequestPage.tsx` file.

### 3.1. Import Necessary Hooks

First, import the required hooks to get user data and handle the SharePoint submission.

```typescript
import React, { useState, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { FormRenderer } from '@/components/forms/FormRenderer';
import { ITRequestPaper } from '@/components/forms/ITRequestPaper';
import { itRequestTemplate } from '@/config/formTemplates';
import { FormSubmission } from '@/types/forms';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import useMicrosoftContacts from '@/hooks/useMicrosoftContacts';
import { useSharePointUpload } from '@/hooks/useSharePointUpload';
import { toast } from 'sonner';
```

### 3.2. Fetch User and Contact Information

Inside the `ITRequestPage` component, use the hooks to get the user's profile and contact details.

```typescript
const ITRequestPage: React.FC = () => {
  const [isPaperView, setIsPaperView] = useState(false);
  const { user, profile } = useSupabaseAuth();
  const { contacts, isLoading: contactsLoading } = useMicrosoftContacts();
  const { addSharePointListItem, isLoading: isSubmitting } = useSharePointUpload();

  const form = useForm({
    defaultValues: {},
  });

  // Find the current user's contact information
  const currentUserContact = contacts.find(
    (contact) => contact.mail?.toLowerCase() === user?.email?.toLowerCase()
  );
```

### 3.3. Implement the Form Submission Logic

The `handleFormSubmit` function will be updated to include the user's data in the submission payload.

```typescript
  const handleFormSubmit = async (data: Record<string, any>) => {
    if (!currentUserContact) {
      toast.error('Could not find your contact information. Please try again.');
      return;
    }

    // 1. Prepare the user data
    const userData = {
      Title: `IT Request from ${currentUserContact.displayName}`,
      Name: currentUserContact.displayName || '',
      Email: currentUserContact.mail || '',
      Job_x0020_Title: currentUserContact.jobTitle || '',
      Department: currentUserContact.department || '',
    };

    // 2. Combine user data with form data and convert to strings
    const submissionData = { ...userData };
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        submissionData[key] = String(data[key]);
      }
    }

    // 3. Submit to SharePoint
    try {
      const result = await addSharePointListItem(
        '/sites/scpngintranet',
        'IT_Request_Access_List',
        submissionData
      );

      if (result) {
        toast.success('IT Request submitted successfully!');
        form.reset();
      } else {
        toast.error('Failed to submit IT Request. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting to SharePoint:', error);
      toast.error('An error occurred while submitting the form.');
    }
  };
```

### 3.4. Update the Component Return Statement

Update the `FormRenderer` to use the new `handleFormSubmit` function and disable the submit button while submitting.

```typescript
  return (
    <FormProvider {...form}>
      <div className="mb-4">
        {/* ... view toggle buttons ... */}
      </div>

      {isPaperView ? (
        <ITRequestPaper submission={mockSubmission} />
      ) : (
        <FormRenderer
          template={itRequestTemplate}
          mode="fill"
          onSubmit={handleFormSubmit}
          onSave={handleFormSave}
          onCancel={() => window.history.back()}
          isSubmitting={isSubmitting} // Pass the loading state
        />
      )}
    </FormProvider>
  );
};
```

## 4. Complete Code for `ITRequestPage.tsx`

Here is the complete code for the updated `src/components/forms/ITRequestPage.tsx` file.

```typescript
import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { FormRenderer } from '@/components/forms/FormRenderer';
import { ITRequestPaper } from '@/components/forms/ITRequestPaper';
import { itRequestTemplate } from '@/config/formTemplates';
import { FormSubmission } from '@/types/forms';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import useMicrosoftContacts from '@/hooks/useMicrosoftContacts';
import { useSharePointUpload } from '@/hooks/useSharePointUpload';
import { toast } from 'sonner';

const ITRequestPage: React.FC = () => {
  const [isPaperView, setIsPaperView] = useState(false);
  const { user } = useSupabaseAuth();
  const { contacts } = useMicrosoftContacts();
  const { addSharePointListItem, isLoading: isSubmitting } = useSharePointUpload();

  const form = useForm({
    defaultValues: {},
  });

  const currentUserContact = contacts.find(
    (contact) => contact.mail?.toLowerCase() === user?.email?.toLowerCase()
  );

  const handleFormSubmit = async (data: Record<string, any>) => {
    if (!currentUserContact) {
      toast.error('Could not find your contact information. Please try again.');
      return;
    }

    const userData = {
      Title: `IT Request from ${currentUserContact.displayName}`,
      Name: currentUserContact.displayName || '',
      Email: currentUserContact.mail || '',
      Job_x0020_Title: currentUserContact.jobTitle || '',
      Department: currentUserContact.department || '',
    };

    const submissionData = { ...userData };
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        submissionData[key] = String(data[key]);
      }
    }

    try {
      const result = await addSharePointListItem(
        '/sites/scpngintranet',
        'IT_Request_Access_List',
        submissionData
      );

      if (result) {
        toast.success('IT Request submitted successfully!');
        form.reset();
      } else {
        toast.error('Failed to submit IT Request. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting to SharePoint:', error);
      toast.error('An error occurred while submitting the form.');
    }
  };

  const handleFormSave = async (data: Record<string, any>) => {
    console.log('Form saved as draft:', data);
  };

  const mockSubmission: FormSubmission = {
    id: 'sub123',
    formTemplateId: itRequestTemplate.id,
    status: 'submitted',
    data: form.getValues(),
    submittedBy: 'user1',
    submittedAt: new Date().toISOString(),
    history: [],
  };

  return (
    <FormProvider {...form}>
      <div className="mb-4">
        <Button onClick={() => setIsPaperView(false)} variant={!isPaperView ? 'default' : 'outline'}>
          Digital Form
        </Button>
        <Button onClick={() => setIsPaperView(true)} variant={isPaperView ? 'default' : 'outline'} className="ml-2">
          Paper Form
        </Button>
      </div>

      {isPaperView ? (
        <ITRequestPaper submission={mockSubmission} />
      ) : (
        <FormRenderer
          template={itRequestTemplate}
          mode="fill"
          onSubmit={handleFormSubmit}
          onSave={handleFormSave}
          onCancel={() => window.history.back()}
          isSubmitting={isSubmitting}
        />
      )}
    </FormProvider>
  );
};

export default ITRequestPage;
