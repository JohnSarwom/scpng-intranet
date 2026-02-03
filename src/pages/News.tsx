// News.tsx

import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CustomTabs from '@/components/custom/Tabs';

import { supabase, logger } from '@/lib/supabaseClient'; // Ensure this path is correct
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'; // Still useful for other auth-dependent logic
import { useRoleBasedAuth } from '@/hooks/useRoleBasedAuth'; // <-- IMPORT THE NEW HOOK
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TradingViewTicker from '@/components/custom/TradingViewTicker'; // Import the new component
import ScpngNewsUploadForm from '@/components/custom/ScpngNewsUploadForm'; // Import the new form
import ScpngArticleModal, { NewsArticle as ModalNewsArticle } from '@/components/custom/ScpngArticleModal'; // <-- IMPORT MODAL AND ITS TYPE
import { useMicrosoftGraph } from '@/hooks/useMicrosoftGraph';
import { NewsSharePointService } from '@/services/newsSharePointService';
import NewsDashboard from '@/components/dashboard/NewsDashboard';
import { PageNewsArticle } from '@/types/news';

// Mock news data (rest of your code)
const mockNewsData = [
  // SCPNG News item removed, will be fetched from Supabase
  {
    id: 'mock-2',
    title: 'New HR Policy Announced',
    summary: 'Details about the new remote work policy have been released.',
    date: 'May 18, 2023',
    category: 'HR', // Example category for My Feed
    important: false,
    sourceName: 'HR Department',
    sourceUrl: '#',
    urlToImage: 'https://picsum.photos/seed/hr-policy/800/400',
  },
  {
    id: 'mock-3',
    title: 'IT System Maintenance Alert',
    summary: 'Scheduled maintenance for core IT infrastructure this weekend.',
    date: 'May 15, 2023',
    category: 'IT', // Example category for My Feed
    important: true,
    sourceName: 'IT Department',
    sourceUrl: '#',
    urlToImage: 'https://picsum.photos/seed/it-maintenance/800/400',
  },
  {
    id: 'mock-4', // Corrected ID
    title: 'Community Engagement Initiative',
    summary: 'Join us for the upcoming community tree planting event next Saturday.',
    date: 'May 10, 2023',
    category: 'Organization', // Example category for My Feed
    important: false,
    sourceName: 'Community Outreach',
    sourceUrl: '#',
    urlToImage: 'https://picsum.photos/seed/community-event/800/400',
  }
];

// This interface is used internally for structuring data in News.tsx tabs
// This interface is used internally for structuring data in News.tsx tabs
// PageNewsArticle is now imported from @/types/news


interface NewsTabState {
  articles: PageNewsArticle[]; // Use PageNewsArticle for tab state
  isLoading: boolean;
  error: string | null;
  hasFetched: boolean;
  promptUsed?: string | null;
}

// Initial base categories
const baseNewsCategories = ['News Dashboard', 'SCPNG News', 'National News', 'Global Insights', 'All News'];
const aiDrivenCategories = [] as string[];

// Define ArticleCardComponent locally within News.tsx
const ArticleCardComponent: React.FC<{ article: PageNewsArticle; handleReadMoreClick: (article: PageNewsArticle) => void }> = ({ article, handleReadMoreClick }) => {
  return (
    <Card key={article.id} className={`overflow-hidden flex flex-col justify-between`}>
      {article.urlToImage && (
        <img
          src={article.urlToImage}
          alt={`Image for ${article.title}`}
          className="w-full h-48 object-cover"
          onError={(e) => (e.currentTarget.style.display = 'none')}
        />
      )}
      <div>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start mb-1">
            <span className="inline-block text-xs font-medium bg-gray-100 dark:bg-gray-700 dark:text-gray-200 rounded px-2 py-1">
              {article.category}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{article.date}</span>
          </div>
          <CardTitle className="text-lg leading-tight hover:text-intranet-primary transition-colors dark:text-white dark:hover:text-intranet-accent-light">
            {article.sourceUrl && !article.sourceUrl.startsWith('#article-') && article.sourceUrl !== '#' ? (
              <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {article.title}
              </a>
            ) : (
              article.title
            )}
          </CardTitle>
          {article.sourceName && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Source: {article.sourceName}</p>
          )}
        </CardHeader>
        <CardContent className="pt-0 pb-3">
          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-4 hover:line-clamp-none transition-all duration-300 ease-in-out">{article.summary}</p>
        </CardContent>
      </div>
      <div className="px-6 pb-4 pt-2">
        <Button
          variant="link"
          className="p-0 text-intranet-accent hover:text-intranet-accent-dark dark:hover:text-intranet-accent-light"
          onClick={() => handleReadMoreClick(article)}
        >
          Read more →
        </Button>
      </div>
    </Card>
  );
};

const News = () => {
  const { session } = useSupabaseAuth();
  const { hasPermission, isAdmin } = useRoleBasedAuth();

  const canUploadNews = hasPermission('news', 'upload');
  const isSystemAdmin = isAdmin;

  const [selectedScpngYear, setSelectedScpngYear] = useState<string>('All'); // Default to 'All'
  const [availableScpngYears, setAvailableScpngYears] = useState<string[]>([]);

  const newsCategories = baseNewsCategories;

  // State for the Article Modal - RESTORED
  const [selectedArticleForModal, setSelectedArticleForModal] = useState<ModalNewsArticle | null>(null);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);

  const initialNewsData: Record<string, NewsTabState> = {};
  baseNewsCategories.forEach(cat => {
    initialNewsData[cat] = { articles: [], isLoading: false, error: null, hasFetched: false };
  });


  aiDrivenCategories.forEach(cat => {
    if (!initialNewsData[cat]) {
      initialNewsData[cat] = { articles: [], isLoading: false, error: null, hasFetched: false, promptUsed: null };
    }
  });

  const [newsData, setNewsData] = useState<Record<string, NewsTabState>>(initialNewsData);
  const [isInvokingEdgeFunction, setIsInvokingEdgeFunction] = useState(false);

  // Handler to open the modal with the selected article
  const handleReadMoreClick = (article: PageNewsArticle) => {
    // Map PageNewsArticle to ModalNewsArticle
    const modalArticleData: ModalNewsArticle = {
      article_id: article.article_id_internal, // Ensure this is correctly mapped
      title: article.title,
      description: article.description_full || article.summary, // Prefer full description
      published_at: article.published_at_iso || new Date(article.date).toISOString(), // Ensure ISO string
      source_name: article.sourceName,
      url: article.sourceUrl,
      url_to_image: article.urlToImage,
      categories_api: typeof article.categoriesApi === 'string' ? article.categoriesApi : JSON.stringify(article.categoriesApi || []),
    };
    setSelectedArticleForModal(modalArticleData);
    setIsArticleModalOpen(true);
  };


  // --- CHANGED: Use SharePoint Service ---
  const { getClient, getAppSetting } = useMicrosoftGraph();

  const fetchSharePointNews = async () => {
    const graphClient = await getClient();
    if (!graphClient) {
      // logger.warn('[News] Graph client not available yet.');
      return;
    }

    setNewsData(prev => ({
      ...prev,
      ['All News']: { ...prev['All News'], isLoading: true, error: null },
      ['National News']: { ...(prev['National News'] || { articles: [], isLoading: true, error: null, hasFetched: false }), isLoading: true, error: null },
      ['Global Insights']: { ...(prev['Global Insights'] || { articles: [], isLoading: true, error: null, hasFetched: false }), isLoading: true, error: null },
      ['SCPNG News']: { ...(prev['SCPNG News'] || { articles: [], isLoading: true, error: null, hasFetched: false }), isLoading: true, error: null },
    }));

    try {
      // logger.info('[News] Fetching news articles from SharePoint...');
      const service = new NewsSharePointService(graphClient);
      const data = await service.getAllNews();

      const formattedArticles: PageNewsArticle[] = data.map((article) => {
        // Determine category based on string match or default
        // We will assign a primary category for display, but filtering will be done separately
        let displayCategory = 'General';
        const categoryLower = article.category.toLowerCase();
        const countryUpper = article.country?.toUpperCase() || '';

        if (categoryLower.includes('scpng') || categoryLower.includes('internal')) {
          displayCategory = 'SCPNG News';
        } else if (countryUpper === 'PAPUA NEW GUINEA') {
          displayCategory = 'National News';
        } else {
          displayCategory = 'Global Insights';
        }

        return {
          id: article.id,
          article_id_internal: article.articleId,
          title: article.title,
          summary: article.aiSummary || (article.description ? (article.description.length > 150 ? article.description.substring(0, 150) + '...' : article.description) : 'No summary available.'),
          description_full: article.description,
          date: article.publishDate ? new Date(article.publishDate).toLocaleDateString('en-CA') : new Date().toLocaleDateString('en-CA'),
          published_at_iso: article.publishDate,
          category: displayCategory, // Used for the badge on the card
          important: false,
          sourceName: article.sourceName,
          sourceUrl: article.sourceUrl,
          urlToImage: article.imageUrl,
          categoriesApi: article.category,
          aiSummary: article.aiSummary,
          country: article.country,
        };
      });

      // --- START: Randomize "All News" articles ---
      const shuffleArray = (array: PageNewsArticle[]) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
      };
      const shuffledAllNews = shuffleArray(formattedArticles);
      // --- END: Randomize "All News" articles ---

      // Extract years specifically for SCPNG News articles
      // Filter logic for SCPNG News: Category contains 'SCPNG' or 'Internal'
      const scpngNewsArticles = formattedArticles.filter(a => {
        const cat = (a.categoriesApi as string || '').toLowerCase();
        return cat.includes('scpng') || cat.includes('internal');
      });

      const years = [...new Set(scpngNewsArticles.map(article => new Date(article.date).getFullYear().toString()))]
        .sort((a, b) => parseInt(b) - parseInt(a));

      setAvailableScpngYears(years);
      if (years.length === 0) {
        setSelectedScpngYear('All');
      }

      // Filter logic for National News: Country is 'PAPUA NEW GUINEA' but NOT 'SCPNG News'
      const nationalNewsArticles = formattedArticles.filter(a =>
        (a.country || '').toUpperCase() === 'PAPUA NEW GUINEA' &&
        a.category !== 'SCPNG News'
      );

      // Filter logic for Global Insights: Country is NOT 'PAPUA NEW GUINEA'
      // Note: We might want to exclude SCPNG specific news if desired, but usually Global is anything non-PNG.
      // If SCPNG news is also PNG, it might appear in National.
      // Let's strictly follow: Global = NOT PNG.
      const globalNewsArticles = formattedArticles.filter(a => (a.country || '').toUpperCase() !== 'PAPUA NEW GUINEA');

      setNewsData(prev => ({
        ...prev,
        ['All News']: { articles: shuffledAllNews, isLoading: false, error: null, hasFetched: true },
        ['National News']: {
          articles: nationalNewsArticles,
          isLoading: false, error: null, hasFetched: true
        },
        ['Global Insights']: {
          articles: globalNewsArticles,
          isLoading: false, error: null, hasFetched: true
        },
        ['SCPNG News']: {
          articles: scpngNewsArticles,
          isLoading: false, error: null, hasFetched: true
        },
      }));
      // logger.success('[News] Successfully fetched and processed all news from SharePoint.');

    } catch (err: any) {
      logger.error('[News] Error fetching news from SharePoint:', err.message);
      setNewsData(prev => ({
        ...prev,
        ['All News']: { articles: [], isLoading: false, error: err.message, hasFetched: true },
        ['National News']: { articles: [], isLoading: false, error: err.message, hasFetched: true },
        ['Global Insights']: { articles: [], isLoading: false, error: err.message, hasFetched: true },
        ['SCPNG News']: { articles: [], isLoading: false, error: err.message, hasFetched: true },
      }));
    }
  };

  // --- AMENDED SECTION: Use supabase.functions.invoke() ---
  const handleInvokeEdgeFunction = async () => {
    setIsInvokingEdgeFunction(true);
    // logger.info('[News] Manually invoking Edge Function via supabase.functions.invoke()...');
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('update-all-news-from-sources', {
        method: 'POST',
        body: {},
      });

      if (invokeError) {
        logger.error('[News] Edge Function "update-all-news-from-sources" invocation failed:', {
          message: invokeError.message,
          status: invokeError.status,
        });
      } else {
        // logger.success('[News] Edge Function "update-all-news-from-sources" invoked successfully:', data);
      }
    } catch (err: any) {
      logger.error('[News] Caught unexpected error during Edge Function invocation:', err.message);
    } finally {
      setIsInvokingEdgeFunction(false);
      // logger.info('[News] Re-fetching "All News" from Supabase table after "update-all-news-from-sources" Edge Function invocation attempt.');
      fetchSharePointNews();
    }
  };
  // --- END AMENDED SECTION ---


  const fetchAiNewsForCategory = async (categoryName: string, userId: string, globalSettings: any) => {
    // Only proceed if this category is genuinely meant to be fetched by AI and not from Supabase
    if (categoryName === 'National News' || categoryName === 'Global Insights' || categoryName === 'SCPNG News') { // Added SCPNG News
      // logger.info(`[News] Skipping AI fetch for ${categoryName} as it's now sourced from Supabase.`);
      return;
    }

    setNewsData(prev => ({
      ...prev,
      [categoryName]: { ...prev[categoryName], isLoading: true, error: null },
    }));

    try {
      const prompt = globalSettings.prompts?.[categoryName];
      if (!prompt) {
        throw new Error(`Prompt for ${categoryName} not configured. Please check News Admin Settings.`);
      }

      let apiKey = import.meta.env.VITE_GEMINI_API_KEY || globalSettings.api_key;
      let modelName = 'gemini-1.5-flash';

      if (!apiKey && getAppSetting) {
        // Try fetching from SharePoint
        // logger.info('[News] Attempting to fetch API Key from SharePoint...');
        const spKey = await getAppSetting('GeminiAPIKey');
        if (spKey) apiKey = spKey;

        const spModel = await getAppSetting('GeminiModel');
        if (spModel) modelName = spModel;
      }

      if (!apiKey) {
        throw new Error("AI API Key not configured. Please add VITE_GEMINI_API_KEY to .env or configure in settings/SharePoint.");
      }

      // Use Supabase Edge Function instead of client-side fetch
      // Changed to use direct client-side fetch for now to match AIHub

      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      };

      const cleanApiKey = apiKey.trim();
      const apiUrl = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${cleanApiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(`Gemini API request failed: ${response.status} ${responseData.error?.message || ''}`);
      }

      let generatedText = '';
      if (responseData.candidates && responseData.candidates.length > 0 &&
        responseData.candidates[0].content && responseData.candidates[0].content.parts &&
        responseData.candidates[0].content.parts.length > 0 && responseData.candidates[0].content.parts[0].text) {
        generatedText = responseData.candidates[0].content.parts[0].text;
      } else {
        // logger.warn("[News] Gemini response structure not as expected or no content generated.", responseData);
        throw new Error('Gemini response format is not recognized or content is missing.');
      }

      let cleanedJsonString = generatedText.trim();
      if (cleanedJsonString.startsWith("```json")) {
        cleanedJsonString = cleanedJsonString.substring(7);
      } else if (cleanedJsonString.startsWith("```")) {
        cleanedJsonString = cleanedJsonString.substring(3);
      }
      if (cleanedJsonString.endsWith("```")) {
        cleanedJsonString = cleanedJsonString.substring(0, cleanedJsonString.length - 3);
      }
      cleanedJsonString = cleanedJsonString.trim();

      let articlesFromAI: any[];
      try {
        articlesFromAI = JSON.parse(cleanedJsonString);
        if (!Array.isArray(articlesFromAI)) {
          throw new Error('Parsed content is not an array. Prompt Gemini to return a JSON array output.');
        }
      } catch (parseError: any) {
        logger.error("[News] Failed to parse JSON from Gemini response:", { error: parseError, rawText: generatedText, cleanedText: cleanedJsonString });
        throw new Error(`Failed to parse news articles from AI. Ensure AI is prompted for JSON array output. Error: ${parseError.message}`);
      }

      const formattedArticles: PageNewsArticle[] = articlesFromAI.map((aiArticle: any, index: number) => {
        if (typeof aiArticle !== 'object' || aiArticle === null) {
          // logger.warn('[News] Invalid item in AI-generated article array:', aiArticle);
          return null;
        }
        return {
          id: `${categoryName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}-${index}`,
          title: aiArticle.Headline || aiArticle.title || `Article ${index + 1}`,
          summary: aiArticle.Summary || aiArticle.summary || 'Content not available.',
          date: aiArticle.PublicationDate || aiArticle.date || new Date().toLocaleDateString('en-CA'),
          category: categoryName,
          important: aiArticle.important || false,
          sourceName: aiArticle.Source || aiArticle.SourceName || undefined,
          sourceUrl: aiArticle.SourceURL || aiArticle.Url || aiArticle.Link || undefined,
          relevanceNote: categoryName === 'All News' ? (aiArticle.RelevanceNote || undefined) : undefined,
        };
      }).filter(article => article !== null) as PageNewsArticle[];

      if (formattedArticles.length === 0 && articlesFromAI.length > 0) {
        throw new Error('AI returned an array, but items within were not valid article objects.');
      }
      if (formattedArticles.length === 0) {
        // logger.warn(`[News] No valid articles were parsed for ${categoryName} from AI response, though API call was successful.`);
      }

      setNewsData(prev => ({
        ...prev,
        [categoryName]: { articles: formattedArticles, isLoading: false, error: null, hasFetched: true, promptUsed: prompt },
      }));
      // logger.success(`[News] Successfully fetched and parsed REAL news for ${categoryName} from Gemini`);

    } catch (err: any) {
      logger.error(`[News] Error fetching real news for ${categoryName} from Gemini:`, err.message);
      setNewsData(prev => ({
        ...prev,
        [categoryName]: { articles: [], isLoading: false, error: err.message, hasFetched: true, promptUsed: null },
      }));
    }
  };

  const getFilteredArticles = (allArticles: PageNewsArticle[], filterLogic: (article: PageNewsArticle) => boolean): PageNewsArticle[] => {
    return allArticles.filter(filterLogic);
  };

  // If renderArchivedNewsCards is used, ensure it uses PageNewsArticle
  // This is a placeholder, actual implementation might differ or be removed if not used.
  const renderArchivedNewsCards = (articles: PageNewsArticle[]) => {
    if (!articles || articles.length === 0) {
      return <p>No archived news available.</p>;
    }
    return (
      <div className="space-y-4">
        {articles.map(article => (
          <Card key={article.id}>
            <CardHeader>
              <CardTitle>{article.title}</CardTitle>
              <p className="text-sm text-gray-500">{article.date} - {article.category}</p>
            </CardHeader>
            <CardContent>
              <p>{article.summary}</p>
              {/* Add a way to view full archived article if needed */}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const loadNewsData = async () => {
    let settings: any = null;
    let settingsErrorMsg: string | null = null;

    // Fetch all news from Supabase if not already loading or fetched for 'All News'
    // This now also handles 'National News', 'Global Insights', and 'SCPNG News'
    if (!newsData['All News'].isLoading && !newsData['All News'].hasFetched) {
      fetchSharePointNews();
    }

    // Handle any other categories that are still purely AI-driven (if any)
    const categoriesToFetchAI = aiDrivenCategories.filter(
      category => !newsData[category]?.isLoading && !newsData[category]?.hasFetched &&
        category !== 'National News' && category !== 'Global Insights' && category !== 'SCPNG News' // Exclude Supabase-driven
    );

    if (categoriesToFetchAI.length > 0) {
      try {
        const { data: dbData, error: dbError } = await supabase
          .from('news_api_settings')
          .select('prompts')
          .eq('id', 1)
          .single();

        if (dbError && dbError.code !== 'PGRST116') {
          settingsErrorMsg = `Failed to load global news settings: ${dbError.message}`;
        } else if (!dbData && dbError?.code === 'PGRST116') {
          settingsErrorMsg = "Global news settings not found. Please configure them via an admin in the Settings tab.";
        } else {
          settings = dbData;
        }
      } catch (e: any) {
        settingsErrorMsg = `Exception loading global news settings: ${e.message}`;
      }

      if (settingsErrorMsg) {
        logger.error('[News] Global settings issue for AI categories:', settingsErrorMsg);
        const updates: Record<string, Partial<NewsTabState>> = {};
        categoriesToFetchAI.forEach(category => {
          updates[category] = { error: settingsErrorMsg, hasFetched: true, isLoading: false };
        });
        if (Object.keys(updates).length > 0) {
          setNewsData(prev => {
            const newState = { ...prev };
            for (const catKey in updates) {
              newState[catKey] = { ...(newState[catKey] || {}), ...updates[catKey] } as NewsTabState;
            }
            return newState;
          });
        }
      } else if (settings) {
        for (const category of categoriesToFetchAI) {
          fetchAiNewsForCategory(category, session?.user?.id || "anonymous_user", settings);
        }
      }
    }

    if (session && newsData['All News'].articles.length > 0 && !newsData['News Dashboard']?.hasFetched) {
      setNewsData(prev => ({
        ...prev,
        ['News Dashboard']: {
          articles: [], // Dashboard doesn't need its own articles list, it uses others
          isLoading: false,
          error: null,
          hasFetched: true,
        }
      }));
    } else if (!session && !newsData['News Dashboard']?.hasFetched) {
      setNewsData(prev => ({
        ...prev,
        ['News Dashboard']: { articles: [], isLoading: false, error: null, hasFetched: true }
      }));
    }
  };

  useEffect(() => {
    loadNewsData();
  }, [session, newsData]);

  const renderNewsCards = (category?: string) => {
    const tabKey = category && newsData[category] ? category : 'All News';
    const currentTabState = newsData[tabKey];

    if (currentTabState?.isLoading && !currentTabState?.hasFetched) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-intranet-primary" />
          <p className="ml-4 text-lg">Loading news...</p>
        </div>
      );
    }

    if (currentTabState?.error) {
      return <p className="text-red-500">Error loading news: {currentTabState.error}</p>;
    }

    let articlesToDisplay = currentTabState?.articles || [];

    if (category === 'News Dashboard') {
      return (
        <NewsDashboard
          allNews={newsData['All News']?.articles || []}
          scpngNews={newsData['SCPNG News']?.articles || []}
          nationalNews={newsData['National News']?.articles || []}
          globalNews={newsData['Global Insights']?.articles || []}
          onReadMore={handleReadMoreClick}
        />
      );
    }

    if (category === 'SCPNG News') {
      if (selectedScpngYear !== 'All') {
        articlesToDisplay = articlesToDisplay.filter(article =>
          new Date(article.date).getFullYear().toString() === selectedScpngYear
        );
      }

      const renderedArticleCards = articlesToDisplay.map((item) =>
        <ArticleCardComponent article={item} handleReadMoreClick={handleReadMoreClick} key={item.id} />
      );

      return (
        <div>
          {/* Year Filter Buttons for SCPNG News */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={selectedScpngYear === 'All' ? 'default' : 'outline'}
              onClick={() => setSelectedScpngYear('All')}
              size="sm"
            >
              All Years
            </Button>
            {availableScpngYears.map(year => (
              <Button
                key={year}
                variant={selectedScpngYear === year ? 'default' : 'outline'}
                onClick={() => setSelectedScpngYear(year)}
                size="sm"
              >
                {year}
              </Button>
            ))}
          </div>

          {/* Existing layout logic based on canUploadNews */}
          {canUploadNews ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                {articlesToDisplay.length > 0
                  ? renderedArticleCards
                  : (<p className="text-gray-600 dark:text-gray-400">No SCPNG news articles found {selectedScpngYear !== 'All' ? `for ${selectedScpngYear}` : ''}. Use the form to add new ones.</p>)}
              </div>
              <div className="md:col-span-1">
                <h3 className="text-lg font-semibold mb-3 dark:text-white">Upload SCPNG News Article</h3>
                <ScpngNewsUploadForm onUploadSuccess={fetchSharePointNews} />
              </div>
            </div>
          ) : (
            articlesToDisplay.length > 0
              ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{renderedArticleCards}</div>)
              : (<p className="text-gray-600 dark:text-gray-400">No SCPNG news articles found {selectedScpngYear !== 'All' ? `for ${selectedScpngYear}` : ''}.</p>)
          )}
        </div>
      );
    }

    // Fallback for other categories (National News, Global Insights, etc.)
    const otherCategoryArticles = articlesToDisplay.map((item) =>
      <ArticleCardComponent article={item} handleReadMoreClick={handleReadMoreClick} key={item.id} />
    );
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {otherCategoryArticles.length > 0
          ? otherCategoryArticles
          : (<p className="text-gray-600 dark:text-gray-400">No news articles available for this category yet.</p>)}
      </div>
    );
  };

  const tabs = newsCategories.map(category => ({
    label: category,
    content: renderNewsCards(category)
  }));

  return (
    <PageLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between"> {/* Flex container for title and ticker */}
          <div className="flex-shrink-0 mr-4"> {/* Container for title to prevent it from shrinking too much */}
            <h1 className="text-2xl font-bold">News & Announcements</h1>
          </div>
          <div className="flex-grow min-w-0"> {/* Container for ticker to allow it to grow and handle overflow */}
            <TradingViewTicker />
          </div>
        </div>
        {/* The subtitle can remain below or be adjusted if needed */}
        <p className="text-gray-500 mt-2">Stay updated with the latest organizational news and unit announcements</p>
      </div>

      <div className="relative mb-4">
        <CustomTabs tabs={tabs} defaultTab="News Dashboard" />
      </div>

      {/* Recent Updates removed as it is now part of the dashboard */}

      {/* Render the Modal */}
      <ScpngArticleModal
        article={selectedArticleForModal}
        isOpen={isArticleModalOpen}
        onOpenChange={setIsArticleModalOpen}
      />
    </PageLayout>
  );
};

export default News;
