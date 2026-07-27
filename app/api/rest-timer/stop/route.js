import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function adminClient() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Configurazione Supabase server incompleta.");
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const jobId = String(body.job_id || "").trim();
    const stopToken = String(body.stop_token || "").trim();

    if (!jobId || !stopToken) {
      return NextResponse.json({ error: "Dati di arresto mancanti." }, { status: 400 });
    }

    const admin = adminClient();
    const { data, error } = await admin
      .from("rest_timer_jobs")
      .update({
        status: "stopped",
        stopped_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", jobId)
      .eq("stop_token", stopToken)
      .in("status", ["scheduled", "sending", "alerting", "sent"])
      .select("id")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, stopped: Boolean(data?.id) });
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || "Impossibile interrompere il richiamo." },
      { status: 500 }
    );
  }
}
