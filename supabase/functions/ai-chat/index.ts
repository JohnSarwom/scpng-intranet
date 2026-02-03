
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        // 1. Parse the Request from the Client
        // We expect the client to send the body exactly as Gemini expects it (contents, system_instruction, etc.)
        const requestPayload = await req.json()

        // 2. Fetch the Secure Configuration (API Key) from the Database
        // This runs server-side, so the key is never exposed to the client.
        const { data: settings, error: settingsError } = await supabaseClient
            .from('news_api_settings')
            .select('api_key, api_endpoint')
            .eq('id', 1)
            .single()

        if (settingsError || !settings?.api_key || !settings?.api_endpoint) {
            console.error("AI Configuration Error:", settingsError);
            return new Response(JSON.stringify({ error: "AI Service is not configured." }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
            })
        }

        // 3. Forward the request to Gemini API
        const geminiUrl = `${settings.api_endpoint}?key=${settings.api_key}`

        // We forward the payload from the client directly to Gemini
        const geminiResponse = await fetch(geminiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestPayload),
        })

        const geminiData = await geminiResponse.json()

        if (!geminiResponse.ok) {
            console.error("Gemini API Error:", geminiData);
            return new Response(JSON.stringify({ error: geminiData.error?.message || "Upstream API Error" }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: geminiResponse.status,
            })
        }

        // 4. Return the result to the client
        return new Response(JSON.stringify(geminiData), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error("Edge Function Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
