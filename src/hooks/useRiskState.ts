import { useState, useCallback, useEffect } from 'react';
import { Risk } from '@/types';
import { useToast } from '@/components/ui/use-toast';

export interface RiskFilterState {
  status: string;
  impact: string;
  likelihood: string;
  category: string;
  owner: string;
}

export function useRiskState(initialRisks: Risk[] = []) {
  const { toast } = useToast();
  const [risks, setRisks] = useState<Risk[]>(initialRisks);
  const [filteredRisks, setFilteredRisks] = useState<Risk[]>(initialRisks);
  
  // Risk filtering state
  const [riskFilters, setRiskFilters] = useState<RiskFilterState>({
    status: 'all',
    impact: 'all',
    likelihood: 'all',
    category: 'all',
    owner: 'all'
  });
  
  // Modal states
  const [showAddRiskModal, setShowAddRiskModal] = useState(false);
  const [showEditRiskModal, setShowEditRiskModal] = useState(false);
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null);
  const [showDeleteRiskModal, setShowDeleteRiskModal] = useState(false);
  const [deletingRisk, setDeletingRisk] = useState<Risk | null>(null);
  
  // Apply risk filters
  const applyRiskFilters = useCallback(() => {
    let filtered = [...risks];
    
    if (riskFilters.status !== 'all') {
      filtered = filtered.filter(risk => risk.status === riskFilters.status);
    }
    
    if (riskFilters.impact !== 'all') {
      filtered = filtered.filter(risk => risk.impact === riskFilters.impact);
    }
    
    if (riskFilters.likelihood !== 'all') {
      filtered = filtered.filter(risk => risk.likelihood === riskFilters.likelihood);
    }
    
    if (riskFilters.category !== 'all') {
      filtered = filtered.filter(risk => risk.category === riskFilters.category);
    }
    
    if (riskFilters.owner !== 'all') {
      filtered = filtered.filter(risk => risk.owner === riskFilters.owner);
    }
    
    setFilteredRisks(filtered);
  }, [risks, riskFilters]);
  
  // Apply filters when risks or filters change
  useEffect(() => {
    applyRiskFilters();
  }, [risks, riskFilters, applyRiskFilters]);
  
  // Function to add a risk
  const handleAddRisk = (risk: Risk) => {
    setRisks([...risks, risk]);
    toast({
      title: "Risk Added",
      description: "The risk has been successfully added."
    });
  };
  
  // Function to update a risk
  const handleUpdateRisk = (updatedRisk: Risk) => {
    const updatedRisks = risks.map(r => r.id === updatedRisk.id ? updatedRisk : r);
    setRisks(updatedRisks);
    toast({
      title: "Risk Updated",
      description: "The risk has been successfully updated."
    });
  };
  
  // Function to delete a risk
  const handleDeleteRisk = () => {
    if (!deletingRisk) return;
    
    const updatedRisks = risks.filter(r => r.id !== deletingRisk.id);
    setRisks(updatedRisks);
    setDeletingRisk(null);
    toast({
      title: "Risk Deleted",
      description: "The risk has been successfully deleted."
    });
  };
  
  // Reset filters function
  const resetRiskFilters = () => {
    setRiskFilters({
      status: 'all',
      impact: 'all',
      likelihood: 'all',
      category: 'all',
      owner: 'all'
    });
  };
  
  return {
    risks,
    setRisks,
    filteredRisks,
    riskFilters,
    setRiskFilters,
    resetRiskFilters,
    applyRiskFilters,
    
    // Modal states
    showAddRiskModal,
    setShowAddRiskModal,
    showEditRiskModal,
    setShowEditRiskModal,
    editingRisk,
    setEditingRisk,
    showDeleteRiskModal,
    setShowDeleteRiskModal,
    deletingRisk,
    setDeletingRisk,
    
    // Handler functions
    handleAddRisk,
    handleUpdateRisk,
    handleDeleteRisk
  };
} 