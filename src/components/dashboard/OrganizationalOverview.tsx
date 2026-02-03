
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Target, Compass, Flag, BarChart2, Shield, TrendingUp, Award, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

import { useStrategySharePoint } from '@/hooks/useStrategySharePoint';
import { Loader2 } from 'lucide-react';
import { StrategicItem } from '@/mockData/strategyData';

const OrganizationalOverview = () => {
  const { strategyData, isLoading } = useStrategySharePoint();

  // SCPNG 2025 Strategic Work Plan Data
  const orgMission = "To reform and regulate the capital markets ensuring they remain fair, efficient, and transparent, while protecting investors and reducing systemic risk through active enforcement and modernization.";

  const orgVision = "To ensure Port Moresby becomes the Financial Capital of the Blue Pacific by 2040, providing a secure and dynamic alternative for capital raising in the region.";

  const strategicPillars = [
    { name: "Protect", color: "text-intranet-primary", bg: "bg-intranet-primary/5", icon: Shield, desc: "Safeguarding investors" },
    { name: "Develop", color: "text-intranet-primary", bg: "bg-intranet-primary/5", icon: TrendingUp, desc: "Capital formation" },
    { name: "Regulate", color: "text-intranet-primary", bg: "bg-intranet-primary/5", icon: Award, desc: "Rule of law" },
    { name: "Mitigate", color: "text-intranet-primary", bg: "bg-intranet-primary/5", icon: Zap, desc: "Systemic risks" }
  ];

  // Use dynamic objectives or empty array if loading/undefined
  const objectives = strategyData?.objectives || [];

  return (
    <Card className="bg-gradient-to-br from-card to-muted/80 shadow-md animate-fade-in rounded-xl flex-1 h-full border-none">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xl font-bold">
          <Compass className="h-5 w-5 text-intranet-primary" />
          Organizational Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5 mb-1.5 text-intranet-primary uppercase tracking-wider">
                  <Flag className="h-4 w-4" />
                  Our Mission
                </h3>
                <p className="text-[11px] leading-relaxed text-gray-600 dark:text-gray-300 italic font-medium">"{orgMission}"</p>
              </div>

              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5 mb-1.5 text-intranet-primary uppercase tracking-wider">
                  <Target className="h-4 w-4" />
                  Our Vision
                </h3>
                <p className="text-[11px] leading-relaxed text-gray-600 dark:text-gray-300 italic font-medium">"{orgVision}"</p>
              </div>
            </div>

            {/* Strategic Pillars 2x2 Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {strategicPillars.map((pillar, idx) => (
                <div key={idx} className={`p-3 rounded-xl border border-gray-100 dark:border-gray-800 ${pillar.bg} flex flex-col gap-1.5 group hover:shadow-sm transition-all`}>
                  <div className={`p-1.5 rounded-lg bg-intranet-primary/10 w-fit ${pillar.color}`}>
                    <pillar.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-tight leading-none">{pillar.name}</div>
                    <div className="text-[9px] text-muted-foreground font-medium opacity-70 mt-0.5">{pillar.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col h-full space-y-6">
            <div className="flex flex-col flex-1">
              <h3 className="text-sm font-bold flex items-center gap-1.5 mb-3 text-intranet-primary uppercase tracking-wider shrink-0">
                <Target className="h-4 w-4" />
                Strategic Objectives
              </h3>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center flex-1 p-8 space-y-2">
                  <Loader2 className="h-5 w-5 text-intranet-primary animate-spin" />
                  <p className="text-[10px] text-muted-foreground">Loading objectives...</p>
                </div>
              ) : (
                <div className="flex flex-col justify-between flex-1 gap-4 min-h-[280px]">
                  {objectives.slice(0, 5).map((objective: StrategicItem, index: number) => (
                    <div key={objective.id || index} className="space-y-2">
                      <div className="flex justify-between text-[11px] font-semibold">
                        <span className="flex-1 mr-2 text-gray-700 dark:text-gray-200 line-clamp-1">{objective.title}</span>
                        <span className="text-intranet-primary">{objective.progress}%</span>
                      </div>
                      <Progress value={objective.progress} className="h-2" />
                    </div>
                  ))}
                  {objectives.length === 0 && (
                    <p className="text-[11px] italic text-muted-foreground">No strategic objectives found.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrganizationalOverview;
