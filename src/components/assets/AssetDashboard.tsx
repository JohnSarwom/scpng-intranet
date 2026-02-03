import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowUpRight, ArrowDownRight, Bell, LayoutList, ChevronRight, ChevronUp, Loader2 } from "lucide-react";
import { formatCurrency, cn, formatDate, formatRelativeTime } from "@/lib/utils";
import { supabase } from '@/lib/supabaseClient'; // Assuming supabase client is here
import { RealtimeChannel } from '@supabase/supabase-js';
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar
} from 'recharts'; // Import recharts components and PieChart components

// Define an interface for the summary data
interface DashboardSummary {
  total_purchase_cost: number | null;
  total_active_assets: number | null;
  total_distinct_active_types: number | null;
  total_depreciated_value: number | null;
  total_recent_purchase_cost: number | null;
  total_recent_assets: number | null;
  total_recent_distinct_types: number | null;
}

// Define an interface for the time series data point
interface TimeSeriesDataPoint {
  report_date: string; // Assuming YYYY-MM-DD format from the view
  cumulative_purchase_cost: number;
}

// Define interface for depreciation breakdown data
interface DepreciationByTypeDataPoint {
  asset_type: string;
  total_depreciated_value_for_type: number;
}

// Define interface for monthly acquisition cost data
interface MonthlyAcquisitionDataPoint {
  month: string; // e.g., 'Jan', 'Feb', 'Mar', etc.
  total_acquisition: number | null;
}

interface RecentlyAssignedAsset {
  id: number;
  name: string | null;
  image_url: string | null;
  assigned_date: string | null; // Comes as date string
  assigned_to: string | null;
}

interface RecentlyDamagedAsset {
  id: number;
  name: string | null;
  image_url: string | null;
  last_updated: string | null; // Comes as timestamp string
  assigned_to: string | null;
}

export function AssetDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesDataPoint[]>([]); // State for chart data
  const [depreciationByTypeData, setDepreciationByTypeData] = useState<DepreciationByTypeDataPoint[]>([]); // State for donut chart data
  const [monthlyAcquisitionData, setMonthlyAcquisitionData] = useState<MonthlyAcquisitionDataPoint[]>([]); // State for bar chart
  const [recentlyAssignedAssets, setRecentlyAssignedAssets] = useState<RecentlyAssignedAsset[]>([]);
  const [recentlyDamagedAssets, setRecentlyDamagedAssets] = useState<RecentlyDamagedAsset[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingChart, setLoadingChart] = useState<boolean>(true); // Separate loading for chart
  const [loadingDonut, setLoadingDonut] = useState<boolean>(true); // Separate loading for donut
  const [loadingMonthlyAcquisitionChart, setLoadingMonthlyAcquisitionChart] = useState<boolean>(true); // Separate loading for bar chart
  const [loadingAssigned, setLoadingAssigned] = useState<boolean>(true);
  const [loadingDamaged, setLoadingDamaged] = useState<boolean>(true);
  const [monthlyAcquisitionChartError, setMonthlyAcquisitionChartError] = useState<string | null>(null); // Specific error for bar chart
  const [assignedError, setAssignedError] = useState<string | null>(null);
  const [damagedError, setDamagedError] = useState<string | null>(null);

  const fetchSummary = async () => {
    setLoading(true);
    console.log("Fetching summary data...");
    try {
      const { data, error: viewError } = await supabase
        .from('dashboard_total_value_summary')
        .select('*')
        .single(); // Use .single() as the view should return only one row

      if (viewError) {
        throw viewError;
      }

      if (data) {
        console.log("Summary data fetched:", data);
        setSummary(data);
      } else {
        console.log("No summary data found.");
        setSummary({
          total_purchase_cost: 0,
          total_active_assets: 0,
          total_distinct_active_types: 0,
          total_depreciated_value: 0,
          total_recent_purchase_cost: 0,
          total_recent_assets: 0,
          total_recent_distinct_types: 0
        });
      }
      setError(null);
    } catch (err: any) {
      console.error("Error fetching dashboard summary:", err);
      setError(err.message || "Failed to fetch summary data.");
      setSummary(null); // Clear summary on error
    } finally {
      setLoading(false);
    }
  };

  // New function to fetch time series data
  const fetchTimeSeriesData = async () => {
    setLoadingChart(true);
    console.log("Fetching time series data...");
    try {
      const { data, error: seriesError } = await supabase
        .from('dashboard_daily_value_timeseries')
        .select('report_date, cumulative_purchase_cost')
        .order('report_date', { ascending: true });

      if (seriesError) throw seriesError;

      if (data) {
        console.log("Time series data fetched:", data.length, "points");
        setTimeSeriesData(data);
      } else {
        console.log("No time series data found.");
        setTimeSeriesData([]);
      }
      // Don't reset main error here
    } catch (err: any) {
      console.error("Error fetching time series data:", err);
      setError(prev => prev || err.message || "Failed to fetch time series data."); // Keep existing error if any
      setTimeSeriesData([]);
    } finally {
      // Only set chart loading false when both fetches are potentially done (handled in useEffect)
    }
  };

  // New function to fetch depreciation breakdown data
  const fetchDepreciationData = async () => {
    setLoadingDonut(true);
    console.log("Fetching depreciation by type data...");
    try {
      const { data, error: donutError } = await supabase
        .from('dashboard_depreciation_by_type')
        .select('asset_type, total_depreciated_value_for_type')
        .order('total_depreciated_value_for_type', { ascending: false });

      if (donutError) throw donutError;

      if (data) {
        console.log("Depreciation data fetched:", data.length, "types");
        setDepreciationByTypeData(data);
      } else {
        console.log("No depreciation data found.");
        setDepreciationByTypeData([]);
      }
    } catch (err: any) {
      console.error("Error fetching depreciation data:", err);
      setError(prev => prev || err.message || "Failed to fetch depreciation data.");
      setDepreciationByTypeData([]);
    } finally {
      // Loading state handled in fetchAllData
    }
  };

  // Renamed function to fetch monthly acquisition data
  const fetchMonthlyAcquisitionData = async () => {
    setLoadingMonthlyAcquisitionChart(true);
    setMonthlyAcquisitionChartError(null); // Clear previous error
    console.log("Fetching monthly acquisition cost data...");
    try {
      // Fetch from the new Supabase view for the current year
      const { data, error: acquisitionError } = await supabase
        .from('dashboard_monthly_acquisition_cost') // Query the new view
        .select('month, total_acquisition')
        .order('month', { ascending: true }); // Ensure correct month order (Jan -> Dec relies on the view's ORDER BY)

      if (acquisitionError) {
        throw acquisitionError;
      }

      console.log("Monthly acquisition cost data fetched:", data?.length ?? 0, "points");
      setMonthlyAcquisitionData(data || []); // Set state with fetched data or empty array

    } catch (err: any) {
      console.error("Error fetching monthly acquisition cost data:", err);
      setMonthlyAcquisitionChartError(err.message || "Failed to fetch monthly acquisition data."); // Set specific error
      setMonthlyAcquisitionData([]);
    } finally {
      // Loading state is handled in fetchAllData
    }
  };

  const fetchRecentlyAssignedAssets = async () => {
    setLoadingAssigned(true);
    setAssignedError(null);
    console.log("Fetching recently assigned assets...");
    try {
      const { data, error: assignedFetchError } = await supabase
        .from('dashboard_recently_assigned_assets')
        .select('id, name, image_url, assigned_date, assigned_to');

      if (assignedFetchError) throw assignedFetchError;
      console.log("Recently assigned assets fetched:", data?.length ?? 0);
      setRecentlyAssignedAssets(data || []);
    } catch (err: any) {
      console.error("Error fetching recently assigned assets:", err);
      setAssignedError(err.message || "Failed to fetch assigned assets.");
      setRecentlyAssignedAssets([]);
    } finally {
      // setLoadingAssigned(false); // Handled in fetchAllData
    }
  };

  const fetchRecentlyDamagedAssets = async () => {
    setLoadingDamaged(true);
    setDamagedError(null);
    console.log("Fetching recently damaged assets...");
    try {
      const { data, error: damagedFetchError } = await supabase
        .from('dashboard_recently_damaged_assets')
        .select('id, name, image_url, last_updated, assigned_to');

      if (damagedFetchError) throw damagedFetchError;
      console.log("Recently damaged assets fetched:", data?.length ?? 0);
      setRecentlyDamagedAssets(data || []);
    } catch (err: any) {
      console.error("Error fetching recently damaged assets:", err);
      setDamagedError(err.message || "Failed to fetch damaged assets.");
      setRecentlyDamagedAssets([]);
    } finally {
      // setLoadingDamaged(false); // Handled in fetchAllData
    }
  };

  // Combined fetch function
  const fetchAllData = async () => {
    setLoading(true);
    setLoadingChart(true);
    setLoadingDonut(true);
    setLoadingMonthlyAcquisitionChart(true);
    setLoadingAssigned(true);
    setLoadingDamaged(true);

    setError(null);
    setMonthlyAcquisitionChartError(null);
    setAssignedError(null);
    setDamagedError(null);

    try {
      await Promise.all([
        fetchSummary(),
        fetchTimeSeriesData(),
        fetchDepreciationData(),
        fetchMonthlyAcquisitionData(),
        fetchRecentlyAssignedAssets(),
        fetchRecentlyDamagedAssets()
      ]);
    } catch (err) {
      console.error("Error during combined fetch:", err);
      // setError("Failed to load some dashboard components.");
    } finally {
      setLoading(false);
      setLoadingChart(false);
      setLoadingDonut(false);
      setLoadingMonthlyAcquisitionChart(false);
      setLoadingAssigned(false);
      setLoadingDamaged(false);
    }
  };

  useEffect(() => {
    // Fetch initial data for both summary and time series
    fetchAllData();

    // Set up Realtime subscription
    const channel: RealtimeChannel = supabase
      .channel('public:assets')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'assets' },
        (payload) => {
          console.log('Change received on assets table! Re-fetching all dashboard data.', payload);
          // Re-fetch ALL dashboard data when assets table changes
          fetchAllData();
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to assets table changes');
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('Realtime subscription error:', err);
          setError(prev => `Realtime error: ${err?.message}. ${prev || ''}`);
        }
        if (status === 'TIMED_OUT') {
          console.warn('Realtime subscription timed out.');
          setError(prev => `Realtime subscription timed out. ${prev || ''}`);
        }
      });

    // Cleanup function
    return () => {
      console.log("Unsubscribing from assets table changes");
      supabase.removeChannel(channel);
    };
  }, []); // Empty dependency array

  // --- Helper to display loading/error/data ---
  const renderTotalValue = () => {
    if (loading && !summary) { // Show loading only on initial load
      return <span className="text-muted-foreground">Loading...</span>;
    }
    if (error) {
      return <span className="text-red-600 text-sm" title={error}>Error</span>;
    }
    if (summary?.total_purchase_cost !== null && summary?.total_purchase_cost !== undefined) {
      return formatCurrency(summary.total_purchase_cost);
    }
    return formatCurrency(0); // Default to 0 if null/undefined
  };

  const renderTotalAssets = () => {
    if (loading || error || !summary) return '-';
    return summary.total_active_assets ?? 0;
  }

  // Use total_distinct_active_types from the view for the category count
  const renderCategoryCount = () => {
    if (loading || error || !summary) return '-';
    return summary.total_distinct_active_types ?? 0;
  }

  // --- Helpers for New Acquisitions Card ---
  const renderRecentAcquisitionValue = () => {
    if (loading && !summary) return <span className="text-muted-foreground">Loading...</span>;
    if (error) return <span className="text-red-600 text-sm" title={error}>Error</span>;
    if (summary?.total_recent_purchase_cost !== null && summary?.total_recent_purchase_cost !== undefined) {
      return formatCurrency(summary.total_recent_purchase_cost);
    }
    return formatCurrency(0);
  };

  const renderRecentAcquisitionCount = () => {
    if (loading || error || !summary) return '-';
    return summary.total_recent_assets ?? 0;
  };

  const renderRecentAcquisitionCategories = () => {
    if (loading || error || !summary) return '-';
    return summary.total_recent_distinct_types ?? 0;
  };
  // --- End New Acquisitions Helpers ---

  // --- Helper for Depreciation Card ---
  const renderTotalDepreciationValue = () => {
    if (loading && !summary) return <span className="text-muted-foreground">Loading...</span>;
    if (error) return <span className="text-red-600 text-sm" title={error}>Error</span>;
    if (summary?.total_depreciated_value !== null && summary?.total_depreciated_value !== undefined) {
      return formatCurrency(summary.total_depreciated_value);
    }
    return formatCurrency(0);
  };
  // --- End Depreciation Helper ---

  // --- Formatters for Chart Axes/Tooltips ---
  const formatDateTick = (tickItem: string) => {
    // Basic formatter, show month and day
    try {
      const date = new Date(tickItem + 'T00:00:00'); // Ensure parsing as local date
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch { return tickItem; } // Fallback
  };

  const formatCurrencyTick = (tickItem: number) => {
    if (tickItem >= 1000) {
      return `K${(tickItem / 1000).toFixed(0)}k`;
    }
    return `K${tickItem}`;
  };

  const formatTooltipCurrency = (value: number) => {
    return formatCurrency(value); // Use existing precise formatter
  };
  // --- End Chart Formatters ---

  // --- Define Colors for Donut Chart ---
  const DONUT_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Asset Value Card */}
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total asset value</CardTitle>
            <div className="rounded-md bg-primary-50 px-2 py-1 text-xs">PGK</div>
          </CardHeader>
          <CardContent>
            <TooltipWrapper content="Total purchase cost of all active assets (excluding Decommissioned/Sold)">
              <div className="text-2xl font-bold mb-1">
                {renderTotalValue()}
                <span className="text-muted-foreground text-sm font-normal">.00</span>
              </div>
            </TooltipWrapper>
            <div className="flex items-center space-x-2">
              <div className="flex items-center text-sm font-medium text-emerald-600">
                <ChevronUp className="mr-1 h-4 w-4" />
                -
              </div>
              <div className="text-sm text-muted-foreground">
                Compared to last month (TBD)
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <TooltipWrapper content="Total count of active assets (excluding Decommissioned/Sold)">
                <div className="flex items-center text-muted-foreground">
                  <LayoutList className="mr-1 h-4 w-4" />
                  <span>{renderTotalAssets()} assets</span>
                </div>
              </TooltipWrapper>
              <div className="flex items-center text-muted-foreground">
                <Bell className="mr-1 h-4 w-4" />
                <span>{renderCategoryCount()} categories</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* New Acquisitions Card */}
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">New acquisitions (30d)</CardTitle>
            <div className="rounded-md bg-primary-50 px-2 py-1 text-xs">PGK</div>
          </CardHeader>
          <CardContent>
            <TooltipWrapper content="Sum of purchase cost for active assets acquired in the last 30 days">
              <div className="text-2xl font-bold mb-1">
                {renderRecentAcquisitionValue()}
                <span className="text-muted-foreground text-sm font-normal">.00</span>
              </div>
            </TooltipWrapper>
            <div className="flex items-center space-x-2">
              <div className="flex items-center text-sm font-medium text-emerald-600">
                <ChevronUp className="mr-1 h-4 w-4" />
                {0}%
              </div>
              <div className="text-sm text-muted-foreground">
                Compared to last period (TBD)
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <TooltipWrapper content="Count of active assets acquired in the last 30 days">
                <div className="flex items-center text-muted-foreground">
                  <LayoutList className="mr-1 h-4 w-4" />
                  <span>{renderRecentAcquisitionCount()} assets</span>
                </div>
              </TooltipWrapper>
              <div className="flex items-center text-muted-foreground">
                <Bell className="mr-1 h-4 w-4" />
                <TooltipWrapper content="Count of distinct asset types acquired in the last 30 days">
                  <span>{renderRecentAcquisitionCategories()} categories</span>
                </TooltipWrapper>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Depreciation Card */}
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Depreciation</CardTitle>
            <div className="rounded-md bg-primary-50 px-2 py-1 text-xs">PGK</div>
          </CardHeader>
          <CardContent>
            <TooltipWrapper content="Sum of the 'depreciated_value' column for all active assets">
              <div className="text-2xl font-bold mb-1">
                {renderTotalDepreciationValue()}
                <span className="text-muted-foreground text-sm font-normal">.00</span>
              </div>
            </TooltipWrapper>
            <div className="flex items-center space-x-2">
              <div className="flex items-center text-sm font-medium text-red-600">
                <ArrowDownRight className="mr-1 h-4 w-4" />
                {0}%
              </div>
              <div className="text-sm text-muted-foreground">
                Compared to last month (TBD)
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <div className="flex items-center text-muted-foreground">
                <LayoutList className="mr-1 h-4 w-4" />
                <TooltipWrapper content="Placeholder - Transaction count not available from this view">
                  <span>- transactions</span>
                </TooltipWrapper>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Bell className="mr-1 h-4 w-4" />
                <TooltipWrapper content="Placeholder - Category count not available from this view">
                  <span>- categories</span>
                </TooltipWrapper>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Asset Value Overview Chart - Span 8/12 columns on md+ */}
        <Card className="overflow-hidden md:col-span-8">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">Total asset value overview</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className="h-3 w-3 rounded-full bg-primary"></div>
                <span className="text-xs">This month</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="h-3 w-3 rounded-full bg-gray-300"></div>
                <span className="text-xs">Same period last month</span>
              </div>
              <div className="rounded-md border px-2 py-1 text-xs font-medium flex items-center">
                Total value <ChevronRight className="ml-1 h-3 w-3" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Conditional Rendering for Chart */}
            {loadingChart ? (
              <div className="h-[250px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                <p className="text-sm text-muted-foreground">Loading Chart Data...</p>
              </div>
            ) : error ? (
              <div className="h-[250px] w-full flex items-center justify-center bg-red-50 rounded-md">
                <p className="text-sm text-red-600" title={typeof error === 'string' ? error : 'Error loading chart'}>Error loading chart data</p>
              </div>
            ) : timeSeriesData.length === 0 ? (
              <div className="h-[250px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                <p className="text-sm text-muted-foreground">No time series data available.</p>
              </div>
            ) : (
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={timeSeriesData}
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
                    <XAxis
                      dataKey="report_date"
                      tickFormatter={formatDateTick}
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={formatCurrencyTick}
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      width={80} // Adjust width for labels like K100k
                    />
                    <RechartsTooltip
                      contentStyle={{ fontSize: '12px', borderRadius: '0.5rem' }}
                      formatter={formatTooltipCurrency}
                      labelFormatter={formatDateTick}
                    />
                    <Area
                      type="monotone"
                      dataKey="cumulative_purchase_cost"
                      stroke="#8884d8"
                      fillOpacity={1}
                      fill="url(#colorValue)"
                      name="Total Value"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics / Depreciation Donut Chart - Span 4/12 columns on md+ */}
        <Card className="overflow-hidden md:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">Depreciation by Type</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="rounded-md border px-2 py-1 text-xs font-medium flex items-center">
                Details <ChevronRight className="ml-1 h-3 w-3" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Conditional Rendering for Donut Chart */}
            {loadingDonut ? (
              <div className="h-[250px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                <p className="text-sm text-muted-foreground">Loading Chart Data...</p>
              </div>
            ) : error ? (
              <div className="h-[250px] w-full flex items-center justify-center bg-red-50 rounded-md">
                <p className="text-sm text-red-600" title={typeof error === 'string' ? error : 'Error loading chart'}>Error loading chart data</p>
              </div>
            ) : depreciationByTypeData.length === 0 ? (
              <div className="h-[250px] w-full flex items-center justify-center bg-muted/20 rounded-md">
                <p className="text-sm text-muted-foreground">No depreciation data to display.</p>
                {/* Optionally show total depreciation value even if breakdown is empty */}
                <div className="absolute text-center">
                  <p className="text-xl font-bold mt-2">{renderTotalDepreciationValue()}</p>
                  <p className="text-xs text-muted-foreground">Total Depreciation</p>
                </div>
              </div>
            ) : (
              <div className="h-[250px] w-full relative"> {/* Added relative positioning */}
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <RechartsTooltip
                      contentStyle={{ fontSize: '12px', borderRadius: '0.5rem' }}
                      formatter={(value: number, name: string) => [`${formatCurrency(value)}`, name]}
                    />
                    <Pie
                      data={depreciationByTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      // label={renderCustomizedLabel} // Could add labels if needed
                      innerRadius={60} // Make it a donut
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="total_depreciated_value_for_type"
                      nameKey="asset_type"
                    >
                      {depreciationByTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                      ))}
                    </Pie>
                    {/* Adjust Legend position */}
                    <Legend
                      layout="horizontal" // Changed to horizontal
                      verticalAlign="bottom" // Changed to bottom
                      align="center" // Changed to center
                      iconSize={10}
                      wrapperStyle={{ fontSize: '12px', lineHeight: '1.5', marginTop: '10px' }} // Add margin top
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Text - Display total depreciation from summary */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-2xl font-bold">{renderTotalDepreciationValue()}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total Depreciation</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section: Charts and New Info Cards */}
      {/* Corrected Grid Layout for Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:col-span-2 lg:col-span-3 xl:col-span-4"> {/* Span full width */}
        {/* Left Column: Monthly Acquisition Cost Chart */}
        {/* Corrected lg span to 2 */}
        <Card className="lg:col-span-2 h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            {/* Updated Title */}
            <CardTitle className="text-sm font-medium">Monthly Acquisition Cost</CardTitle>
            {/* Updated Filter Button (still placeholder) */}
            <TooltipWrapper content="Select time period (future feature)">
              <Button variant="outline" size="sm" className="h-7 text-xs px-2 py-1 cursor-not-allowed opacity-50">
                This year
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </TooltipWrapper>
          </CardHeader>
          <CardContent className="pl-2 pr-4 relative flex-grow"> {/* Adjust height and padding */}
            {/* Use renamed loading state */}
            {loadingMonthlyAcquisitionChart ? (
              <div className="flex items-center justify-center h-full text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mr-2" />Loading Chart...</div>
              /* Use renamed error state */
            ) : monthlyAcquisitionChartError ? (
              <div className="flex items-center justify-center h-full text-red-600">{monthlyAcquisitionChartError}</div>
              /* Use renamed data state */
            ) : monthlyAcquisitionData.length > 0 ? (
              <>
                {/* Adjusted ResponsiveContainer height - no need for bottom text */}
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    /* Use renamed data state */
                    data={monthlyAcquisitionData}
                    margin={{ top: 25, right: 5, left: 20, bottom: 5 }} // Adjusted margins
                    barCategoryGap="20%" // Space between groups
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tickFormatter={formatCurrencyTick}
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 'dataMax + 1000']}
                      width={50} // Give YAxis some space
                    />
                    <RechartsTooltip
                      contentStyle={{ fontSize: 12, borderRadius: '4px', border: '1px solid #ccc' }}
                      /* Updated formatter for single value */
                      formatter={(value: number | null) => [value !== null ? formatCurrency(value) : 'N/A', 'Acquisition Cost']}
                      cursor={{ fill: 'rgba(206, 206, 206, 0.2)' }}
                    />
                    {/* Simplified Legend for single bar */}
                    <Legend
                      verticalAlign="top"
                      align="right"
                      height={30}
                      iconSize={10}
                      wrapperStyle={{ fontSize: '12px', paddingBottom: '10px', top: '-5px' }}
                      payload={[{ value: 'Acquisition Cost', type: 'square', color: '#8884d8' }]} // Define legend item
                    />
                    {/* Single Bar for Acquisition */}
                    <Bar dataKey="total_acquisition" fill="#8884d8" name="Acquisition Cost" radius={[4, 4, 0, 0]} /> {/* Using primary color */}
                  </BarChart>
                </ResponsiveContainer>
                {/* REMOVED Budget Comparison Text */}
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">No acquisition data for this year</div>
            )}
          </CardContent>
        </Card>

        {/* Right Column: Stacked Cards */}
        {/* Corrected lg span to 1 and removed other spans */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <Card> {/* Recently Assigned Assets */}
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Recently Assigned Assets</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {loadingAssigned ? (
                <div className="flex items-center justify-center h-20 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading...
                </div>
              ) : assignedError ? (
                <div className="text-red-600 text-xs p-2 text-center">Error: {assignedError}</div>
              ) : recentlyAssignedAssets.length > 0 ? (
                recentlyAssignedAssets.map(asset => (
                  <div key={asset.id} className="flex items-center gap-3 border-b last:border-b-0 pb-2 last:pb-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={asset.image_url || undefined} alt={asset.name || 'Asset'} />
                      <AvatarFallback>{asset.name?.charAt(0)?.toUpperCase() || 'A'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-xs">
                      <p className="font-medium truncate" title={asset.name || ''}>{asset.name || 'Unnamed Asset'}</p>
                      <p className="text-muted-foreground">To: {asset.assigned_to || 'N/A'}</p>
                    </div>
                    <TooltipWrapper content={`Assigned on ${formatDate(asset.assigned_date)}`}>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatRelativeTime(asset.assigned_date)}
                      </span>
                    </TooltipWrapper>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">No assets assigned recently.</p>
              )}
            </CardContent>
          </Card>
          <Card> {/* Recently Damaged Assets */}
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Recently Damaged Assets</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {loadingDamaged ? (
                <div className="flex items-center justify-center h-20 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading...
                </div>
              ) : damagedError ? (
                <div className="text-red-600 text-xs p-2 text-center">Error: {damagedError}</div>
              ) : recentlyDamagedAssets.length > 0 ? (
                recentlyDamagedAssets.map(asset => (
                  <div key={asset.id} className="flex items-center gap-3 border-b last:border-b-0 pb-2 last:pb-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={asset.image_url || undefined} alt={asset.name || 'Asset'} />
                      <AvatarFallback>{asset.name?.charAt(0)?.toUpperCase() || 'A'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-xs">
                      <p className="font-medium truncate" title={asset.name || ''}>{asset.name || 'Unnamed Asset'}</p>
                      <p className="text-muted-foreground">Assigned: {asset.assigned_to || 'N/A'}</p> {/* Shows who had it when damaged */}
                    </div>
                    <TooltipWrapper content={`Marked damaged on ${formatDate(asset.last_updated)}`}>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatRelativeTime(asset.last_updated)}
                      </span>
                    </TooltipWrapper>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">No recently damaged assets found.</p>
              )}
            </CardContent>
          </Card>
          <Card> {/* Upcoming Maintenance */}
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Upcoming Maintenance</CardTitle></CardHeader>
            <CardContent>
              {/* ... (Static Placeholder Content for Maintenance) ... */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
