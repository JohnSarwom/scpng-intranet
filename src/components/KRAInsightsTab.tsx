import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Kra, Kpi, User } from '@/types/kpi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LabelList,
  LineChart,
  Line
} from 'recharts';
import { useTheme } from "next-themes";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Badge } from '@/components/ui/badge';

interface KRAInsightsTabProps {
  kras: Kra[];
}

const getKraProgress = (kpis: Kpi[]): number => {
  if (!kpis || kpis.length === 0) return 0;
  const totalTarget = kpis.reduce((sum, kpi) => sum + (Number(kpi.target) || 0), 0);
  if (totalTarget === 0) return 0;
  const totalActual = kpis.reduce((sum, kpi) => sum + (Number(kpi.actual) || 0), 0);
  const progress = Math.min(100, (totalActual / totalTarget) * 100);
  return Math.round(progress);
};

const getKraStatus = (kpis: Kpi[]): string => {
  if (!kpis || kpis.length === 0) return 'Not Started';
  if (kpis.some(kpi => kpi.status === 'at-risk')) return 'At Risk';
  if (kpis.some(kpi => kpi.status === 'behind')) return 'Behind';
  if (kpis.some(kpi => kpi.status === 'on-hold')) return 'On Hold';
  if (kpis.some(kpi => kpi.status === 'in-progress')) return 'In Progress';
  if (kpis.some(kpi => kpi.status === 'on-track')) return 'On Track';
  if (kpis.every(kpi => kpi.status === 'completed')) return 'Completed';
  return 'Not Started';
};

const themeColors = {
  primary: '#400010',
  secondary: '#600018',
  accent: '#E11D48',
  neutral: '#64748b',
  background: '#ffffff',
  foreground: '#0f172a'
};

const statusColors: Record<string, string> = {
  'Completed': themeColors.primary,
  'On Track': '#10b981',
  'In Progress': '#3b82f6',
  'Pending': themeColors.neutral,
  'Not Started': themeColors.neutral,
  'On Hold': '#f59e0b',
  'At Risk': themeColors.accent,
  'Behind': '#ef4444',
};

export const KRAInsightsTab: React.FC<KRAInsightsTabProps> = ({ kras }) => {
  const validKras = Array.isArray(kras) ? kras : [];
  const { theme } = useTheme();
  const { user } = useSupabaseAuth();

  console.log('[KRAInsightsTab] User:', JSON.stringify(user, null, 2));
  console.log('[KRAInsightsTab] Received kras data:', JSON.stringify(validKras, null, 2));

  const userOwnedKras = React.useMemo(() => {
    if (!user?.id) {
      console.log('[KRAInsightsTab] No user ID found for KRA filtering.');
      return [];
    }
    console.log(`[KRAInsightsTab] Filtering KRAs for owner ID: ${user.id}`);
    const filtered = validKras.filter(kra => {
      return kra.ownerId === user.id;
    });
    console.log('[KRAInsightsTab] Filtered userOwnedKras:', filtered);
    return filtered;
  }, [validKras, user?.id]);

  const userAssignedKpis = React.useMemo(() => {
    if (!user?.id) {
      console.log('[KRAInsightsTab] No user ID found for KPI filtering.');
      return [];
    }
    console.log(`[KRAInsightsTab] Filtering KPIs for assignee ID: ${user.id}`);
    const assignedKpis = validKras.flatMap(kra => kra.unitKpis || [])
      .filter(kpi => {
        const isAssigned = Array.isArray(kpi.assignees) && kpi.assignees.some(assignee => assignee?.email === user.email);
        return isAssigned;
      });
    console.log('[KRAInsightsTab] Filtered userAssignedKpis:', assignedKpis);
    return assignedKpis;
  }, [validKras, user?.id, user?.email]);

  // Get user's department's KRAs
  const departmentKras = React.useMemo(() => {
    if (!user?.user_metadata?.unitName) {
      return [];
    }

    const departmentName = user.user_metadata.unitName;
    return validKras.filter(kra => kra.unit === departmentName);
  }, [validKras, user?.user_metadata?.unitName]);

  const userKraStatusData = React.useMemo(() => {
    const statusCounts: Record<string, number> = {};
    userOwnedKras.forEach(kra => {
      const status = getKraStatus(kra.unitKpis || []);
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    console.log('[KRAInsightsTab] Calculated userKraStatusData:', statusCounts);
    return Object.entries(statusCounts)
      .map(([name, value]) => ({ name, value }))
      .filter(d => d.value > 0);
  }, [userOwnedKras]);

  const userKpiStatusData = React.useMemo(() => {
    const statusCounts: Record<string, number> = {};
    userAssignedKpis.forEach(kpi => {
      if (kpi?.status) {
        statusCounts[kpi.status] = (statusCounts[kpi.status] || 0) + 1;
      }
    });
    console.log('[KRAInsightsTab] Calculated userKpiStatusData:', statusCounts);
    return Object.entries(statusCounts)
      .map(([name, value]) => ({ name, value }))
      .filter(d => d.value > 0);
  }, [userAssignedKpis]);

  // Create trend data - completion by month
  const completionTrendData = React.useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();

    // Get last 6 months including current
    const relevantMonths = Array.from({ length: 6 }, (_, i) => {
      const monthIndex = (currentMonth - i + 12) % 12;
      return months[monthIndex];
    }).reverse();

    // Create baseline data with 0 completions for each month
    const baseData = relevantMonths.map(month => ({ month, completed: 0, total: 0 }));

    // Count KPIs and completed KPIs by month
    const allKpis = validKras.flatMap(kra => kra.unitKpis || []);

    allKpis.forEach(kpi => {
      if (kpi.target_date || kpi.targetDate) {
        const date = new Date(kpi.target_date || kpi.targetDate || '');
        if (!isNaN(date.getTime())) {
          const monthName = months[date.getMonth()];
          const monthIndex = relevantMonths.indexOf(monthName);

          if (monthIndex !== -1) {
            baseData[monthIndex].total++;
            if (kpi.status === 'completed') {
              baseData[monthIndex].completed++;
            }
          }
        }
      }
    });

    // Calculate completion percentage
    return baseData.map(item => ({
      ...item,
      percentage: item.total === 0 ? 0 : Math.round((item.completed / item.total) * 100)
    }));
  }, [validKras]);

  // KPI distribution by objective
  const kpisByObjective = React.useMemo(() => {
    const objectiveMap: Record<string, { total: number, completed: number, name: string }> = {};

    validKras.forEach(kra => {
      const objectiveId = kra.objective_id?.toString() || 'unknown';
      const objectiveName = kra.unitObjectives?.title || 'Unknown Objective';

      if (!objectiveMap[objectiveId]) {
        objectiveMap[objectiveId] = { total: 0, completed: 0, name: objectiveName };
      }

      const kpis = kra.unitKpis || [];
      objectiveMap[objectiveId].total += kpis.length;
      objectiveMap[objectiveId].completed += kpis.filter(kpi => kpi.status === 'completed').length;
    });

    return Object.values(objectiveMap)
      .filter(obj => obj.total > 0)
      .map(obj => ({
        name: obj.name,
        total: obj.total,
        completed: obj.completed,
        percentage: Math.round((obj.completed / obj.total) * 100)
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5); // Top 5 objectives by KPI count
  }, [validKras]);

  // Get priority KPIs that need attention
  const priorityKpis = React.useMemo(() => {
    return userAssignedKpis
      .filter(kpi => kpi.status === 'at-risk' || kpi.status === 'behind')
      .map(kpi => {
        // Find parent KRA for context
        const parentKra = validKras.find(kra =>
          kra.unitKpis?.some(k => k.id === kpi.id)
        );

        return {
          ...kpi,
          kraTitle: parentKra?.title || 'Unknown KRA',
          objective: parentKra?.unitObjectives?.title || 'Unknown Objective'
        };
      })
      .slice(0, 3); // Top 3 priority KPIs
  }, [userAssignedKpis, validKras]);

  const CustomTooltip = ({ active, payload, label, unit }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm text-sm">
          <p className="font-medium mb-1">{label || payload[0].name}</p>
          <p className="text-muted-foreground">
            <span style={{ color: payload[0].payload?.fill || payload[0].color }}>■</span> {payload[0].name}:
            <span className="font-bold ml-1">{payload[0].value}{unit || ''}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 mt-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Your KRA Status Overview</CardTitle>
            <CardDescription>Status distribution of KRAs you own</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {userKraStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomTooltip />} />
                    <Pie
                      data={userKraStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={110}
                      paddingAngle={2}
                      dataKey="value"
                      labelLine={false}
                    >
                      {userKraStatusData.map((entry) => (
                        <Cell key={`cell-kra-${entry.name}`} fill={statusColors[entry.name] || themeColors.neutral} stroke={themeColors.background} />
                      ))}
                    </Pie>
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      formatter={(value, entry) => <span style={{ color: themeColors.foreground }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">You do not own any KRAs.</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Your Assigned KPI Status</CardTitle>
            <CardDescription>Status distribution of KPIs assigned to you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {userKpiStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={userKpiStatusData}
                    margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                    barGap={4}
                    barSize={12}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={themeColors.neutral} strokeOpacity={0.3} />
                    <XAxis type="number" allowDecimals={false} stroke={themeColors.neutral} fontSize={12} />
                    <YAxis type="category" dataKey="name" width={80} stroke={themeColors.neutral} fontSize={12} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="value" name="KPIs" radius={[0, 4, 4, 0]}>
                      {userKpiStatusData.map((entry) => (
                        <Cell key={`cell-kpi-${entry.name}`} fill={statusColors[entry.name] || themeColors.neutral} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">No KPIs assigned to you.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New insights section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Trend Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Completion Trend</CardTitle>
            <CardDescription>KPI completion rate over last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {completionTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={completionTrendData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip unit="%" />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="percentage"
                      name="Completion %"
                      stroke={themeColors.primary}
                      strokeWidth={2}
                      dot={{ r: 5 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">No trend data available.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* KPI Distribution by Objective */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>KPI Distribution by Objective</CardTitle>
            <CardDescription>Top objectives by number of KPIs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {kpisByObjective.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={kpisByObjective}
                    margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval={0}
                      fontSize={11}
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="total" name="Total KPIs" fill={themeColors.neutral} />
                    <Bar dataKey="completed" name="Completed" fill={themeColors.primary} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">No objective data available.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority KPIs Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Priority KPIs Needing Attention</CardTitle>
          <CardDescription>KPIs assigned to you that are at risk or behind</CardDescription>
        </CardHeader>
        <CardContent>
          {priorityKpis.length > 0 ? (
            <div className="space-y-4">
              {priorityKpis.map((kpi) => (
                <div key={kpi.id} className="border rounded-md p-4 bg-muted/20">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium mb-1">{kpi.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {kpi.kraTitle} • {kpi.objective}
                      </p>
                    </div>
                    <Badge variant={kpi.status === 'at-risk' ? 'destructive' : 'default'}>
                      {kpi.status === 'at-risk' ? 'At Risk' : 'Behind'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Target</p>
                      <p className="font-medium">{kpi.target}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Actual</p>
                      <p className="font-medium">{kpi.actual || 0}</p>
                    </div>
                    {(kpi.target_date || kpi.targetDate) && (
                      <div>
                        <p className="text-muted-foreground">Target Date</p>
                        <p className="font-medium">
                          {new Date(kpi.target_date || kpi.targetDate || '').toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No priority KPIs to show. Great job!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default KRAInsightsTab;