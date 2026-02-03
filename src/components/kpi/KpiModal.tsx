// src/components/kpi/KpiModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Kra, Kpi, User, Objective, KraStatus } from '@/types/kpi'; // Use the centralized types
import { StaffMember } from '@/types/staff'; // Import StaffMember type
import KraFormSection from './KraFormSection';
import KpiInputBlock from './KpiInputBlock';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { PlusCircle } from 'lucide-react';

// Update interface
interface KpiModalProps {
  isOpen: boolean;
  onClose: () => void;
  kraData?: Kra | null; // Allow null for explicit clearing
  onSubmit: (formData: Kra) => void; // Function to handle form submission
  // Props needed for dropdowns/data fetching within the modal:
  users?: User[];
  staffMembers?: StaffMember[]; // Add staffMembers prop for assignees
  objectives?: Objective[]; // Changed from string[] to Objective[]
  units?: { id: string | number; name: string }[]; // Update units prop type
  existingKraTitles?: string[]; // Add prop for existing titles
  userContext?: { division: string; unit: string; name: string; email: string };
  editingKpi?: { kraId: string; kpi: Partial<Kpi> }; // New prop for single KPI editing
}

const KpiModal: React.FC<KpiModalProps> = ({
  isOpen,
  onClose,
  kraData,
  onSubmit,
  users = [],
  staffMembers = [], // Add default value
  objectives = [], // Provide default empty arrays
  units = [], // Provide default empty arrays
  existingKraTitles = [], // Add default value
  userContext,
  editingKpi,
}) => {
  // Initialize state based on whether we are editing or adding
  const [formData, setFormData] = useState<Partial<Kra>>({});
  const [kpiBlocks, setKpiBlocks] = useState<Partial<Kpi>[]>([]);

  // Determine if we are adding a new KRA
  const isAddingNew = !kraData?.id;

  // Effect to reset form when kraData changes (for edit) or modal opens for add
  useEffect(() => {
    console.log("[KpiModal useEffect] Running. isOpen:", isOpen, "isAddingNew:", isAddingNew);
    if (isOpen) {
      console.log("[KpiModal useEffect] Modal is open. Received kraData:", kraData);
      if (kraData && !isAddingNew) {
        // Editing existing KRA
        if (editingKpi) {
          // Case: Editing a SINGLE KPI
          console.log("[KpiModal useEffect] Editing SINGLE KPI mode.");
          setFormData({ ...kraData }); // Keep parent KRA data for context/saving
          setKpiBlocks([editingKpi.kpi]); // Only show the specific KPI being edited
        } else {
          // Case: Editing KRA and ALL KPIs
          console.log("[KpiModal useEffect] Editing FULL KRA mode.");
          setFormData({ ...kraData });
          // Ensure KPI blocks are initialized correctly
          const kpisToSet = kraData.unitKpis ? kraData.unitKpis.map(kpi => ({ ...kpi })) : [{}];
          setKpiBlocks(kpisToSet);
        }

      } else {
        // Adding new KRA - reset to defaults
        console.log("[KpiModal useEffect] Add mode. Resetting formData and kpiBlocks.");

        // Auto-fill Unit/Department from User Context
        const userUnitRaw = userContext?.unit || '';
        let defaultUnitName = '';
        let defaultUnitId = undefined;

        console.log(`[KpiModal] Auto-filling. Context Unit: "${userUnitRaw}". Available Units:`, units.map(u => u.name));

        if (userUnitRaw) {
          // 1. Try Exact Match
          let matchedUnit = units.find(u => u.name === userUnitRaw);

          // 2. Try Case-Insensitive Match
          if (!matchedUnit) {
            matchedUnit = units.find(u => u.name.toLowerCase() === userUnitRaw.toLowerCase());
          }

          // 3. Try Partial Match (e.g. "Information Technology" vs "IT Unit" - difficult without map)
          // But checking if context unit is contained in list unit or vice versa
          if (!matchedUnit) {
            matchedUnit = units.find(u => u.name.toLowerCase().includes(userUnitRaw.toLowerCase()) || userUnitRaw.toLowerCase().includes(u.name.toLowerCase()));
          }

          if (matchedUnit) {
            console.log(`[KpiModal] Found matching unit: "${matchedUnit.name}" for context "${userUnitRaw}"`);
            defaultUnitName = matchedUnit.name;
            defaultUnitId = String(matchedUnit.id);
          } else {
            // Fallback: Use the raw value, even if not in list (Select might support it or show as value)
            // Or better, leave empty to force user selection if ambiguous
            console.warn(`[KpiModal] No matching unit found for "${userUnitRaw}"`);
            defaultUnitName = userUnitRaw; // Try setting it anyway
          }
        }

        setFormData({
          title: '',
          objectiveId: undefined,
          unitId: defaultUnitId, // Set ID if found
          unit: defaultUnitName, // Set Name from context
          startDate: '',
          targetDate: '',
          description: '', // Reset description/comments
          status: 'pending' as KraStatus, // Use a valid KraStatus
          owner: undefined,
        });
        // Ensure default KPI block has assignees array
        setKpiBlocks([{ assignees: [] }]);
      }
    } else {
      // Reset form when modal closes
      setFormData({});
      setKpiBlocks([]);
    }
  }, [isOpen, kraData, isAddingNew, userContext, units]); // Add userContext and units to deps

  const handleKraChange = useCallback((field: keyof Kra, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleKpiChange = useCallback((index: number, field: keyof Kpi, value: any) => {
    setKpiBlocks(prev => {
      const updatedBlocks = [...prev];
      updatedBlocks[index] = { ...updatedBlocks[index], [field]: value };
      return updatedBlocks;
    });
  }, []);

  const handleAddKpi = () => {
    // Add a new empty KPI object with default assignees array
    setKpiBlocks(prev => [...prev, { tempId: `kpi_${Date.now()}`, assignees: [] }]);
  };

  const handleRemoveKpi = (index: number) => {
    // TODO: Add confirmation if the KPI block has existing data (e.g., an ID from the backend)
    setKpiBlocks(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (event?: React.FormEvent) => {
    event?.preventDefault();

    const finalKpiBlocks = kpiBlocks.filter(kpi => kpi.name).map(kpi => {
      const { tempId, ...rest } = kpi;
      return rest;
    });

    // Ensure unit (department name) is included in submission data
    const completeFormData = {
      ...formData,
      id: formData.id || kraData?.id || `kra_${Date.now()}`,
      kpis: finalKpiBlocks,
      unit: formData.unit, // Ensure unit (department name string) is submitted
      department: formData.unit, // Map unit to department as assumed by sharePointOpsService
      unitId: formData.unitId, // Keep unitId if still needed for other purposes
      title: formData.title || 'Untitled KRA',
      objectiveId: formData.objectiveId,
      startDate: formData.startDate || '',
      targetDate: formData.targetDate || '',
      status: formData.status || 'pending', // Use a valid KraStatus
      owner: formData.owner,
      description: formData.description, // Include description
    } as Partial<Kra>;

    console.log("Modal Submit:", completeFormData);
    onSubmit(completeFormData as Kra);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{editingKpi ? 'Edit KPI' : (kraData ? 'Edit KRA' : 'Add New KRA')}</DialogTitle>
          <DialogDescription>
            {editingKpi
              ? 'Update the details for this KPI.'
              : (kraData ? 'Update the details for this Key Result Area and its KPIs.' : 'Create a new Key Result Area with its associated KPIs.')}
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable middle section */}
        <div className="flex-1 overflow-y-auto pr-6 -mr-6 py-4">
          <div className="space-y-6">
            {/* Section 1: KRA Information - HIDE if editing single KPI */}
            {!editingKpi && (
              <>
                <KraFormSection
                  formData={formData}
                  onChange={handleKraChange}
                  users={users}
                  staffMembers={staffMembers}
                  objectives={objectives}
                  units={units}
                  existingKraTitles={existingKraTitles}
                  isAddingNew={isAddingNew}
                />
                <Separator />
              </>
            )}

            {/* Section 2: Repeatable KPI Blocks */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{editingKpi ? 'KPI Details' : 'KPIs'}</h3>
              {kpiBlocks.map((kpi, index) => (

                <KpiInputBlock
                  key={kpi.id || kpi.tempId || index}
                  kpiIndex={index}
                  formData={kpi}
                  onChange={(field, value) => handleKpiChange(index, field, value)}
                  onRemove={handleRemoveKpi}
                  isOnlyBlock={kpiBlocks.length === 1}
                  users={users}
                  staffMembers={staffMembers}
                />
              ))}
              {!editingKpi && (
                <Button type="button" variant="outline" size="sm" onClick={handleAddKpi} className="mt-2">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add KPI
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Footer remains fixed at the bottom */}
        <DialogFooter className="mt-auto pt-4 border-t">
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={() => handleSubmit()}>
            {isAddingNew ? 'Add KRA' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default KpiModal; 