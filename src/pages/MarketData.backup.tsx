import React, { useState, useEffect, useRef, useCallback } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import Chart from 'chart.js/auto';
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

// ============================================
// COMPANY DATA WITH BRAND COLORS
// ============================================
const initialCompanies = [
    {
        symbol: 'BSP',
        name: 'Bank South Pacific',
        sector: 'Financials',
        last: 28.00,
        change: 1.8,
        vol: 10200,
        mcap: 'K 60.2B',
        colors: { primary: '#0066cc', secondary: '#0099ff', glow: 'rgba(0, 102, 204, 0.3)' }
    },
    {
        symbol: 'KSL',
        name: 'Kina Securities Limited',
        sector: 'Financials',
        last: 2.85,
        change: -2.1,
        vol: 8500,
        mcap: 'K 12.3B',
        colors: { primary: '#e63946', secondary: '#ff6b6b', glow: 'rgba(230, 57, 70, 0.3)' }
    },
    {
        symbol: 'CCP',
        name: 'Credit Corporation PNG',
        sector: 'Financials',
        last: 1.95,
        change: 3.2,
        vol: 15000,
        mcap: 'K 8.5B',
        colors: { primary: '#2a9d8f', secondary: '#40c9b4', glow: 'rgba(42, 157, 143, 0.3)' }
    },
    {
        symbol: 'KAM',
        name: 'Kina Asset Management',
        sector: 'Asset Management',
        last: 0.85,
        change: 0.6,
        vol: 3200,
        mcap: 'K 2.1B',
        colors: { primary: '#9b5de5', secondary: '#c77dff', glow: 'rgba(155, 93, 229, 0.3)' }
    },
    {
        symbol: 'NCM',
        name: 'Newcrest Mining',
        sector: 'Mining',
        last: 45.20,
        change: 4.5,
        vol: 25000,
        mcap: 'K 95.4B',
        colors: { primary: '#f59e0b', secondary: '#fbbf24', glow: 'rgba(245, 158, 11, 0.3)' }
    },
    {
        symbol: 'OSH',
        name: 'Oil Search Limited',
        sector: 'Energy',
        last: 4.12,
        change: -1.3,
        vol: 18500,
        mcap: 'K 28.7B',
        colors: { primary: '#059669', secondary: '#10b981', glow: 'rgba(5, 150, 105, 0.3)' }
    },
    {
        symbol: 'STO',
        name: 'Santos Limited',
        sector: 'Energy',
        last: 6.78,
        change: 2.1,
        vol: 12000,
        mcap: 'K 35.2B',
        colors: { primary: '#dc2626', secondary: '#ef4444', glow: 'rgba(220, 38, 38, 0.3)' }
    },
    {
        symbol: 'NGP',
        name: 'NGIP Agmark',
        sector: 'Agriculture',
        last: 0.42,
        change: -0.8,
        vol: 5600,
        mcap: 'K 1.8B',
        colors: { primary: '#65a30d', secondary: '#84cc16', glow: 'rgba(101, 163, 13, 0.3)' }
    },
    {
        symbol: 'CPL',
        name: 'CPL Group',
        sector: 'Industrial',
        last: 0.68,
        change: 1.2,
        vol: 4200,
        mcap: 'K 3.2B',
        colors: { primary: '#7c3aed', secondary: '#a78bfa', glow: 'rgba(124, 58, 237, 0.3)' }
    },
    {
        symbol: 'SST',
        name: 'Steamships Trading',
        sector: 'Conglomerate',
        last: 2.35,
        change: 0.4,
        vol: 7800,
        mcap: 'K 15.6B',
        colors: { primary: '#0891b2', secondary: '#22d3ee', glow: 'rgba(8, 145, 178, 0.3)' }
    }
];

// Generate price history for each company
const generatePriceHistory = (startPrice: number, change: number, days = 60): PricePoint[] => {
    const history: PricePoint[] = [];
    const endPrice = startPrice;
    const start = startPrice * (1 - change / 100 * 1.5);
    const volatility = startPrice * 0.02;

    for (let i = 0; i < days; i++) {
        const progress = i / (days - 1);
        const trend = start + (endPrice - start) * progress;
        const noise = (Math.random() - 0.5) * volatility;
        const close = Math.max(0.01, trend + noise);
        const open = close + (Math.random() - 0.5) * volatility * 0.5;
        const high = Math.max(open, close) + Math.random() * volatility * 0.3;
        const low = Math.min(open, close) - Math.random() * volatility * 0.3;
        const vol = Math.round(500 + Math.random() * 2000);

        history.push({
            time: Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000,
            open: +open.toFixed(2),
            high: +high.toFixed(2),
            low: +low.toFixed(2),
            close: +close.toFixed(2),
            volume: vol
        });
    }
    return history;
};

// Initialize companies with history
const initializeCompanies = (): Company[] => {
    return initialCompanies.map(c => ({
        ...c,
        history: generatePriceHistory(c.last, c.change)
    }));
};

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
    const [companies, setCompanies] = useState<Company[]>(() => initializeCompanies());
    const [selectedSymbol, setSelectedSymbol] = useState('BSP');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const [isFullscreen, setIsFullscreen] = useState(false);

    const mainChartRef = useRef<HTMLCanvasElement>(null);
    const compareChartRef = useRef<HTMLCanvasElement>(null);
    const mainChartInstance = useRef<Chart | null>(null);
    const compareChartInstance = useRef<Chart | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedCompany = companies.find(c => c.symbol === selectedSymbol) || companies[0];
    const topGainer = companies.reduce((a, b) => a.change > b.change ? a : b);
    const totalVolume = companies.reduce((acc, c) => acc + c.vol, 0);

    // CSS Variables based on selected company
    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--company-primary', selectedCompany.colors.primary);
        root.style.setProperty('--company-secondary', selectedCompany.colors.secondary);
        root.style.setProperty('--company-glow', selectedCompany.colors.glow);
    }, [selectedCompany]);

    // Create/Update Main Chart
    const createMainChart = useCallback(() => {
        const ctx = mainChartRef.current?.getContext('2d');
        if (!ctx || !selectedCompany) return;

        const history = selectedCompany.history;
        const labels = history.map(h => {
            const d = new Date(h.time);
            return `${d.getMonth() + 1}/${d.getDate()}`;
        });
        const prices = history.map(h => h.close);

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
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleFont: { family: 'DM Sans', weight: '600' },
                        bodyFont: { family: 'Space Mono' },
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
                            color: '#6b7280',
                            font: { size: 10 },
                            maxTicksLimit: 10
                        }
                    },
                    y: {
                        grid: { color: 'rgba(255,255,255,0.04)' },
                        ticks: {
                            color: '#6b7280',
                            font: { family: 'Space Mono', size: 10 },
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
    }, [selectedCompany]);

    // Create Compare Chart
    const createCompareChart = useCallback(() => {
        const ctx = compareChartRef.current?.getContext('2d');
        if (!ctx || companies.length === 0) return;

        const datasets = companies.slice(0, 5).map(c => {
            const basePrice = c.history[0]?.close || 1;
            return {
                label: c.symbol,
                data: c.history.map(h => ((h.close / basePrice) - 1) * 100),
                borderColor: c.colors.primary,
                borderWidth: 1.5,
                pointRadius: 0,
                tension: 0.3
            };
        });

        const labels = companies[0]?.history.map(h => {
            const d = new Date(h.time);
            return `${d.getMonth() + 1}/${d.getDate()}`;
        }) || [];

        if (compareChartInstance.current) {
            compareChartInstance.current.destroy();
        }

        compareChartInstance.current = new Chart(ctx, {
            type: 'line',
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#6b7280',
                            usePointStyle: true,
                            pointStyle: 'circle',
                            padding: 16,
                            font: { size: 11 }
                        }
                    }
                },
                scales: {
                    x: { display: false },
                    y: {
                        grid: { color: 'rgba(255,255,255,0.04)' },
                        ticks: {
                            color: '#6b7280',
                            font: { size: 10 },
                            callback: (v: any) => v.toFixed(0) + '%'
                        }
                    }
                }
            }
        });
    }, [companies]);

    // Select company handler
    const selectCompany = useCallback((symbol: string) => {
        setSelectedSymbol(symbol);
    }, []);

    // Reset view
    const resetView = () => {
        setSearchQuery('');
        setSelectedSymbol('BSP');
    };

    // Download CSV
    const downloadCSV = () => {
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

    // Search handler
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value.toUpperCase().trim();
        setSearchQuery(e.target.value);
        if (query) {
            const found = companies.find(c =>
                c.symbol.includes(query) || c.name.toUpperCase().includes(query)
            );
            if (found) selectCompany(found.symbol);
        }
    };

    // Live data simulation
    useEffect(() => {
        const interval = setInterval(() => {
            setCompanies(prevCompanies => {
                return prevCompanies.map(c => {
                    const movement = (Math.random() - 0.5) * 0.02;
                    const newPrice = +(c.last * (1 + movement)).toFixed(2);
                    const newChange = +(c.change + (Math.random() - 0.5) * 0.1).toFixed(2);

                    const lastPoint = c.history[c.history.length - 1];
                    const newHistory = [...c.history, {
                        time: Date.now(),
                        open: lastPoint.close,
                        high: Math.max(lastPoint.close, newPrice),
                        low: Math.min(lastPoint.close, newPrice),
                        close: newPrice,
                        volume: Math.round(Math.random() * 500 + 100)
                    }];

                    if (newHistory.length > 100) newHistory.shift();

                    return {
                        ...c,
                        last: newPrice,
                        change: newChange,
                        history: newHistory
                    };
                });
            });
        }, 2000);

        return () => clearInterval(interval);
    }, []);

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
            const newData = selectedCompany.history.map(h => h.close);
            mainChartInstance.current.data.datasets[0].data = newData;
            mainChartInstance.current.update('none');
        }
    }, [companies, selectedCompany]);

    return (
        <PageLayout>
            <div className="market-data-page" ref={containerRef}>
                <div className="bg-grid"></div>

                <div className="app-container">
                    {/* Top Bar */}
                    <header className="topbar">
                        <div className="brand">
                            <div className="logo">PNGX</div>
                            <div className="title-group">
                                <h1>PNGX Market Dashboard</h1>
                                <div className="subtitle">Papua New Guinea Stock Exchange • Live Data</div>
                            </div>
                        </div>

                        <div className="market-status">
                            <div className="status-dot"></div>
                            <span>Market Open</span>
                            <span style={{ color: 'var(--muted)' }}>|</span>
                            <span>{currentTime}</span>
                        </div>

                        <div className="controls">
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search ticker..."
                                value={searchQuery}
                                onChange={handleSearch}
                            />
                            <button className="btn" onClick={resetView}>Reset</button>
                            <button className="btn" onClick={toggleFullscreen}>
                                {isFullscreen ? '⊗ Exit Fullscreen' : '⛶ Fullscreen'}
                            </button>
                            <button className="btn primary" onClick={downloadCSV}>Export CSV</button>
                        </div>
                    </header>

                    {/* KPI Row */}
                    <div className="kpi-row">
                        <div className="kpi">
                            <div className="kpi-label">Total Market Cap</div>
                            <div className="kpi-value">K 145.2B</div>
                            <div className="kpi-change positive">+2.4%</div>
                        </div>
                        <div className="kpi">
                            <div className="kpi-label">Total Volume</div>
                            <div className="kpi-value">{totalVolume.toLocaleString()}</div>
                            <div className="kpi-change positive">+12.8%</div>
                        </div>
                        <div className="kpi">
                            <div className="kpi-label">Trades Today</div>
                            <div className="kpi-value">156</div>
                            <div className="kpi-change">+24</div>
                        </div>
                        <div className="kpi">
                            <div className="kpi-label">Top Gainer</div>
                            <div className="kpi-value">{topGainer.symbol}</div>
                            <div className="kpi-change positive">+{topGainer.change.toFixed(1)}%</div>
                        </div>
                    </div>

                    {/* Ticker Strip */}
                    <div className="ticker-strip">
                        {companies.map(c => (
                            <div
                                key={c.symbol}
                                className={`ticker-chip ${c.symbol === selectedSymbol ? 'active' : ''}`}
                                onClick={() => selectCompany(c.symbol)}
                                style={c.symbol === selectedSymbol ? {
                                    borderColor: c.colors.primary,
                                    background: c.colors.glow
                                } : {}}
                            >
                                <span className="symbol">{c.symbol}</span>
                                <span className="price">K {c.last.toFixed(2)}</span>
                                <span className={`change ${c.change >= 0 ? 'positive' : 'negative'}`}>
                                    {c.change >= 0 ? '+' : ''}{c.change.toFixed(1)}%
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="main-grid">
                        <div className="main-content">
                            {/* Main Chart Card */}
                            <div className="card-custom">
                                <div className="card-body-custom">
                                    <div className="selected-company">
                                        <div
                                            className="company-logo"
                                            style={{
                                                background: `linear-gradient(135deg, ${selectedCompany.colors.primary}, ${selectedCompany.colors.secondary})`,
                                                boxShadow: `0 0 40px ${selectedCompany.colors.glow}`
                                            }}
                                        >
                                            {selectedCompany.symbol}
                                        </div>
                                        <div className="company-info">
                                            <h2>{selectedCompany.name}</h2>
                                            <div className="sector">Sector: {selectedCompany.sector}</div>
                                            <div className="company-stats">
                                                <div className="stat">
                                                    <span className="stat-label">Last Price</span>
                                                    <span className="stat-value">K {selectedCompany.last.toFixed(2)}</span>
                                                </div>
                                                <div className="stat">
                                                    <span className="stat-label">Change</span>
                                                    <span className={`stat-value ${selectedCompany.change >= 0 ? 'positive' : 'negative'}`}>
                                                        {selectedCompany.change >= 0 ? '+' : ''}{selectedCompany.change.toFixed(1)}%
                                                    </span>
                                                </div>
                                                <div className="stat">
                                                    <span className="stat-label">Volume</span>
                                                    <span className="stat-value">{selectedCompany.vol.toLocaleString()}</span>
                                                </div>
                                                <div className="stat">
                                                    <span className="stat-label">Market Cap</span>
                                                    <span className="stat-value">{selectedCompany.mcap}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="chart-container">
                                        <canvas ref={mainChartRef} style={{ width: '100%', height: '100%' }}></canvas>
                                        <div className="chart-gradient-overlay"></div>
                                    </div>

                                    {/* Volume Bars */}
                                    <div className="volume-bars">
                                        {selectedCompany.history.slice(-30).map((h, i) => {
                                            const volumes = selectedCompany.history.slice(-30).map(x => x.volume);
                                            const maxVol = Math.max(...volumes);
                                            const height = (h.volume / maxVol) * 100;
                                            return (
                                                <div
                                                    key={i}
                                                    className="vol-bar"
                                                    style={{ height: `${height}%`, background: selectedCompany.colors.primary }}
                                                ></div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Market Table */}
                            <div className="card-custom" style={{ marginTop: 16 }}>
                                <div className="card-header-custom">
                                    <div>
                                        <div className="card-title-custom">Market Overview</div>
                                        <div className="card-subtitle-custom">Click row to select • Live updates</div>
                                    </div>
                                </div>
                                <table className="market-table">
                                    <thead>
                                        <tr>
                                            <th>Symbol</th>
                                            <th>Last Price</th>
                                            <th>Change</th>
                                            <th>Volume</th>
                                            <th>Market Cap</th>
                                            <th>Chart</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {companies.map(c => (
                                            <tr
                                                key={c.symbol}
                                                className={c.symbol === selectedSymbol ? 'active' : ''}
                                                onClick={() => selectCompany(c.symbol)}
                                            >
                                                <td>
                                                    <div className="table-symbol">
                                                        <div
                                                            className="table-logo"
                                                            style={{ background: `linear-gradient(135deg, ${c.colors.primary}, ${c.colors.secondary})` }}
                                                        >
                                                            {c.symbol.slice(0, 3)}
                                                        </div>
                                                        <div>
                                                            <div className="table-symbol-text">{c.symbol}</div>
                                                            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{c.name}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="table-price">K {c.last.toFixed(2)}</td>
                                                <td className={`table-change ${c.change >= 0 ? 'positive' : 'negative'}`}>
                                                    {c.change >= 0 ? '+' : ''}{c.change.toFixed(1)}%
                                                </td>
                                                <td>{c.vol.toLocaleString()}</td>
                                                <td>{c.mcap}</td>
                                                <td className="sparkline-cell">
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

                            {/* Comparison Chart */}
                            <div className="card-custom" style={{ marginTop: 16 }}>
                                <div className="card-header-custom">
                                    <div>
                                        <div className="card-title-custom">Performance Comparison</div>
                                        <div className="card-subtitle-custom">Normalized returns • 30 Day</div>
                                    </div>
                                </div>
                                <div className="card-body-custom">
                                    <div className="compare-chart-container">
                                        <canvas ref={compareChartRef}></canvas>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="market-right-panel">
                            {/* Live Price Card */}
                            <div className="card-custom">
                                <div className="card-header-custom">
                                    <div className="card-title-custom">Live Price</div>
                                    <div className="card-subtitle-custom">{selectedSymbol}</div>
                                </div>
                                <div className="card-body-custom">
                                    <div className="live-ticker">
                                        <div className="live-dot"></div>
                                        <div className="live-price">K {selectedCompany.last.toFixed(2)}</div>
                                        <div className={`live-change ${selectedCompany.change >= 0 ? 'positive' : 'negative'}`}>
                                            {selectedCompany.change >= 0 ? '+' : ''}{selectedCompany.change.toFixed(1)}%
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Heatmap */}
                            <div className="card-custom">
                                <div className="card-header-custom">
                                    <div className="card-title-custom">Market Heatmap</div>
                                    <div className="card-subtitle-custom">Daily % change</div>
                                </div>
                                <div className="card-body-custom">
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
                            <div className="card-custom">
                                <div className="card-header-custom">
                                    <div className="card-title-custom">Market News</div>
                                    <div className="card-subtitle-custom">Latest updates</div>
                                </div>
                                <div className="card-body-custom">
                                    <div className="news-item">
                                        <div className="news-time">2 hours ago</div>
                                        <div className="news-title">PNGX records highest trading volume in Q4</div>
                                    </div>
                                    <div className="news-item">
                                        <div className="news-time">5 hours ago</div>
                                        <div className="news-title">BSP announces quarterly dividend of K 0.45</div>
                                    </div>
                                    <div className="news-item">
                                        <div className="news-time">Yesterday</div>
                                        <div className="news-title">Mining sector leads market gains on commodity prices</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default MarketData;
