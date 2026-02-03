import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import AppsSection from '@/components/dashboard/AppsSection';

const Apps: React.FC = () => {
  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Applications
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Access Microsoft 365 apps and other organizational applications
          </p>
        </div>

        <AppsSection />
      </div>
    </PageLayout>
  );
};

export default Apps;
