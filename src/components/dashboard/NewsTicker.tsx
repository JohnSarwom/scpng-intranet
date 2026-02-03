import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/supabaseClient';
import { Loader2, Newspaper } from 'lucide-react';
import { useMicrosoftGraph } from '@/hooks/useMicrosoftGraph';
import { NewsSharePointService } from '@/services/newsSharePointService';

interface NewsArticle {
    id: string;
    title: string;
    source_name?: string;
    published_at: string;
    source_url?: string;
}

const NewsTicker: React.FC = () => {
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const { getClient } = useMicrosoftGraph();

    useEffect(() => {
        const fetchNewsArticles = async () => {
            try {
                logger.info('[NewsTicker] Fetching latest news articles from SharePoint...');
                const client = await getClient();
                if (!client) {
                    return;
                }

                const service = new NewsSharePointService(client);
                const data = await service.getAllNews();

                // Map SharePoint items to Ticker items
                const tickerItems: NewsArticle[] = data.map(item => ({
                    id: item.id,
                    title: item.title,
                    source_name: item.sourceName,
                    published_at: item.publishDate,
                    source_url: item.sourceUrl
                }));

                // Shuffle the articles to show a random sequence on each load
                for (let i = tickerItems.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [tickerItems[i], tickerItems[j]] = [tickerItems[j], tickerItems[i]];
                }

                setArticles(tickerItems);
                logger.success('[NewsTicker] Successfully fetched news articles');
            } catch (error) {
                logger.error('[NewsTicker] Failed to fetch news articles:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNewsArticles();
    }, [getClient]);

    if (loading) {
        return (
            <div className="h-10 flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden">
                <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
            </div>
        );
    }

    if (articles.length === 0) {
        return (
            <div className="h-10 flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden">
                <Newspaper className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-xs text-gray-500 dark:text-gray-400">No news available</span>
            </div>
        );
    }

    return (
        <div className="relative h-10 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden">
            {/* Fade effect on edges */}
            <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-gray-100 to-transparent dark:from-gray-800 z-10 pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-gray-200 to-transparent dark:from-gray-900 z-10 pointer-events-none"></div>

            {/* News ticker content */}
            <div className="news-ticker-wrapper h-full flex items-center">
                <div className="news-ticker-content flex items-center gap-8 animate-ticker">
                    {/* Duplicate the articles twice for seamless loop */}
                    {[...articles, ...articles].map((article, index) => (
                        <div key={`${article.id}-${index}`} className="flex items-center gap-2 whitespace-nowrap">
                            <span className="inline-block w-2 h-2 rounded-full bg-red-500"></span>
                            {article.source_url ? (
                                <a
                                    href={article.source_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 hover:underline cursor-pointer"
                                >
                                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                        {article.title}
                                    </span>
                                    {article.source_name && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            ({article.source_name})
                                        </span>
                                    )}
                                </a>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                        {article.title}
                                    </span>
                                    {article.source_name && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            ({article.source_name})
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                @keyframes ticker {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }

                .animate-ticker {
                    animation: ticker 860s linear infinite;
                }

                .news-ticker-wrapper:hover .animate-ticker {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
};

export default NewsTicker;
