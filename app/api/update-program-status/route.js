import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const allowedStatuses = ["active", "archived", "inactive"];

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "update-program-status",
    message: "API update-program-status TMFIT Pro V3.1 attiva"
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
    const programId = body.program_id;
    const status = body.status;

    if (!programId) {
      return NextResponse.json(
        {
          error: "program_id mancante."
        },
        { status: 400 }
      );
    }

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: "Status non valido. Usa active, archived oppure inactive."
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

    const { data: profile, error: profileError } = await adminSupabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || profile?.role !== "professional") {
      return NextResponse.json(
        {
          error: "Solo il professionista può modificare lo stato dei programmi."
        },
        { status: 403 }
      );
    }

    const { data: program, error: programError } = await adminSupabase
      .from("workout_plans")
      .select("id, client_id, professional_id, title, status")
      .eq("id", programId)
      .eq("professional_id", user.id)
      .maybeSingle();

    if (programError) {
      return NextResponse.json(
        {
          error: `Errore lettura programma: ${programError.message}`
        },
        { status: 500 }
      );
    }

    if (!program) {
      return NextResponse.json(
        {
          error: "Programma non trovato o non associato a questo professionista."
        },
        { status: 404 }
      );
    }

    const { data: updatedProgram, error: updateError } = await adminSupabase
      .from("workout_plans")
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq("id", programId)
      .eq("professional_id", user.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        {
          error: `Errore aggiornamento programma: ${updateError.message}`
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      program: updatedProgram
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error.message ||
          "Errore server imprevisto durante aggiornamento programma."
      },
      { status: 500 }
    );
  }
}
