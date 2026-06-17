import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const LEGAL_VERSION = "tmfit-v1.0";

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "accept-legal",
    version: LEGAL_VERSION,
    message: "API accept-legal TMFIT Pro V4.1 attiva"
  });
}

export async function POST(request) {
  try {
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      return NextResponse.json(
        {
          error:
            "Variabili Supabase mancanti lato server. Controlla SUPABASE_SERVICE_ROLE_KEY su Vercel."
        },
        { status: 500 }
      );
    }

    const authorization = request.headers.get("authorization") || "";
    const token = authorization.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        {
          error: "Token mancante. Effettua nuovamente il login."
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (
      body.terms_accepted !== true ||
      body.privacy_accepted !== true ||
      body.coaching_consent_accepted !== true
    ) {
      return NextResponse.json(
        {
          error:
            "Devi accettare Termini, Privacy e consenso trattamento dati per continuare."
        },
        { status: 400 }
      );
    }

    const userSupabase = createClient(supabaseUrl, supabaseAnonKey);

    const {
      data: { user },
      error: userError
    } = await userSupabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "Utente non autorizzato."
        },
        { status: 401 }
      );
    }

    const adminSupabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const now = new Date().toISOString();
    const userAgent = request.headers.get("user-agent") || null;

    const { data: profile, error: updateError } = await adminSupabase
      .from("profiles")
      .update({
        terms_accepted_at: now,
        terms_version: LEGAL_VERSION,
        privacy_accepted_at: now,
        privacy_version: LEGAL_VERSION,
        coaching_consent_accepted_at: now,
        coaching_consent_version: LEGAL_VERSION,
        legal_user_agent: userAgent,
        legal_updated_at: now
      })
      .eq("id", user.id)
      .select("*")
      .single();

    if (updateError) {
      return NextResponse.json(
        {
          error: `Errore aggiornamento consenso: ${updateError.message}`
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      version: LEGAL_VERSION,
      profile
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error.message ||
          "Errore server imprevisto durante accettazione consensi."
      },
      { status: 500 }
    );
  }
}
