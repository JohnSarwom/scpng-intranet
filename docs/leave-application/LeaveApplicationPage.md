import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormRenderer } from '@/components/forms/FormRenderer';
import LeaveApplicationPaper from '@/components/forms/LeaveApplicationPaper';
import { leaveApplicationTemplate } from '@/config/formTemplates'; // Assuming this is the correct path

const LeaveApplicationPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'digital' | 'paper'>('digital');
  const methods = useForm();

  const onSubmit = async (data: any) => {
    console.log('Form submitted', data);
    // Handle form submission logic
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <PageLayout>
      <FormProvider {...methods}>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Leave Application</h1>
          <div className="flex items-center gap-2">
            <Button onClick={() => methods.handleSubmit(onSubmit)()} variant="default">
              Submit
            </Button>
          </div>
        </div>
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'digital' | 'paper')} className="w-full">
          <TabsList>
            <TabsTrigger value="digital">Digital Form</TabsTrigger>
            <TabsTrigger value="paper">Paper Form</TabsTrigger>
          </TabsList>
          <TabsContent value="digital">
            <FormRenderer template={leaveApplicationTemplate} mode="fill" onSubmit={onSubmit} />
          </TabsContent>
          <TabsContent value="paper">
            <LeaveApplicationPaper />
          </TabsContent>
        </Tabs>
      </FormProvider>
    </PageLayout>
  );
};

export default LeaveApplicationPage;
