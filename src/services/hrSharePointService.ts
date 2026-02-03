/**
 * HR SharePoint Service
 * Handles all SharePoint operations for HR Profiles module
 */

import { Client } from '@microsoft/microsoft-graph-client';
import {
  Employee,
  EmployeeProfile,
  LeaveBalance,
  LeaveRequest,
  EmployeeDocument,
  Training,
  PerformanceReview,
  HRCase,
  EmploymentHistory,
  AuditLogEntry,
  HRStatistics,
  DocumentUploadData,
  LeaveRequestSubmission,
  EmployeeFormData,
} from '@/types/hr';

const SITE_PATH = '/sites/scpngintranet';
const SITE_DOMAIN = 'scpng1.sharepoint.com';

// SharePoint List Names
const LISTS = {
  EMPLOYEES: 'HR_Employees',
  LEAVE_BALANCES: 'HR_LeaveBalances',
  LEAVE_REQUESTS: 'Staff Leave Requests',
  DOCUMENTS: 'HR_Documents',
  TRAINING: 'HR_Training',
  PERFORMANCE_REVIEWS: 'HR_PerformanceReviews',
  HR_CASES: 'HR_Cases',
  EMPLOYMENT_HISTORY: 'HR_EmploymentHistory',
  AUDIT_LOG: 'HR_AuditLog',
};

const LIBRARY_NAME = 'HR_Documents';

export class HRSharePointService {
  private client: Client;
  private siteId: string | null = null;
  private listIds: Map<string, string> = new Map();

  constructor(client: Client) {
    this.client = client;
  }

  /**
   * Initialize service by getting site and list IDs
   */
  async initialize(): Promise<void> {
    try {
      // Get Site ID
      const site = await this.client
        .api(`/sites/${SITE_DOMAIN}:${SITE_PATH}`)
        .get();

      if (!site || !site.id) {
        throw new Error(`Site not found at ${SITE_DOMAIN}:${SITE_PATH}`);
      }

      this.siteId = site.id;
      console.log('✅ HR Service initialized with site ID:', this.siteId);

      // Get all list IDs
      await this.loadListIds();
    } catch (error) {
      console.error('❌ Error initializing HR SharePoint Service:', error);
      throw error;
    }
  }

  /**
   * Load all SharePoint list IDs
   */
  private async loadListIds(): Promise<void> {
    if (!this.siteId) throw new Error('Site ID not initialized');

    try {
      const lists = await this.client
        .api(`/sites/${this.siteId}/lists`)
        .get();

      for (const [key, listName] of Object.entries(LISTS)) {
        const list = lists.value.find((l: any) => l.displayName === listName);
        if (list) {
          this.listIds.set(listName, list.id);
          console.log(`✅ Loaded list ID for ${listName}:`, list.id);
        } else {
          console.warn(`⚠️ List not found: ${listName}`);
        }
      }
    } catch (error) {
      console.error('❌ Error loading list IDs:', error);
      throw error;
    }
  }

  /**
   * Get list ID by name
   */
  private getListId(listName: string): string {
    const listId = this.listIds.get(listName);
    if (!listId) {
      throw new Error(`List ID not found for: ${listName}`);
    }
    return listId;
  }

  /**
   * Helper: Fetch items from list and filter by EmployeeID client-side
   * This avoids SharePoint's indexed column requirement for filters
   */
  private async getItemsByEmployeeId(
    listName: string,
    employeeId: string,
    additionalFilter?: string
  ): Promise<any[]> {
    if (!this.siteId) await this.initialize();

    try {
      const listId = this.getListId(listName);
      let query = this.client
        .api(`/sites/${this.siteId}/lists/${listId}/items`)
        .expand('fields');

      const response = await query.get();

      // Client-side filtering for flexibility
      return response.value.filter((item: any) => {
        const matchesEmployee = item.fields.EmployeeID === employeeId;
        if (!additionalFilter) return matchesEmployee;

        if (additionalFilter.includes('IsActive eq true')) {
          return matchesEmployee && item.fields.IsActive === true;
        }

        return matchesEmployee;
      });
    } catch (error) {
      console.error(`❌ Error fetching items from ${listName}:`, error);
      throw error;
    }
  }

  /**
   * DEBUG: Inspect list columns to find internal names
   */
  async inspectListColumns(listName: string): Promise<void> {
    if (!this.siteId) await this.initialize();
    try {
      const listId = this.getListId(listName);
      const response = await this.client.api(`/sites/${this.siteId}/lists/${listId}/columns`).get();

      const columns = response.value.map((c: any) => ({
        displayName: c.displayName,
        name: c.name, // This is the internal name we need!
        id: c.id,
        type: c.text ? 'Text' : (c.number ? 'Number' : (c.choice ? 'Choice' : 'Other'))
      }));

      console.log(`📋 SCHEMA REPORT FOR '${listName}':`);
      console.table(columns);
      console.log('Detailed Columns:', JSON.stringify(columns, null, 2));
    } catch (error) {
      console.error('❌ Error inspecting columns:', error);
    }
  }

  /**
   * ==========================================
   * EMPLOYEE OPERATIONS
   * ==========================================
   */

  /**
   * Get all employees with optional filtering
   */
  async getEmployees(filter?: {
    status?: string;
    department?: string;
    employmentType?: string;
  }): Promise<Employee[]> {
    if (!this.siteId) await this.initialize();

    try {
      const listId = this.getListId(LISTS.EMPLOYEES);
      let query = this.client.api(`/sites/${this.siteId}/lists/${listId}/items`)
        .expand('fields')
        .top(5000);

      // Build filter query
      const filters: string[] = [];
      if (filter?.status) {
        filters.push(`fields/EmploymentStatus eq '${filter.status}'`);
      }
      if (filter?.department) {
        filters.push(`fields/Department eq '${filter.department}'`);
      }
      if (filter?.employmentType) {
        filters.push(`fields/EmploymentType eq '${filter.employmentType}'`);
      }

      if (filters.length > 0) {
        query = query.filter(filters.join(' and '));
      }

      const response = await query.get();
      return response.value.map((item: any) => this.mapSharePointEmployee(item.fields));
    } catch (error) {
      console.error('❌ Error fetching employees:', error);
      throw error;
    }
  }

  /**
   * Get employee by ID
   */
  async getEmployeeById(employeeId: string): Promise<Employee | null> {
    if (!this.siteId) await this.initialize();

    try {
      const listId = this.getListId(LISTS.EMPLOYEES);

      // Fetch all items and filter client-side to avoid indexing requirement
      // For production, index the EmployeeID column in SharePoint for better performance
      const response = await this.client
        .api(`/sites/${this.siteId}/lists/${listId}/items`)
        .expand('fields')
        .get();

      if (response.value && response.value.length > 0) {
        const employee = response.value.find((item: any) =>
          item.fields.EmployeeID === employeeId
        );

        if (employee) {
          return this.mapSharePointEmployee(employee.fields);
        }
      }
      return null;
    } catch (error) {
      console.error('❌ Error fetching employee:', error);
      throw error;
    }
  }

  /**
   * Get employee by Email
   */
  async getEmployeeByEmail(email: string): Promise<Employee | null> {
    if (!this.siteId) await this.initialize();

    try {
      const listId = this.getListId(LISTS.EMPLOYEES);

      // Filter by Email
      const response = await this.client
        .api(`/sites/${this.siteId}/lists/${listId}/items`)
        .header('Prefer', 'HonorNonIndexedQueriesWarningMayFailRandomly')
        .expand('fields')
        .filter(`fields/Email eq '${email}'`)
        .get();

      if (response.value && response.value.length > 0) {
        return this.mapSharePointEmployee(response.value[0].fields);
      }
      return null;
    } catch (error) {
      console.error('❌ Error fetching employee by email:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive employee profile with all related data
   */
  async getEmployeeProfile(employeeId: string): Promise<EmployeeProfile | null> {
    try {
      const employee = await this.getEmployeeById(employeeId);
      if (!employee) return null;

      // Fetch all related data in parallel
      const [
        leaveBalances,
        leaveRequests,
        documents,
        trainings,
        performanceReviews,
        employmentHistory,
      ] = await Promise.all([
        this.getLeaveBalances(employeeId),
        this.getLeaveRequests(employeeId),
        this.getDocuments(employeeId),
        this.getTraining(employeeId),
        this.getPerformanceReviews(employeeId),
        this.getEmploymentHistory(employeeId),
      ]);

      return {
        ...employee,
        leaveBalances,
        leaveRequests,
        documents,
        trainings,
        performanceReviews,
        employmentHistory,
      };
    } catch (error) {
      console.error('❌ Error fetching employee profile:', error);
      throw error;
    }
  }

  /**
   * Create new employee
   */
  async createEmployee(data: EmployeeFormData): Promise<Employee> {
    if (!this.siteId) await this.initialize();

    try {
      const listId = this.getListId(LISTS.EMPLOYEES);

      // Generate employee ID if not provided
      const employeeId = data.employeeId || `EMP${Date.now()}`;

      const itemData = {
        fields: {
          EmployeeID: employeeId,
          FirstName: data.firstName,
          LastName: data.lastName,
          PreferredName: data.preferredName,
          Gender: data.gender,
          DateOfBirth: data.dateOfBirth,
          NationalID: data.nationalId,
          Email: data.email,
          Phone: data.phone,
          MobilePhone: data.mobilePhone,
          Address: data.address,
          EmergencyContactName: data.emergencyContactName,
          EmergencyContactPhone: data.emergencyContactPhone,
          EmergencyContactRelation: data.emergencyContactRelation,
          Department: data.department,
          Unit: data.unit,
          JobTitle: data.jobTitle,
          OfficeLocation: data.officeLocation,
          StartDate: data.startDate,
          EmploymentStatus: data.employmentStatus,
          EmploymentType: data.employmentType,
          Grade: data.grade,
          PayScale: data.payScale,
          CostCenter: data.costCenter,
        },
      };

      const response = await this.client
        .api(`/sites/${this.siteId}/lists/${listId}/items`)
        .post(itemData);

      // Log audit entry
      await this.logAudit(employeeId, 'Employee', 'Created', undefined, undefined, JSON.stringify(data));

      return this.mapSharePointEmployee(response.fields);
    } catch (error) {
      console.error('❌ Error creating employee:', error);
      throw error;
    }
  }

  /**
   * Update employee
   */
  async updateEmployee(itemId: string, data: Partial<EmployeeFormData>): Promise<Employee> {
    if (!this.siteId) await this.initialize();

    try {
      const listId = this.getListId(LISTS.EMPLOYEES);

      const updateData: any = { fields: {} };

      // Map form data to SharePoint fields
      if (data.firstName) updateData.fields.FirstName = data.firstName;
      if (data.lastName) updateData.fields.LastName = data.lastName;
      if (data.preferredName !== undefined) updateData.fields.PreferredName = data.preferredName;
      if (data.email) updateData.fields.Email = data.email;
      if (data.phone !== undefined) updateData.fields.Phone = data.phone;
      if (data.mobilePhone !== undefined) updateData.fields.MobilePhone = data.mobilePhone;
      if (data.jobTitle) updateData.fields.JobTitle = data.jobTitle;
      if (data.department !== undefined) updateData.fields.Department = data.department;
      if (data.unit !== undefined) updateData.fields.Unit = data.unit;
      if (data.employmentStatus) updateData.fields.EmploymentStatus = data.employmentStatus;
      if (data.employmentType) updateData.fields.EmploymentType = data.employmentType;

      const response = await this.client
        .api(`/sites/${this.siteId}/lists/${listId}/items/${itemId}`)
        .patch(updateData);

      return this.mapSharePointEmployee(response.fields);
    } catch (error) {
      console.error('❌ Error updating employee:', error);
      throw error;
    }
  }

  /**
   * ==========================================
   * LEAVE OPERATIONS
   * ==========================================
   */

  /**
   * Create leave balance for employee
   */
  async createLeaveBalance(
    employeeId: string,
    leaveType: string,
    entitlement: number,
    year: number
  ): Promise<void> {
    if (!this.siteId) await this.initialize();

    try {
      const listId = this.getListId(LISTS.LEAVE_BALANCES);

      const itemData = {
        fields: {
          EmployeeID: employeeId,
          LeaveType: leaveType,
          Year: year.toString(), // Schema: Text
          Entitlement: entitlement.toString(), // Schema: Text
          Used: '0', // Schema: Text
          Pending: '0', // Schema: Text
          AccrualRate: '0', // Schema: Text
          LastAccrualDate: new Date().toISOString(),
        },
      };

      await this.client
        .api(`/sites/${this.siteId}/lists/${listId}/items`)
        .post(itemData);
    } catch (error) {
      console.error('❌ Error creating leave balance:', error);
      throw error;
    }
  }

  /**
   * Get leave balances for employee
   */
  async getLeaveBalances(employeeId: string): Promise<LeaveBalance[]> {
    try {
      const items = await this.getItemsByEmployeeId(LISTS.LEAVE_BALANCES, employeeId);

      return items.map((item: any) => {
        const entitlement = parseFloat(item.fields.Entitlement || '0');
        const used = parseFloat(item.fields.Used || '0');
        const pending = parseFloat(item.fields.Pending || '0');

        return {
          id: item.id,
          employeeId: item.fields.EmployeeID,
          leaveType: item.fields.LeaveType,
          year: parseInt(item.fields.Year || '0'),
          entitlement: entitlement,
          used: used,
          pending: pending,
          available: entitlement - used - pending,
          accrualRate: parseFloat(item.fields.AccrualRate || '0'),
          lastAccrualDate: item.fields.LastAccrualDate,
        };
      });
    } catch (error) {
      console.error('❌ Error fetching leave balances:', error);
      return [];
    }
  }

  /**
   * Get leave requests for employee
   */
  async getLeaveRequests(employeeId: string): Promise<LeaveRequest[]> {
    try {
      // Use getItemsByEmployeeId but we need to override the field name since it's Payroll_Number now
      if (!this.siteId) await this.initialize();

      const listId = this.getListId(LISTS.LEAVE_REQUESTS);

      // We can't use getItemsByEmployeeId directly because the field name changed
      // So we implement the fetch logic here
      const response = await this.client
        .api(`/sites/${this.siteId}/lists/${listId}/items`)
        .expand('fields')
        .get();

      // Filter by EmployeeID client-side
      const items = response.value.filter((item: any) => {
        return item.fields.EmployeeID === employeeId;
      });

      // Sort by start date descending (client-side)
      const sorted = items.sort((a: any, b: any) => {
        const dateA = new Date(a.fields.Start_Date).getTime();
        const dateB = new Date(b.fields.Start_Date).getTime();
        return dateB - dateA;
      });

      return sorted.map((item: any) => ({
        id: item.id,
        employeeId: item.fields.EmployeeID,
        leaveType: item.fields.Type_of_leave,
        startDate: item.fields.Start_Date,
        endDate: item.fields.End_Date,
        daysRequested: item.fields.TotalLeaveDays || 0,
        reason: item.fields.Reason,
        status: item.fields.ApprovalStatus || 'Pending',
        stage: item.fields.Stage || 'Submitted',
        currentStep: parseInt(item.fields.CurrentStep || '1'),
        approverManager: item.fields.Approver_Manager,
        approverDirector: item.fields.Approver_Director,
        approverHR: item.fields.Approver_HR,
        approvedBy: item.fields.ApprovedBy,
        approvedDate: item.fields.ApprovedDate,
        // Map to actual SharePoint column names (with spaces and underscores)
        managerApprovedDate: item.fields['Manager Approval Date'] || item.fields.Manager_Approval_Date || item.fields.ManagerApprovalDate,
        directorApprovedDate: item.fields['Director Approval Date'] || item.fields.Director_Approval_Date || item.fields.DirectorApprovalDate,
        hrApprovedDate: item.fields['HR Approval Date'] || item.fields.HR_Approval_Date || item.fields.HRApprovalDate,
        comments: item.fields.HRRemarks,
        createdDate: item.fields.Created,
      }));
    } catch (error) {
      console.error('❌ Error fetching leave requests:', error);
      return [];
    }
  }

  /**
   * Submit leave request
   */
  async submitLeaveRequest(data: LeaveRequestSubmission): Promise<LeaveRequest> {
    if (!this.siteId) await this.initialize();

    try {
      const listId = this.getListId(LISTS.LEAVE_REQUESTS);

      const itemData = {
        fields: {
          EmployeeID: data.employeeId,
          Name: data.name,
          Division: data.division,
          Unit: data.unit,
          Type_of_leave: data.leaveType,
          Start_Date: data.startDate,
          End_Date: data.endDate,
          Reason: data.reason,
          Signature: data.signature,
          Stage: 'Manager Review',
          CurrentStep: '2', // Schema defines this as Text
          Request_ID: `REQ-${data.employeeId}-${Date.now()}`,
          Submission_Date: new Date().toISOString().split('T')[0],
          TotalLeaveDays: data.daysRequested, // Mapped from schema
          ApprovalStatus: 'Pending', // Mapped from schema
        },
      };

      const response = await this.client
        .api(`/sites/${this.siteId}/lists/${listId}/items`)
        .post(itemData);

      return {
        id: response.id,
        employeeId: response.fields.EmployeeID,
        leaveType: response.fields.Type_of_leave,
        startDate: response.fields.Start_Date,
        endDate: response.fields.End_Date,
        daysRequested: response.fields.TotalLeaveDays,
        reason: response.fields.Reason,
        status: response.fields.ApprovalStatus,
        stage: response.fields.Stage,
        currentStep: parseInt(response.fields.CurrentStep || '0'),
      };
    } catch (error) {
      console.error('❌ Error submitting leave request:', error);
      throw error;
    }
  }

  /**
   * ==========================================
   * DOCUMENT OPERATIONS
   * ==========================================
   */

  /**
   * Get documents for employee
   */
  async getDocuments(employeeId: string): Promise<EmployeeDocument[]> {
    try {
      // Fetch with IsActive filter (can use server-side as it's not EmployeeID)
      const items = await this.getItemsByEmployeeId(
        LISTS.DOCUMENTS,
        employeeId,
        'fields/IsActive eq true'
      );

      // Sort by upload date descending (client-side)
      const sorted = items.sort((a: any, b: any) => {
        const dateA = new Date(a.fields.UploadDate).getTime();
        const dateB = new Date(b.fields.UploadDate).getTime();
        return dateB - dateA;
      });

      return sorted.map((item: any) => ({
        id: item.id,
        employeeId: item.fields.EmployeeID,
        documentType: item.fields.DocumentType,
        documentName: item.fields.DocumentName,
        fileUrl: item.fields.FileURL,
        uploadedBy: item.fields.UploadedBy,
        uploadDate: item.fields.UploadDate,
        expiryDate: item.fields.ExpiryDate,
        version: item.fields.Version || 1,
        isActive: item.fields.IsActive,
        notes: item.fields.Notes,
      }));
    } catch (error) {
      console.error('❌ Error fetching documents:', error);
      return [];
    }
  }

  /**
   * ==========================================
   * TRAINING OPERATIONS
   * ==========================================
   */

  /**
   * Get training records for employee
   */
  async getTraining(employeeId: string): Promise<Training[]> {
    try {
      const items = await this.getItemsByEmployeeId(LISTS.TRAINING, employeeId);

      // Sort by completion date descending (client-side)
      const sorted = items.sort((a: any, b: any) => {
        const dateA = new Date(a.fields.CompletionDate).getTime();
        const dateB = new Date(b.fields.CompletionDate).getTime();
        return dateB - dateA;
      });

      return sorted.map((item: any) => ({
        id: item.id,
        employeeId: item.fields.EmployeeID,
        courseName: item.fields.CourseName,
        provider: item.fields.Provider,
        completionDate: item.fields.CompletionDate,
        expiryDate: item.fields.ExpiryDate,
        certificateUrl: item.fields.CertificateURL,
        status: item.fields.Status,
        cost: item.fields.Cost,
        notes: item.fields.Notes,
      }));
    } catch (error) {
      console.error('❌ Error fetching training records:', error);
      return [];
    }
  }

  /**
   * ==========================================
   * PERFORMANCE REVIEW OPERATIONS
   * ==========================================
   */

  /**
   * Get performance reviews for employee
   */
  async getPerformanceReviews(employeeId: string): Promise<PerformanceReview[]> {
    try {
      const items = await this.getItemsByEmployeeId(LISTS.PERFORMANCE_REVIEWS, employeeId);

      // Sort by review date descending (client-side)
      const sorted = items.sort((a: any, b: any) => {
        const dateA = new Date(a.fields.ReviewDate).getTime();
        const dateB = new Date(b.fields.ReviewDate).getTime();
        return dateB - dateA;
      });

      return sorted.map((item: any) => ({
        id: item.id,
        employeeId: item.fields.EmployeeID,
        reviewPeriod: item.fields.ReviewPeriod,
        reviewDate: item.fields.ReviewDate,
        reviewType: item.fields.ReviewType,
        reviewer: item.fields.Reviewer,
        overallRating: item.fields.OverallRating,
        strengths: item.fields.Strengths,
        areasForImprovement: item.fields.AreasForImprovement,
        goals: item.fields.Goals,
        employeeComments: item.fields.EmployeeComments,
        status: item.fields.Status,
      }));
    } catch (error) {
      console.error('❌ Error fetching performance reviews:', error);
      return [];
    }
  }

  /**
   * ==========================================
   * EMPLOYMENT HISTORY OPERATIONS
   * ==========================================
   */

  /**
   * Get employment history for employee
   */
  async getEmploymentHistory(employeeId: string): Promise<EmploymentHistory[]> {
    try {
      const items = await this.getItemsByEmployeeId(LISTS.EMPLOYMENT_HISTORY, employeeId);

      // Sort by effective date descending (client-side)
      const sorted = items.sort((a: any, b: any) => {
        const dateA = new Date(a.fields.EffectiveDate).getTime();
        const dateB = new Date(b.fields.EffectiveDate).getTime();
        return dateB - dateA;
      });

      return sorted.map((item: any) => ({
        id: item.id,
        employeeId: item.fields.EmployeeID,
        changeType: item.fields.ChangeType,
        previousJobTitle: item.fields.PreviousJobTitle,
        newJobTitle: item.fields.NewJobTitle,
        previousDepartment: item.fields.PreviousDepartment,
        newDepartment: item.fields.NewDepartment,
        previousGrade: item.fields.PreviousGrade,
        newGrade: item.fields.NewGrade,
        effectiveDate: item.fields.EffectiveDate,
        reason: item.fields.Reason,
        approvedBy: item.fields.ApprovedBy,
      }));
    } catch (error) {
      console.error('❌ Error fetching employment history:', error);
      return [];
    }
  }

  /**
   * ==========================================
   * STATISTICS & REPORTING
   * ==========================================
   */

  /**
   * Get HR statistics
   */
  async getHRStatistics(): Promise<HRStatistics> {
    try {
      const employees = await this.getEmployees();

      const stats: HRStatistics = {
        totalEmployees: employees.length,
        activeEmployees: employees.filter(e => e.employmentStatus === 'Active').length,
        onLeave: employees.filter(e => e.employmentStatus === 'On Leave').length,
        byDepartment: {},
        byEmploymentType: {
          Permanent: 0,
          Contract: 0,
          Casual: 0,
          Temporary: 0,
          Intern: 0,
          Consultant: 0,
          Agency: 0,
        },
        contractsExpiring: 0,
        documentsExpiring: 0,
        certificationsExpiring: 0,
        lowLeaveBalance: 0,
      };

      // Count by department
      employees.forEach(emp => {
        if (emp.department) {
          stats.byDepartment[emp.department] = (stats.byDepartment[emp.department] || 0) + 1;
        }
        if (emp.employmentType) {
          stats.byEmploymentType[emp.employmentType]++;
        }
      });

      return stats;
    } catch (error) {
      console.error('❌ Error fetching HR statistics:', error);
      throw error;
    }
  }

  /**
   * ==========================================
   * AUDIT LOGGING
   * ==========================================
   */

  /**
   * Log audit entry
   */
  private async logAudit(
    employeeId: string,
    entityType: string,
    action: string,
    fieldChanged?: string,
    oldValue?: string,
    newValue?: string
  ): Promise<void> {
    if (!this.siteId) return;

    try {
      const listId = this.getListId(LISTS.AUDIT_LOG);

      const itemData = {
        fields: {
          EmployeeID: employeeId,
          EntityType: entityType,
          Action: action,
          FieldChanged: fieldChanged,
          OldValue: oldValue,
          NewValue: newValue,
        },
      };

      await this.client
        .api(`/sites/${this.siteId}/lists/${listId}/items`)
        .post(itemData);
    } catch (error) {
      console.error('⚠️ Error logging audit entry:', error);
      // Don't throw - audit logging shouldn't break operations
    }
  }

  /**
   * ==========================================
   * HELPER METHODS
   * ==========================================
   */

  /**
   * Map SharePoint fields to Employee object
   */
  private mapSharePointEmployee(fields: any): Employee {
    return {
      id: fields.id || fields.ID,
      employeeId: fields.EmployeeID,
      firstName: fields.FirstName,
      lastName: fields.LastName,
      preferredName: fields.PreferredName,
      fullName: `${fields.FirstName} ${fields.LastName}`,
      gender: fields.Gender,
      dateOfBirth: fields.DateOfBirth,
      photoUrl: fields.PhotoURL,
      nationalId: fields.NationalID,
      email: fields.Email,
      phone: fields.Phone,
      mobilePhone: fields.MobilePhone,
      address: fields.Address,
      emergencyContactName: fields.EmergencyContactName,
      emergencyContactPhone: fields.EmergencyContactPhone,
      emergencyContactRelation: fields.EmergencyContactRelation,
      department: fields.Department,
      unit: fields.Unit,
      jobTitle: fields.JobTitle,
      lineManager: fields.LineManager,
      officeLocation: fields.OfficeLocation,
      startDate: fields.StartDate,
      endDate: fields.EndDate,
      employmentStatus: fields.EmploymentStatus,
      employmentType: fields.EmploymentType,
      grade: fields.Grade,
      payScale: fields.PayScale,
      costCenter: fields.CostCenter,
      payrollId: fields.PayrollID,
      createdDate: fields.CreatedDate,
      modifiedDate: fields.ModifiedDate,
      createdBy: fields.CreatedBy,
      modifiedBy: fields.ModifiedBy,
    };
  }
}

// Singleton instance
let serviceInstance: HRSharePointService | null = null;
let initializationPromise: Promise<HRSharePointService> | null = null;

/**
 * Get singleton instance of HR Service
 * Ensures initialization happens only once
 */
export const getHRServiceInstance = async (client: Client): Promise<HRSharePointService> => {
  // If already initialized, return immediately
  if (serviceInstance) return serviceInstance;

  // If initialization is in progress, return the existing promise
  if (initializationPromise) return initializationPromise;

  // Start initialization
  initializationPromise = (async () => {
    try {
      const service = new HRSharePointService(client);
      await service.initialize();
      serviceInstance = service;
      return service;
    } catch (error) {
      // Reset promise on error so we can try again
      initializationPromise = null;
      throw error;
    }
  })();

  return initializationPromise;
};

// Export factory (legacy/testing)
export const createHRService = (client: Client) => new HRSharePointService(client);
