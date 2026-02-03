import React, { useState, useEffect } from 'react';
import {
    Search,
    HelpCircle,
    ChevronRight,
    Zap,
    Loader2,
    BookOpen
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from "@/components/ui/accordion";
import { logger } from '@/lib/supabaseClient';

interface Question {
    id: string;
    text: string;
}

interface Category {
    id: string;
    title: string;
    questions: Question[];
}

interface LibraryDefinition {
    id: string;
    title: string;
    file: string;
    mode: string;
}

const LIBRARIES: LibraryDefinition[] = [
    { id: 'general', title: 'General', file: '/files/General Analytical Questions for All Acts.txt', mode: 'merged_acts_expert' },
    { id: 'cda', title: 'CDA 2015', file: '/files/Central Depositories Act 2015 Questions.txt', mode: 'cda_2015_expert' },
    { id: 'cma', title: 'CMA 2015', file: '/files/Captial Market Act 2015 Questions.txt', mode: 'cma_2015_expert' },
    { id: 'sca', title: 'SCA 2015', file: '/files/Securities Commission Act 2015 Questions.txt', mode: 'sca_2015_expert' },
    { id: 'sa', title: 'SA 1997', file: '/files/Securities Act 1997.txt', mode: 'sa_1997_expert' },
];

interface QuestionLibrarySidebarProps {
    onSelectQuestion: (question: string, mode?: string) => void;
    className?: string;
}

const QuestionLibrarySidebar: React.FC<QuestionLibrarySidebarProps> = ({ onSelectQuestion, className }) => {
    const [activeLibraryId, setActiveLibraryId] = useState('general');
    const [categories, setCategories] = useState<Category[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const activeLibrary = LIBRARIES.find(l => l.id === activeLibraryId) || LIBRARIES[0];

    useEffect(() => {
        const fetchQuestions = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(activeLibrary.file);
                const text = await response.text();

                if (!text || text.trim() === '') {
                    logger.warn(`[QuestionLibrary] Questions file ${activeLibrary.file} is empty or could not be reached.`);
                    setCategories([]);
                    return;
                }

                const lines = text.split('\n');
                const parsedCategories: Category[] = [];
                let currentCategory: Category | null = null;

                lines.forEach((line, index) => {
                    const trimmedLine = line.trim();
                    if (!trimmedLine) return;

                    // Match Category headers (Category X or Header X)
                    if (/category \d+/i.test(trimmedLine) || /header \d+/i.test(trimmedLine)) {
                        if (currentCategory) {
                            parsedCategories.push(currentCategory);
                        }
                        currentCategory = {
                            id: `cat-${parsedCategories.length}`,
                            title: trimmedLine.replace(/[#*]/g, '').replace(/^(Category|Header)\s+\d+:\s*/i, '').trim(),
                            questions: []
                        };
                    } else if (currentCategory && /^\d+\./.test(trimmedLine)) {
                        // Match numbered questions
                        currentCategory.questions.push({
                            id: `q-${index}`,
                            text: trimmedLine.replace(/^\d+\.\s*/, '')
                        });
                    }
                });

                if (currentCategory) {
                    parsedCategories.push(currentCategory);
                }

                setCategories(parsedCategories);
            } catch (error) {
                logger.error('[QuestionLibrary] Error fetching/parsing questions:', error);
                setCategories([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuestions();
    }, [activeLibraryId]);

    const filteredCategories = categories.map(cat => ({
        ...cat,
        questions: cat.questions.filter(q =>
            q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cat.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(cat => cat.questions.length > 0);

    return (
        <div className={`flex flex-col h-full ${className}`}>
            <div className="p-4 border-b border-border space-y-3 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-intranet-primary" />
                        <h2 className="text-lg font-bold tracking-tight">Question Library</h2>
                    </div>
                </div>

                <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                    {LIBRARIES.map(lib => (
                        <button
                            key={lib.id}
                            onClick={() => setActiveLibraryId(lib.id)}
                            className={`flex-1 text-[10px] py-1 px-1 rounded-md transition-all font-medium ${activeLibraryId === lib.id
                                ? 'bg-white dark:bg-gray-700 shadow-sm text-intranet-primary'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {lib.title}
                        </button>
                    ))}
                </div>

                <div className="relative group">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-intranet-primary transition-colors" size={14} />
                    <Input
                        placeholder="Search questions..."
                        className="pl-8 h-9 text-xs"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-intranet-primary" />
                        <span className="text-xs text-muted-foreground">Loading questions...</span>
                    </div>
                ) : filteredCategories.length > 0 ? (
                    <Accordion type="single" collapsible className="space-y-3">
                        {filteredCategories.map((category) => (
                            <AccordionItem
                                key={category.id}
                                value={category.id}
                                className="border rounded-lg overflow-hidden border-border bg-card shadow-sm hover:border-intranet-primary/20 transition-all"
                            >
                                <AccordionTrigger className="px-3 py-3 hover:no-underline text-left">
                                    <div className="flex-1 min-w-0 pr-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 bg-primary/5 text-primary border-primary/20">
                                                {category.questions.length}
                                            </Badge>
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Topic</span>
                                        </div>
                                        <h3 className="text-sm font-semibold truncate text-foreground group-hover:text-intranet-primary">
                                            {category.title}
                                        </h3>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="bg-gray-50/50 dark:bg-gray-950/20">
                                    <div className="divide-y divide-border/50">
                                        {category.questions.map((q) => (
                                            <button
                                                key={q.id}
                                                onClick={() => onSelectQuestion(q.text, activeLibrary.mode)}
                                                className="w-full h-auto text-left py-3 px-3 hover:bg-white dark:hover:bg-gray-800 transition-colors flex items-start gap-3 group/item border-l-2 border-transparent hover:border-intranet-primary"
                                            >
                                                <Zap className="w-3.5 h-3.5 mt-0.5 text-muted-foreground group-hover/item:text-intranet-primary transition-colors flex-shrink-0" />
                                                <span className="text-xs leading-relaxed text-muted-foreground group-hover/item:text-foreground transition-colors">
                                                    {q.text}
                                                </span>
                                                <ChevronRight size={12} className="mt-1 ml-auto text-muted-foreground/30 group-hover/item:text-intranet-primary group-hover/item:translate-x-0.5 transition-all flex-shrink-0" />
                                            </button>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                    <div className="text-center py-12 px-2 border-2 border-dashed border-border rounded-xl">
                        <HelpCircle className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-sm font-medium text-foreground">No matches found</p>
                        <p className="text-xs text-muted-foreground mt-1">Try a different search term</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuestionLibrarySidebar;
