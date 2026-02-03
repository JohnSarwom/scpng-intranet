import React from 'react';
import InquiryCard from './InquiryCard';
import { InquiryData } from './GeneralInquiries'; // Assuming InquiryData is exported

// Props for the Grid View
interface InquiryGridViewProps {
  inquiries: InquiryData[];
  onEditInquiry: (id: string) => void;
  onDeleteInquiry: (id: string) => void;
  // Pass down the style/icon getters needed by InquiryCard
  getStatusBadgeClass: (status: 'Open' | 'In Progress' | 'Resolved') => string;
  getPriorityIcon: (priority: 'High' | 'Medium' | 'Low') => React.ReactNode;
  getCategoryBadgeStyle: (category: string) => React.CSSProperties;
}

const InquiryGridView: React.FC<InquiryGridViewProps> = ({
  inquiries,
  onEditInquiry,
  onDeleteInquiry,
  getStatusBadgeClass,
  getPriorityIcon,
  getCategoryBadgeStyle,
}) => {

  if (!Array.isArray(inquiries) || inquiries.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No inquiries found matching your criteria.</div>;
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {inquiries.map((inquiry) => (
          <InquiryCard
            key={inquiry.id}
            {...inquiry} // Spread all inquiry data
            onEdit={onEditInquiry}
            onDelete={onDeleteInquiry}
            // Pass the getter functions down
            getStatusBadgeClass={getStatusBadgeClass}
            getPriorityIcon={getPriorityIcon}
            getCategoryBadgeStyle={getCategoryBadgeStyle}
          />
        ))}
      </div>
    </div>
  );
};

export default InquiryGridView; 