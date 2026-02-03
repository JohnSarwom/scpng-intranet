import React from 'react';
import { useFormContext } from 'react-hook-form';

const LeaveApplicationPaper: React.FC = () => {
  const { register } = useFormContext();

  return (
    <div style={{ fontFamily: '\'Times New Roman\', Times, serif', width: '800px', margin: '20px auto', padding: '20px', fontSize: '14px', lineHeight: '1.2', border: '1px solid #ccc' }}>
      <style>
        {`
          .leave-table { width: 100%; border-collapse: collapse; }
          .leave-table td, .leave-table th { border: 1px solid #000; padding: 4px; vertical-align: top; }
          .section-title { font-weight: bold; margin-top: 15px; margin-bottom: 8px; font-size: 14px; }
          .no-border { border: none; }
          .header-text { text-align: center; margin: 0; padding: 0; }
          .form-input { width: 100%; border: none; background: #f8f8f8; padding: 2px; }
        `}
      </style>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '15px' }}>
        <img src="/images/SCPNG Original Logo.png" alt="SCPNG Logo" style={{ width: '145px', height: 'auto' }} />
        <p className="header-text" style={{ fontSize: '12px', margin: '3px 0' }}>www.scpng.gov.pg</p>
        <h2 className="header-text" style={{ fontSize: '18px', fontWeight: 'bold', margin: '8px 0' }}>LEAVE APPLICATION FORM</h2>
      </div>

      <div className="section-title">A) TO BE FILLED BY APPLICANT</div>
      <table className="leave-table">
        <tbody>
          <tr>
            <td style={{ width: '50%', padding: '6px', height: '35px', border: 'none' }}></td>
            <td style={{ width: '50%', padding: '6px', height: '35px' }}>
              PAYROLL #: <input type="text" {...register('payrollNumber')} className="form-input" />
            </td>
          </tr>
          <tr>
            <td style={{ padding: '6px', height: '35px' }}>
              NAME: <input type="text" {...register('name')} className="form-input" />
            </td>
            <td style={{ padding: '6px', height: '35px' }}>
              DIVISION: <input type="text" {...register('division')} className="form-input" />
            </td>
          </tr>
          <tr>
            <td colSpan={2} style={{ padding: '6px', height: '35px' }}>
              PERIOD OF ABSENCE (DATE & TIME) - FROM: <input type="datetime-local" {...register('absenceFrom')} style={{ marginLeft: '10px' }} />
              <span style={{ display: 'inline-block', marginLeft: '20px' }}>TO:</span> <input type="datetime-local" {...register('absenceTo')} style={{ marginLeft: '10px' }} />
            </td>
          </tr>
          <tr>
            <td colSpan={2} style={{ height: '50px', padding: '6px' }}>
              REASON: <textarea {...register('reason')} className="form-input" style={{ height: '40px' }} />
            </td>
          </tr>
          <tr>
            <td colSpan={2} style={{ padding: '0' }}>
              <table style={{ width: '100%', border: 'none' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '85%', border: 'none', padding: '8px', verticalAlign: 'top' }}>
                      {['SICK LEAVE', 'COMPASSIONATE LEAVE', 'ANNUAL LEAVE', 'CARERS LEAVE', 'LEAVE WITHOUT PAY', 'STUDY LEAVE', 'MATERNITY LEAVE', 'LEAVE FOR BREAST FEEDING', 'PATERNITY LEAVE', 'RECREATIONAL LEAVE'].map(leaveType => (
                        <div key={leaveType} style={{ marginBottom: '4px' }}>• {leaveType}</div>
                      ))}
                    </td>
                    <td style={{ width: '15%', border: 'none', borderLeft: '1px solid black', padding: '0' }}>
                      {['sickLeave', 'compassionateLeave', 'annualLeave', 'carersLeave', 'leaveWithoutPay', 'studyLeave', 'maternityLeave', 'breastFeedingLeave', 'paternityLeave', 'recreationalLeave'].map(leaveType => (
                        <div key={leaveType} style={{ height: '22px', borderBottom: '1px solid black', margin: '0', textAlign: 'center' }}>
                          <input type="checkbox" {...register('leaveType')} value={leaveType} />
                        </div>
                      ))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td style={{ padding: '6px' }}>
              SIGNATURE OFFICER: <input type="text" {...register('signatureOfficer')} className="form-input" />
            </td>
            <td style={{ padding: '6px' }}>
              DATE: <input type="date" {...register('officerDate')} className="form-input" />
            </td>
          </tr>
        </tbody>
      </table>

      <div className="section-title">B) FOR MANAGER</div>
      <table className="leave-table">
        <tbody>
          <tr>
            <td style={{ width: '50%', height: '45px', padding: '6px' }}>
              SIGNATURE FOR MANAGER: <input type="text" {...register('managerSignature')} className="form-input" />
            </td>
            <td style={{ width: '30%', padding: '6px' }}>
              DESIGNATION: <input type="text" {...register('managerDesignation')} className="form-input" />
            </td>
            <td style={{ width: '20%', padding: '6px' }}>
              DATE: <input type="date" {...register('managerDate')} className="form-input" />
            </td>
          </tr>
        </tbody>
      </table>

      <div className="section-title">C) FOR DIVISIONAL DIRECTOR</div>
      <table className="leave-table">
        <tbody>
          <tr>
            <td style={{ width: '50%', height: '45px', padding: '6px' }}>
              SIGNATURE FOR DIRECTOR: <input type="text" {...register('directorSignature')} className="form-input" />
            </td>
            <td style={{ width: '30%', padding: '6px' }}>
              DESIGNATION: <input type="text" {...register('directorDesignation')} className="form-input" />
            </td>
            <td style={{ width: '20%', padding: '6px' }}>
              DATE: <input type="date" {...register('directorDate')} className="form-input" />
            </td>
          </tr>
        </tbody>
      </table>

      <div className="section-title">D) FOR HUMAN RESOURCE DIVISION</div>
      <div style={{ fontWeight: 'bold', textAlign: 'center', marginBottom: '8px', fontSize: '14px' }}>DETAILS FOR DEDUCTION</div>
      <table className="leave-table">
        <thead>
          <tr>
            <th style={{ textAlign: 'center', width: '70%', padding: '6px' }}>TYPES OF LEAVES</th>
            <th style={{ textAlign: 'center', width: '15%', padding: '6px' }}>DAYS</th>
            <th style={{ textAlign: 'center', width: '15%', padding: '6px' }}>HOURS</th>
          </tr>
        </thead>
        <tbody>
          {['SICK LEAVE', 'COMPASSIONATE LEAVE', 'CARERS LEAVE', 'ANNUAL LEAVE', 'LEAVE WITHOUT PAY', 'STUDY LEAVE', 'MATERNITY LEAVE', 'LEAVE FOR BREAST FEEDING', 'PATERNITY LEAVE', 'RECREATIONAL LEAVE'].map((leave, i) => (
            <tr key={i} style={{ height: '25px' }}>
              <td style={{ padding: '4px' }}>{leave}</td>
              <td><input type="number" {...register(`deduction.${i}.days`)} className="form-input" /></td>
              <td><input type="number" {...register(`deduction.${i}.hours`)} className="form-input" /></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="section-title" style={{ marginBottom: '8px' }}>REMARKS</div>
      <table className="leave-table">
        <tbody>
          <tr>
            <td style={{ width: '60%', height: '80px', verticalAlign: 'top', padding: '6px' }}>
              <textarea {...register('remarks')} className="form-input" style={{ height: '100%' }} />
            </td>
            <td style={{ width: '40%', verticalAlign: 'bottom', padding: '12px' }}>
              <div style={{ marginBottom: '12px', fontSize: '13px' }}>HR DELEGATE: <input type="text" {...register('hrDelegate')} style={{ width: '150px', borderBottom: '1px dotted black', marginLeft: '5px' }} /></div>
              <div style={{ marginBottom: '12px', fontSize: '13px' }}>SIGNATURE: <input type="text" {...register('hrSignature')} style={{ width: '165px', borderBottom: '1px dotted black', marginLeft: '5px' }} /></div>
              <div style={{ fontSize: '13px' }}>DATE: <input type="date" {...register('hrDate')} style={{ width: '195px', borderBottom: '1px dotted black', marginLeft: '5px' }} /></div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default LeaveApplicationPaper;
