import React from 'react';
import { LeaveRequest, LeaveBalance } from '@/types/hr';
import { format } from 'date-fns';
import { getManagerDesignation, getDirectorDesignation } from '@/utils/departmentDesignations';

interface PrintableLeaveFormProps {
  application: LeaveRequest;
  leaveBalances?: LeaveBalance[];
  employeeName?: string;
  division?: string;
  unit?: string;
}

const PrintableLeaveForm: React.FC<PrintableLeaveFormProps> = ({
  application,
  leaveBalances,
  employeeName,
  division,
  unit,
}) => {
  // Normalize leave type from SharePoint to match our checkbox keys
  const normalizeLeaveType = (type: string): string => {
    if (!type) return '';

    // Create a normalized version (uppercase, trim)
    const normalized = type.toUpperCase().trim();

    // Map SharePoint values to our checkbox keys
    const leaveTypeMap: Record<string, string> = {
      'SICK LEAVE': 'Sick',
      'SICK': 'Sick',
      'COMPASSIONATE LEAVE': 'Compassionate',
      'COMPASSIONATE': 'Compassionate',
      'ANNUAL LEAVE': 'Annual',
      'ANNUAL': 'Annual',
      'CARERS LEAVE': 'Special',
      'SPECIAL': 'Special',
      'LEAVE WITHOUT PAY': 'Unpaid',
      'UNPAID': 'Unpaid',
      'STUDY LEAVE': 'Study',
      'STUDY': 'Study',
      'MATERNITY LEAVE': 'Maternity',
      'MATERNITY': 'Maternity',
      'LEAVE FOR BREAST FEEDING': 'Breast Feeding',
      'BREAST FEEDING': 'Breast Feeding',
      'PATERNITY LEAVE': 'Paternity',
      'PATERNITY': 'Paternity',
      'RECREATIONAL LEAVE': 'Recreational',
      'RECREATIONAL': 'Recreational',
    };

    return leaveTypeMap[normalized] || type;
  };

  const getLeaveBalance = (leaveType: string): LeaveBalance | undefined => {
    return leaveBalances?.find(b => b.leaveType === leaveType);
  };

  // Normalize the leave type from SharePoint for checkbox matching
  const normalizedLeaveType = normalizeLeaveType(application.leaveType);
  const balance = getLeaveBalance(application.leaveType);

  // Determine if manager/director/HR have approved based on stage
  const isManagerApproved = application.currentStep && application.currentStep >= 3; // Stage 3 or higher means manager approved
  const isDirectorApproved = application.currentStep && application.currentStep >= 4; // Stage 4 or higher means director approved
  const isHRApproved = application.currentStep && application.currentStep >= 5; // Stage 5 or higher means HR approved

  // Get designations based on division (department)
  const managerDesignation = getManagerDesignation(division);
  const directorDesignation = getDirectorDesignation(division);

  return (
    <div className="printable-leave-form" style={{
      fontFamily: "'Times New Roman', Times, serif",
      width: '210mm',
      minHeight: '297mm',
      margin: '0 auto',
      padding: '10mm 15mm',
      fontSize: '10pt',
      lineHeight: '1.2',
      backgroundColor: 'white',
      color: 'black'
    }}>
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }

          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          .printable-leave-form {
            width: 100%;
            margin: 0;
            padding: 0 !important;
            page-break-after: avoid;
            font-size: 9pt !important;
          }

          .no-print {
            display: none !important;
          }

          .leave-table {
            page-break-inside: avoid;
            margin-bottom: 8px !important;
          }

          .section-title {
            margin-top: 8px !important;
            margin-bottom: 4px !important;
            font-size: 10pt !important;
          }

          .header-section {
            margin-bottom: 8px !important;
          }

          .footer-section {
            font-size: 7pt !important;
            margin-top: 10px !important;
          }
        }

        .leave-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 8px;
        }

        .leave-table td, .leave-table th {
          border: 1px solid #000;
          padding: 4px 6px;
          vertical-align: top;
          font-size: 9pt;
        }

        .leave-table th {
          font-weight: bold;
          text-align: center;
          background-color: #f5f5f5;
          padding: 3px 6px;
        }

        .section-title {
          font-weight: bold;
          margin-top: 10px;
          margin-bottom: 4px;
          font-size: 10pt;
          text-decoration: underline;
        }

        .header-text {
          text-align: center;
          margin: 5px 0;
        }

        .checkbox-row {
          display: flex;
          align-items: center;
          padding: 2px 0;
          border-bottom: 1px solid #ddd;
        }

        .checkbox-row:last-child {
          border-bottom: none;
        }

        .checkbox-checked {
          display: inline-block;
          width: 12px;
          height: 12px;
          border: 1.5px solid #000;
          background-color: #000;
          position: relative;
        }

        .checkbox-checked::after {
          content: '✓';
          color: white;
          position: absolute;
          top: -4px;
          left: 1px;
          font-size: 11px;
          font-weight: bold;
        }

        .checkbox-unchecked {
          display: inline-block;
          width: 12px;
          height: 12px;
          border: 1.5px solid #000;
          background-color: white;
        }

        .signature-line {
          border-bottom: 1px dotted #000;
          display: inline-block;
          min-width: 150px;
          padding: 0 5px;
        }
      `}</style>

      {/* Header with Logo */}
      <div className="header-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px' }}>
        <img src="/images/SCPNG Original Logo.png" alt="SCPNG Logo" style={{ width: '100px', height: 'auto' }} />
        <p className="header-text" style={{ fontSize: '9pt', margin: '2px 0' }}>www.scpng.gov.pg</p>
        <h2 className="header-text" style={{ fontSize: '13pt', fontWeight: 'bold', margin: '4px 0' }}>
          LEAVE APPLICATION FORM
        </h2>
      </div>

      {/* Section A: Applicant Information */}
      <div className="section-title">A) TO BE FILLED BY APPLICANT</div>
      <table className="leave-table">
        <tbody>
          <tr>
            <td style={{ width: '50%' }}></td>
            <td style={{ width: '50%' }}>
              <strong>PAYROLL #:</strong> {application.employeeId || 'N/A'}
            </td>
          </tr>
          <tr>
            <td>
              <strong>NAME:</strong> {employeeName || application.employeeName || 'N/A'}
            </td>
            <td>
              <strong>DIVISION:</strong> {division || 'N/A'}
            </td>
          </tr>
          <tr>
            <td colSpan={2}>
              <strong>UNIT:</strong> {unit || 'N/A'}
            </td>
          </tr>
          <tr>
            <td colSpan={2}>
              <strong>PERIOD OF ABSENCE (DATE & TIME) - FROM:</strong>{' '}
              {format(new Date(application.startDate), 'dd/MM/yyyy')}
              <span style={{ marginLeft: '30px' }}><strong>TO:</strong></span>{' '}
              {format(new Date(application.endDate), 'dd/MM/yyyy')}
            </td>
          </tr>
          <tr>
            <td colSpan={2} style={{ minHeight: '60px' }}>
              <strong>REASON:</strong>
              <div style={{ marginTop: '5px' }}>{application.reason || 'N/A'}</div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Leave Type Selection */}
      <table className="leave-table">
        <tbody>
          <tr>
            <td style={{ width: '85%', padding: '4px 8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {[
                  { key: 'Sick', label: 'SICK LEAVE' },
                  { key: 'Compassionate', label: 'COMPASSIONATE LEAVE' },
                  { key: 'Annual', label: 'ANNUAL LEAVE' },
                  { key: 'Special', label: 'CARERS LEAVE' },
                  { key: 'Unpaid', label: 'LEAVE WITHOUT PAY' },
                  { key: 'Study', label: 'STUDY LEAVE' },
                  { key: 'Maternity', label: 'MATERNITY LEAVE' },
                  { key: 'Breast Feeding', label: 'LEAVE FOR BREAST FEEDING' },
                  { key: 'Paternity', label: 'PATERNITY LEAVE' },
                  { key: 'Recreational', label: 'RECREATIONAL LEAVE' }
                ].map(({ key, label }) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '8pt' }}>
                    <span>• {label}</span>
                  </div>
                ))}
              </div>
            </td>
            <td style={{ width: '15%', padding: '0', textAlign: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {[
                  { key: 'Sick', label: 'SICK LEAVE' },
                  { key: 'Compassionate', label: 'COMPASSIONATE LEAVE' },
                  { key: 'Annual', label: 'ANNUAL LEAVE' },
                  { key: 'Special', label: 'CARERS LEAVE' },
                  { key: 'Unpaid', label: 'LEAVE WITHOUT PAY' },
                  { key: 'Study', label: 'STUDY LEAVE' },
                  { key: 'Maternity', label: 'MATERNITY LEAVE' },
                  { key: 'Breast Feeding', label: 'LEAVE FOR BREAST FEEDING' },
                  { key: 'Paternity', label: 'PATERNITY LEAVE' },
                  { key: 'Recreational', label: 'RECREATIONAL LEAVE' }
                ].map(({ key }) => (
                  <div key={key} style={{
                    height: '19px',
                    borderBottom: '1px solid #ddd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {normalizedLeaveType === key ? (
                      <div className="checkbox-checked"></div>
                    ) : (
                      <div className="checkbox-unchecked"></div>
                    )}
                  </div>
                ))}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <table className="leave-table">
        <tbody>
          <tr>
            <td style={{ width: '50%' }}>
              <strong>SIGNATURE OFFICER:</strong> <span className="signature-line">{application.employeeName || ''}</span>
            </td>
            <td style={{ width: '50%' }}>
              <strong>DATE:</strong> {application.createdDate ? format(new Date(application.createdDate), 'dd/MM/yyyy') : ''}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Section B: Manager Approval */}
      <div className="section-title">B) FOR MANAGER</div>
      <table className="leave-table">
        <tbody>
          <tr>
            <td style={{ width: '50%', padding: '2px 6px' }}>
              <div><strong>SIGNATURE FOR MANAGER:</strong></div>
              <div style={{ marginTop: '2px' }}>
                {isManagerApproved && application.approverManager ? application.approverManager : ''}
              </div>
            </td>
            <td style={{ width: '30%', padding: '2px 6px' }}>
              <div><strong>DESIGNATION:</strong></div>
              <div style={{ marginTop: '2px' }}>
                {isManagerApproved ? managerDesignation : ''}
              </div>
            </td>
            <td style={{ width: '20%', padding: '2px 6px' }}>
              <div><strong>DATE:</strong></div>
              <div style={{ marginTop: '2px' }}>
                {isManagerApproved && application.managerApprovedDate
                  ? format(new Date(application.managerApprovedDate), 'dd/MM/yyyy')
                  : ''}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Section C: Director Approval */}
      <div className="section-title">C) FOR DIVISIONAL DIRECTOR</div>
      <table className="leave-table">
        <tbody>
          <tr>
            <td style={{ width: '50%', padding: '2px 6px' }}>
              <div><strong>SIGNATURE FOR DIRECTOR:</strong></div>
              <div style={{ marginTop: '2px' }}>
                {isDirectorApproved && application.approverDirector ? application.approverDirector : ''}
              </div>
            </td>
            <td style={{ width: '30%', padding: '2px 6px' }}>
              <div><strong>DESIGNATION:</strong></div>
              <div style={{ marginTop: '2px' }}>
                {isDirectorApproved ? directorDesignation : ''}
              </div>
            </td>
            <td style={{ width: '20%', padding: '2px 6px' }}>
              <div><strong>DATE:</strong></div>
              <div style={{ marginTop: '2px' }}>
                {isDirectorApproved && application.directorApprovedDate
                  ? format(new Date(application.directorApprovedDate), 'dd/MM/yyyy')
                  : ''}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Section D: HR Division */}
      <div className="section-title">D) FOR HUMAN RESOURCE DIVISION</div>
      <div style={{ fontWeight: 'bold', textAlign: 'center', marginBottom: '4px', fontSize: '10pt' }}>
        DETAILS FOR DEDUCTION
      </div>
      <table className="leave-table">
        <thead>
          <tr>
            <th style={{ width: '70%' }}>TYPES OF LEAVES</th>
            <th style={{ width: '15%' }}>DAYS</th>
            <th style={{ width: '15%' }}>HOURS</th>
          </tr>
        </thead>
        <tbody>
          {[
            'SICK LEAVE',
            'COMPASSIONATE LEAVE',
            'CARERS LEAVE',
            'ANNUAL LEAVE',
            'LEAVE WITHOUT PAY',
            'STUDY LEAVE',
            'MATERNITY LEAVE',
            'LEAVE FOR BREAST FEEDING',
            'PATERNITY LEAVE',
            'RECREATIONAL LEAVE'
          ].map((leave) => {
            // Normalize both the SharePoint value and the label for comparison
            const normalizedLabel = normalizeLeaveType(leave);
            const isCurrentType = normalizedLeaveType === normalizedLabel;
            return (
              <tr key={leave}>
                <td>{leave}</td>
                <td style={{ textAlign: 'center', fontWeight: isCurrentType ? 'bold' : 'normal' }}>
                  {isCurrentType ? application.daysRequested : ''}
                </td>
                <td style={{ textAlign: 'center' }}></td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Remarks Section */}
      <div className="section-title">REMARKS</div>
      <table className="leave-table">
        <tbody>
          <tr>
            <td style={{ width: '60%', minHeight: '60px', verticalAlign: 'top', padding: '4px 6px', fontSize: '8pt' }}>
              {balance && (
                <div>
                  <strong>Leave Balance:</strong>
                  <div style={{ marginTop: '2px', lineHeight: '1.3' }}>
                    Entitlement: {balance.entitlement} | Used: {balance.used} | Available: {balance.available} | Pending: {balance.pending}
                  </div>
                </div>
              )}
              {application.comments && (
                <div style={{ marginTop: '4px' }}>
                  <strong>Comments:</strong> {application.comments}
                </div>
              )}
            </td>
            <td style={{ width: '40%', verticalAlign: 'bottom', padding: '6px', fontSize: '8pt' }}>
              <div style={{ marginBottom: '6px' }}>
                <strong>HR DELEGATE:</strong> <span className="signature-line" style={{ minWidth: '120px' }}>
                  {isHRApproved && application.approverHR ? application.approverHR : ''}
                </span>
              </div>
              <div style={{ marginBottom: '6px' }}>
                <strong>SIGNATURE:</strong> <span className="signature-line" style={{ minWidth: '130px' }}>
                  {isHRApproved && application.approverHR ? application.approverHR : ''}
                </span>
              </div>
              <div>
                <strong>DATE:</strong> <span className="signature-line" style={{ minWidth: '150px' }}>
                  {isHRApproved && application.hrApprovedDate
                    ? format(new Date(application.hrApprovedDate), 'dd/MM/yyyy')
                    : ''}
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Status Badge */}
      <div style={{ marginTop: '8px', textAlign: 'center', padding: '4px 6px', border: '1.5px solid #000', fontSize: '8pt' }}>
        <strong>STATUS:</strong>{' '}
        <span style={{
          fontWeight: 'bold',
          color: application.status === 'Approved' ? '#006400' :
                 application.status === 'Rejected' || application.status === 'Declined' ? '#8B0000' : '#DAA520'
        }}>
          {application.status}
        </span>
        {' | '}
        <strong>STAGE:</strong> {application.stage || 'N/A'}
        {' | '}
        <strong>ID:</strong> #{application.id}
      </div>

      {/* Footer */}
      <div className="footer-section" style={{ marginTop: '8px', fontSize: '7pt', color: '#666', textAlign: 'center', borderTop: '1px solid #ddd', paddingTop: '4px' }}>
        <p style={{ margin: '2px 0' }}>System-generated document from Unitopia Hub | Printed: {format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
      </div>
    </div>
  );
};

export default PrintableLeaveForm;
