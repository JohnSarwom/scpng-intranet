import { useState } from 'react';

export function useKraModals() {
  const [showAddKraModal, setShowAddKraModal] = useState(false);
  const [showEditKpiModal, setShowEditKpiModal] = useState(false);
  const [showDeleteKpiModal, setShowDeleteKpiModal] = useState(false);

  return {
    showAddKraModal,
    setShowAddKraModal,
    showEditKpiModal,
    setShowEditKpiModal,
    showDeleteKpiModal,
    setShowDeleteKpiModal,
  };
} 