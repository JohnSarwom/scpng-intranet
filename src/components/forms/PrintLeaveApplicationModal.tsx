import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, X, FileText } from 'lucide-react';
import PrintableLeaveForm from './PrintableLeaveForm';
import { LeaveRequest, LeaveBalance } from '@/types/hr';

interface PrintLeaveApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: LeaveRequest;
  leaveBalances?: LeaveBalance[];
  employeeName?: string;
  division?: string;
  unit?: string;
}

const PrintLeaveApplicationModal: React.FC<PrintLeaveApplicationModalProps> = ({
  isOpen,
  onClose,
  application,
  leaveBalances,
  employeeName,
  division,
  unit,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    // Create a new window for printing
    const printWindow = window.open('', '', 'width=800,height=900');
    if (!printWindow) return;

    // Write the content
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Leave Application - Request #${application.id}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Times New Roman', Times, serif;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();

    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Print Leave Application Form
          </DialogTitle>
          <DialogDescription>
            Preview and print your leave application in the official paper format.
            Request ID: #{application.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Action Buttons */}
          <div className="flex justify-end gap-2 sticky top-0 bg-white z-10 py-2 border-b no-print">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handlePrint} className="bg-maroon hover:bg-maroon/90">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>

          {/* Preview */}
          <div
            ref={printRef}
            className="border rounded-lg overflow-hidden shadow-sm bg-white"
            style={{
              minHeight: '297mm',
              width: '100%'
            }}
          >
            <PrintableLeaveForm
              application={application}
              leaveBalances={leaveBalances}
              employeeName={employeeName}
              division={division}
              unit={unit}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrintLeaveApplicationModal;
