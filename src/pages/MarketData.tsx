import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import Chart from 'chart.js/auto';
import { Settings, Play, Pause, RefreshCw, AlertCircle, FileText, Database } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useMarketNews } from '@/hooks/useMarketNews';
import { useMarketData, useLiveMarketUpdates } from '@/hooks/useMarketData';
import './MarketData.css';

// ============================================
// TYPES
// ============================================
interface Company {
    symbol: string;
    name: string;
    sector: string;
    last: number;
    change: number;
    vol: number;
    mcap: string;
    colors: {
        primary: string;
        secondary: string;
        glow: string;
    };
    history: PricePoint[];
}

interface PricePoint {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

type TimeRange = '1D' | '3D' | '1W' | '2W' | '1M' | '2M' | '6M' | '1Y' | 'CUSTOM';

interface TimeRangeOption {
    value: TimeRange;
    label: string;
    days: number;
}

// ============================================
// TIME RANGE OPTIONS
// ============================================
const timeRangeOptions: TimeRangeOption[] = [
    { value: '1D', label: '1 Day', days: 1 },
    { value: '3D', label: '3 Days', days: 3 },
    { value: '1W', label: '1 Week', days: 7 },
    { value: '2W', label: '2 Weeks', days: 14 },
    { value: '1M', label: '1 Month', days: 30 },
    { value: '2M', label: '2 Months', days: 60 },
    { value: '6M', label: '6 Months', days: 180 },
    { value: '1Y', label: '1 Year', days: 365 },
    { value: 'CUSTOM', label: 'Custom Range', days: 0 }
];

// ============================================
// COMPANY DATA WITH BRAND COLORS
// ============================================


// ============================================
// SPARKLINE COMPONENT
// ============================================
const Sparkline: React.FC<{ data: number[]; isPositive: boolean }> = ({ data, isPositive }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !data || data.length === 0) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = 80;
        canvas.height = 24;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;

        ctx.strokeStyle = isPositive ? '#22c55e' : '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.beginPath();

        data.forEach((val, i) => {
            const x = (i / (data.length - 1)) * canvas.width;
            const y = canvas.height - ((val - min) / range) * (canvas.height - 4) - 2;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });

        ctx.stroke();
    }, [data, isPositive]);

    return <canvas ref={canvasRef} style={{ width: 80, height: 24 }} />;
};

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================
const MarketData = () => {
    // Fetch data from SharePoint
    const {
        companies: spCompanies,
        settings: spSettings,
        isLoading: dataLoading,
        error: dataError,
        refetch: refetchData,
    } = useMarketData();

    const [selectedSymbol, setSelectedSymbol] = useState('BSP');

    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Settings State
    const [isLiveUpdates, setIsLiveUpdates] = useState(spSettings?.liveUpdatesEnabled ?? true);
    const [isAutoCycle, setIsAutoCycle] = useState(spSettings?.autoCycleEnabled ?? false);
    const [cycleInterval, setCycleInterval] = useState(5000);
    const [timeRange, setTimeRange] = useState<TimeRange>(spSettings?.defaultTimeRange as TimeRange || '2M');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    // Apply live updates to the SharePoint data (Auto-Refresh)
    const companies = useLiveMarketUpdates(
        spCompanies,
        isLiveUpdates,
        spSettings?.updateInterval ?? 60000, // Default to 60s
        refetchData
    );

    // Fetch market news from SharePoint
    const { news: marketNews, isLoading: newsLoading, error: newsError, refetch: refetchNews } = useMarketNews();

    const mainChartRef = useRef<HTMLCanvasElement>(null);
    const compareChartRef = useRef<HTMLCanvasElement>(null);
    const mainChartInstance = useRef<Chart | null>(null);
    const compareChartInstance = useRef<Chart | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedCompany = companies.length > 0 ? (companies.find(c => c.symbol === selectedSymbol) || companies[0]) : null;
    const topGainer = companies.length > 0 ? companies.reduce((a, b) => a.change > b.change ? a : b) : null;
    const totalVolume = companies.reduce((acc, c) => acc + c.vol, 0);

    // Filter history based on time range
    const getFilteredHistory = useCallback((history: PricePoint[]): PricePoint[] => {
        if (timeRange === 'CUSTOM') {
            if (!customStartDate || !customEndDate) return history;

            const startTime = new Date(customStartDate).getTime();
            const endTime = new Date(customEndDate).getTime() + (24 * 60 * 60 * 1000 - 1); // End of day

            return history.filter(h => h.time >= startTime && h.time <= endTime);
        }

        const selectedOption = timeRangeOptions.find(opt => opt.value === timeRange);
        if (!selectedOption || selectedOption.days === 0) return history;

        const cutoffTime = Date.now() - (selectedOption.days * 24 * 60 * 60 * 1000);
        return history.filter(h => h.time >= cutoffTime);
    }, [timeRange, customStartDate, customEndDate]);

    const filteredHistory = selectedCompany ? getFilteredHistory(selectedCompany.history) : [];

    // Get computed CSS colors for theme-aware chart rendering
    const getThemeColors = useCallback(() => {
        const computedStyle = getComputedStyle(document.documentElement);
        const isDark = document.documentElement.classList.contains('dark');

        return {
            gridColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.08)',
            textColor: isDark ? '#9ca3af' : '#6b7280',
            tooltipBg: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.95)',
            tooltipBorder: isDark ? '#374151' : '#e5e7eb'
        };
    }, []);

    // CSS Variables based on selected company
    useEffect(() => {
        if (!selectedCompany) return;
        const root = document.documentElement;
        root.style.setProperty('--company-primary', selectedCompany.colors.primary);
        root.style.setProperty('--company-secondary', selectedCompany.colors.secondary);
        root.style.setProperty('--company-glow', selectedCompany.colors.glow);
    }, [selectedCompany]);

    // Create/Update Main Chart
    const createMainChart = useCallback(() => {
        const ctx = mainChartRef.current?.getContext('2d');
        if (!ctx || !selectedCompany) return;

        const themeColors = getThemeColors();
        const history = getFilteredHistory(selectedCompany.history);

        if (history.length === 0) {
            // Render basic grid or empty state
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.font = '14px sans-serif';
            ctx.fillStyle = themeColors.textColor;
            ctx.textAlign = 'center';
            ctx.fillText('No history data available', ctx.canvas.width / 2, ctx.canvas.height / 2);
            return;
        }

        // Deduplicate data by date (keep the last point for each day)
        const uniqueDailyPoints = new Map<string, PricePoint>();
        history.forEach(h => {
            const dateKey = new Date(h.time).toLocaleDateString();
            uniqueDailyPoints.set(dateKey, h);
        });
        const dedupedData = Array.from(uniqueDailyPoints.values());

        const labels = dedupedData.map(h => {
            const d = new Date(h.time);
            return `${d.getMonth() + 1}/${d.getDate()}`;
        });
        const prices = dedupedData.map(h => h.close);

        const gradient = ctx.createLinearGradient(0, 0, 0, 350);
        gradient.addColorStop(0, selectedCompany.colors.glow);
        gradient.addColorStop(0.5, selectedCompany.colors.glow.replace('0.3', '0.1'));
        gradient.addColorStop(1, 'transparent');

        if (mainChartInstance.current) {
            mainChartInstance.current.destroy();
        }

        mainChartInstance.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: selectedCompany.symbol,
                    data: prices,
                    borderColor: selectedCompany.colors.primary,
                    borderWidth: 2.5,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: selectedCompany.colors.primary,
                    pointHoverBorderColor: '#fff',
                    pointHoverBorderWidth: 2,
                    tension: 0.3,
                    fill: true,
                    backgroundColor: gradient
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: themeColors.tooltipBg,
                        borderColor: themeColors.tooltipBorder,
                        borderWidth: 1,
                        titleColor: themeColors.textColor,
                        bodyColor: themeColors.textColor,
                        titleFont: { family: 'system-ui', weight: 'bold' },
                        bodyFont: { family: 'ui-monospace' },
                        padding: 12,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            label: (context: any) => `K ${context.parsed.y.toFixed(2)}`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            color: themeColors.textColor,
                            font: { size: 10 },
                            maxTicksLimit: 10
                        }
                    },
                    y: {
                        grid: { color: themeColors.gridColor },
                        ticks: {
                            color: themeColors.textColor,
                            font: { family: 'ui-monospace', size: 10 },
                            callback: (v: any) => 'K ' + v.toFixed(2)
                        }
                    }
                },
                animation: {
                    duration: 800,
                    easing: 'easeOutQuart'
                }
            }
        });
    }, [selectedCompany, getThemeColors, getFilteredHistory]);

    // Create Compare Chart
    const createCompareChart = useCallback(() => {
        const ctx = compareChartRef.current?.getContext('2d');
        if (!ctx || companies.length === 0) return;

        const themeColors = getThemeColors();
        const datasets = companies.slice(0, 5).map(c => {
            const filteredCompanyHistory = getFilteredHistory(c.history);
            const basePrice = filteredCompanyHistory[0]?.close || 1;
            return {
                label: c.symbol,
                data: filteredCompanyHistory.map(h => ((h.close / basePrice) - 1) * 100),
                borderColor: c.colors.primary,
                borderWidth: 1.5,
                pointRadius: 0,
                tension: 0.3
            };
        });

        const filteredFirstCompany = getFilteredHistory(companies[0]?.history || []);
        const labels = filteredFirstCompany.map(h => {
            const d = new Date(h.time);
            return `${d.getMonth() + 1}/${d.getDate()}`;
        });

        if (compareChartInstance.current) {
            compareChartInstance.current.destroy();
        }

        compareChartInstance.current = new Chart(ctx, {
            type: 'line',
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: themeColors.textColor,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            padding: 16,
                            font: { size: 11 }
                        }
                    }
                },
                scales: {
                    x: {
                        display: false,
                        grid: { display: false }
                    },
                    y: {
                        grid: { color: themeColors.gridColor },
                        ticks: {
                            color: themeColors.textColor,
                            font: { size: 10 },
                            callback: (v: any) => v.toFixed(0) + '%'
                        }
                    }
                }
            }
        });
    }, [companies, getThemeColors, getFilteredHistory]);

    // Select company handler
    const selectCompany = useCallback((symbol: string) => {
        setSelectedSymbol(symbol);
    }, []);

    // Download CSV
    const downloadCSV = () => {
        if (!selectedCompany) return;
        const rows = ['Date,Open,High,Low,Close,Volume'];
        selectedCompany.history.forEach(h => {
            const date = new Date(h.time).toISOString().slice(0, 10);
            rows.push(`${date},${h.open},${h.high},${h.low},${h.close},${h.volume}`);
        });

        const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedSymbol}_history.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Fullscreen toggle
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };



    // Live data simulation
    // Track companies for auto-cycle without resetting timer on every update
    const companiesRef = useRef(companies);
    useEffect(() => {
        companiesRef.current = companies;
    }, [companies]);

    // Auto Cycle Logic
    useEffect(() => {
        if (!isAutoCycle) return;

        const interval = setInterval(() => {
            const currentCompanies = companiesRef.current;
            if (currentCompanies.length === 0) return;

            const currentIndex = currentCompanies.findIndex(c => c.symbol === selectedSymbol);
            // If selected not found, start at 0
            const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % currentCompanies.length;

            if (currentCompanies[nextIndex]) {
                setSelectedSymbol(currentCompanies[nextIndex].symbol);
            }
        }, cycleInterval);

        return () => clearInterval(interval);
    }, [isAutoCycle, cycleInterval, selectedSymbol]);

    // Update Company Color
    const updateCompanyColor = (symbol: string, type: 'primary' | 'secondary', color: string) => {
        // console.log("Color update not implemented for SharePoint mode yet.", symbol, type, color);
        // In a full implementation, this would call a service method to update the SharePoint list item
    };

    // Clock update
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Listen for fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Initialize charts
    useEffect(() => {
        createMainChart();
    }, [createMainChart, selectedSymbol]);

    useEffect(() => {
        createCompareChart();
    }, [createCompareChart]);

    // Update main chart data
    useEffect(() => {
        if (mainChartInstance.current && selectedCompany) {
            const filteredData = getFilteredHistory(selectedCompany.history);

            // Deduplicate data by date (keep the last point for each day)
            const uniqueDailyPoints = new Map<string, PricePoint>();
            filteredData.forEach(h => {
                const dateKey = new Date(h.time).toLocaleDateString();
                uniqueDailyPoints.set(dateKey, h);
            });
            const dedupedData = Array.from(uniqueDailyPoints.values());

            const newData = dedupedData.map(h => h.close);
            const newLabels = dedupedData.map(h => {
                const d = new Date(h.time);
                return `${d.getMonth() + 1}/${d.getDate()}`;
            });

            mainChartInstance.current.data.labels = newLabels;
            mainChartInstance.current.data.datasets[0].data = newData;
            mainChartInstance.current.data.datasets[0].borderColor = selectedCompany.colors.primary;
            mainChartInstance.current.data.datasets[0].pointHoverBackgroundColor = selectedCompany.colors.primary;

            // Update gradient
            const ctx = mainChartRef.current?.getContext('2d');
            if (ctx) {
                const gradient = ctx.createLinearGradient(0, 0, 0, 350);
                gradient.addColorStop(0, selectedCompany.colors.glow);
                gradient.addColorStop(0.5, selectedCompany.colors.glow.replace('0.3', '0.1'));
                gradient.addColorStop(1, 'transparent');
                mainChartInstance.current.data.datasets[0].backgroundColor = gradient;
            }

            mainChartInstance.current.update('none');
        }
    }, [companies, selectedCompany, getFilteredHistory]);

    // Listen for theme changes and recreate charts
    useEffect(() => {
        const observer = new MutationObserver(() => {
            createMainChart();
            createCompareChart();
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        return () => observer.disconnect();
    }, [createMainChart, createCompareChart]);

    return (
        <PageLayout>
            {/* Loading State */}
            {dataLoading && (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="text-muted-foreground">Loading market data from SharePoint...</p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {dataError && !dataLoading && (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center space-y-4 max-w-md">
                        <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                        <h2 className="text-xl font-semibold">Failed to Load Market Data</h2>
                        <p className="text-muted-foreground">{dataError}</p>
                        <Button onClick={refetchData} className="mt-4">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Retry
                        </Button>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!dataLoading && !dataError && companies.length === 0 && (
                <div className="flex items-center justify-center min-h-[50vh]">
                    <div className="text-center space-y-4 max-w-md">
                        <Database className="h-12 w-12 text-muted-foreground mx-auto" />
                        <h2 className="text-xl font-semibold">No Market Data Found</h2>
                        <p className="text-muted-foreground">The market data lists appear to be empty. You likely need to seed them with initial data.</p>
                        <Link to="/test-ground">
                            <Button variant="outline" className="mt-4">
                                Go to Setup to Seed Data
                            </Button>
                        </Link>
                    </div>
                </div>
            )}

            {/* Main Content - Only show when data is loaded */}
            {!dataLoading && !dataError && companies.length > 0 && (
                <div className="market-data-page" ref={containerRef}>
                    <div className="bg-grid"></div>

                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-5">
                        {/* Top Bar */}
                        <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-5 pb-5 border-b border-border gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg">
                                    <img
                                        src="/images/SCPNG Original Logo.png"
                                        alt="SCPNG Logo"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-foreground">SCPNG Market Dashboard</h1>
                                    <div className="text-xs text-muted-foreground">Papua New Guinea Stock Exchange • Live Data</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-lg text-sm font-medium shadow-sm">
                                <div className={`status-dot w-2 h-2 rounded-full ${isLiveUpdates ? 'bg-primary animate-pulse' : 'bg-muted'}`}></div>
                                <span className="text-foreground">{isLiveUpdates ? 'Market Open' : 'Market Paused'}</span>
                                <span className="text-muted-foreground">|</span>
                                <span className="text-foreground font-mono">{currentTime}</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <Link to="/market-summary">
                                    <button className="bg-card hover:bg-accent border border-border text-foreground px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        Daily Summary
                                    </button>
                                </Link>

                                <Dialog>
                                    <DialogTrigger asChild>
                                        <button className="bg-card hover:bg-accent border border-border text-foreground px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                                            <Settings className="w-4 h-4" />
                                            Settings
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle>Dashboard Settings</DialogTitle>
                                            <DialogDescription>
                                                Customize your market data viewing experience.
                                            </DialogDescription>
                                        </DialogHeader>

                                        <div className="space-y-6 py-4">
                                            <div className="space-y-4">
                                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">General</h3>

                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label className="text-base">Live Updates</Label>
                                                        <div className="text-xs text-muted-foreground">Simulate real-time price changes</div>
                                                    </div>
                                                    <Switch
                                                        checked={isLiveUpdates}
                                                        onCheckedChange={setIsLiveUpdates}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label className="text-base">Auto-Cycle Ticker</Label>
                                                        <div className="text-xs text-muted-foreground">Automatically rotate through companies</div>
                                                    </div>
                                                    <Switch
                                                        checked={isAutoCycle}
                                                        onCheckedChange={setIsAutoCycle}
                                                    />
                                                </div>
                                            </div>

                                            <Separator />

                                            <div className="space-y-4">
                                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Chart Time Range</h3>

                                                <div className="space-y-3">
                                                    <Label className="text-base">Select Time Period</Label>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {timeRangeOptions.map((option) => (
                                                            <button
                                                                key={option.value}
                                                                onClick={() => setTimeRange(option.value)}
                                                                className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${timeRange === option.value
                                                                    ? 'bg-primary text-primary-foreground border-primary'
                                                                    : 'bg-card text-foreground border-border hover:bg-accent'
                                                                    }`}
                                                            >
                                                                {option.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {timeRange === 'CUSTOM' && (
                                                    <div className="space-y-3 pt-2">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="start-date" className="text-sm">Start Date</Label>
                                                            <Input
                                                                id="start-date"
                                                                type="date"
                                                                value={customStartDate}
                                                                onChange={(e) => setCustomStartDate(e.target.value)}
                                                                className="w-full"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="end-date" className="text-sm">End Date</Label>
                                                            <Input
                                                                id="end-date"
                                                                type="date"
                                                                value={customEndDate}
                                                                onChange={(e) => setCustomEndDate(e.target.value)}
                                                                className="w-full"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <Separator />

                                            <div className="space-y-4">
                                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Company Colors</h3>
                                                <div className="grid grid-cols-1 gap-4">
                                                    {companies.map(company => (
                                                        <div key={company.symbol} className="flex items-center justify-between p-3 border rounded-lg">
                                                            <div className="flex items-center gap-3">
                                                                <div
                                                                    className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold text-white"
                                                                    style={{ background: company.colors.primary }}
                                                                >
                                                                    {company.symbol}
                                                                </div>
                                                                <span className="font-medium text-sm">{company.name}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex flex-col items-center gap-1">
                                                                    <span className="text-[10px] text-muted-foreground">Primary</span>
                                                                    <input
                                                                        type="color"
                                                                        value={company.colors.primary}
                                                                        onChange={(e) => updateCompanyColor(company.symbol, 'primary', e.target.value)}
                                                                        className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                                                                    />
                                                                </div>
                                                                <div className="flex flex-col items-center gap-1">
                                                                    <span className="text-[10px] text-muted-foreground">Secondary</span>
                                                                    <input
                                                                        type="color"
                                                                        value={company.colors.secondary}
                                                                        onChange={(e) => updateCompanyColor(company.symbol, 'secondary', e.target.value)}
                                                                        className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>

                                <button
                                    className="bg-card hover:bg-accent border border-border text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                    onClick={toggleFullscreen}
                                >
                                    {isFullscreen ? '⊗ Exit Fullscreen' : '⛶ Fullscreen'}
                                </button>
                                <button
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors"
                                    onClick={downloadCSV}
                                >
                                    Export CSV
                                </button>
                            </div>
                        </header>

                        {/* KPI Row */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                            {[
                                { label: 'Total Market Cap', value: 'K 145.2B', change: '+2.4%', positive: true },
                                { label: 'Total Volume', value: totalVolume.toLocaleString(), change: '+12.8%', positive: true },
                                { label: 'Trades Today', value: '156', change: '+24', positive: true },
                                { label: 'Top Gainer', value: topGainer.symbol, change: `+${topGainer.change.toFixed(1)}%`, positive: true }
                            ].map((kpi, i) => (
                                <div key={i} className="bg-card border border-border rounded-xl p-4 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/60 opacity-60"></div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">{kpi.label}</div>
                                    <div className="text-2xl font-bold text-foreground font-mono mb-1">{kpi.value}</div>
                                    <div className={`text-sm font-semibold ${kpi.positive ? 'text-green-500' : 'text-red-500'}`}>
                                        {kpi.change}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Ticker Strip */}
                        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-thin">
                            {companies.map(c => (
                                <div
                                    key={c.symbol}
                                    className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all border ${c.symbol === selectedSymbol
                                        ? 'bg-accent/50 border-primary shadow-sm'
                                        : 'bg-card/30 border-border hover:bg-accent/30'
                                        }`}
                                    onClick={() => selectCompany(c.symbol)}
                                    style={c.symbol === selectedSymbol ? {
                                        borderColor: c.colors.primary,
                                        backgroundColor: c.colors.glow
                                    } : {}}
                                >
                                    <span className="font-bold text-sm text-foreground">{c.symbol}</span>
                                    <span className="font-mono text-xs text-muted-foreground">K {c.last.toFixed(2)}</span>
                                    <span className={`text-xs font-semibold ${c.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {c.change >= 0 ? '+' : ''}{c.change.toFixed(1)}%
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
                            <div className="space-y-4">
                                {/* Main Chart Card */}
                                <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                                    <div className="p-5">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div
                                                className="company-logo"
                                                style={{
                                                    background: `linear-gradient(135deg, ${selectedCompany.colors.primary}, ${selectedCompany.colors.secondary})`,
                                                    boxShadow: `0 0 40px ${selectedCompany.colors.glow}`
                                                }}
                                            >
                                                {selectedCompany.symbol}
                                            </div>
                                            <div className="flex-1">
                                                <h2 className="text-lg font-bold text-foreground">{selectedCompany.name}</h2>
                                                <div className="text-sm text-muted-foreground">Sector: {selectedCompany.sector}</div>
                                                <div className="flex gap-5 mt-3">
                                                    {[
                                                        { label: 'Last Price', value: `K ${selectedCompany.last.toFixed(2)}` },
                                                        { label: 'Change', value: `${selectedCompany.change >= 0 ? '+' : ''}${selectedCompany.change.toFixed(1)}%`, color: selectedCompany.change >= 0 },
                                                        { label: 'Volume', value: selectedCompany.vol.toLocaleString() },
                                                        { label: 'Market Cap', value: selectedCompany.mcap }
                                                    ].map((stat, i) => (
                                                        <div key={i}>
                                                            <div className="text-xs text-muted-foreground uppercase">{stat.label}</div>
                                                            <div className={`font-mono text-base font-semibold mt-0.5 ${stat.color !== undefined
                                                                ? stat.color ? 'text-green-500' : 'text-red-500'
                                                                : 'text-foreground'
                                                                }`}>
                                                                {stat.value}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="chart-container">
                                            <canvas ref={mainChartRef} className="chart-canvas"></canvas>
                                            <div className="chart-gradient-overlay"></div>
                                        </div>

                                        {/* Volume Bars */}
                                        <div className="volume-bars">
                                            {(() => {
                                                const filtered = filteredHistory;
                                                const volumeData = filtered.slice(-30);
                                                const maxVol = Math.max(...volumeData.map(x => x.volume));
                                                return volumeData.map((h, i) => {
                                                    const height = (h.volume / maxVol) * 100;
                                                    const date = new Date(h.time);
                                                    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
                                                    const formattedVolume = h.volume.toLocaleString();
                                                    return (
                                                        <div
                                                            key={i}
                                                            className="vol-bar"
                                                            style={{ height: `${height}%`, background: selectedCompany.colors.primary }}
                                                            title={`${formattedDate}\nVolume: ${formattedVolume}`}
                                                        ></div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    </div>
                                </div>

                                {/* Market Table */}
                                <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                                    <div className="flex justify-between items-center px-5 py-4 border-b border-border">
                                        <div>
                                            <div className="text-sm font-semibold text-foreground">Market Overview</div>
                                            <div className="text-xs text-muted-foreground">Click row to select • Live updates</div>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-border">
                                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Symbol</th>
                                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Last Price</th>
                                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Change</th>
                                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Volume</th>
                                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Market Cap</th>
                                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Chart</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {companies.map(c => (
                                                    <tr
                                                        key={c.symbol}
                                                        className={`cursor-pointer transition-colors border-b border-border last:border-0 ${c.symbol === selectedSymbol ? 'bg-accent/50' : 'hover:bg-accent/30'
                                                            }`}
                                                        onClick={() => selectCompany(c.symbol)}
                                                    >
                                                        <td className="px-4 py-3.5">
                                                            <div className="flex items-center gap-2.5">
                                                                <div
                                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-primary-foreground"
                                                                    style={{ background: `linear-gradient(135deg, ${c.colors.primary}, ${c.colors.secondary})` }}
                                                                >
                                                                    {c.symbol.slice(0, 3)}
                                                                </div>
                                                                <div>
                                                                    <div className="font-semibold text-sm text-foreground">{c.symbol}</div>
                                                                    <div className="text-xs text-muted-foreground">{c.name}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3.5 font-mono font-semibold text-sm text-foreground">K {c.last.toFixed(2)}</td>
                                                        <td className={`px-4 py-3.5 font-mono font-semibold text-sm ${c.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                            {c.change >= 0 ? '+' : ''}{c.change.toFixed(1)}%
                                                        </td>
                                                        <td className="px-4 py-3.5 text-sm text-foreground">{c.vol.toLocaleString()}</td>
                                                        <td className="px-4 py-3.5 text-sm text-foreground">{c.mcap}</td>
                                                        <td className="px-4 py-3.5">
                                                            <Sparkline
                                                                data={c.history.slice(-20).map(h => h.close)}
                                                                isPositive={c.change >= 0}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar */}
                            <div className="flex flex-col gap-4">
                                {/* Live Price Card */}
                                <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                                    <div className="px-5 py-4 border-b border-border">
                                        <div className="text-sm font-semibold text-foreground">Live Price</div>
                                        <div className="text-xs text-muted-foreground">{selectedSymbol}</div>
                                    </div>
                                    <div className="p-5">
                                        <div className="flex items-center gap-3 px-4 py-3.5 bg-muted/20 rounded-lg">
                                            <div className="live-dot"></div>
                                            <div className="font-mono text-2xl font-bold text-foreground">K {selectedCompany.last.toFixed(2)}</div>
                                            <div className={`text-sm font-semibold ${selectedCompany.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {selectedCompany.change >= 0 ? '+' : ''}{selectedCompany.change.toFixed(1)}%
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Heatmap */}
                                <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                                    <div className="px-5 py-4 border-b border-border">
                                        <div className="text-sm font-semibold text-foreground">Market Heatmap</div>
                                        <div className="text-xs text-muted-foreground">Daily % change</div>
                                    </div>
                                    <div className="p-5">
                                        <div className="heatmap-grid">
                                            {companies.map(c => {
                                                const intensity = Math.min(Math.abs(c.change) / 5, 1);
                                                const bgColor = c.change >= 0
                                                    ? `rgba(34, 197, 94, ${0.3 + intensity * 0.5})`
                                                    : `rgba(239, 68, 68, ${0.3 + intensity * 0.5})`;

                                                return (
                                                    <div
                                                        key={c.symbol}
                                                        className="heat-cell"
                                                        style={{ background: bgColor }}
                                                        onClick={() => selectCompany(c.symbol)}
                                                    >
                                                        <div className="heat-symbol">{c.symbol}</div>
                                                        <div className="heat-change">
                                                            {c.change >= 0 ? '+' : ''}{c.change.toFixed(1)}%
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* News Feed */}
                                <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col">
                                    <div className="px-5 py-4 border-b border-border">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-sm font-semibold text-foreground">Market News</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {newsLoading ? 'Loading...' : `${marketNews.length} updates`}
                                                </div>
                                            </div>
                                            <button
                                                onClick={refetchNews}
                                                disabled={newsLoading}
                                                className="p-1.5 hover:bg-accent rounded-lg transition-colors disabled:opacity-50"
                                                title="Refresh news"
                                            >
                                                <RefreshCw className={`w-4 h-4 ${newsLoading ? 'animate-spin' : ''}`} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-5 space-y-3 overflow-y-auto" style={{ maxHeight: '605px' }}>
                                        {newsLoading && marketNews.length === 0 ? (
                                            <div className="flex items-center justify-center py-8 text-muted-foreground">
                                                <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                                                Loading news...
                                            </div>
                                        ) : newsError ? (
                                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                                <AlertCircle className="w-8 h-8 text-destructive mb-2" />
                                                <div className="text-sm text-foreground font-medium mb-1">Failed to load news</div>
                                                <div className="text-xs text-muted-foreground mb-3">{newsError}</div>
                                                <Button
                                                    onClick={refetchNews}
                                                    size="sm"
                                                    variant="outline"
                                                >
                                                    Try Again
                                                </Button>
                                            </div>
                                        ) : marketNews.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                                <div className="text-sm">No news available</div>
                                                <div className="text-xs mt-1">Check back later for updates</div>
                                            </div>
                                        ) : (
                                            marketNews.map((news) => (
                                                <div
                                                    key={news.id}
                                                    className="pb-3 border-b border-border last:border-0 last:pb-0 px-3 py-2 -mx-3 rounded-lg cursor-pointer transition-colors hover:bg-accent/30"
                                                    onClick={() => {
                                                        // console.log('News clicked:', { title: news.title, url: news.url });
                                                        if (news.url) {
                                                            window.open(news.url, '_blank');
                                                        } else {
                                                            // console.warn('No URL available for this news item');
                                                        }
                                                    }}
                                                >
                                                    <div className="flex items-center justify-between gap-2 mb-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                                                                {news.company}
                                                            </span>
                                                            <div className="text-xs text-muted-foreground">{news.timeAgo}</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-sm font-semibold text-foreground leading-snug hover:text-primary transition-colors">
                                                        {news.title}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Comparison Chart - Full Width */}
                        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm mt-4">
                            <div className="px-5 py-4 border-b border-border">
                                <div className="text-sm font-semibold text-foreground">Performance Comparison</div>
                                <div className="text-xs text-muted-foreground">Normalized returns • 30 Day</div>
                            </div>
                            <div className="py-5">
                                <div className="compare-chart-container">
                                    <canvas ref={compareChartRef}></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </div >
            )}
        </PageLayout >
    );
};

export default MarketData;
