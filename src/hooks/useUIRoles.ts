import { useMsal } from "@azure/msal-react";

// Email to Role Mapping
// For a production app with many roles, consider loading this from a JSON file or a configuration service.
const emailToRoleMap = new Map<string, string>([
  ["aambulu@scpng.gov.pg", "General Counsel"],
  ["jjoshua@scpng.gov.pg", "Acting Chief Executive Officer"],
  ["rminak@scpng.gov.pg", "Acting Executive Chairman"],
  ["akosnga@scpng.gov.pg", "Finance Officer"],
  ["ayambe@scpng.gov.pg", "Senior Finance Officer"],
  ["ekipongi@scpng.gov.pg", "Manager Information Technology"],
  ["jsarwom@scpng.gov.pg", "Senior IT Database Officer"],
  ["jwaiya@scpng.gov.pg", "Senior Human Resource Officer"],
  // Add all other email-to-role mappings from your list here...
  ["admin@scpng.gov.pg", "System Administrator"],
  ["admin@scpng1.onmicrosoft.com", "System Administrator"],
  ["ealia@scpng.gov.pg", "Market Data Officer"],
  ["tyapao@scpng.gov.pg", "Legal Manager - Compliance & Enforcement"],
  // ... (ensure all unique roles are represented in AppUIRole enum below)
]);

// Define your application's UI roles based on the roles in your list
export enum AppUIRole {
  // System/Admin Roles
  SYSTEM_ADMINISTRATOR = "System Administrator", // Matches "System Administrator" from your list
  MANAGER_IT = "Manager Information Technology",

  // Executive Roles
  ACTING_CEO = "Acting Chief Executive Officer",
  ACTING_EXECUTIVE_CHAIRMAN = "Acting Executive Chairman",
  ACTING_DIRECTOR_CORPORATE_SERVICE = "Acting Director Corporate Service",

  // Finance Roles
  FINANCE_OFFICER = "Finance Officer",
  SENIOR_FINANCE_OFFICER = "Senior Finance Officer",
  SENIOR_PAYROLL_OFFICER = "Senior Payroll Officer",

  // HR Roles
  SENIOR_HR_OFFICER = "Senior Human Resource Officer", // Covers both "Senior Human Resource Officer" and "Senior HR Officer" if they are the same logical role

  // Legal Roles
  GENERAL_COUNSEL = "General Counsel",
  LEGAL_MANAGER_COMPLIANCE_ENFORCEMENT = "Legal Manager - Compliance & Enforcement",
  SENIOR_LEGAL_OFFICER = "Senior Legal Officer",
  LEGAL_OFFICER = "Legal Officer",
  LEGAL_CLARK = "Legal Clark",
  SENIOR_LEGAL_OFFICER_ENFORCEMENT_COMPLIANCE = "Senior Legal Officer Enforcement & Compliance",


  // IT Roles (other than Manager)
  SENIOR_IT_DATABASE_OFFICER = "Senior IT Database Officer",
  SENIOR_SYSTEMS_ANALYST_CONSULTANT = "Senior Systems Analyst Consultant",
  IT_SUPPORT = "IT Support",

  // Operations & Support Roles
  ADMINISTRATIVE_DRIVER = "Administrative Driver",
  ADMIN_OFFICER = "Admin Officer",
  RECEPTIONIST = "Receptionist",
  EXECUTIVE_SECRETARY = "Executive Secretary",
  DIVISIONAL_SECRETARY = "Divisional Secretary",
  SUPPORT_STAFF = "Support Staff",

  // Market & Data Roles
  MARKET_DATA_OFFICER = "Market Data Officer",
  MARKET_DATA_MANAGER = "Market Data Manager",
  SENIOR_INVESTIGATIONS_OFFICER = "Senior Investigations Officer",
  INVESTIGATION_OFFICER = "Inestigation Officer", // Corrected typo from "Inestigation"
  SENIOR_SUPERVISION_OFFICER = "Senior Supervision Officer",
  SUPERVISION_OFFICER = "Supervision Officer",
  SENIOR_LICENSING_OFFICER = "Senior Licensing Officer",

  // Research & Publication Roles
  PUBLICATION_OFFICER = "Publication Officer",
  DIRECTOR_RESEARCH_PUBLICATION = "Director Research & Publication",
  RESEARCH_OFFICER = "Research Officer",

  // Service & Facility Roles
  INFORMATION_SERVICE = "Information Service",
  FACILITY = "Facility",
  SERVICE_ACCOUNT = "Service Account",

  // Generic/Fallback
  STANDARD_USER = "StandardUser", // A generic role if needed for users not in the map
  UNKNOWN = "Unknown", // Default for users not found or errors
}

// Interface for the permissions object returned by the hook
export interface UIPermissions {
  currentUserUIRole: AppUIRole;
  isAuthenticated: boolean; // Useful to know if user is logged in

  // High-level role checks
  isSystemAdmin: boolean;
  isExecutive: boolean;
  isFinanceTeam: boolean;
  isHRTeam: boolean;
  isLegalTeam: boolean;
  isITTeam: boolean;

  // Specific granular permissions
  canUploadNews: boolean; // Example from before
  canEditSiteSettings: boolean;
  canViewFinancialReports: boolean;
  canManageUserAccounts: boolean; // e.g., for System Admin
  canAccessHRRecords: boolean;
  canAccessLegalCaseFiles: boolean;
  canPerformSystemMaintenance: boolean; // For IT roles
  // Add more specific permission flags as your application grows
}

export const useUIRoles = (): UIPermissions => {
  const { accounts } = useMsal();
  const account = accounts[0]; // Get the first (active) account

  let currentUIRole: AppUIRole = AppUIRole.UNKNOWN;
  let roleStringFromMap: string | undefined;

  if (account && account.username) { // Using username (expected to be email)
    roleStringFromMap = emailToRoleMap.get(account.username.toLowerCase()); // Use toLowerCase for case-insensitive email matching

    if (roleStringFromMap) {
      // Map the role string from the map to your AppUIRole enum
      // This requires AppUIRole enum values to exactly match the role strings in your map.
      const roleKey = Object.keys(AppUIRole).find(
        key => AppUIRole[key as keyof typeof AppUIRole] === roleStringFromMap
      );
      if (roleKey) {
        currentUIRole = AppUIRole[roleKey as keyof typeof AppUIRole];
      } else {
        console.warn(`Role string "${roleStringFromMap}" from map for email ${account.username} not found in AppUIRole enum. Assigning UNKNOWN.`);
        currentUIRole = AppUIRole.UNKNOWN;
      }
    } else {
      console.warn(`Email ${account.username} not found in emailToRoleMap. Assigning STANDARD_USER or UNKNOWN.`);
      // Decide a default role for users not in your specific list
      // currentUIRole = AppUIRole.STANDARD_USER; // Or AppUIRole.UNKNOWN;
      currentUIRole = AppUIRole.UNKNOWN;
    }
  } else if (account) {
    console.warn("MSAL account found but has no username (email). Assigning UNKNOWN role.");
    currentUIRole = AppUIRole.UNKNOWN;
  }
  // If no account, role remains UNKNOWN and isAuthenticated will be false

  // Define permissions based on the currentUIRole
  const permissions: UIPermissions = {
    currentUserUIRole: currentUIRole,
    isAuthenticated: !!account, // True if account object exists

    // High-level role checks
    isSystemAdmin: currentUIRole === AppUIRole.SYSTEM_ADMINISTRATOR,
    isExecutive: [
      AppUIRole.ACTING_CEO,
      AppUIRole.ACTING_EXECUTIVE_CHAIRMAN,
      AppUIRole.ACTING_DIRECTOR_CORPORATE_SERVICE,
    ].includes(currentUIRole),
    isFinanceTeam: [
      AppUIRole.FINANCE_OFFICER,
      AppUIRole.SENIOR_FINANCE_OFFICER,
      AppUIRole.SENIOR_PAYROLL_OFFICER,
    ].includes(currentUIRole),
    isHRTeam: [
        AppUIRole.SENIOR_HR_OFFICER,
        // Add other HR roles if they exist as distinct enum members
    ].includes(currentUIRole),
    isLegalTeam: [
        AppUIRole.GENERAL_COUNSEL,
        AppUIRole.LEGAL_MANAGER_COMPLIANCE_ENFORCEMENT,
        AppUIRole.SENIOR_LEGAL_OFFICER,
        AppUIRole.LEGAL_OFFICER,
        AppUIRole.LEGAL_CLARK,
        AppUIRole.SENIOR_LEGAL_OFFICER_ENFORCEMENT_COMPLIANCE,
    ].includes(currentUIRole),
    isITTeam: [
        AppUIRole.MANAGER_IT,
        AppUIRole.SENIOR_IT_DATABASE_OFFICER,
        AppUIRole.SENIOR_SYSTEMS_ANALYST_CONSULTANT,
        AppUIRole.IT_SUPPORT,
    ].includes(currentUIRole),
    
    // Specific granular permissions
    canUploadNews:
      currentUIRole === AppUIRole.SYSTEM_ADMINISTRATOR || // System Admins can often do many things
      currentUIRole === AppUIRole.MANAGER_IT || // Example: IT Manager might manage news
      currentUIRole === AppUIRole.DIRECTOR_RESEARCH_PUBLICATION || // Publication roles
      currentUIRole === AppUIRole.PUBLICATION_OFFICER,

    canEditSiteSettings: currentUIRole === AppUIRole.SYSTEM_ADMINISTRATOR || currentUIRole === AppUIRole.MANAGER_IT,

    canViewFinancialReports:
      currentUIRole === AppUIRole.SYSTEM_ADMINISTRATOR ||
      [
        AppUIRole.ACTING_CEO,
        AppUIRole.ACTING_EXECUTIVE_CHAIRMAN,
        AppUIRole.FINANCE_OFFICER,
        AppUIRole.SENIOR_FINANCE_OFFICER,
      ].includes(currentUIRole),

    canManageUserAccounts: currentUIRole === AppUIRole.SYSTEM_ADMINISTRATOR,
    
    canAccessHRRecords: 
      currentUIRole === AppUIRole.SYSTEM_ADMINISTRATOR || 
      [
        AppUIRole.SENIOR_HR_OFFICER,
        AppUIRole.ACTING_DIRECTOR_CORPORATE_SERVICE,
        AppUIRole.ACTING_CEO,
      ].includes(currentUIRole),

    canAccessLegalCaseFiles: 
      currentUIRole === AppUIRole.SYSTEM_ADMINISTRATOR || 
      [
        AppUIRole.GENERAL_COUNSEL,
        AppUIRole.LEGAL_MANAGER_COMPLIANCE_ENFORCEMENT,
        AppUIRole.SENIOR_LEGAL_OFFICER,
        AppUIRole.LEGAL_OFFICER,
        AppUIRole.SENIOR_LEGAL_OFFICER_ENFORCEMENT_COMPLIANCE,
      ].includes(currentUIRole),

    canPerformSystemMaintenance: 
      currentUIRole === AppUIRole.SYSTEM_ADMINISTRATOR || 
      currentUIRole === AppUIRole.MANAGER_IT ||
      currentUIRole === AppUIRole.SENIOR_IT_DATABASE_OFFICER ||
      currentUIRole === AppUIRole.SENIOR_SYSTEMS_ANALYST_CONSULTANT,
  };

  return permissions;
};

// Optional: Export the MSAL account if components need direct access to it for display purposes, etc.
// export const useUserAccount = () => {
//   const { accounts } = useMsal();
//   return accounts[0];
// }; 