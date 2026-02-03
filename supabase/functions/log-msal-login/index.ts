import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

console.log("Initializing log-msal-login function");

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS requests");
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Only expect user_email from the client now
    const { user_email } = await req.json(); 
    console.log("Received data:", { user_email });

    if (!user_email) {
      console.error("Missing user_email in request body");
      return new Response(
        JSON.stringify({ error: "Missing user_email" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Create Supabase Admin client
    // Ensure environment variables are set in Supabase project settings
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceKey) {
      console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
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
    console.log("Supabase Admin client created");

    // --- Get or Create Supabase User ---
    console.log(`Checking for user in auth.users by email: ${user_email}`);
    let supabaseUserId = null;
    let userExists = false;

    // 1. Check if user exists using listUsers and filtering
    // Note: Listing all users might be inefficient for large numbers of users. 
    // Supabase might offer more direct email lookup methods in newer API versions or via specific filters.
    // This approach assumes we fetch and filter. Consider pagination if user count is very high.
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers({
       // page: 1, // Example pagination if needed
       // perPage: 1000, // Example pagination if needed
    });

    // Handle potential errors during user listing
    if (listError) {
       console.error("Error listing users:", listError);
       // Distinguish between actual errors and just an empty list if possible
       return new Response(JSON.stringify({ error: "Failed to query users: " + listError.message }), {
         headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500
       });
    }

    // Filter the results manually for the specific email (case-insensitive)
    const existingUser = users.find(u => u.email?.toLowerCase() === user_email.toLowerCase());

    if (existingUser) {
      console.log("Existing user found in auth.users:", existingUser.id);
      supabaseUserId = existingUser.id;
      userExists = true;
    } else {
      // 2. User does not exist, create them
      console.log("User not found, creating user in auth.users for email:", user_email);
      const { data: { user: newUser }, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: user_email,
        email_confirm: true, // Mark email as confirmed since MSAL verified it
        // Generate a secure random password (required by createUser)
        // This password won't be used for MSAL logins but is needed for the record.
        password: crypto.randomUUID(), // Use built-in crypto for a secure random string
        // Optionally add metadata
        // user_metadata: { full_name: 'From MSAL', provider: 'msal' }
      });

      if (createError) {
        console.error("Error creating user:", createError);
        // Provide more context if possible, e.g., duplicate email if creation failed for that reason
        return new Response(JSON.stringify({ error: "Failed to create user: " + createError.message }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500
        });
      }
      
      // Ensure the user object and ID were returned
      if (!newUser?.id) {
         console.error("User creation call succeeded but returned no user object or ID.");
         return new Response(JSON.stringify({ error: "Failed to get new user details after creation." }), {
           headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500
         });
      }
      
      supabaseUserId = newUser.id;
      console.log("New user created successfully:", supabaseUserId);
    }
    
    // Final check to ensure we have a user ID
    if (!supabaseUserId) {
       console.error("Critical error: Failed to obtain supabaseUserId after check/create logic.");
       return new Response(JSON.stringify({ error: "Internal server error: Could not determine user ID." }), {
         headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500
       });
    }
    // --- End Get or Create Supabase User ---


    // Insert data into the log table using the Supabase User ID
    console.log(`Inserting login log for user_id: ${supabaseUserId}`);
    const { error: insertError } = await supabaseAdmin.from("user_login_log").insert({
      user_id: supabaseUserId, // Use the ID found or created in auth.users
      user_email: user_email, // Log the email as well for easy reference
    });

    if (insertError) {
      console.error("Error inserting into user_login_log:", insertError);
      return new Response(
        JSON.stringify({ error: "Database insert error: " + insertError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log("Successfully logged user login:", { user_id: supabaseUserId, user_email });
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("Unhandled error:", err);
    // Check if the error is due to invalid JSON body
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