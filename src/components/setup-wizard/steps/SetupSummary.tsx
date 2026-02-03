import React from 'react';
import { Card } from '@/components/ui/card';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface SetupSummaryProps {
  oneDriveConfig: {
    folderId: string;
    folderName: string;
  } | null;
  objectives: any[];
  kras: any[];
  kpis: any[];
  onComplete: () => void;
  onBack: () => void;
}

export const SetupSummary: React.FC<SetupSummaryProps> = ({
  oneDriveConfig,
  objectives,
  kras,
  kpis,
  // We'll still keep these props but won't use them directly
  onComplete,
  onBack,
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Review Setup</h3>
        <p className="text-sm text-muted-foreground">
          Review your configuration before finalizing
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {/* OneDrive Configuration */}
          <div className="space-y-2">
            <h4 className="font-medium">OneDrive Configuration</h4>
            {oneDriveConfig ? (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>Using folder: {oneDriveConfig.folderName}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-yellow-600">
                <AlertCircle className="h-4 w-4" />
                <span>No folder selected</span>
              </div>
            )}
          </div>

          {/* Objectives */}
          <div className="space-y-2">
            <h4 className="font-medium">Objectives</h4>
            {objectives && objectives.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{objectives.length} objectives configured</span>
                </div>
                <ul className="list-disc pl-5 space-y-1">
                  {objectives.map((objective, index) => (
                    <li key={index} className="text-sm">
                      {objective.name || `Objective ${index + 1}`}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-yellow-600">
                <AlertCircle className="h-4 w-4" />
                <span>No objectives configured</span>
              </div>
            )}
          </div>

          {/* KRAs */}
          <div className="space-y-2">
            <h4 className="font-medium">Key Result Areas (KRAs)</h4>
            {kras && kras.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{kras.length} KRAs configured</span>
                </div>
                <ul className="list-disc pl-5 space-y-1">
                  {kras.map((kra, index) => (
                    <li key={index} className="text-sm">
                      {kra.name || `KRA ${index + 1}`}
                      {kra.objectiveName && (
                        <span className="text-gray-500 text-xs ml-2">
                          (Linked to: {kra.objectiveName})
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-yellow-600">
                <AlertCircle className="h-4 w-4" />
                <span>No KRAs configured</span>
              </div>
            )}
          </div>

          {/* KPIs */}
          <div className="space-y-2">
            <h4 className="font-medium">Key Performance Indicators (KPIs)</h4>
            {kpis && kpis.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{kpis.length} KPIs configured</span>
                </div>
                <ul className="list-disc pl-5 space-y-1">
                  {kpis.map((kpi, index) => (
                    <li key={index} className="text-sm">
                      {kpi.name || `KPI ${index + 1}`}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-yellow-600">
                <AlertCircle className="h-4 w-4" />
                <span>No KPIs configured</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Remove the buttons - they're duplicated in the parent wizard */}
    </div>
  );
}; 