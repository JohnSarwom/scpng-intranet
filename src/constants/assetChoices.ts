/**
 * SharePoint Assets List - Choice Field Values
 * These must EXACTLY match the choices defined in SharePoint
 * Any mismatch will cause a 500 error when creating/updating assets
 */

export const ASSET_TYPES = [
  'Desktop PC',
  'Laptop',
  'PC Monitor',
  'Desk Phone',
  'Printer',
  'Scanner',
  'Tablet',
  'Projector',
  'Networking Equipment',
  'Server',
  'Other'
] as const;

export const ASSET_CONDITIONS = [
  'Excellent',
  'Good',
  'Fair',
  'Poor',
  'Needs Repair',
  'Out of Service'
] as const;

export const ASSET_UNITS = [
  'IT',
  'HR',
  'Finance',
  'Operations',
  'Administration',
  'Legal',
  'Procurement',
  'Other'
] as const;

// Note: Division choices should match your SharePoint list
// Update these to match your organization's divisions
export const ASSET_DIVISIONS = [
  'Administration Division',
  'Finance Division',
  'IT Division',
  'HR Division',
  'Operations Division'
] as const;

// Type exports for TypeScript
export type AssetType = typeof ASSET_TYPES[number];
export type AssetCondition = typeof ASSET_CONDITIONS[number];
export type AssetUnit = typeof ASSET_UNITS[number];
export type AssetDivision = typeof ASSET_DIVISIONS[number];
