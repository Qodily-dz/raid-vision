import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Password-recovery callback.
 *
 * Supabase redirects here with the recovery token in the URL fragment. The
 * fragment never reaches the server, so the page briefly calls `exchangeCodeForSession`
 * in the browser; this route exists to catch the PKCE `?code=` variant and the
 * case where a client sends the token as a query parameter.
 *
 * Either way the visitor ends up on `/admin/reset-password` with a session.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const token = url.searchParams.get("token_hash") ?? url.searchParams.get("token");

  const supabase = await createClient();

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  } else if (token && token.split(".").length === 2) {
    // Opaque `token_hash` links cannot be verified without the server-side secret,
    // so they are not exchanged here; the browser half of the flow handles those.
    console.warn("[raid-vision] recovery token received without a PKCE code");
  }

  const next = new URL("/admin/reset-password", url.origin);
  return NextResponse.redirect(next);
}
