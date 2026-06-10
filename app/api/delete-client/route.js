import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "delete-client",
    message: "API delete-client attiva"
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
        { error: "Token mancante. Effettua nuovamente il login." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const clientId = Number(body.client_id);

    if (!clientId) {
      return NextResponse.json(
        { error: "client_id mancante o non valido." },
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
        { error: "Utente non autorizzato." },
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
        { error: "Solo il professionista può eliminare clienti." },
        { status: 403 }
      );
    }

    const { data: client, error: clientError } = await adminSupabase
      .from("clients")
      .select("id, user_id, professional_id, first_name, last_name")
      .eq("id", clientId)
      .eq("professional_id", user.id)
      .maybeSingle();

    if (clientError) {
      return NextResponse.json(
        { error: `Errore lettura cliente: ${clientError.message}` },
        { status: 500 }
      );
    }

    if (!client) {
      return NextResponse.json(
        { error: "Cliente non trovato o non associato a questo professionista." },
        { status: 404 }
      );
    }

    const { data: diets } = await adminSupabase
      .from("diets")
      .select("file_path")
      .eq("client_id", clientId);

    const dietPaths = (diets || [])
      .map((diet) => diet.file_path)
      .filter(Boolean);

    if (dietPaths.length > 0) {
      await adminSupabase.storage.from("diets").remove(dietPaths);
    }

    await adminSupabase.from("workout_logs").delete().eq("client_id", clientId);
    await adminSupabase.from("diets").delete().eq("client_id", clientId);

    await adminSupabase
      .from("measurements")
      .delete()
      .eq("client_id", String(clientId));

    await adminSupabase.from("workout_plans").delete().eq("client_id", clientId);

    await adminSupabase.from("clients").delete().eq("id", clientId);

    if (client.user_id) {
      await adminSupabase.from("profiles").delete().eq("id", client.user_id);
      await adminSupabase.auth.admin.deleteUser(client.user_id);
    }

    return NextResponse.json({
      ok: true,
      deleted_client_id: clientId
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error.message ||
          "Errore server imprevisto durante eliminazione cliente."
      },
      { status: 500 }
    );
  }
}
