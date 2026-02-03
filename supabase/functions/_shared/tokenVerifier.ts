// supabase/functions/_shared/tokenVerifier.ts
import * as jose from 'https://deno.land/x/jose@v4.14.4/index.ts' // Using Deno compatible JOSE library

// --- Configuration Needed ---
// Replace with your actual Microsoft Entra ID (Azure AD) details
const AZURE_TENANT_ID = Deno.env.get('AZURE_TENANT_ID') || 'common'; // Or your specific tenant ID
const AZURE_AUDIENCE = Deno.env.get('AZURE_AUDIENCE'); // Your App Registration's Application ID URI or Client ID
const AZURE_ISSUER_PREFIX = `https://login.microsoftonline.com/`; // Base issuer URL

// --- JWKS Fetching ---
// Construct the correct JWKS URI based on tenant ID
const JWKS_URI = `${AZURE_ISSUER_PREFIX}${AZURE_TENANT_ID}/discovery/v2.0/keys`;
const JWKS = jose.createRemoteJWKSet(new URL(JWKS_URI));

/**
 * Verifies a Microsoft Entra ID JWT.
 * @param token The JWT string from the Authorization header.
 * @returns The verified token payload.
 * @throws Error if verification fails.
 */
export async function verifyMicrosoftToken(token: string): Promise<any> {
  if (!AZURE_AUDIENCE) {
    throw new Error("Missing required environment variable: AZURE_AUDIENCE");
  }
  if (!token) {
    throw new Error("No token provided for verification.");
  }

  try {
    const { payload } = await jose.jwtVerify(token, JWKS, {
      issuer: `${AZURE_ISSUER_PREFIX}${AZURE_TENANT_ID}/v2.0`, // Check issuer claim
      audience: AZURE_AUDIENCE, // Check audience claim
      // Add algorithms if needed, typically RS256 for Azure AD
      algorithms: ['RS256']
    });

    // Check if payload contains necessary user info (e.g., email or preferred_username)
    const userEmail = payload.email || payload.preferred_username;
    if (!userEmail) {
       console.warn("JWT payload missing standard email claim. Payload:", payload);
       // You might need to adjust this based on your token configuration (e.g., use 'upn' or 'oid')
       throw new Error("Could not extract user identifier (email/preferred_username) from token.");
    }

    console.log("Token verified successfully for:", userEmail);
    return payload; // Return the whole payload for flexibility

  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    // Provide a more generic error message to the client
    throw new Error('Invalid or expired token.');
  }
} 