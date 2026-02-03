import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";

console.log("Function 'get-my-tasks' starting up...");

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
    // Create Supabase client with Service Role Key for elevated privileges
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", // Use Service Role Key
    );

    // Get user email from request body
    const body = await req.json();
    const user_email = body?.user_email; // Add safe access
    console.log(`Received request for tasks for email: ${user_email}`);

    if (!user_email) {
      console.error("User email not provided in the request body.");
      return new Response(JSON.stringify({ error: "User email is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    let query = supabaseClient.from("unit_tasks").select("*");

    // Check if the user is an admin
    const isAdmin = ADMIN_EMAILS.includes(user_email.toLowerCase());

    if (isAdmin) {
      console.log(`User ${user_email} is an admin. Fetching all tasks.`);
      // Admin query remains selecting all tasks
    } else {
      console.log(`User ${user_email} is not an admin. Fetching unit...`);
      // 1. Fetch user's unit from staff_members
      const { data: staffData, error: staffError } = await supabaseClient
        .from("staff_members")
        .select("unit")
        .eq("email", user_email)
        .single(); // Expecting only one user

      if (staffError) {
        console.error(`Error fetching unit for ${user_email}:`, staffError);
        // If user not found in staff_members, maybe return empty array? Or throw error?
        // Let's return empty for now to avoid breaking the flow if user isn't mapped yet.
         return new Response(JSON.stringify([]), {
           headers: { ...corsHeaders, "Content-Type": "application/json" },
           status: 200, // Or 404 if preferred when user not found
         });
      }

      const userUnit = staffData?.unit;

      if (!userUnit) {
         console.warn(`Unit not found for user ${user_email}. Returning empty tasks.`);
         // If unit is null/empty in the table for the user
         return new Response(JSON.stringify([]), {
           headers: { ...corsHeaders, "Content-Type": "application/json" },
           status: 200,
         });
      }

      console.log(`User ${user_email} belongs to unit: ${userUnit}. Filtering tasks...`);
      // 2. Modify query to filter by unit
      query = query.eq("unit", userUnit);
    }

    // Execute the final query
    const { data, error } = await query;

    if (error) {
      console.error("Supabase query error:", error);
      throw error; // Throw error to be caught by the outer catch block
    }

    console.log(`Successfully fetched ${data?.length ?? 0} tasks for ${user_email} (Admin: ${isAdmin})`);

    // Return the data
    return new Response(JSON.stringify(data || []), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error processing request:", error); // Log the actual error object
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500, // Internal Server Error
    });
  }
});

// Note: Ensure you have a _shared/cors.ts file or replace corsHeaders with appropriate values.
// Example _shared/cors.ts:
/*
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Or specific origins
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
*/ 