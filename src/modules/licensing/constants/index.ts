import { AllElementStyles } from '../types';

export const PREVIEW_SIZES = {
  ORIGINAL_DESIGN: { width: 800, height: 565, name: 'Original (800x565px)' },
  A4_LANDSCAPE: { width: 1122, height: 794, name: 'A4 Landscape (1122x794px @96DPI)' },
  A3_LANDSCAPE: { width: 1587, height: 1122, name: 'A3 Landscape (1587x1122px @96DPI)' },
  CUSTOM: { width: 800, height: 565, name: 'Custom Dimensions' }
};

export interface LicenseTypeData {
  id: string; 
  name: string; 
  leftSections: string;
  leftAuthorizedActivity: string;
  rightLegalReference: string; 
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

export const licenseTypes = actualLicenseTypes;

export const availableFontFamilies = [
  { id: 'Montserrat', name: 'Montserrat' },
  { id: 'LedSledStraight', name: 'LED Sled Straight' },
  { id: 'Times New Roman', name: 'Times New Roman' },
  { id: 'Arial', name: 'Arial' },
  { id: 'Century Gothic', name: 'Century Gothic' },
];

export const initialElementStyles: AllElementStyles = {
    "headerLogo": {
      "x": 18,
      "y": 9,
      "width": 123,
      "height": 123,
      "zIndex": 10,
      "fontFamily": "Montserrat"
    },
    "securitiesCommissionText": {
      "x": 79,
      "y": 18,
      "fontSize": 22,
      "fontWeight": "500",
      "color": "#000000",
      "letterSpacing": 0.9,
      "fontFamily": "Montserrat",
      "fontStyle": "normal",
      "zIndex": 1,
      "width": 420,
      "height": 30
    },
    "ofPapuaNewGuineaText": {
      "x": 80,
      "y": 34,
      "fontSize": 16,
      "fontWeight": "normal",
      "color": "#6a6868",
      "letterSpacing": 5.6,
      "fontFamily": "Montserrat",
      "fontStyle": "normal",
      "zIndex": 1,
      "width": 307,
      "height": 25
    },
    "issuedLabelText": {
      "x": 318,
      "y": 19,
      "fontSize": 13,
      "fontWeight": "normal",
      "color": "#888888",
      "letterSpacing": 0,
      "fontFamily": "LedSledStraight",
      "fontStyle": "normal",
      "zIndex": 1,
      "width": 103,
      "height": 20
    },
    "issuedDateText": {
      "x": 343,
      "y": 19,
      "fontSize": 13,
      "fontWeight": "normal",
      "color": "#D32F2F",
      "letterSpacing": 0,
      "fontFamily": "LedSledStraight",
      "fontStyle": "normal",
      "zIndex": 1,
      "width": 100,
      "height": 20
    },
    "expiryLabelText": {
      "x": 319,
      "y": 29,
      "fontSize": 13,
      "fontWeight": "normal",
      "color": "#888888",
      "letterSpacing": 0,
      "fontFamily": "LedSledStraight",
      "fontStyle": "normal",
      "zIndex": 1,
      "width": 100,
      "height": 20
    },
    "expiryDateText": {
      "x": 687,
      "y": 58,
      "fontSize": 13,
      "fontWeight": "normal",
      "color": "#D32F2F",
      "letterSpacing": 0,
      "fontFamily": "LedSledStraight",
      "fontStyle": "normal",
      "zIndex": 1,
      "width": 100,
      "height": 20
    },
    "licenseNumberHeaderText": {
      "x": 298,
      "y": 42,
      "fontSize": 28,
      "fontWeight": "500",
      "color": "#000000",
      "letterSpacing": 2.4,
      "fontFamily": "LedSledStraight",
      "fontStyle": "normal",
      "zIndex": 1,
      "width": 163,
      "height": 25
    },
    "capitalMarketActText": {
      "x": 50,
      "y": 160,
      "fontSize": 14,
      "fontWeight": "bold",
      "color": "#111111",
      "letterSpacing": 0.5,
      "fontFamily": "Montserrat",
      "fontStyle": "normal",
      "zIndex": 1,
      "width": 220,
      "height": 25
    },
    "actDetailsText": {
      "x": 50,
      "y": 183,
      "fontSize": 10,
      "fontWeight": "normal",
      "color": "#222222",
      "letterSpacing": 0.2,
      "fontFamily": "Montserrat",
      "fontStyle": "italic",
      "zIndex": 1,
      "width": 227,
      "height": 17
    },
    "sidebarPara1StaticText": {
      "x": 50,
      "y": 212,
      "fontSize": 10,
      "fontWeight": "normal",
      "color": "#222222",
      "letterSpacing": 0.2,
      "fontFamily": "Montserrat",
      "fontStyle": "normal",
      "zIndex": 1,
      "width": 245,
      "height": 60
    },
    "sidebarRegulatedActivityText": {
      "x": 92,
      "y": 243,
      "fontSize": 10,
      "fontWeight": "bold",
      "color": "#222222",
      "letterSpacing": 0.2,
      "fontFamily": "Montserrat",
      "fontStyle": "normal",
      "zIndex": 1,
      "width": 200,
      "height": 40
    },
    "sidebarPara2Text": {
      "x": 50,
      "y": 264,
      "fontSize": 10,
      "fontWeight": "normal",
      "color": "#222222",
      "letterSpacing": 0.2,
      "fontFamily": "Montserrat",
      "fontStyle": "normal",
      "width": 245,
      "zIndex": 1,
      "height": 80
    },
    "qrCode": {
      "x": 42,
      "y": 178,
      "width": 142,
      "height": 142,
      "zIndex": 10,
      "fontFamily": "Montserrat"
    },
    "verticalGoldLine": {
      "x": 317,
      "y": 149,
      "width": 1,
      "height": 350,
      "backgroundColor": "#d4af37",
      "zIndex": 15,
      "fontFamily": "Montserrat"
    },
    "mainTitleBanner": {
      "x": 348,
      "y": 149,
      "height": 69,
      "width": 451,
      "backgroundColor": "#000000",
      "zIndex": 5,
      "borderTopLeftRadius": 34,
      "borderBottomLeftRadius": 34,
      "borderBottomRightRadius": 0,
      "fontFamily": "Montserrat"
    },
    "mainLicenseTitleText": {
      "x": 383,
      "y": 166,
      "fontSize": 24,
      "fontWeight": "lighter",
      "color": "#FFFFFF",
      "letterSpacing": 2.7,
      "fontFamily": "Montserrat",
      "fontStyle": "normal",
      "zIndex": 6,
      "width": 381,
      "height": 30
    },
    "grantedToLabelText": {
      "x": 352,
      "y": 262,
      "fontSize": 17,
      "fontWeight": "bold",
      "color": "#555555",
      "letterSpacing": 0,
      "fontFamily": "Times New Roman",
      "fontStyle": "italic",
      "zIndex": 1,
      "width": 100,
      "height": 25
    },
    "granteeNameText": {
      "x": 186,
      "y": 149,
      "fontSize": 26,
      "fontWeight": "bold",
      "color": "#A20707",
      "letterSpacing": 0,
      "fontFamily": "Montserrat",
      "fontStyle": "italic",
      "zIndex": 1,
      "width": 350,
      "height": 40,
      "textShadow": "1px 1px 2px rgba(0, 0, 0, 0.3)"
    },
    "subtitleText": {
      "x": 192,
      "y": 164,
      "fontSize": 20,
      "fontWeight": "normal",
      "color": "#555555",
      "letterSpacing": 1.5,
      "fontFamily": "Montserrat",
      "fontStyle": "normal",
      "zIndex": 1,
      "width": 350,
      "height": 30
    },
    "subtitleText2": {
      "x": 296,
      "y": 33,
      "fontSize": 56,
      "fontWeight": "normal",
      "color": "#000000",
      "letterSpacing": 1.5,
      "fontFamily": "Montserrat",
      "fontStyle": "normal",
      "zIndex": 1,
      "width": 189,
      "height": 14
    },
    "subtitleText3": {
      "x": 296,
      "y": 38,
      "fontSize": 56,
      "fontWeight": "normal",
      "color": "#d6d6d6",
      "letterSpacing": 1.5,
      "fontFamily": "Montserrat",
      "fontStyle": "normal",
      "zIndex": 1,
      "width": 189,
      "height": 14
    },
    "regulatedActivityMainText": {
      "x": 363,
      "y": 366,
      "fontSize": 11,
      "fontWeight": "normal",
      "color": "#000000",
      "letterSpacing": -0.3,
      "fontFamily": "Montserrat",
      "fontStyle": "normal",
      "zIndex": 1,
      "width": 394,
      "height": 18
    },
    "legalReferenceMainText": {
      "x": 367,
      "y": 384,
      "fontSize": 10,
      "fontWeight": "normal",
      "color": "#000000",
      "letterSpacing": 0,
      "fontFamily": "Montserrat",
      "fontStyle": "italic",
      "zIndex": 1,
      "width": 384,
      "height": 17
    },
    "signatureNameText": {
      "x": 367,
      "y": 472,
      "fontSize": 12,
      "fontWeight": "bold",
      "color": "#000000",
      "letterSpacing": 0,
      "fontFamily": "Montserrat",
      "fontStyle": "normal",
      "zIndex": 1,
      "width": 200,
      "height": 20
    },
    "signatureTitleText": {
      "x": 367,
      "y": 489,
      "fontSize": 12,
      "fontWeight": "normal",
      "color": "#000000",
      "letterSpacing": 0,
      "fontFamily": "Times New Roman",
      "fontStyle": "normal",
      "zIndex": 1,
      "width": 200,
      "height": 20
    },
    "footerLogo": {
      "x": 674,
      "y": 407,
      "width": 107,
      "height": 107,
      "zIndex": 10,
      "fontFamily": "Montserrat",
      "opacity": 0.25
    },
    "footerBanner": {
      "x": -2,
      "y": 526,
      "width": 800,
      "height": 40,
      "backgroundColor": "#000000",
      "borderRadius": 0,
      "zIndex": 5,
      "fontFamily": "Montserrat"
    },
    "footerLicenseNoLabelText": {
      "x": 351,
      "y": 535,
      "fontSize": 12,
      "fontWeight": "normal",
      "color": "#FFFFFF",
      "letterSpacing": 4.6,
      "fontFamily": "Century Gothic",
      "fontStyle": "normal",
      "zIndex": 6,
      "width": 301,
      "height": 20
    },
    "footerLicenseNoValueText": {
      "x": 654,
      "y": 535,
      "fontSize": 12,
      "fontWeight": "normal",
      "color": "#FFFFFF",
      "letterSpacing": 4.6,
      "fontFamily": "Century Gothic",
      "fontStyle": "normal",
      "zIndex": 6,
      "width": 150,
      "height": 20,
      "content": "CMLXXXXXX"
    }
};