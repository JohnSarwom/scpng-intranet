import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Define corsHeaders directly in this file
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Or specific origins for better security
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', // Adjust as needed
};

// Store API keys as environment variables in Supabase project settings.
const NEWSAPI_KEY_1 = Deno.env.get("NEWSDATA_API_KEY_1");
const NEWSAPI_KEY_2 = Deno.env.get("NEWSDATA_API_KEY_2");

const NEWS_URL_1 = `https://newsdata.io/api/1/latest?apikey=${NEWSAPI_KEY_1}&q=News&country=pg`;
const NEWS_URL_2 = `https://newsdata.io/api/1/latest?apikey=${NEWSAPI_KEY_2}&q=Police&country=pg`;

interface NewsDataIOResult {
  article_id: string;
  title: string | null;
  link: string | null;
  keywords: string[] | null;
  creator: string[] | null;
  video_url: string | null;
  description: string | null;
  content: string | null;
  pubDate: string | null;
  image_url: string | null;
  source_id: string | null;
  source_priority: number;
  country: string[];
  category: string[];
  language: string;
  ai_tag?: string;
  sentiment?: string;
  sentiment_stats?: object;
}

interface NewsDataIOResponse {
  status: string;
  totalResults: number;
  results: NewsDataIOResult[];
  nextPage?: string;
}

console.log("Function 'update-all-news-from-sources' starting up...");

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request for update-all-news-from-sources");
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Ensure API keys are configured
    if (!NEWSAPI_KEY_1 || !NEWSAPI_KEY_2) {
      console.error("News API keys are not configured in environment variables.");
      return new Response(JSON.stringify({ error: "Server configuration error: Missing API keys." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Create Supabase client with Service Role Key for admin-level operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "" // Using Service Role Key
    );
    
    console.log("Fetching news from source 1 (News)...");
    const response1 = await fetch(NEWS_URL_1);
    if (!response1.ok) {
        const errorText1 = await response1.text();
        console.error(`Failed to fetch news from source 1: ${response1.status} ${response1.statusText}`, errorText1);
        throw new Error(`Failed to fetch news from source 1: ${response1.statusText}. Details: ${errorText1}`);
    }
    const data1: NewsDataIOResponse = await response1.json();
    const articles1 = data1.results || [];
    console.log(`Fetched ${articles1.length} articles from source 1.`);

    console.log("Fetching news from source 2 (Police)...");
    const response2 = await fetch(NEWS_URL_2);
    if (!response2.ok) {
        const errorText2 = await response2.text();
        console.error(`Failed to fetch news from source 2: ${response2.status} ${response2.statusText}`, errorText2);
        throw new Error(`Failed to fetch news from source 2: ${response2.statusText}. Details: ${errorText2}`);
    }
    const data2: NewsDataIOResponse = await response2.json();
    const articles2 = data2.results || [];
    console.log(`Fetched ${articles2.length} articles from source 2.`);

    const combinedArticles = [...articles1, ...articles2];
    console.log(`Total articles combined: ${combinedArticles.length}.`);

    if (combinedArticles.length === 0) {
      return new Response(
        JSON.stringify({ message: "No articles fetched from sources." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const articlesToUpsert = combinedArticles.map(article => {
      const title = article.title || "No Title Provided";
      const url = article.link;
      const description = article.description || article.content || "No summary available.";
      const url_to_image = article.image_url;
      let published_at = new Date().toISOString(); // Default to now
      if (article.pubDate) {
        try {
          // newsdata.io format "YYYY-MM-DD HH:MM:SS"
          const parsedDate = new Date(article.pubDate.replace(" ", "T") + "Z"); // Append Z for UTC
          if (!isNaN(parsedDate.getTime())) {
            published_at = parsedDate.toISOString();
          } else {
            console.warn(`Could not parse date '${article.pubDate}', defaulting to now.`);
          }
        } catch (dateError: any) {
          console.warn(`Error parsing date '${article.pubDate}', defaulting to now. Error: ${dateError.message}`);
        }
      }
      const source_name = article.source_id || "Unknown Source";

      if (!url) {
        console.warn("Article missing URL, skipping:", title);
        return null;
      }

      return {
        title: title,
        description: description,
        url: url,
        url_to_image: url_to_image,
        published_at: published_at,
        source_name: source_name,
        // Ensure your 'news_articles' table has these columns.
        // Add/remove fields as per your table structure.
        // e.g., category: article.category?.[0] || 'General', 
      };
    }).filter(Boolean);

    console.log(`Attempting to upsert ${articlesToUpsert.length} valid articles.`);

    if (articlesToUpsert.length > 0) {
      const { data: upsertData, error: upsertError } = await supabaseClient
        .from("news_articles") // Ensure this is your table name
        .upsert(articlesToUpsert, { onConflict: 'url', ignoreDuplicates: false });

      if (upsertError) {
        console.error("Error upserting articles:", upsertError);
        throw upsertError;
      }
      console.log(`Successfully upserted/updated ${articlesToUpsert.length} articles. Result:`, upsertData);
    } else {
      console.log("No valid articles to upsert after filtering.");
    }

    return new Response(
      JSON.stringify({ message: `Successfully processed and stored ${articlesToUpsert.length} articles.` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error: any) {
    console.error("Error in 'update-all-news-from-sources' Edge Function:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}, { verifyJWT: false }); 