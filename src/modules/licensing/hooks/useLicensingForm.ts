import { useState, ChangeEvent } from 'react';
import { FormData } from '../types';
import { LicenseTypeData, placeholderLicenseType, allLicenseOptions } from '../constants';

export const useLicensingForm = (initialFormData: FormData) => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [selectedLicenseType, setSelectedLicenseType] = useState<LicenseTypeData>(placeholderLicenseType);

  const handleFormInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, name } = e.target;
    if (name === "licenseType") {
      const chosenType = allLicenseOptions.find(lt => lt.id === value);
      if (chosenType) {
        setSelectedLicenseType(chosenType);
      }
      return;
    }
    const mapIdToKey: { [key: string]: keyof FormData } = {
        formIssuedDate: 'issuedDate',
        formExpiryDate: 'expiryDate',
        formLicenseNumber: 'licenseNumber',
        formLicenseeName: 'licenseeName',
        formRegulatedActivity: 'regulatedActivity',
        formLegalReference: 'legalReference',
        formSignatoryName: 'signatoryName',
        formSignatoryTitle: 'signatoryTitle',
    };
    const key = mapIdToKey[id];
    if (key) {
        setFormData(prev => ({ ...prev, [key]: value }));
    }
  };

  const handlePreviewTextUpdate = (fieldName: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  return {
    formData,
    setFormData,
    selectedLicenseType,
    setSelectedLicenseType,
    handleFormInputChange,
    handlePreviewTextUpdate,
  };
}; 