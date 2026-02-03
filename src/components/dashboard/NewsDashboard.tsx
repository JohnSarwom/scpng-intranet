import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageNewsArticle } from '@/types/news';
import { ArrowRight, Newspaper, Globe, MapPin, Building2, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';

interface NewsDashboardProps {
    allNews: PageNewsArticle[];
    scpngNews: PageNewsArticle[];
    nationalNews: PageNewsArticle[];
    globalNews: PageNewsArticle[];
    onReadMore: (article: PageNewsArticle) => void;
}

const NewsDashboard: React.FC<NewsDashboardProps> = ({
    allNews,
    scpngNews,
    nationalNews,
    globalNews,
    onReadMore,
}) => {
    // Get featured articles for slideshow (top 5)
    const featuredArticles = scpngNews.length > 0 ? scpngNews.slice(0, 5) : allNews.slice(0, 5);
    const [currentSlide, setCurrentSlide] = useState(0);

    // Auto-advance slideshow
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % featuredArticles.length);
        }, 8000); // Change slide every 8 seconds
        return () => clearInterval(timer);
    }, [featuredArticles.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % featuredArticles.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + featuredArticles.length) % featuredArticles.length);
    };

    const currentFeatured = featuredArticles[currentSlide];

    // Get latest updates (excluding currently displayed featured article if possible, or just top list)
    // To avoid duplication, we can filter out the *current* featured article ID
    const latestUpdates = allNews
        .filter(a => a.id !== currentFeatured?.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Featured Article - Takes up 2 columns */}
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-intranet-primary" />
                        Featured Story
                    </h2>
                    {currentFeatured ? (
                        <div className="relative group" key={currentFeatured.id}>
                            <Card className="overflow-hidden rounded-xl shadow-md flex flex-col relative animate-in fade-in slide-in-from-right-2 duration-700 ease-in-out">
                                {currentFeatured.urlToImage && (
                                    <div className="relative h-64 w-full overflow-hidden">
                                        <img
                                            src={currentFeatured.urlToImage}
                                            alt={currentFeatured.title}
                                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                            onError={(e) => (e.currentTarget.style.display = 'none')}
                                        />
                                        <div className="absolute top-4 left-4">
                                            <Badge className="bg-intranet-primary hover:bg-intranet-primary-dark text-white">
                                                {currentFeatured.category}
                                            </Badge>
                                        </div>
                                    </div>
                                )}
                                <CardHeader>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-gray-500">{currentFeatured.date}</span>
                                        {currentFeatured.sourceName && (
                                            <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                                                {currentFeatured.sourceName}
                                            </span>
                                        )}
                                    </div>
                                    <CardTitle className="text-2xl hover:text-intranet-primary transition-colors cursor-pointer" onClick={() => onReadMore(currentFeatured)}>
                                        {currentFeatured.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
                                        {currentFeatured.summary}
                                    </p>
                                    <Button onClick={() => onReadMore(currentFeatured)} className="w-full sm:w-auto">
                                        Read Full Story <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Slideshow Controls */}
                            <button
                                onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="Previous slide"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="Next slide"
                            >
                                <ChevronRight className="h-6 w-6" />
                            </button>

                            {/* Slide Indicators */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                {featuredArticles.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentSlide(idx)}
                                        className={`w-2 h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-intranet-primary w-4' : 'bg-gray-300 dark:bg-gray-600'}`}
                                        aria-label={`Go to slide ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <Card className="h-64 flex items-center justify-center">
                            <p className="text-gray-500">No featured news available.</p>
                        </Card>
                    )}
                </div>

                {/* Latest Updates - Takes up 1 column */}
                <div className="lg:col-span-1">
                    <h2 className="text-xl font-semibold mb-4">Latest Updates</h2>
                    <div className="space-y-4">
                        {latestUpdates.map((article) => (
                            <Card key={article.id} className="rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer group flex items-center overflow-hidden" onClick={() => onReadMore(article)}>
                                {article.urlToImage && (
                                    <div className="w-24 h-24 flex-shrink-0 ml-2">
                                        <img
                                            src={article.urlToImage}
                                            alt={article.title}
                                            className="w-full h-full object-cover rounded-md"
                                            onError={(e) => (e.currentTarget.style.display = 'none')}
                                        />
                                    </div>
                                )}
                                <CardContent className="p-3 flex-grow min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">
                                            {article.category}
                                        </Badge>
                                        <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{article.date}</span>
                                    </div>
                                    <h4 className="font-semibold text-sm group-hover:text-intranet-primary transition-colors line-clamp-2 mb-1 leading-tight">
                                        {article.title}
                                    </h4>
                                    <p className="text-xs text-gray-500 line-clamp-2">
                                        {article.summary}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                        {latestUpdates.length === 0 && (
                            <p className="text-gray-500 text-sm">No recent updates.</p>
                        )}
                        <Button variant="ghost" className="w-full text-sm text-gray-500 hover:text-intranet-primary">
                            View All News
                        </Button>
                    </div>
                </div>
            </div>

            {/* Category Highlights Grid */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Category Highlights</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* SCPNG Highlight */}
                    <Card className="rounded-xl bg-gradient-to-br from-red-50 to-white dark:from-red-900/10 dark:to-gray-900 border-red-100 dark:border-red-900/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg text-red-700 dark:text-red-400">
                                <Building2 className="h-5 w-5" /> SCPNG News
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {scpngNews.slice(0, 2).map(article => (
                                <div key={article.id} className="mb-3 last:mb-0 pb-3 last:pb-0 border-b last:border-0 border-red-100 dark:border-red-900/30">
                                    <h4 className="text-sm font-medium hover:underline cursor-pointer" onClick={() => onReadMore(article)}>{article.title}</h4>
                                    <p className="text-xs text-gray-500 mt-1">{article.date}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* National Highlight */}
                    <Card className="rounded-xl bg-gradient-to-br from-green-50 to-white dark:from-green-900/10 dark:to-gray-900 border-green-100 dark:border-green-900/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg text-green-700 dark:text-green-400">
                                <MapPin className="h-5 w-5" /> National News
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {nationalNews.slice(0, 2).map(article => (
                                <div key={article.id} className="mb-3 last:mb-0 pb-3 last:pb-0 border-b last:border-0 border-green-100 dark:border-green-900/30">
                                    <h4 className="text-sm font-medium hover:underline cursor-pointer" onClick={() => onReadMore(article)}>{article.title}</h4>
                                    <p className="text-xs text-gray-500 mt-1">{article.date}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Global Highlight */}
                    <Card className="rounded-xl bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/10 dark:to-gray-900 border-purple-100 dark:border-purple-900/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg text-purple-700 dark:text-purple-400">
                                <Globe className="h-5 w-5" /> Global Insights
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {globalNews.slice(0, 2).map(article => (
                                <div key={article.id} className="mb-3 last:mb-0 pb-3 last:pb-0 border-b last:border-0 border-purple-100 dark:border-purple-900/30">
                                    <h4 className="text-sm font-medium hover:underline cursor-pointer" onClick={() => onReadMore(article)}>{article.title}</h4>
                                    <p className="text-xs text-gray-500 mt-1">{article.date}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default NewsDashboard;
