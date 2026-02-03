import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Define the structure of a news article
// You might want to centralize this type if it's used elsewhere (e.g., in a types.ts file)
export interface NewsArticle {
  article_id: string;
  title: string;
  description: string; // This will be our main content, potentially long
  published_at: string;
  source_name?: string | null;
  url?: string | null;
  url_to_image?: string | null;
  categories_api?: string | null; // Assuming it's a JSON string array of tags
  // Add any other fields you expect for an article
}

interface ScpngArticleModalProps {
  article: NewsArticle | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const ScpngArticleModal: React.FC<ScpngArticleModalProps> = ({ article, isOpen, onOpenChange }) => {
  if (!article) {
    return null; // Don't render anything if no article is selected
  }

  // Helper to parse categories if they are a JSON string
  const getTags = () => {
    if (article.categories_api) {
      try {
        const tags = JSON.parse(article.categories_api);
        return Array.isArray(tags) ? tags : [];
      } catch (e) {
        console.error("Failed to parse categories_api:", e);
        return [];
      }
    }
    return [];
  };

  const tags = getTags();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className="w-[90vw] max-w-[800px] h-[90vh] flex flex-col p-0" // A4-ish aspect ratio, large modal
        onInteractOutside={(e) => e.preventDefault()} // Optional: prevent closing on outside click
      >
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-2xl font-bold">{article.title}</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Published: {new Date(article.published_at).toLocaleDateString()}
            {article.source_name && ` | Source: ${article.source_name}`}
          </DialogDescription>
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </DialogHeader>

        <div 
          className="flex-grow overflow-y-auto p-6 bg-white" // Main content area
          style={{ fontFamily: 'serif', lineHeight: '1.6' }} // A4-like typography
        >
          {article.url_to_image && (
            <img 
              src={article.url_to_image} 
              alt={article.title} 
              className="w-full h-auto max-h-[400px] object-contain mb-6 rounded" 
            />
          )}
          {/* Using dangerouslySetInnerHTML for HTML content if description can contain HTML.
              If it's plain text, just use <p>{article.description}</p> or format it with <pre> for line breaks.
              Be cautious with dangerouslySetInnerHTML if the content isn't trusted.
          */}
          <div 
            className="prose max-w-none" // 'prose' class from Tailwind typography for nice text formatting
            dangerouslySetInnerHTML={{ __html: article.description || '<p>No content available.</p>' }} 
          />

          {article.url && article.url !== '#' && !article.url.startsWith('#article-') && (
            <div className="mt-6 pt-4 border-t">
              <a 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:underline"
              >
                Read original article
              </a>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-gray-50 rounded-b-md">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScpngArticleModal; 