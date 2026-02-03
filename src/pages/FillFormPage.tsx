import React from 'react';
import { useParams } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { FormRenderer } from '@/components/forms/FormRenderer';
import { defaultFormTemplates, leaveApplicationTemplate, assetRequestTemplate, itSupportTemplate, trainingRequestTemplate, itRequestTemplate } from '@/config/formTemplates';
import LeaveApplicationPage from '@/components/forms/LeaveApplicationPage';
import ITRequestPage from '@/components/forms/ITRequestPage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const formTemplates = [
  ...Object.values(defaultFormTemplates),
  leaveApplicationTemplate,
  assetRequestTemplate,
  itSupportTemplate,
  trainingRequestTemplate,
  itRequestTemplate,
];

const FillFormPage: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const template = formTemplates.find(t => t.id === formId);

  if (!template) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Form not found</h2>
          <p className="text-muted-foreground">The form you are looking for does not exist.</p>
        </div>
      </PageLayout>
    );
  }

  const handleFormSubmit = async (data: Record<string, any>) => {
    console.log('Form submitted:', data);
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  const handleFormSave = async (data: Record<string, any>) => {
    console.log('Form saved as draft:', data);
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <PageLayout>
      <Card>
        <CardHeader>
          <CardTitle>{template.title}</CardTitle>
          <CardDescription>{template.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {template.id === 'leave-application' ? (
            <LeaveApplicationPage />
          ) : template.id === 'it-equipment-access-request' ? (
            <ITRequestPage />
          ) : (
            <FormRenderer
              template={template}
              mode="fill"
              onSubmit={handleFormSubmit}
              onSave={handleFormSave}
              onCancel={() => window.history.back()}
            />
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default FillFormPage;
