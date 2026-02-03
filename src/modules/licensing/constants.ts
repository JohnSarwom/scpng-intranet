export interface LicenseTypeData {
  id: string; // Unique identifier for the license type
  name: string; // Display name for the dropdown
  leftSections: string;
  leftAuthorizedActivity: string;
  rightLegalReference: string; // The full "Pursuant to..." text for the right side
}

export const placeholderLicenseType: LicenseTypeData = {
  id: 'placeholder',
  name: "Select License Type...",
  leftSections: "",
  leftAuthorizedActivity: "",
  rightLegalReference: "",
};

export const actualLicenseTypes: LicenseTypeData[] = [
  {
    id: 'trustee-services',
    name: "Trustee Services",
    leftSections: "Sections 34(1), 36, 37(1), 44, 156 & 189",
    leftAuthorizedActivity: "authorises the licensee to be: Trustee.",
    rightLegalReference: "Pursuant to Sections 34(1), 37, & 156 & 189 of the Capital Market Act 2015",
  },
  {
    id: 'advising-on-corporate-finance',
    name: "Advising on Corporate Finance",
    leftSections: "Sections 34(1), 37, 44, & Schedule 2(4)",
    leftAuthorizedActivity: "authorises the licensee to conduct the below stipulated regulated activity: Advising on Corporate Finance",
    rightLegalReference: "Pursuant to Sections 34(1), 37, & Schedule 2(4) of the Capital Market Act 2015",
  },
  {
    id: 'dealing-in-securities',
    name: "Dealing in Securities",
    leftSections: "Sections 34(1), 37, 44, & Schedule 2(1)",
    leftAuthorizedActivity: "authorises the licensee to conduct the below stipulated regulated activity: Dealing in Securities",
    rightLegalReference: "Pursuant to Sections 34(1), 37, & Schedule 2(1) of the Capital Market Act 2015",
  },
  {
    id: 'fund-management',
    name: "Fund Management",
    leftSections: "Sections 34(1), 37, 44, & Schedule 2(3)",
    leftAuthorizedActivity: "authorises the licensee to conduct the below stipulated regulated activity: Fund Management",
    rightLegalReference: "Pursuant to Sections 34(1), 37, & Schedule 2(3) of the Capital Market Act 2015",
  },
  {
    id: 'investment-advice',
    name: "Investment Advice",
    leftSections: "Sections 34(1), 37, 44, & Schedule 2(5)",
    leftAuthorizedActivity: "authorises the licensee to conduct the below stipulated regulated activity: Investment Advice",
    rightLegalReference: "Pursuant to Sections 34(1), 37, & Schedule 2(5) of the Capital Market Act 2015",
  }
];

export const allLicenseOptions: LicenseTypeData[] = [placeholderLicenseType, ...actualLicenseTypes];

// This is the original licenseTypes export, ensure it is removed or updated if other parts of the code rely on it with a different structure.
// For this feature, we will use allLicenseOptions for dropdowns and actualLicenseTypes for data lookup.
export const licenseTypes = actualLicenseTypes; // Or update this to allLicenseOptions if that's what the hook expects for initialization.
                                            // Given the plan, `useLicensingForm` will be affected by the initial selection logic.
                                            // Let's assume for now that the `useEffect` in LicensingRegistry.tsx will handle the initial set to placeholder. 