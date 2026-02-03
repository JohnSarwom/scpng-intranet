import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { verifyMicrosoftToken } from '../_shared/tokenVerifier.ts'

console.log("get-assets function initializing...");

async function getUserDivision(supabaseAdmin: SupabaseClient, userEmail: string): Promise<string | null> {
    if (!userEmail) return null;

    const { data: staffMember, error: staffError } = await supabaseAdmin
        .from('staff_members')
        .select('division_id')
        .eq('email', userEmail)
        .maybeSingle(); // Use maybeSingle, user might not be in staff_members

    if (staffError) {
        console.error(`Error fetching staff member for ${userEmail}:`, staffError);
        return null; // Treat error as if not found for permission check
    }
    if (!staffMember) {
         console.warn(`Staff member not found for email: ${userEmail}`);
         return null;
    }
    if (!staffMember.division_id) {
         console.warn(`Staff member ${userEmail} found but has no division_id.`);
         return null;
    }

    return staffMember.division_id;
}

async function isUserAdmin(supabaseAdmin: SupabaseClient, userEmail: string): Promise<boolean> {
    if (!userEmail) return false;

    // We need to link the email from the token to the user profile ID
    // Assuming user_profiles table has an 'email' column that matches the JWT email
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, is_admin')
      .eq('email', userEmail) // Query by email
      .maybeSingle();

    if (profileError) {
        console.error(`Error fetching user profile for ${userEmail}:`, profileError);
        return false; // Treat error as non-admin
    }

    return userProfile?.is_admin === true;
}


serve(async (req) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS request");
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Verify JWT
    console.log("Verifying token...");
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
       console.error("Missing authorization header");
       throw new Error('Missing authorization header');
    }
    const token = authHeader.replace('Bearer ', '');
    const jwtPayload = await verifyMicrosoftToken(token);
    // Extract email - adjust claim ('email', 'preferred_username', 'upn') as needed based on your Azure AD token config
    const userEmail = jwtPayload.email || jwtPayload.preferred_username;
     if (!userEmail) {
       console.error("Could not determine user email from verified token payload:", jwtPayload);
       throw new Error('User identifier not found in token.');
     }
    console.log(`Token verified for user: ${userEmail}`);

    // 2. Create Supabase Admin Client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { fetch: fetch }, // Required for Deno environment
        auth: { persistSession: false } // Prevent storing session cookies server-side
      }
    );
    console.log("Supabase admin client created.");

    // 3. Determine User Role (Admin or Division)
    const isAdmin = await isUserAdmin(supabaseAdmin, userEmail);
    let userDivision: string | null = null;
    if (!isAdmin) {
        console.log(`User ${userEmail} is not admin, fetching division...`);
        userDivision = await getUserDivision(supabaseAdmin, userEmail);
         if (!userDivision) {
             console.warn(`Could not determine division for non-admin user ${userEmail}. Denying access.`);
              return new Response(JSON.stringify({ error: 'Permission denied. User division not found or user not registered in staff directory.' }), {
                 headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                 status: 403 // Forbidden
             });
         }
        console.log(`User ${userEmail} belongs to division: ${userDivision}`);
    } else {
         console.log(`User ${userEmail} is an Admin.`);
    }


    // 4. Fetch Assets based on Role
    let query = supabaseAdmin.from('assets').select('*');

    if (!isAdmin) {
      // Non-admin: Filter by the email of the person it's assigned to
      console.log(`Filtering assets assigned to email: ${userEmail}`);
      // Assuming 'assets' table has an 'assigned_to_email' column storing the user's email
      query = query.eq('assigned_to_email', userEmail);

    } else {
       console.log("Admin fetching all assets.");
       // Admin gets all assets - no additional filters needed
    }

    const { data: assets, error: assetsError } = await query;

    if (assetsError) {
       console.error("Error fetching assets:", assetsError);
       throw assetsError;
    }

    console.log(`Successfully fetched ${assets?.length ?? 0} assets.`);

    // 5. Return Data
    return new Response(JSON.stringify({ assets }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error("Error in get-assets function:", error);
    // Determine status code based on error type if possible
    const status = (error.message === 'Missing authorization header' || error.message === 'Invalid or expired token.' || error.message.includes('User identifier not found')) ? 401 : // Unauthorized
                   (error.message.includes('Permission denied')) ? 403 : // Forbidden
                   500; // Internal Server Error for others
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: status,
    })
  }
}) 