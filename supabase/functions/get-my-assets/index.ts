// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

console.log("Initializing get-my-assets function v2"); // Increment version for logging

// Helper function to sanitize string values for JSON
function sanitizeString(str: string | null | undefined): string | null {
  if (str === null || str === undefined) {
    return null;
  }
  // Replace control characters (like newlines) with spaces, 
  // escape backslashes, and escape double quotes.
  // Adjust the replacement logic if needed based on specific data issues.
  try {
    // A more robust approach using JSON.stringify on the single string
    // This handles quotes, backslashes, newlines, tabs, etc. correctly.
    // We then remove the outer quotes added by stringify.
    const jsonString = JSON.stringify(str);
    return jsonString.substring(1, jsonString.length - 1);
  } catch (e) {
    console.warn(`[sanitizeString] Failed to sanitize string: ${str.substring(0, 100)}...`, e);
    // Fallback: Replace common problematic characters if stringify fails
    return str
      .replace(/\/g, '\\') // Escape backslashes first
      .replace(/"/g, '\"')   // Escape double quotes
      .replace(/
/g, '\n')   // Escape newlines
      .replace(//g, '\r')   // Escape carriage returns
      .replace(/	/g, '\t');  // Escape tabs
  }
}

const ADMIN_EMAILS = [
  "admin@scpng.gov.pg",
  "admin@scpng1.onmicrosoft.com",
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request for get-my-assets");
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Extract user email from the request body
    const body = await req.json(); 
    const user_email = body?.user_email;
    console.log("[get-my-assets] Received data:", { user_email });

    if (!user_email) {
      console.error("[get-my-assets] Missing user_email in request body");
      return new Response(
        JSON.stringify({ error: "Missing user_email" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // 2. Create Supabase Admin client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceKey) {
      console.error("[get-my-assets] Missing Supabase environment variables.");
      return new Response(
        JSON.stringify({ error: "Server configuration error." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    console.log("[get-my-assets] Supabase Admin client created");

    // 3. Build the query based on user role
    const isAdmin = ADMIN_EMAILS.includes(user_email.toLowerCase());
    
    // Use active_assets view to automatically exclude deleted assets
    let query = supabaseAdmin.from("active_assets").select("*");

    if (isAdmin) {
      console.log(`[get-my-assets] Admin user (${user_email}) detected. Fetching all active assets.`);
      // Admins see all active assets (deleted assets are already filtered out by the view)
    } else {
      console.log(`[get-my-assets] Non-admin user (${user_email}). Filtering active assets by assigned_to_email.`);
      query = query.eq("assigned_to_email", user_email);
    }

    // 4. Execute the query
    const { data, error } = await query;

    if (error) {
      console.error("[get-my-assets] Database error fetching assets:", error);
      return new Response(
        JSON.stringify({ error: "Database query error: " + error.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log(`[get-my-assets] Found ${data?.length ?? 0} assets for ${user_email} (Admin: ${isAdmin}). Sanitizing...`);

    // 5. Sanitize string fields before returning
    const sanitizedData = data?.map(asset => {
      const sanitizedAsset = { ...asset };
      // Iterate over asset properties and sanitize strings
      for (const key in sanitizedAsset) {
        if (typeof sanitizedAsset[key] === 'string') {
          sanitizedAsset[key] = sanitizeString(sanitizedAsset[key]);
        }
        // Optional: Deep sanitize if you have nested objects with strings
        // else if (typeof sanitizedAsset[key] === 'object' && sanitizedAsset[key] !== null) {
        //   // Implement deep sanitization if necessary
        // }
      }
      return sanitizedAsset;
    }) || [];

    // 6. Return the sanitized data
    return new Response(
      JSON.stringify(sanitizedData), // Use the sanitized data
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (err) {
    console.error("[get-my-assets] Unhandled error:", err);
    if (err instanceof SyntaxError && err.message.includes('JSON')) {
        return new Response(JSON.stringify({ error: "Invalid request body: Malformed JSON." }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
    }
    return new Response(JSON.stringify({ error: "Internal Server Error: " + err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/get-my-assets' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
