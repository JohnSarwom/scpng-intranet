import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface KPI {
  id: string;
  name: string;
  date?: Date;
  endDate?: Date;
  target: string | number;
  actual: string | number;
  status?: string;
  description?: string;
  notes?: string;
  unit?: string;
  frequency?: string;
}

interface KRA {
  id: string;
  name: string;
  objectiveId: string;
  objectiveName: string;
  department: string;
  responsible: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  status: 'open' | 'in-progress' | 'closed';
  kpis: KPI[];
  createdAt: string;
  updatedAt: string;
}

interface KRATimelineProps {
  kras: KRA[];
}

const KRATimeline: React.FC<KRATimelineProps> = ({ kras }) => {
  const [currentViewMode, setCurrentViewMode] = useState<'quarters' | 'months' | 'weeks'>('quarters');
  const [selectedKPI, setSelectedKPI] = useState<KPI | null>(null);

  const quarters = ["Q1", "Q2", "Q3", "Q4"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const weeks = Array.from({ length: 52 }, (_, i) => `W${i + 1}`);

  // Helper functions
  const calculatePosition = (date: Date, viewMode: 'quarters' | 'months' | 'weeks') => {
    const year = date.getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31);
    const totalDaysInYear = (endOfYear.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24) + 1; // +1 to include end date

    const dayOfYear = (date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24);

    switch (viewMode) {
      case 'quarters':
        // Find quarter (0-3)
        const quarter = Math.floor(date.getMonth() / 3);
        // Position within the quarter (approximate)
        const startOfQuarter = new Date(year, quarter * 3, 1);
        const endOfQuarter = new Date(year, quarter * 3 + 3, 0); // Last day of the quarter
        const daysInQuarter = (endOfQuarter.getTime() - startOfQuarter.getTime()) / (1000 * 60 * 60 * 24) + 1;
        const daysFromQuarterStart = (date.getTime() - startOfQuarter.getTime()) / (1000 * 60 * 60 * 24);
        const quarterOffset = quarter * 25; // Each quarter is 25% width
        return Math.max(0, Math.min(100, quarterOffset + (daysFromQuarterStart / daysInQuarter) * 25));
      case 'months':
        const month = date.getMonth(); // 0-11
        const monthOffset = (month / 12) * 100;
        // Position within the month (approximate)
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0);
        const daysInMonth = endOfMonth.getDate();
        const dayOfMonth = date.getDate();
        return Math.max(0, Math.min(100, monthOffset + ((dayOfMonth -1) / daysInMonth) * (100/12) ));
      case 'weeks':
        // Calculate the week number (ISO 8601 style might be better if needed)
        const weekNumber = Math.ceil((dayOfYear + startOfYear.getDay() + 1) / 7);
        return Math.max(0, Math.min(100, ((weekNumber - 1) / 52) * 100)); // Approximate position
      default:
        return Math.max(0, Math.min(100, (dayOfYear / totalDaysInYear) * 100));
    }
  };

  const calculateWidth = (startDate: Date, endDate: Date | undefined, viewMode: 'quarters' | 'months' | 'weeks') => {
    // If no end date, assume it's a point-in-time event (small width)
    if (!endDate || startDate.getTime() === endDate.getTime()) {
       // Represent point-in-time KPIs with a small, fixed width marker
       return 2; // e.g., 2% width, adjust as needed for visibility
    }

    const startPos = calculatePosition(startDate, viewMode);
    const endPos = calculatePosition(endDate, viewMode);
    let width = endPos - startPos;

    // Ensure a minimum width for visibility if dates are very close
    if (width < 2 && width > 0) {
        width = 2;
    }
    // Handle cases where width might be negative (e.g., across year boundary, though less likely with current view)
     if (width <= 0) {
         return 2; // Fallback minimum width
     }

    return Math.max(2, Math.min(100 - startPos, width));
  };

  const getStatusColorClass = (status: string) => {
    switch(status) {
      case "In Progress": return "bg-amber-100 text-amber-800";
      case "Open": return "bg-blue-100 text-blue-800";
      case "Closed": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getProgressColorClass = (progress: number) => {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 75) return "bg-green-400";
    if (progress >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  const getKpiStatusColor = (status: string | undefined) => {
    switch(status?.toLowerCase()) {
      case "completed": return "#10b981";
      case "on track": return "#3b82f6";
      case "at risk": return "#f59e0b";
      case "behind": return "#ef4444";
      case "not started": return "#9ca3af";
      default: return "#6b7280";
    }
  };

  const mockKRAs: KRA[] = [
    {
      id: '1',
      name: 'Increase Market Share',
      objectiveId: '1',
      objectiveName: 'Market Expansion',
      department: 'Sales',
      responsible: 'John Doe',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      progress: 75,
      status: 'in-progress',
      kpis: [
        {
          id: '1',
          name: 'Market Share Percentage',
          target: 25,
          actual: 18,
          unit: '%',
          frequency: 'Monthly'
        },
        {
          id: '2',
          name: 'New Customer Acquisition',
          target: 1000,
          actual: 750,
          unit: 'customers',
          frequency: 'Quarterly'
        }
      ],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-03-15T00:00:00Z'
    },
    {
      id: '2',
      name: 'Improve Customer Satisfaction',
      objectiveId: '2',
      objectiveName: 'Customer Experience',
      department: 'Customer Service',
      responsible: 'Jane Smith',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-12-31'),
      progress: 60,
      status: 'in-progress',
      kpis: [
        {
          id: '3',
          name: 'Customer Satisfaction Score',
          target: 90,
          actual: 85,
          unit: 'points',
          frequency: 'Monthly'
        },
        {
          id: '4',
          name: 'Response Time',
          target: 2,
          actual: 2.5,
          unit: 'hours',
          frequency: 'Daily'
        }
      ],
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: '2024-03-15T00:00:00Z'
    }
  ];

  // MOCK DATA ADJUSTMENT: Add specific dates and statuses to KPIs
  // In a real app, this data would come from the API/props
  const mockKRAsWithDetails: KRA[] = mockKRAs.map((kra, index) => ({
      ...kra,
      objectiveName: kra.objectiveName || `Objective ${index + 1}`, // Ensure objectiveName exists
      kpis: kra.kpis.map((kpi, kpiIndex) => {
          // Assign mock dates and statuses for demonstration
          const baseDate = new Date(kra.startDate);
          const kpiDate = new Date(baseDate.setDate(baseDate.getDate() + kpiIndex * 45 + index * 15)); // Stagger dates
          let status = "Not Started";
          const today = new Date();
          if (kpiDate < today) status = kpiIndex % 3 === 0 ? "Completed" : "Behind";
          if (kpiDate >= today && kpiDate < new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)) status = kpiIndex % 2 === 0 ? "On Track" : "At Risk";

          return {
              ...kpi,
              date: kpiDate, // Assign a specific date
              endDate: kpiIndex % 2 === 0 ? undefined : new Date(kpiDate.getTime() + 30 * 24 * 60 * 60 * 1000), // Some KPIs might have duration
              status: status,
              description: kpi.description || `Details for KPI ${kpi.name}`,
              notes: kpi.notes || `Notes for KPI ${kpi.name}`
          };
      })
  }));

  // Use the augmented mock data or the props data
  const krasToDisplay = kras.length > 0 ? kras.map(kra => ({
      ...kra,
      kpis: kra.kpis?.map(kpi => ({ // Add optional chaining for safety
          ...kpi,
          date: kpi.date ? new Date(kpi.date) : new Date(), // Ensure date is a Date object
          endDate: kpi.endDate ? new Date(kpi.endDate) : undefined, // Ensure endDate is Date or undefined
      })) || [] // Ensure kpis is always an array
   })) : mockKRAsWithDetails;

  // Group KRAs by objectiveName
  const groupedKras = krasToDisplay.reduce((acc, kra) => {
    const objective = kra.objectiveName || 'Uncategorized';
    if (!acc[objective]) {
      acc[objective] = [];
    }
    acc[objective].push(kra);
    return acc;
  }, {} as Record<string, KRA[]>);

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <img src="/images/scpng-logo.png" alt="SCPNG Logo" className="h-10 w-auto" />
              <CardTitle>Key Result Areas Timeline</CardTitle>
            </div>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={currentViewMode === 'quarters' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentViewMode('quarters')}
                className="px-4"
              >
                Quarterly
              </Button>
              <Button
                variant={currentViewMode === 'months' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentViewMode('months')}
                className="px-4"
              >
                Monthly
              </Button>
              <Button
                variant={currentViewMode === 'weeks' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentViewMode('weeks')}
                className="px-4"
              >
                Weekly
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 overflow-x-auto">
            <div className="timeline-view">
              {/* Timeline header */}
              <div className="flex border-b border-gray-200 pb-2 sticky top-0 bg-white z-30">
                <div className="w-72 px-4 py-2 text-sm font-medium text-gray-700 sticky left-0 bg-white z-30">KRA Details</div>
                <div className="flex-1 flex pl-2">
                  {currentViewMode === 'quarters' && quarters.map(quarter => (
                    <div key={quarter} className="flex-1 text-center text-sm font-medium text-gray-700">
                      {quarter}
                    </div>
                  ))}
                  {currentViewMode === 'months' && months.map(month => (
                    <div key={month} className="flex-1 text-center text-xs font-medium text-gray-700">
                      {month}
                    </div>
                  ))}
                  {currentViewMode === 'weeks' && (
                    <div className="flex w-full">
                      {weeks.map((week, i) => (
                        <div
                          key={week}
                          className="text-center text-xs font-medium text-gray-600"
                          style={{ width: '1.92%' }}
                        >
                          {i % 4 === 0 ? week : ''}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline grid */}
              <div className="relative">
                {/* Background Grid Lines */}
                <div className="absolute top-0 left-72 right-0 h-full flex z-0">
                   {currentViewMode === 'quarters' && quarters.map((_, i) => (
                     <div
                       key={`q-line-${i}`}
                       className="absolute top-0 bottom-0 border-r border-dashed border-gray-200"
                       style={{
                         left: `${(i + 1) * 25}%`,
                         width: '1px',
                         display: i < 3 ? 'block' : 'none'
                       }}
                     />
                   ))}
                   {currentViewMode === 'months' && months.map((_, i) => (
                     <div
                       key={`m-line-${i}`}
                       className="absolute top-0 bottom-0 border-r border-dashed border-gray-200"
                       style={{
                         left: `${((i + 1) * 100) / 12}%`,
                         width: '1px',
                         display: i < 11 ? 'block' : 'none'
                       }}
                     />
                   ))}
                   {currentViewMode === 'weeks' && weeks.map((_, i) => (
                     <div
                        key={`w-line-${i}`}
                        className="absolute top-0 bottom-0 border-r border-dashed border-gray-200"
                        style={{
                          left: `${((i + 1) / 52) * 100}%`,
                          width: '1px',
                          display: i < 51 && (i+1) % 4 === 0 ? 'block' : 'none'
                        }}
                      />
                   ))}
                </div>

                {/* KRA Rows - Grouped by Objective */}
                {Object.entries(groupedKras).map(([objectiveName, krasInGroup], groupIndex) => (
                  <React.Fragment key={objectiveName}>
                    {krasInGroup.map((kra, kraIndex) => (
                      <div
                        key={kra.id || `${objectiveName}-${kraIndex}`}
                        className={`flex border-b border-gray-200 relative min-h-[60px] ${kraIndex === 0 ? 'border-t-2 border-gray-300' : ''}`}
                      >
                        <div className="w-72 px-4 py-2 border-r border-gray-200 sticky left-0 bg-white z-20 flex flex-col justify-center">
                          {kraIndex === 0 && (
                            <div className="text-xs font-semibold text-gray-500 uppercase mb-1">{objectiveName}</div>
                          )}
                          <div className="text-sm font-semibold text-gray-900">{kra.name}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {/* Conditionally render dates and separator */}
                            {kra.startDate?.toLocaleDateString()}
                            {kra.startDate && kra.endDate && ' - '}
                            {kra.endDate?.toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex-1 flex relative items-center px-2 py-2">
                           {kra.kpis && kra.kpis.map((kpi) => {
                               const kpiPosition = calculatePosition(kpi.date, currentViewMode);
                               const kpiWidth = calculateWidth(kpi.date, kpi.endDate, currentViewMode);
                               const kpiColor = getKpiStatusColor(kpi.status);

                               return (
                                 <Tooltip key={kpi.id}>
                                   <TooltipTrigger asChild>
                                     <div
                                       className="absolute h-4 rounded text-white text-[10px] flex items-center justify-center overflow-hidden whitespace-nowrap px-1 cursor-pointer z-10"
                                       style={{
                                         left: `${kpiPosition}%`,
                                         width: `${kpiWidth}%`,
                                         backgroundColor: kpiColor,
                                         top: '50%',
                                         transform: 'translateY(-50%)'
                                       }}
                                       onClick={() => setSelectedKPI(kpi)}
                                     >
                                       <span className="truncate">{kpi.name}</span>
                                     </div>
                                   </TooltipTrigger>
                                   <TooltipContent>
                                     <p>{kpi.name} ({kpi.status})</p>
                                     <p>Date: {kpi.date?.toLocaleDateString() || 'N/A'}</p>
                                     {kpi.endDate && <p>End: {kpi.endDate.toLocaleDateString()}</p>}
                                   </TooltipContent>
                                 </Tooltip>
                               );
                           })}
                        </div>
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center text-sm text-gray-500">
            <div>2023 Fiscal Year</div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>On Track (75-100%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span>At Risk (50-74%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span>Behind (&lt;50%)</span>
              </div>
            </div>
          </div>
        </CardContent>

        {selectedKPI && (
            <Dialog open={!!selectedKPI} onOpenChange={() => setSelectedKPI(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>KPI Details: {selectedKPI.name}</DialogTitle>
                    </DialogHeader>
                    <div className="text-sm space-y-2">
                        <p><strong>Status:</strong> <span style={{ color: getKpiStatusColor(selectedKPI.status) }}>{selectedKPI.status || 'N/A'}</span></p>
                        <p><strong>Date:</strong> {selectedKPI.date?.toLocaleDateString() || 'N/A'}</p>
                        {selectedKPI.endDate && <p><strong>End Date:</strong> {selectedKPI.endDate.toLocaleDateString()}</p>}
                        <p><strong>Target:</strong> {selectedKPI.target !== undefined ? String(selectedKPI.target) : 'N/A'} {selectedKPI.unit || ''}</p>
                        <p><strong>Actual:</strong> {selectedKPI.actual !== undefined ? String(selectedKPI.actual) : 'N/A'} {selectedKPI.unit || ''}</p>
                        <p><strong>Description:</strong> {selectedKPI.description || 'No description available.'}</p>
                        <p><strong>Notes:</strong> {selectedKPI.notes || 'No notes available.'}</p>
                    </div>
                </DialogContent>
            </Dialog>
        )}
      </Card>
    </TooltipProvider>
  );
};

export default KRATimeline; 