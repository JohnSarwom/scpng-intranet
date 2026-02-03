import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";

console.log("Function 'get-my-objectives' starting up...");

const ADMIN_EMAILS = [
  "admin@scpng.gov.pg",
  "admin@scpng1.onmicrosoft.com",
];

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request");
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create Supabase client with Service Role Key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Get user email from request body
    const body = await req.json();
    const user_email = body?.user_email;
    console.log(`Received request for objectives for email: ${user_email}`);

    if (!user_email) {
      console.error("User email not provided.");
      return new Response(JSON.stringify({ error: "User email is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Start building the query for unit_objectives
    let query = supabaseClient.from("unit_objectives").select("*");

    // Check if the user is an admin
    const isAdmin = ADMIN_EMAILS.includes(user_email.toLowerCase());

    if (isAdmin) {
      console.log(`User ${user_email} is an admin. Fetching all objectives.`);
      // Admin query remains selecting all objectives
    } else {
      console.log(`User ${user_email} is not an admin. Fetching unit...`);
      // 1. Fetch user's unit from staff_members
      const { data: staffData, error: staffError } = await supabaseClient
        .from("staff_members")
        .select("unit")
        .eq("email", user_email)
        .single();

      if (staffError) {
        console.error(`Error fetching unit for ${user_email}:`, staffError);
        return new Response(JSON.stringify([]), { // Return empty if user/unit not found
           headers: { ...corsHeaders, "Content-Type": "application/json" },
           status: 200,
         });
      }

      const userUnit = staffData?.unit;

      if (!userUnit) {
         console.warn(`Unit not found for user ${user_email}. Returning empty objectives.`);
         return new Response(JSON.stringify([]), {
           headers: { ...corsHeaders, "Content-Type": "application/json" },
           status: 200,
         });
      }

      console.log(`User ${user_email} belongs to unit: ${userUnit}. Filtering objectives...`);
      // 2. Modify query to filter by unit
      query = query.eq("unit", userUnit);
    }

    // Execute the final query
    const { data, error } = await query;

    if (error) {
      console.error("Supabase query error:", error);
      throw error;
    }

    console.log(`Successfully fetched ${data?.length ?? 0} objectives for ${user_email} (Admin: ${isAdmin})`);

    // Return the data
    return new Response(JSON.stringify(data || []), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
}); 