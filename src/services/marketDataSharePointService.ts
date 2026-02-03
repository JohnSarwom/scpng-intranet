import { getMsalInstance } from '@/integrations/microsoft/msalService';

// ============================================
// TYPES
// ============================================

export interface SPCompany {
    Id: number;
    Title: string; // Symbol
    CompanyName: string;
    Sector: string;
    LastPrice: number;
    PreviousClose: number;
    ChangePercent: number;
    Volume: number;
    MarketCap: string;
    CompanyLogo?: {
        Url: string;
        Description: string;
    };
    PrimaryColor: string;
    SecondaryColor: string;
    IsActive: boolean;
    DisplayOrder?: number;
    Website?: {
        Url: string;
        Description: string;
    };
    Description?: string;
}

export interface SPPriceHistory {
    Id: number;
    Title: string;
    CompanySymbol: string | { Title: string };
    TradeDate: string;
    OpenPrice: number;
    HighPrice: number;
    LowPrice: number;
    ClosePrice: number;
    Volume: number;
    NumberOfTrades?: number;
    Value?: number;
}

export interface SPMarketSetting {
    Id: number;
    Title: string;
    SettingKey: string;
    SettingValue: string;
    SettingType: 'String' | 'Number' | 'Boolean' | 'JSON' | 'Color';
    Category: string;
    Description?: string;
    IsActive: boolean;
}

export interface Company {
    symbol: string;
    name: string;
    sector: string;
    last: number;
    change: number;
    vol: number;
    mcap: string;
    logo?: string;
    colors: {
        primary: string;
        secondary: string;
        glow: string;
    };
    website?: string;
    description?: string;
}

export interface PricePoint {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface MarketSettings {
    defaultTimeRange: string;
    liveUpdatesEnabled: boolean;
    autoCycleEnabled: boolean;
    cycleInterval: number;
    updateInterval: number;
    chartAnimationDuration: number;
    maxDataPoints: number;
}

// ============================================
// CONFIGURATION
// ============================================

const SITE_URL = import.meta.env.VITE_SHAREPOINT_SITE_URL || 'https://scpng1.sharepoint.com/sites/scpngintranet';
console.log('MarketDataSharePointService: SITE_URL:', SITE_URL);
const COMPANIES_LIST = 'Market_Companies';
const PRICE_HISTORY_LIST = 'Market_PriceHistory';
const SETTINGS_LIST = 'Market_Settings';

// ============================================
// AUTHENTICATION
// ============================================

async function getAccessToken(): Promise<string> {
    const msalInstance = getMsalInstance();
    if (!msalInstance) {
        throw new Error('MSAL instance not initialized');
    }

    const accounts = msalInstance.getAllAccounts();
    if (accounts.length === 0) {
        throw new Error('No accounts found. Please sign in.');
    }

    // Extract the origin (e.g., https://scpng1.sharepoint.com) from the SITE_URL
    const siteOrigin = new URL(SITE_URL).origin;

    const request = {
        scopes: [`${siteOrigin}/.default`], // Request token for SharePoint REST API
        account: accounts[0],
    };

    try {
        const response = await msalInstance.acquireTokenSilent(request);
        return response.accessToken;
    } catch (error) {
        console.error('Error acquiring token:', error);
        const response = await msalInstance.acquireTokenPopup(request);
        return response.accessToken;
    }
}

// ============================================
// API HELPERS
// ============================================

async function fetchSharePointData<T>(endpoint: string): Promise<T> {
    const token = await getAccessToken();
    const url = `${SITE_URL}/_api/web/lists/getbytitle('${endpoint}')`;

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json;odata=verbose',
            'Content-Type': 'application/json;odata=verbose',
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('SharePoint API Error Details:', errorText);
        throw new Error(`SharePoint API error: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data.d.results || data.d;
}

async function fetchSharePointItems<T>(
    listName: string,
    select?: string,
    filter?: string,
    expand?: string,
    orderBy?: string,
    top?: number
): Promise<T[]> {
    const token = await getAccessToken();

    let url = `${SITE_URL}/_api/web/lists/getbytitle('${listName}')/items`;
    const params: string[] = [];

    if (select) params.push(`$select=${select}`);
    if (filter) params.push(`$filter=${filter}`);
    if (expand) params.push(`$expand=${expand}`);
    if (orderBy) params.push(`$orderby=${orderBy}`);
    if (top) params.push(`$top=${top}`);

    if (params.length > 0) {
        url += '?' + params.join('&');
    }

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json;odata=verbose',
            'Content-Type': 'application/json;odata=verbose',
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('SharePoint API Error Details:', errorText);
        throw new Error(`SharePoint API error: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data.d.results;
}

// ============================================
// TRANSFORMATION FUNCTIONS
// ============================================

// Default color palette for companies
const DEFAULT_COLORS: Record<string, { primary: string; secondary: string }> = {
    'BSP': { primary: '#0066cc', secondary: '#0099ff' },
    'CCP': { primary: '#2a9d8f', secondary: '#40c9b4' },
    'KSL': { primary: '#e63946', secondary: '#ff6b6b' },
    'NEM': { primary: '#f59e0b', secondary: '#fbbf24' },
    'NGP': { primary: '#65a30d', secondary: '#84cc16' },
    'CGA': { primary: '#d97706', secondary: '#f59e0b' },
    'CPL': { primary: '#7c3aed', secondary: '#a78bfa' },
    'KAM': { primary: '#9b5de5', secondary: '#c77dff' },
    'NIU': { primary: '#78716c', secondary: '#a8a29e' },
    'SST': { primary: '#0891b2', secondary: '#22d3ee' },
    'STO': { primary: '#dc2626', secondary: '#ef4444' },
    // Fallback for unknown companies
    'DEFAULT': { primary: '#6366f1', secondary: '#818cf8' },
};

function hexToRgba(hex: string, alpha: number = 0.3): string {
    // Handle empty or invalid hex values
    if (!hex || !hex.startsWith('#') || hex.length !== 7) {
        return `rgba(99, 102, 241, ${alpha})`; // Default purple
    }

    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function transformCompany(spCompany: SPCompany): Company {
    // Use SharePoint colors or fall back to defaults
    const defaultColors = DEFAULT_COLORS[spCompany.Title] || DEFAULT_COLORS['DEFAULT'];
    const primaryColor = spCompany.PrimaryColor || defaultColors.primary;
    const secondaryColor = spCompany.SecondaryColor || defaultColors.secondary;

    return {
        symbol: spCompany.Title,
        name: spCompany.CompanyName,
        sector: spCompany.Sector,
        last: spCompany.LastPrice,
        change: spCompany.ChangePercent,
        vol: spCompany.Volume,
        mcap: spCompany.MarketCap,
        logo: spCompany.CompanyLogo?.Url,
        colors: {
            primary: primaryColor,
            secondary: secondaryColor,
            glow: hexToRgba(primaryColor, 0.3),
        },
        website: spCompany.Website?.Url,
        description: spCompany.Description,
    };
}

function transformPriceHistory(spHistory: SPPriceHistory[]): PricePoint[] {
    return spHistory.map(item => ({
        time: new Date(item.TradeDate).getTime(),
        open: item.OpenPrice,
        high: item.HighPrice,
        low: item.LowPrice,
        close: item.ClosePrice,
        volume: item.Volume,
    }));
}

function transformSettings(spSettings: SPMarketSetting[]): MarketSettings {
    const getValue = (key: string, defaultValue: any): any => {
        const setting = spSettings.find(s => s.SettingKey === key && s.IsActive);
        if (!setting) return defaultValue;

        switch (setting.SettingType) {
            case 'Number':
                return parseInt(setting.SettingValue, 10);
            case 'Boolean':
                return setting.SettingValue.toLowerCase() === 'true';
            case 'JSON':
                return JSON.parse(setting.SettingValue);
            default:
                return setting.SettingValue;
        }
    };

    return {
        defaultTimeRange: getValue('default_time_range', '2M'),
        liveUpdatesEnabled: getValue('live_updates_enabled', true),
        autoCycleEnabled: getValue('auto_cycle_enabled', false),
        cycleInterval: getValue('cycle_interval', 5000),
        updateInterval: getValue('update_interval', 2000),
        chartAnimationDuration: getValue('chart_animation_duration', 800),
        maxDataPoints: getValue('max_data_points', 100),
    };
}

// ============================================
// PUBLIC API
// ============================================

/**
 * Fetch all active companies from SharePoint
 */
export async function getCompanies(): Promise<Company[]> {
    try {
        const spCompanies = await fetchSharePointItems<SPCompany>(
            COMPANIES_LIST,
            'Id,Title,CompanyName,Sector,LastPrice,PreviousClose,ChangePercent,Volume,MarketCap,CompanyLogo,PrimaryColor,SecondaryColor,IsActive,DisplayOrder,Website,Description',
            undefined, // Removed filter 'IsActive eq 1' for debugging
            undefined,
            'DisplayOrder',
            undefined
        );

        console.log('DEBUG: Raw companies data from SharePoint:', spCompanies);

        return spCompanies.map(transformCompany);
    } catch (error) {
        console.error('Error fetching companies:', error);
        throw error;
    }
}

/**
 * Fetch price history for a specific company
 * @param symbol - Company symbol (e.g., 'BSP')
 * @param days - Number of days of history to fetch (default: 400)
 */
export async function getPriceHistory(symbol: string, days: number = 400): Promise<PricePoint[]> {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const isoDate = cutoffDate.toISOString();

        const spHistory = await fetchSharePointItems<SPPriceHistory>(
            PRICE_HISTORY_LIST,
            'Id,Title,CompanySymbol/Title,TradeDate,OpenPrice,HighPrice,LowPrice,ClosePrice,Volume,NumberOfTrades',
            `CompanySymbol/Title eq '${symbol}' and TradeDate ge datetime'${isoDate}'`,
            'CompanySymbol',
            'TradeDate asc',
            undefined
        );

        return transformPriceHistory(spHistory);
    } catch (error) {
        console.error(`Error fetching price history for ${symbol}:`, error);
        throw error;
    }
}

/**
 * Fetch price history for all companies
 * @param days - Number of days of history to fetch (default: 400)
 */
export async function getAllPriceHistory(days: number = 400): Promise<Map<string, PricePoint[]>> {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const isoDate = cutoffDate.toISOString();

        const spHistory = await fetchSharePointItems<SPPriceHistory>(
            PRICE_HISTORY_LIST,
            'Id,Title,TradeDate,OpenPrice,HighPrice,LowPrice,ClosePrice,Volume',
            `TradeDate ge datetime'${isoDate}'`,
            undefined,
            'TradeDate asc',
            undefined
        );

        // Group by company symbol
        // Group by company symbol
        const historyMap = new Map<string, PricePoint[]>();

        if (spHistory.length > 0) {
            console.log('DEBUG: First history item structure:', spHistory[0]);
        }

        let matchCount = 0;
        let failCount = 0;

        spHistory.forEach(item => {
            const rawSymbol = item.CompanySymbol;
            let symbol = '';

            // 1. Try to get from Lookup Object
            if (typeof rawSymbol === 'object' && rawSymbol !== null && 'Title' in rawSymbol) {
                symbol = rawSymbol.Title;
            }
            // 2. Try to get from simple string/number (if not expanded or mapped oddly)
            else if (rawSymbol) {
                symbol = String(rawSymbol);
            }

            // 3. Fallback: If symbol is missing, "0", or numeric, try to parse from Title
            // Format expected: "SYMBOL - YYYY-MM-DD" e.g., "BSP - 2025-01-01"
            if ((!symbol || symbol === '0' || !isNaN(Number(symbol))) && item.Title) {
                // Try splitting by " - " first
                if (item.Title.includes(' - ')) {
                    const parts = item.Title.split(' - ');
                    if (parts.length > 0) symbol = parts[0].trim();
                }
                // Fallback: Try splitting by space if " - " not found (e.g. "BSP 2025-01-01")
                else {
                    const parts = item.Title.split(' ');
                    if (parts.length > 0) symbol = parts[0].trim();
                }
            }

            // Debug log for first few items to see what's happening
            if (matchCount + failCount < 5) {
                console.log(`DEBUG: Processing item Title='${item.Title}' -> Extracted Symbol='${symbol}'`);
            }

            // If still no symbol, skip
            if (!symbol || symbol === '0') {
                failCount++;
                return;
            }

            // Normalize symbol to match keys (optional but good safety)
            // symbol = symbol.toUpperCase(); 

            if (!historyMap.has(symbol)) {
                // console.log(`DEBUG: New symbol group found: ${symbol}`);
                historyMap.set(symbol, []);
            }

            matchCount++;

            historyMap.get(symbol)!.push({
                time: new Date(item.TradeDate).getTime(),
                open: item.OpenPrice,
                high: item.HighPrice,
                low: item.LowPrice,
                close: item.ClosePrice,
                volume: item.Volume,
            });
        });

        console.log(`DEBUG: History processing complete. Matched: ${matchCount}, Failed/Skipped: ${failCount}`);

        return historyMap;
    } catch (error) {
        console.error('Error fetching all price history:', error);
        throw error;
    }
}

/**
 * Fetch market dashboard settings
 */
export async function getMarketSettings(): Promise<MarketSettings> {
    try {
        const spSettings = await fetchSharePointItems<SPMarketSetting>(
            SETTINGS_LIST,
            'Id,Title,SettingKey,SettingValue,SettingType,Category,IsActive',
            'IsActive eq 1',
            undefined,
            undefined,
            undefined
        );

        return transformSettings(spSettings);
    } catch (error) {
        console.error('Error fetching market settings:', error);
        // Return defaults if settings can't be fetched
        return {
            defaultTimeRange: '2M',
            liveUpdatesEnabled: true,
            autoCycleEnabled: false,
            cycleInterval: 5000,
            updateInterval: 2000,
            chartAnimationDuration: 800,
            maxDataPoints: 100,
        };
    }
}

/**
 * Update company colors
 * @param symbol - Company symbol
 * @param primaryColor - Primary color hex
 * @param secondaryColor - Secondary color hex
 */
export async function updateCompanyColors(
    symbol: string,
    primaryColor: string,
    secondaryColor: string
): Promise<void> {
    try {
        const token = await getAccessToken();

        // First, get the item ID
        const companies = await fetchSharePointItems<SPCompany>(
            COMPANIES_LIST,
            'Id',
            `Title eq '${symbol}'`,
            undefined,
            undefined,
            1
        );

        if (companies.length === 0) {
            throw new Error(`Company ${symbol} not found`);
        }

        const itemId = companies[0].Id;
        const url = `${SITE_URL}/_api/web/lists/getbytitle('${COMPANIES_LIST}')/items(${itemId})`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json;odata=verbose',
                'Content-Type': 'application/json;odata=verbose',
                'IF-MATCH': '*',
                'X-HTTP-Method': 'MERGE',
            },
            body: JSON.stringify({
                __metadata: { type: 'SP.Data.Market_CompaniesListItem' },
                PrimaryColor: primaryColor,
                SecondaryColor: secondaryColor,
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to update colors: ${response.statusText}`);
        }
    } catch (error) {
        console.error(`Error updating colors for ${symbol}:`, error);
        throw error;
    }
}

/**
 * Get the latest price for a company (most recent trade)
 */
export async function getLatestPrice(symbol: string): Promise<PricePoint | null> {
    try {
        const spHistory = await fetchSharePointItems<SPPriceHistory>(
            PRICE_HISTORY_LIST,
            'TradeDate,OpenPrice,HighPrice,LowPrice,ClosePrice,Volume',
            `CompanySymbol/Title eq '${symbol}'`,
            'CompanySymbol',
            'TradeDate desc',
            1
        );

        if (spHistory.length === 0) return null;

        const item = spHistory[0];
        return {
            time: new Date(item.TradeDate).getTime(),
            open: item.OpenPrice,
            high: item.HighPrice,
            low: item.LowPrice,
            close: item.ClosePrice,
            volume: item.Volume,
        };
    } catch (error) {
        console.error(`Error fetching latest price for ${symbol}:`, error);
        return null;
    }
}

/**
 * Delete all items from Price History list
 * WARNING: This is destructive.
 */
export async function deleteAllPriceHistory(): Promise<void> {
    try {
        const token = await getAccessToken();
        let hasMore = true;

        while (hasMore) {
            // Fetch batch of IDs
            const items = await fetchSharePointItems<{ Id: number }>(
                PRICE_HISTORY_LIST,
                'Id',
                undefined,
                undefined,
                undefined,
                1000 // Max limit typically
            );

            if (items.length === 0) {
                hasMore = false;
                break;
            }

            console.log(`Deleting batch of ${items.length} items...`);

            // Delete one by one (REST API doesn't support simple bulk delete without batch payload construction)
            // For a test ground button, sequential/parallel delete is acceptable
            const deletePromises = items.map(item =>
                fetch(`${SITE_URL}/_api/web/lists/getbytitle('${PRICE_HISTORY_LIST}')/items(${item.Id})`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'X-HTTP-Method': 'DELETE',
                        'IF-MATCH': '*'
                    }
                })
            );

            await Promise.all(deletePromises);
        }
    } catch (error) {
        console.error('Error deleting price history:', error);
        throw error;
    }
}

export default {
    getCompanies,
    getPriceHistory,
    getAllPriceHistory,
    getMarketSettings,
    updateCompanyColors,
    getLatestPrice,
    deleteAllPriceHistory,
};
