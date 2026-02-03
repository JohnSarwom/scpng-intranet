import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

console.log("Initializing get-my-kras function");

const ADMIN_EMAILS = [
  'admin@scpng1.onmicrosoft.com',
  'admin@scpng.gov.pg'
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Extract user email from the request body
    const body = await req.json();
    const user_email = body?.user_email; 
    console.log("[get-my-kras] Received data:", { user_email });

    if (!user_email) {
      console.error("[get-my-kras] Missing user_email in request body");
      return new Response(
        JSON.stringify({ error: "Missing user_email" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // 2. Create Supabase Admin client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceKey) {
      console.error("[get-my-kras] Missing Supabase environment variables.");
      return new Response(
        JSON.stringify({ error: "Server configuration error." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    console.log("[get-my-kras] Supabase Admin client created");

    // 3. Build the query based on user role
    let query = supabaseAdmin.from("unit_kras").select("*"); // Correct table name

    const isAdmin = ADMIN_EMAILS.includes(user_email.toLowerCase());

    if (isAdmin) {
      console.log(`[get-my-kras] Admin user (${user_email}) detected. Fetching all KRAs.`);
      // Admins see all KRAs
    } else {
      console.log(`[get-my-kras] Non-admin user (${user_email}). Fetching unit...`);
      // Fetch user's unit from staff_members
      const { data: staffData, error: staffError } = await supabaseAdmin
        .from("staff_members")
        .select("unit")
        .eq("email", user_email)
        .single();

      if (staffError) {
        console.error(`[get-my-kras] Error fetching unit for ${user_email}:`, staffError);
        return new Response(JSON.stringify([]), {
           headers: { ...corsHeaders, "Content-Type": "application/json" },
           status: 200,
         });
      }

      const userUnit = staffData?.unit;

      if (!userUnit) {
         console.warn(`[get-my-kras] Unit not found for user ${user_email}. Returning empty KRAs.`);
         return new Response(JSON.stringify([]), {
           headers: { ...corsHeaders, "Content-Type": "application/json" },
           status: 200,
         });
      }

      console.log(`[get-my-kras] User ${user_email} belongs to unit: ${userUnit}. Filtering KRAs by unit.`);
      // Filter by unit instead of assigned_to_email
      query = query.eq("unit", userUnit); 
    }

    // 4. Execute the query
    const { data, error } = await query;

    if (error) {
      console.error("[get-my-kras] Database error fetching KRAs:", error);
      return new Response(
        JSON.stringify({ error: "Database query error: " + error.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log(`[get-my-kras] Found ${data?.length ?? 0} KRAs for ${user_email} (Admin: ${isAdmin}).`);

    // 5. Return the filtered data
    return new Response(
      JSON.stringify(data || []), 
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (err) {
    console.error("[get-my-kras] Unhandled error:", err);
    if (err instanceof SyntaxError && err.message.includes('JSON')) {
        return new Response(JSON.stringify({ error: "Invalid request body: Malformed JSON." }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400
        });
    }
    return new Response(JSON.stringify({ error: "Internal Server Error: " + err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500
    });
  }
}); 