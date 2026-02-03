import { useState, useCallback, useEffect } from 'react';
import { KRA, KPI, KraItem, KraFilterState } from '@/types';
import { mockKras } from '@/data/mockData';
import { useToast } from '@/components/ui/use-toast';
import { useKraModals } from './useKraModals';

export function useKraState() {
  const { toast } = useToast();
  const [kras, setKras] = useState<KRA[]>([]);
  const [filteredKraItems, setFilteredKraItems] = useState<KraItem[]>([]);
  
  const [kraFilters, setKraFilters] = useState<KraFilterState>({
    kraId: 'all',
    department: 'all',
    kpiStatus: 'all',
    responsible: 'all'
  });
  
  const {
    showAddKraModal,
    setShowAddKraModal,
    showEditKpiModal,
    setShowEditKpiModal,
    showDeleteKpiModal,
    setShowDeleteKpiModal,
  } = useKraModals();
  
  const [newKra, setNewKra] = useState<Partial<KRA>>({
    status: 'open',
    progress: 0
  });
  
  const [editingKpi, setEditingKpi] = useState<(KPI & { kraId?: string }) | null>(null);
  const [deletingKpi, setDeletingKpi] = useState<(KPI & { kraId?: string }) | null>(null);
  
  // Load initial data
  useEffect(() => {
    setKras(mockKras);
  }, []);
  
  // Calculate filtered KRA items
  const applyKraFilters = useCallback(() => {
    // Filter KRAs based on department and responsible person
    let filteredKras = [...kras];
    
    if (kraFilters.kraId !== 'all') {
      filteredKras = filteredKras.filter(kra => kra.id === kraFilters.kraId);
    }
    
    if (kraFilters.department !== 'all') {
      filteredKras = filteredKras.filter(kra => kra.department === kraFilters.department);
    }
    
    if (kraFilters.responsible !== 'all') {
      filteredKras = filteredKras.filter(kra => kra.responsible === kraFilters.responsible);
    }
    
    // Create items for each KRA and KPI combination
    const items: KraItem[] = [];
    
    filteredKras.forEach(kra => {
      // Filter KPIs based on status
      const filteredKpis = kraFilters.kpiStatus === 'all'
        ? [...kra.kpis]
        : kra.kpis.filter(kpi => kpi.status === kraFilters.kpiStatus);
      
      // Add items for each KPI with its index in the filtered list
      filteredKpis.forEach((kpi, index) => {
        items.push({
          kra,
          kpi,
          index
        });
      });
    });
    
    setFilteredKraItems(items);
  }, [kras, kraFilters]);
  
  // Apply filters when KRAs or filters change
  useEffect(() => {
    applyKraFilters();
  }, [kras, kraFilters, applyKraFilters]);
  
  // Function to add a new KRA
  const handleAddKra = () => {
    try {
      if (!newKra.name || !newKra.objectiveId || !newKra.department || !newKra.responsible) {
        throw new Error("Please fill in all required fields");
      }

      // Create a new KRA
      const newId = `kra-${Date.now()}`;
      const currentDate = new Date();
      // Default end date to 3 months from now
      const endDate = new Date(currentDate);
      endDate.setMonth(endDate.getMonth() + 3);

      const kraToAdd: KRA = {
        id: newId,
        name: newKra.name || '',
        objectiveId: newKra.objectiveId || '',
        objectiveName: newKra.objectiveName || '',
        department: newKra.department || '',
        responsible: newKra.responsible || '',
        startDate: newKra.startDate || currentDate,
        endDate: newKra.endDate || endDate,
        progress: 0,
        status: 'open',
        kpis: [],
        createdAt: currentDate.toISOString(),
        updatedAt: currentDate.toISOString()
      };

      // Add the new KRA to the list
      setKras(prevKras => [...prevKras, kraToAdd]);
      
      // Reset form and close modal
      setNewKra({
        status: 'open',
        progress: 0
      });
      setShowAddKraModal(false);
      
      toast({
        title: "KRA Added",
        description: "The KRA has been successfully added",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  // Function to edit a KPI
  const handleEditKpi = () => {
    if (!editingKpi || !editingKpi.kraId) return;

    try {
      const updatedKras = kras.map(kra => {
        if (kra.id === editingKpi.kraId) {
          return {
            ...kra,
            kpis: kra.kpis.map(kpi => 
              kpi.id === editingKpi.id 
                ? { ...editingKpi, kraId: undefined }
                : kpi
            ),
            updatedAt: new Date().toISOString()
          };
        }
        return kra;
      });
      
      setKras(updatedKras);
      setEditingKpi(null);
      setShowEditKpiModal(false);
      
      toast({
        title: "KPI Updated",
        description: "The KPI has been successfully updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update KPI",
        variant: "destructive"
      });
    }
  };
  
  // Function to delete a KPI
  const handleDeleteKpi = () => {
    if (!deletingKpi || !deletingKpi.kraId) return;

    try {
      const updatedKras = kras.map(kra => {
        if (kra.id === deletingKpi.kraId) {
          return {
            ...kra,
            kpis: kra.kpis.filter(kpi => kpi.id !== deletingKpi.id),
            updatedAt: new Date().toISOString()
          };
        }
        return kra;
      });
      
      setKras(updatedKras);
      setDeletingKpi(null);
      setShowDeleteKpiModal(false);
      
      toast({
        title: "KPI Deleted",
        description: "The KPI has been successfully deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete KPI",
        variant: "destructive"
      });
    }
  };
  
  // Reset filters function
  const resetKraFilters = () => {
    setKraFilters({
      kraId: 'all',
      department: 'all',
      kpiStatus: 'all',
      responsible: 'all'
    });
  };
  
  return {
    kras,
    setKras,
    kraFilters,
    setKraFilters,
    filteredKraItems,
    applyKraFilters,
    resetKraFilters,
    
    // Modal states (now from useKraModals)
    showAddKraModal,
    setShowAddKraModal,
    showEditKpiModal,
    setShowEditKpiModal,
    showDeleteKpiModal,
    setShowDeleteKpiModal,
    
    // Form states
    newKra,
    setNewKra,
    editingKpi,
    setEditingKpi,
    deletingKpi,
    setDeletingKpi,
    
    // Handler functions
    handleAddKra,
    handleEditKpi,
    handleDeleteKpi,
  };
} 