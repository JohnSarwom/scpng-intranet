import { useState, useEffect, useCallback } from 'react';
import {
    getCompanies,
    getAllPriceHistory,
    getMarketSettings,
    updateCompanyColors as updateCompanyColorsService,
    Company,
    PricePoint,
    MarketSettings,
} from '@/services/marketDataSharePointService';

export interface CompanyWithHistory extends Company {
    history: PricePoint[];
}

interface UseMarketDataReturn {
    companies: CompanyWithHistory[];
    settings: MarketSettings | null;
    isLoading: boolean;
    error: string | null;
    refetch: (isSilent?: boolean) => Promise<void>;
    updateCompanyColors: (symbol: string, primaryColor: string, secondaryColor: string) => Promise<void>;
}

/**
 * Hook to fetch and manage market data from SharePoint
 */


export function useMarketData(): UseMarketDataReturn {
    const [companies, setCompanies] = useState<CompanyWithHistory[]>([]);
    const [settings, setSettings] = useState<MarketSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetch all market data (companies, history, settings)
     */
    const fetchData = useCallback(async (isSilent: boolean = false) => {
        try {
            if (!isSilent) {
                setIsLoading(true);
                setError(null);
            }

            // Fetch in parallel for better performance
            const [companiesData, historyMap, settingsData] = await Promise.all([
                getCompanies(),
                getAllPriceHistory(400), // Fetch 400 days of history
                getMarketSettings(),
            ]);

            // Merge companies with their history
            const companiesWithHistory: CompanyWithHistory[] = companiesData.map(company => {
                let history = historyMap.get(company.symbol) || [];



                return {
                    ...company,
                    history,
                };
            });

            setCompanies(companiesWithHistory);
            setSettings(settingsData);
            setError(null);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch market data';
            setError(message);
            console.error('Error fetching market data:', err);
        } finally {
            if (!isSilent) {
                setIsLoading(false);
            }
        }
    }, []);

    /**
     * Update company colors in SharePoint and local state
     */
    const updateCompanyColors = useCallback(async (
        symbol: string,
        primaryColor: string,
        secondaryColor: string
    ) => {
        try {
            // Update in SharePoint
            await updateCompanyColorsService(symbol, primaryColor, secondaryColor);

            // Update local state
            setCompanies(prevCompanies =>
                prevCompanies.map(company => {
                    if (company.symbol === symbol) {
                        // Calculate glow color from primary
                        const r = parseInt(primaryColor.slice(1, 3), 16);
                        const g = parseInt(primaryColor.slice(3, 5), 16);
                        const b = parseInt(primaryColor.slice(5, 7), 16);
                        const glow = `rgba(${r}, ${g}, ${b}, 0.3)`;

                        return {
                            ...company,
                            colors: {
                                primary: primaryColor,
                                secondary: secondaryColor,
                                glow,
                            },
                        };
                    }
                    return company;
                })
            );
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to update colors';
            console.error('Error updating company colors:', err);
            throw new Error(message);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        companies,
        settings,
        isLoading,
        error,
        refetch: fetchData,
        updateCompanyColors,
    };
}

/**
 * Hook to simulate live updates for market data
 * This adds new price points to existing history based on SharePoint data
 */
export function useLiveMarketUpdates(
    companies: CompanyWithHistory[],
    isEnabled: boolean,
    interval: number = 60000, // Default to 60s for real data polling
    onRefresh?: (isSilent?: boolean) => void
): CompanyWithHistory[] {
    useEffect(() => {
        if (!isEnabled || !onRefresh) return;

        const intervalId = setInterval(() => {
            console.log('Auto-refreshing market data...');
            onRefresh(true);
        }, interval);

        return () => clearInterval(intervalId);
    }, [isEnabled, interval, onRefresh]);

    // Return the companies as-is (no simulation)
    return companies;
}

export default useMarketData;
