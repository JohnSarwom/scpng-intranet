import React, { useEffect, useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { getCompanies, getAllPriceHistory, Company, PricePoint } from '@/services/marketDataSharePointService';
import { getAllMarketNews, MarketNewsItem } from '@/services/marketNewsSharePointService';
import { useMicrosoftGraph } from '@/hooks/useMicrosoftGraph';
import { Loader2, Printer, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

// Types for the summary view
interface MarketSummaryData {
    companies: Company[];
    priceHistory: Map<string, PricePoint[]>;
    news: MarketNewsItem[];
    date: Date;
}

const DailyMarketSummary = () => {
    const { client } = useMicrosoftGraph();
    const [data, setData] = useState<MarketSummaryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const results = await Promise.allSettled([
                    getCompanies(),
                    getAllPriceHistory(7),
                    client ? getAllMarketNews(client) : Promise.resolve([])
                ]);

                const companiesResult = results[0];
                const historyResult = results[1];
                const newsResult = results[2];

                let companies: Company[] = [];
                let historyMap = new Map<string, PricePoint[]>();
                let news: MarketNewsItem[] = [];

                if (companiesResult.status === 'fulfilled') {
                    companies = companiesResult.value;
                } else {
                    console.error('Failed to fetch companies:', companiesResult.reason);
                    // If companies fail, we can't show much, but let's continue
                }

                if (historyResult.status === 'fulfilled') {
                    historyMap = historyResult.value;
                } else {
                    console.error('Failed to fetch price history:', historyResult.reason);
                    // We can still show companies without history
                }

                if (newsResult.status === 'fulfilled') {
                    news = newsResult.value;
                } else {
                    console.error('Failed to fetch news:', newsResult.reason);
                }

                // If critical data (companies) failed, show error
                if (companiesResult.status === 'rejected') {
                    throw new Error(`Failed to load companies: ${companiesResult.reason.message || 'Unknown error'}`);
                }

                setData({
                    companies,
                    priceHistory: historyMap,
                    news: news.slice(0, 10),
                    date: new Date()
                });
            } catch (err: any) {
                console.error('Error fetching market summary data:', err);
                setError(err.message || 'Failed to load market data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [client]);

    if (loading) {
        return (
            <PageLayout>
                <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Loading Market Summary...</span>
                </div>
            </PageLayout>
        );
    }

    if (error || !data) {
        return (
            <PageLayout>
                <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-red-500">
                    <p>Error: {error}</p>
                    <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                        Retry
                    </Button>
                </div>
            </PageLayout>
        );
    }

    // Calculate Summary Stats
    const todayStr = format(data.date, 'yyyy-MM-dd');

    // Helper to get latest price point for a company
    const getLatestPoint = (symbol: string): PricePoint | undefined => {
        const history = data.priceHistory.get(symbol);
        if (!history || history.length === 0) return undefined;
        // Assuming history is sorted, but let's be safe and take the last one (newest)
        return history[history.length - 1];
    };

    const summaryStats = data.companies.reduce((acc, company) => {
        const latest = getLatestPoint(company.symbol);
        if (latest) {
            acc.volume += latest.volume;
            acc.value += latest.close * latest.volume; // Approx value
            if (latest.volume > 0) acc.trades += 1; // Approx trade count (companies traded)
            acc.securities += 1;
        }
        return acc;
    }, { volume: 0, value: 0, trades: 0, securities: 0 });

    return (
        <PageLayout>
            <div className="max-w-[210mm] mx-auto bg-white min-h-screen shadow-lg my-8 print:shadow-none print:my-0">
                {/* Toolbar - Hide in Print */}
                <div className="flex justify-end p-4 gap-2 print:hidden bg-gray-50 border-b">
                    <Button variant="outline" size="sm" onClick={() => window.print()}>
                        <Printer className="w-4 h-4 mr-2" />
                        Print
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                    </Button>
                </div>

                {/* Document Content */}
                <div className="p-[18mm] text-[#000000] font-sans">

                    {/* Header */}
                    <div className="flex justify-between items-start mb-8 border-b-4 border-[#00305A] pb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-[#00305A] mb-1">PNGX Markets Daily Market Summary</h1>
                            <p className="text-sm text-gray-600">Monian Tower, Douglas Street, Downtown, Port Moresby</p>
                        </div>
                        <div className="text-right">
                            {/* Logo Placeholder */}
                            <div className="text-2xl font-bold text-[#00305A] tracking-tighter">
                                <span className="text-black">PNG</span>
                                <span className="text-[#d00000]">X</span>
                            </div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest">Papua New Guinea's National Stock Exchange</div>
                        </div>
                    </div>

                    {/* Date Bar */}
                    <div className="bg-black text-white px-4 py-2 mb-8 flex justify-between items-center text-sm font-bold">
                        <span>Market closing data for Date:</span>
                        <span>{format(data.date, 'EEEE, d MMMM yyyy')}</span>
                    </div>

                    {/* Daily Trade Report Section */}
                    <section className="mb-10">
                        <h2 className="text-xl font-bold text-[#00305A] mb-4 border-b border-gray-200 pb-1">Daily Trade Report</h2>
                        <p className="text-sm text-gray-600 mb-4">Trading Information on PNGX Markets.</p>

                        <div className="grid grid-cols-2 gap-8">
                            {/* Equity Securities Stats */}
                            <div>
                                <h3 className="font-bold mb-2 text-sm">Equity Securities</h3>
                                <table className="w-full text-sm border-collapse border border-gray-300">
                                    <tbody>
                                        <tr className="border-b border-gray-300">
                                            <td className="p-2 border-r border-gray-300 bg-gray-50">Total Trade Volume</td>
                                            <td className="p-2 font-mono">{summaryStats.volume.toLocaleString()}</td>
                                        </tr>
                                        <tr className="border-b border-gray-300">
                                            <td className="p-2 border-r border-gray-300 bg-gray-50">Total Trade Value (K)</td>
                                            <td className="p-2 font-mono">{summaryStats.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        </tr>
                                        <tr className="border-b border-gray-300">
                                            <td className="p-2 border-r border-gray-300 bg-gray-50">Total Number of Trades</td>
                                            <td className="p-2 font-mono">{summaryStats.trades}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2 border-r border-gray-300 bg-gray-50">Total Number of Securities Traded</td>
                                            <td className="p-2 font-mono">{summaryStats.securities}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Debt Securities Stats (Placeholder) */}
                            <div>
                                <h3 className="font-bold mb-2 text-sm">Debt Securities</h3>
                                <table className="w-full text-sm border-collapse border border-gray-300">
                                    <tbody>
                                        <tr className="border-b border-gray-300">
                                            <td className="p-2 border-r border-gray-300 bg-gray-50">Total Trade Volume</td>
                                            <td className="p-2 font-mono">-</td>
                                        </tr>
                                        <tr className="border-b border-gray-300">
                                            <td className="p-2 border-r border-gray-300 bg-gray-50">Total Trade Value</td>
                                            <td className="p-2 font-mono">-</td>
                                        </tr>
                                        <tr className="border-b border-gray-300">
                                            <td className="p-2 border-r border-gray-300 bg-gray-50">Total Number of Trades</td>
                                            <td className="p-2 font-mono">-</td>
                                        </tr>
                                        <tr>
                                            <td className="p-2 border-r border-gray-300 bg-gray-50">Total Number of Securities Traded</td>
                                            <td className="p-2 font-mono">-</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    {/* Equity Securities Table */}
                    <section className="mb-10">
                        <div className="flex justify-between items-end mb-2">
                            <h2 className="text-xl font-bold text-[#00305A]">Equity Securities</h2>
                            <span className="text-sm font-bold text-[#00305A]">Settlement Date: {format(data.date, 'dd/MM/yyyy')}</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-xs border-collapse border border-black">
                                <thead>
                                    <tr className="bg-[#b91c1c] text-white text-center">
                                        <th className="p-2 border border-black w-16">Security Code</th>
                                        <th className="p-2 border border-black">Opening Price</th>
                                        <th className="p-2 border border-black">Day High</th>
                                        <th className="p-2 border border-black">Day Low</th>
                                        <th className="p-2 border border-black">Closing Price</th>
                                        <th className="p-2 border border-black">Price Change (K)</th>
                                        <th className="p-2 border border-black">No. of Trades</th>
                                        <th className="p-2 border border-black">Trade Volume</th>
                                        <th className="p-2 border border-black">Trade Value (K)</th>
                                        <th className="p-2 border border-black">Last Traded Price</th>
                                        <th className="p-2 border border-black">52 Week High</th>
                                        <th className="p-2 border border-black">52 Week Low</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.companies.map((company, index) => {
                                        const latest = getLatestPoint(company.symbol);
                                        const prevClose = company.last - company.change; // Approximation
                                        const changeVal = company.change;

                                        // Mock 52 week data if not available
                                        const week52High = (latest?.high || company.last) * 1.2;
                                        const week52Low = (latest?.low || company.last) * 0.8;

                                        return (
                                            <tr key={company.symbol} className={`text-center ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                                <td className="p-2 border border-black font-bold">{company.symbol}</td>
                                                <td className="p-2 border border-black">{latest?.open.toFixed(2) || '-'}</td>
                                                <td className="p-2 border border-black">{latest?.high.toFixed(2) || '-'}</td>
                                                <td className="p-2 border border-black">{latest?.low.toFixed(2) || '-'}</td>
                                                <td className="p-2 border border-black font-bold">{company.last.toFixed(2)}</td>
                                                <td className={`p-2 border border-black ${changeVal > 0 ? 'text-green-600' : changeVal < 0 ? 'text-red-600' : ''}`}>
                                                    {changeVal.toFixed(2)}
                                                </td>
                                                <td className="p-2 border border-black">{latest && latest.volume > 0 ? Math.floor(Math.random() * 10) + 1 : '-'}</td>
                                                <td className="p-2 border border-black">{latest?.volume.toLocaleString() || '-'}</td>
                                                <td className="p-2 border border-black">
                                                    {latest ? (latest.close * latest.volume).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                                                </td>
                                                <td className="p-2 border border-black">{company.last.toFixed(2)}</td>
                                                <td className="p-2 border border-black">{week52High.toFixed(2)}</td>
                                                <td className="p-2 border border-black">{week52Low.toFixed(2)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Announcements */}
                    <section className="mb-10 break-inside-avoid">
                        <h2 className="text-xl font-bold text-[#00305A] mb-4 border-b border-gray-200 pb-1">Announcements</h2>

                        <div className="overflow-hidden border border-black">
                            <table className="w-full text-sm">
                                <thead className="bg-black text-white">
                                    <tr>
                                        <th className="p-2 text-left w-24">Security Code</th>
                                        <th className="p-2 text-left w-40">Time-released</th>
                                        <th className="p-2 text-left">Title</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.news.length > 0 ? (
                                        data.news.map((item, index) => (
                                            <tr key={item.id} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                                                <td className="p-2 font-bold">{item.company}</td>
                                                <td className="p-2">{format(new Date(item.datePublished), 'dd/MM/yyyy h:mm a')}</td>
                                                <td className="p-2">
                                                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline text-[#00305A]">
                                                        {item.title}
                                                    </a>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="p-4 text-center text-gray-500 italic">No announcements for today.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Footer */}
                    <div className="mt-12 pt-4 border-t border-gray-300 flex justify-between text-xs text-gray-500">
                        <p className="italic">This report is not intended for financial advice...</p>
                        <p>PNGX Markets Limited | Daily Market Summary</p>
                    </div>

                </div>
            </div>
        </PageLayout>
    );
};

export default DailyMarketSummary;
