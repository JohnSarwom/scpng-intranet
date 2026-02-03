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
        />
      )}
    </FormProvider>
  );
};

export default ITRequestPage;
