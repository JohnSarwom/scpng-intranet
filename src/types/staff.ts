export interface StaffMember {
  id: string;
  name: string;
  email: string;
  jobTitle: string;        // camelCase to match hook output
  department: string;      // mapped from database 'unit' field
  mobile: string;
  businessPhone: string;   // camelCase to match hook output  
  officeLocation: string;  // camelCase to match hook output
  divisionId: string;      // camelCase to match hook output
} 