export interface FormData {
  issuedDate: string;
  expiryDate: string;
  licenseNumber: string;
  licenseeName: string;
  regulatedActivity: string; // Will be populated from selectedLicenseType.name
  legalReference: string; // Will be populated from selectedLicenseType.rightLegalReference
  signatoryName: string;
  signatoryTitle: string;
  subtitle?: string;
  subtitle2?: string;
  subtitle3?: string;
  licenseNumberDottedLineContent?: string;
  licenseNumberDottedLine2Content?: string;
  // New fields for dynamic content
  leftSections?: string;
  leftAuthorizedActivity?: string;
  rightSideActivityDisplay?: string; // e.g., TO CARRY ON THE BUSINESS OF [LICENSE NAME]
} 

// Main application view states
export type MainView = 'create' | 'dashboard' | 'registry' | 'settings' | 'admin';

// Added ElementStyleProperties and AllElementStyles
export interface ElementStyleProperties {
  x: number;
  y: number;
  fontSize?: number;
  width?: number;
  height?: number;
  fontWeight?: string | number; 
  letterSpacing?: number;    
  color?: string;            
  fontFamily?: string;
  backgroundColor?: string;
  borderRadius?: number;
  borderTopLeftRadius?: number;
  borderTopRightRadius?: number;
  borderBottomLeftRadius?: number;
  borderBottomRightRadius?: number;
  zIndex?: number;
  fontStyle?: 'normal' | 'italic';
  content?: string;
  opacity?: number; // Added opacity based on initialElementStyles in constants
  textShadow?: string; // Added textShadow property
}

export interface AllElementStyles {
  [key: string]: ElementStyleProperties;
} 