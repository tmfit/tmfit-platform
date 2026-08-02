import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Client as QStashClient } from "@upstash/qstash";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const qstashToken = process.env.QSTASH_TOKEN;

function jsonError(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function adminClient() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Configurazione Supabase server incompleta.");
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

function authClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Configurazione Supabase pubblica incompleta.");
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

function bearerToken(request) {
  const authorization = request.headers.get("authorization") || "";
  return authorization.match(/^Bearer\s+(.+)$/i)?.[1]?.trim() || "";
}

async function authenticatedUser(request) {
  const token = bearerToken(request);
  if (!token) return { error: jsonError("Sessione cliente mancante.", 401) };

  const { data, error } = await authClient().auth.getUser(token);
  if (error || !data?.user) {
    return { error: jsonError("Sessione cliente non valida.", 401) };
  }

  return { user: data.user };
}

async function verifyOwnedClient(admin, userId, clientId) {
  const numericClientId = Number(clientId);
  if (!Number.isInteger(numericClientId) || numericClientId <= 0) {
    return { error: jsonError("Cliente non valido.") };
  }

  const { data, error } = await admin
    .from("clients")
    .select("id, user_id")
    .eq("id", numericClientId)
    .maybeSingle();

  if (error) return { error: jsonError(error.message, 500) };
  if (!data || String(data.user_id) !== String(userId)) {
    return { error: jsonError("Cliente non associato all'utente autenticato.", 403) };
  }

  return { clientId: numericClientId };
}

export async function POST(request) {
  try {
    const auth = await authenticatedUser(request);
    if (auth.error) return auth.error;

    if (!qstashToken) {
      return jsonError("QStash non configurato sul server.", 500);
    }

    const body = await request.json().catch(() => ({}));
    const seconds = Math.max(1, Math.min(3600, Math.ceil(Number(body.seconds) || 0)));
    if (!seconds) return jsonError("Durata timer non valida.");

    const admin = adminClient();
    const ownership = await verifyOwnedClient(admin, auth.user.id, body.client_id);
    if (ownership.error) return ownership.error;

    const { count, error: subscriptionError } = await admin
      .from("push_subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", auth.user.id)
      .eq("enabled", true);

    if (subscriptionError) return jsonError(subscriptionError.message, 500);
    if (!count) {
      return jsonError("Notifiche push non ancora abilitate.", 409);
    }

    const timerKey = body.timer_key
      ? String(body.timer_key).slice(0, 240)
      : null;

    if (timerKey) {
      const { error: previousJobsError } = await admin
        .from("rest_timer_jobs")
        .update({
          status: "cancelled",
          stopped_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("user_id", auth.user.id)
        .eq("client_id", ownership.clientId)
        .eq("timer_key", timerKey)
        .in("status", ["scheduled", "sending", "alerting", "sent"]);

      if (previousJobsError) {
        return jsonError(previousJobsError.message, 500);
      }
    }

    const expiresAt = new Date(Date.now() + seconds * 1000).toISOString();
    const { data: job, error: jobError } = await admin
      .from("rest_timer_jobs")
      .insert({
        user_id: auth.user.id,
        client_id: ownership.clientId,
        timer_key: timerKey,
        expires_at: expiresAt,
        status: "scheduled",
        alert_attempt: 0
      })
      .select("id, stop_token")
      .single();

    if (jobError) return jsonError(jobError.message, 500);

    const qstash = new QStashClient({
      token: qstashToken,
      enableTelemetry: false
    });
    const destination = `${request.nextUrl.origin}/api/rest-timer/deliver`;

    try {
      const published = await qstash.publishJSON({
        url: destination,
        body: { job_id: job.id, attempt: 0 },
        delay: `${seconds}s`,
        retries: 2
      });

      await admin
        .from("rest_timer_jobs")
        .update({
          qstash_message_id: published.messageId || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", job.id);

      return NextResponse.json({
        success: true,
        job_id: job.id,
        expires_at: expiresAt
      });
    } catch (error) {
      await admin
        .from("rest_timer_jobs")
        .update({
          status: "failed",
          last_error: String(error?.message || error),
          updated_at: new Date().toISOString()
        })
        .eq("id", job.id);

      return jsonError("Programmazione della notifica non riuscita.", 502);
    }
  } catch (error) {
    return jsonError(error?.message || "Errore durante la programmazione del timer.", 500);
  }
}

export async function DELETE(request) {
  try {
    const auth = await authenticatedUser(request);
    if (auth.error) return auth.error;

    const body = await request.json().catch(() => ({}));
    const jobId = String(body.job_id || "").trim();
    const timerKey = String(body.timer_key || "").trim().slice(0, 240);
    const numericClientId = Number(body.client_id);

    if (!jobId && !timerKey) {
      return NextResponse.json({ success: true, cancelled: 0 });
    }

    const admin = adminClient();
    const activeStatuses = ["scheduled", "sending", "alerting", "sent"];
    const cancelledIds = new Set();
    const stoppedAt = new Date().toISOString();

    if (jobId) {
      const { data, error } = await admin
        .from("rest_timer_jobs")
        .update({
          status: "cancelled",
          stopped_at: stoppedAt,
          updated_at: stoppedAt
        })
        .eq("id", jobId)
        .eq("user_id", auth.user.id)
        .in("status", activeStatuses)
        .select("id");

      if (error) return jsonError(error.message, 500);
      (data || []).forEach((item) => cancelledIds.add(String(item.id)));
    }

    if (
      timerKey &&
      Number.isInteger(numericClientId) &&
      numericClientId > 0
    ) {
      const ownership = await verifyOwnedClient(
        admin,
        auth.user.id,
        numericClientId
      );
      if (ownership.error) return ownership.error;

      const { data, error } = await admin
        .from("rest_timer_jobs")
        .update({
          status: "cancelled",
          stopped_at: stoppedAt,
          updated_at: stoppedAt
        })
        .eq("user_id", auth.user.id)
        .eq("client_id", numericClientId)
        .eq("timer_key", timerKey)
        .in("status", activeStatuses)
        .select("id");

      if (error) return jsonError(error.message, 500);
      (data || []).forEach((item) => cancelledIds.add(String(item.id)));
    }

    return NextResponse.json({
      success: true,
      cancelled: cancelledIds.size
    });
  } catch (error) {
    return jsonError(
      error?.message || "Errore durante l'annullamento del timer.",
      500
    );
  }
}
