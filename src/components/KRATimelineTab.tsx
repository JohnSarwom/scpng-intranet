import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { Kra, Kpi, Objective } from '@/types/kpi';

interface KRATimelineTabProps {
  kras: Kra[];
  objectives: Objective[];
}

const KRATimelineTab: React.FC<KRATimelineTabProps> = ({ kras, objectives }) => {
  const [currentViewMode, setCurrentViewMode] = useState<'quarters' | 'months' | 'weeks'>('quarters');

  // --- Preprocessing for Grouping --- 
  const firstObjectiveMap = new Map<string | number, string>();
  const firstKraTitleMap = new Map<string, string>(); // Key: objective_id-kraTitle
  const lastObjectiveMap = new Map<string | number, string>(); // To find the last KRA for an objective
  const lastKraTitleMap = new Map<string, string>(); // To find the last KRA for a title group

  kras.forEach(kra => {
    // Track first occurrence of each objective_id
    if (kra.objective_id && !firstObjectiveMap.has(kra.objective_id)) {
      firstObjectiveMap.set(kra.objective_id, kra.id as string);
    }
    // Track first occurrence of each KRA title *within* an objective
    const kraTitleKey = `${kra.objective_id}-${kra.title}`;
    if (kra.title && !firstKraTitleMap.has(kraTitleKey)) {
      firstKraTitleMap.set(kraTitleKey, kra.id as string);
    }
    // Track last KRA for each objective (will be overwritten until the last one)
    if (kra.objective_id) {
      lastObjectiveMap.set(kra.objective_id, kra.id as string);
    }
    // Track last KRA for each title group (will be overwritten)
    if (kra.title) { // Check if title exists
      lastKraTitleMap.set(kraTitleKey, kra.id as string);
    }
  });
  // --- End Preprocessing ---

  const quarters = ["Q1", "Q2", "Q3", "Q4"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const weeks = Array.from({ length: 52 }, (_, i) => `W${i + 1}`);

  const parseDate = (dateString: string | undefined): Date | null => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    } catch (e) {
      return null;
    }
  };

  const calculatePosition = (date: Date | null): number => {
    if (!date) return 0;
    const year = date.getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31);
    const totalDays = (endOfYear.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24);
    const daysFromStart = (date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.min(100, (daysFromStart / totalDays) * 100));
  };

  const calculateWidth = (startDate: Date | null, endDate: Date | null): number => {
    if (!startDate || !endDate || startDate >= endDate) return 0;
    const year = startDate.getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31);
    const totalDays = (endOfYear.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24);
    const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const width = (duration / totalDays) * 100;
    const startPosition = calculatePosition(startDate);
    return Math.max(0, Math.min(100 - startPosition, width));
  };

  const getKraProgress = (kpis: Kpi[]): number => {
    if (!kpis || kpis.length === 0) return 0;
    const totalTarget = kpis.reduce((sum, kpi) => sum + (Number(kpi.target) || 0), 0);
    if (totalTarget === 0) return 0;
    const totalActual = kpis.reduce((sum, kpi) => sum + (Number(kpi.actual) || 0), 0);
    const progress = Math.min(100, (totalActual / totalTarget) * 100);
    return Math.round(progress);
  };

  // Helper function to get KPI progress percentage
  const getKpiProgress = (kpi: Kpi): number => {
    if (kpi.status === 'completed') return 100;
    const target = Number(kpi.target);
    const actual = Number(kpi.actual);
    if (target === 0 || isNaN(target) || isNaN(actual) || actual === undefined || actual === null) return 0;
    const progress = Math.min(100, Math.max(0, (actual / target) * 100));
    return Math.round(progress);
  };

  // --- New Helper: Get Date Range from KPIs ---
  const getKpiDateRange = (kpis: Kpi[]): string => {
    if (!kpis || kpis.length === 0) return '';

    let minStartDate: Date | null = null;
    let maxTargetDate: Date | null = null;

    kpis.forEach(kpi => {
      const startDate = parseDate(kpi.start_date || kpi.startDate);
      const targetDate = parseDate(kpi.target_date || kpi.targetDate);

      if (startDate) {
        if (!minStartDate || startDate < minStartDate) {
          minStartDate = startDate;
        }
      }
      if (targetDate) {
        if (!maxTargetDate || targetDate > maxTargetDate) {
          maxTargetDate = targetDate;
        }
      }
    });

    const formatDate = (date: Date | null): string => {
      if (!date) return '?';
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    if (minStartDate || maxTargetDate) {
      return `${formatDate(minStartDate)} - ${formatDate(maxTargetDate)}`;
    }

    return '';
  };
  // --- End Helper ---

  const getProgressColorClass = (progress: number): string => {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 75) return "bg-green-400";
    if (progress >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  const getKpiStatusColorClass = (status: Kpi['status']): string => {
    switch (status) {
      case 'completed': return "bg-blue-500";
      case 'on-track': return "bg-green-500";
      case 'in-progress': return "bg-green-400";
      case 'at-risk': return "bg-amber-500";
      case 'on-hold': return "bg-gray-400";
      case 'not-started': return "bg-gray-200";
      case 'behind': return "bg-red-500";
      default: return "bg-gray-300";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* <img src="/images/scpng-logo.png" alt="SCPNG Logo" className="h-10 w-auto" /> */}
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
          <div className="timeline-view min-w-[1200px]">
            <div className="flex border-b border-gray-200 pb-2 sticky top-0 bg-background z-10">
              <div className="w-48 px-4 py-2 text-sm font-medium text-muted-foreground shrink-0">Objective</div>
              <div className="w-64 px-4 py-2 text-sm font-medium text-muted-foreground shrink-0">KRA Details</div>
              <div className="flex-1 flex">
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

            <div className="relative">
              {/* Vertical Grid Lines - Apply dashed style */}
              <div className="absolute top-0 left-[calc(12rem+16rem)] right-0 h-full flex pointer-events-none">
                {currentViewMode === 'quarters' && quarters.map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 border-r border-dashed border-gray-100 ${i < 3 ? 'border-r' : 'border-r-0'}`}
                  />
                ))}
                {currentViewMode === 'months' && months.map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 border-r border-dashed border-gray-200 ${i < 11 ? 'border-r' : 'border-r-0'}`}
                  />
                ))}
                {currentViewMode === 'weeks' && weeks.map((_, i) => (
                  <div
                    key={i}
                    className={`border-r border-dashed border-gray-100 ${i < 51 ? 'border-r' : 'border-r-0'}`}
                    style={{
                      width: '1.92%'
                    }}
                  />
                ))}
              </div>

              <div className="relative z-0">
                {kras.map((kra, kraIndex) => {
                  const kraStartDate = parseDate(kra.start_date || kra.startDate);
                  const kraTargetDate = parseDate(kra.target_date || kra.targetDate);
                  const kraProgress = getKraProgress(kra.unitKpis || []);
                  const kpisExist = kra.unitKpis && kra.unitKpis.length > 0;

                  // --- Grouping Checks ---
                  const isFirstForObjective = kra.objective_id ? firstObjectiveMap.get(kra.objective_id) === kra.id : false;
                  const kraTitleKey = `${kra.objective_id}-${kra.title}`;
                  const isFirstForKraTitle = kra.title ? firstKraTitleMap.get(kraTitleKey) === kra.id : false;
                  // Check if it's the last KRA for this objective
                  const isLastForObjective = kra.objective_id ? lastObjectiveMap.get(kra.objective_id) === kra.id : false;
                  // Check if it's the last KRA for this title group
                  const isLastForKraTitle = kra.title ? lastKraTitleMap.get(kraTitleKey) === kra.id : false;
                  // Calculate date range for the KRA based on its KPIs
                  const kraDateRange = getKpiDateRange(kra.unitKpis || []);
                  // --- End Grouping Checks ---

                  return (
                    <div key={kra.id} className="flex items-stretch hover:bg-gray-50/50 relative">
                      {/* Objective Column - Add border-r, conditional border-b */}
                      <div className={`w-48 px-4 py-3 shrink-0 flex flex-col border-r border-gray-200 ${isFirstForObjective ? 'border-t border-gray-200' : ''} ${isLastForObjective ? 'border-b border-gray-200' : ''}`}>
                        {isFirstForObjective && (
                          <span className="font-medium text-gray-900 block truncate text-sm mb-1">
                            {(() => {
                              // Find objective in the objectives array
                              const objective = objectives.find(o => String(o.id) === String(kra.objective_id));
                              // Return title if found, otherwise fallback
                              return objective?.title || (kra.objective_id ? `Obj ID: ${kra.objective_id}` : 'N/A');
                            })()}
                          </span>
                        )}
                        {/* Use a div with margin for spacing */}
                        <div className="mt-auto"></div>
                      </div>
                      {/* KRA Details Column - Re-add conditional border-b */}
                      <div className={`w-64 px-4 py-3 shrink-0 border-r border-gray-200 flex flex-col ${isFirstForKraTitle ? 'border-t border-gray-200' : ''} ${isLastForKraTitle ? 'border-b border-gray-200' : ''}`}>
                        {isFirstForKraTitle && (
                          <>
                            <div className="text-sm font-medium text-gray-900 block truncate">{kra.title}</div>
                            <div className="text-xs text-muted-foreground block truncate mt-0.5">{kra.unit || 'N/A'}</div>
                            {/* Display calculated date range */}
                            {kraDateRange && (
                              <div className="text-xs text-muted-foreground/80 block truncate mt-1">
                                {kraDateRange}
                              </div>
                            )}
                          </>
                        )}
                        {/* Use a div with margin for spacing */}
                        <div className="mt-auto"></div>
                      </div>
                      {/* Timeline Bars Column */}
                      <div
                        className={`flex-1 relative border-b border-gray-200 ${isFirstForObjective || isFirstForKraTitle ? 'border-t border-gray-200' : ''}`}
                        style={{ minHeight: kpisExist ? `${(kra.unitKpis.length * 2) + 1.5}rem` : '4rem' }}
                      >
                        {/* Container for KPI Bars - ensure z-index is not needed if background removed */}
                        <div className={`relative ${kpisExist ? 'py-3 h-full' : 'h-full'}`}> {/* Removed z-10 */}
                          {kra.unitKpis && kra.unitKpis.map((kpi, kpiIndex) => {
                            const kpiStartDate = parseDate(kpi.start_date || kpi.startDate);
                            const kpiTargetDate = parseDate(kpi.target_date || kpi.targetDate);
                            const kpiStartPosition = calculatePosition(kpiStartDate);
                            const kpiWidth = calculateWidth(kpiStartDate, kpiTargetDate);
                            const kpiColorClass = getKpiStatusColorClass(kpi.status);
                            const kpiProgress = getKpiProgress(kpi);

                            // Log values for debugging
                            console.log(`[Timeline KPI Debug] KRA: ${kra.title}, KPI: ${kpi.name}, Start: ${kpi.start_date || kpi.startDate}, ParsedStart: ${kpiStartDate}, Target: ${kpi.target_date || kpi.targetDate}, ParsedTarget: ${kpiTargetDate}, Width: ${kpiWidth}`);

                            if (!kpiStartDate || !kpiTargetDate || kpiWidth <= 0) {
                              // Log why it's not rendering
                              console.log(`  -> KPI bar skipped (Invalid Dates or Zero Width)`);
                              return <React.Fragment key={kpi.id || `kpi-${kraIndex}-${kpiIndex}-frag`}></React.Fragment>;
                            }

                            return (
                              <Tooltip key={kpi.id || `kpi-${kraIndex}-${kpiIndex}`} delayDuration={100}>
                                <TooltipTrigger asChild>
                                  {/* Outer div: Positions the bar */}
                                  <div
                                    className={`absolute h-5 rounded-full bg-gray-200 shadow-sm overflow-hidden`}
                                    style={{
                                      left: `${kpiStartPosition}%`,
                                      width: `${kpiWidth}%`,
                                      top: `${0.75 + kpiIndex * 2}rem`,
                                    }}
                                  >
                                    {/* Inner div: Shows progress */}
                                    <div
                                      className={`absolute top-0 left-0 h-full rounded-full ${kpiColorClass} transition-all duration-300`}
                                      style={{ width: `${kpiProgress}%` }}
                                    />
                                    {/* KPI Name Label */}
                                    <span className="absolute inset-0 flex items-center text-[11px] text-white font-medium px-2 truncate z-10">
                                      {kpi.name}
                                    </span>
                                  </div>
                                </TooltipTrigger>
                                {/* Wrap TooltipContent in a Portal */}
                                <TooltipPrimitive.Portal>
                                  <TooltipContent side="top" align="center" className="z-[100]">
                                    <p className="font-semibold">{kpi.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {kpi.start_date || kpi.startDate ? new Date(kpi.start_date || kpi.startDate).toLocaleDateString() : '?'} - {kpi.target_date || kpi.targetDate ? new Date(kpi.target_date || kpi.targetDate).toLocaleDateString() : '?'}
                                    </p>
                                    <p className="text-xs">Status: {kpi.status}</p>
                                    <p className="text-xs">Progress: {kpiProgress}%</p>
                                    {kpi.target !== undefined && <p className="text-xs">Target: {kpi.target}</p>}
                                    {kpi.actual !== undefined && <p className="text-xs">Actual: {kpi.actual}</p>}
                                  </TooltipContent>
                                </TooltipPrimitive.Portal>
                              </Tooltip>
                            );
                          })}
                        </div>
                        {/* "No KPIs" message (positioned separately) - ensure z-index is not needed if background removed */}
                        {!kpisExist && (
                          <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground px-4 text-center"> {/* Removed z-10 */}
                            No KPIs defined for this KRA.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {kras.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground">No KRAs to display.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-500">
          <div>{new Date().getFullYear()} Fiscal Year</div>
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
    </Card>
  );
};

export default KRATimelineTab; 