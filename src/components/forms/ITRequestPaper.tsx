import React from 'react';
import { FormSubmission } from '@/types/forms';

interface ITRequestPaperProps {
  submission: FormSubmission;
}

export const ITRequestPaper: React.FC<ITRequestPaperProps> = ({ submission }) => {
  const { data } = submission;

  return (
    <div className="p-8 bg-white text-black font-sans text-sm">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">IT Equipment & Access Request Form</h1>
      </div>

      <div className="border border-black p-4 mb-4">
        <h2 className="text-lg font-bold mb-2">Request Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-bold">Priority Level:</p>
            <p>{data.priority}</p>
          </div>
          <div>
            <p className="font-bold">Request/Access Type:</p>
            <p>{data.requestAccessType}</p>
          </div>
          {data.requestAccessType === 'other' && (
            <div className="col-span-2">
              <p className="font-bold">Other Specification:</p>
              <p>{data.otherRequestType}</p>
            </div>
          )}
        </div>
      </div>

      {data.requestAccessType === 'equipment' && (
        <div className="border border-black p-4 mb-4">
          <h2 className="text-lg font-bold mb-2">Equipment Request</h2>
          <div className="grid grid-cols-2 gap-4">
            {data.equipment?.map((item: string) => (
              <div key={item} className="flex items-center">
                <input type="checkbox" checked readOnly className="mr-2" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          {data.equipment?.includes('other') && (
            <div className="mt-4">
              <p className="font-bold">Other Specification:</p>
              <p>{data.otherEquipment}</p>
            </div>
          )}
        </div>
      )}

      {data.requestAccessType === 'access' && (
        <div className="border border-black p-4 mb-4">
          <h2 className="text-lg font-bold mb-2">Access Request</h2>
          <div className="grid grid-cols-2 gap-4">
            {data.access?.map((item: string) => (
              <div key={item} className="flex items-center">
                <input type="checkbox" checked readOnly className="mr-2" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          {data.access?.includes('other') && (
            <div className="mt-4">
              <p className="font-bold">Other Specification:</p>
              <p>{data.otherAccess}</p>
            </div>
          )}
        </div>
      )}

      <div className="border border-black p-4 mb-4">
        <h2 className="text-lg font-bold mb-2">Request Details / Access Details</h2>
        <p>{data.details}</p>
      </div>

      <div className="border border-black p-4 mb-4">
        <h2 className="text-lg font-bold mb-2">Duration of Use</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-bold">Intended Start Date:</p>
            <p>{data.startDate}</p>
          </div>
          <div>
            <p className="font-bold">Intended Return Date:</p>
            <p>{data.returnDate}</p>
          </div>
          <div className="col-span-2">
            <p className="font-bold">Other Duration:</p>
            <p>{data.duration}</p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="mb-8">Signature: _________________________</p>
            <p>Date: _________________________</p>
          </div>
          <div>
            <p className="font-bold text-center">For Office Use Only</p>
          </div>
        </div>
      </div>
    </div>
  );
};
