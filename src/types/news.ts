export interface PageNewsArticle {
    id: string;
    article_id_internal: string; // To map to modal's article_id
    title: string;
    summary: string;
    date: string;
    category: string;
    important: boolean;
    sourceName?: string;
    sourceUrl?: string;
    relevanceNote?: string;
    urlToImage?: string;
    categoriesApi?: string[] | string;
    // For modal compatibility, include all fields from ModalNewsArticle if they are fetched
    description_full?: string; // Full description for modal
    published_at_iso?: string; // ISO date for modal
    aiSummary?: string;
    country?: string;
}
