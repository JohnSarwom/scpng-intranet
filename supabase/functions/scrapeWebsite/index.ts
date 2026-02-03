import { serve } from "https://deno.land/std/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

serve(async (req) => {
  // Default to example.com if no URL is provided in the request
  let urlToScrape = "https://example.com";

  // Check if the request is a POST request and has a JSON body with a 'url' property
  if (req.method === "POST") {
    try {
      const body = await req.json();
      if (body.url) {
        urlToScrape = body.url;
      }
    } catch (error) {
      console.error("Error parsing JSON body:", error);
      // Keep default URL or handle error as appropriate
    }
  } else {
    // For GET requests, you could also check for a URL query parameter
    const reqUrl = new URL(req.url);
    const queryUrl = reqUrl.searchParams.get("url");
    if (queryUrl) {
      urlToScrape = queryUrl;
    }
  }

  console.log(`Fetching HTML from: ${urlToScrape}`);

  try {
    const res = await fetch(urlToScrape);
    if (!res.ok) {
      console.error(`Failed to fetch URL: ${urlToScrape}, status: ${res.status}`);
      return new Response(JSON.stringify({ error: `Failed to fetch URL: ${res.statusText}` }), {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");

    if (!doc) {
      console.error("Failed to parse HTML document.");
      return new Response(JSON.stringify({ error: "Failed to parse HTML document" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const title = doc.querySelector("title")?.textContent || "No title found";
    // You can add more scraping logic here for other elements

    return new Response(JSON.stringify({ title: title.trim() }), {
      headers: { "Content-Type": "application/json", "Connection": "keep-alive" },
    });
  } catch (error) {
    console.error("Error during scraping process:", error);
    return new Response(JSON.stringify({ error: "An error occurred during the scraping process", details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}); 