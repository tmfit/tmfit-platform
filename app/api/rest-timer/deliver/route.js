import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import webpush from "web-push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:info@tmfit.it";

function adminClient() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Configurazione Supabase server incompleta.");
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

async function deliverRestTimer(request) {
  try {
    if (!vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json(
        { error: "Chiavi VAPID non configurate." },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const jobId = String(body.job_id || "").trim();
    const attempt = Math.max(0, Math.trunc(Number(body.attempt) || 0));
    const exerciseName = String(body.exercise_name || "").trim().slice(0, 120);
    const workoutName = String(body.workout_name || "").trim().slice(0, 120);
    const currentSeries = Math.max(
      0,
      Math.min(200, Math.trunc(Number(body.current_series) || 0))
    );
    const totalSeries = Math.max(
      0,
      Math.min(200, Math.trunc(Number(body.total_series) || 0))
    );

    if (!jobId) {
      return NextResponse.json({ error: "Job timer mancante." }, { status: 400 });
    }

    // Blocca eventuali richiami appartenenti alla precedente versione del timer.
    if (attempt !== 0) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: "repeat_disabled"
      });
    }

    const admin = adminClient();
    const { data: currentJob, error: currentJobError } = await admin
      .from("rest_timer_jobs")
      .select("*")
      .eq("id", jobId)
      .maybeSingle();

    if (currentJobError) {
      return NextResponse.json({ error: currentJobError.message }, { status: 500 });
    }

    if (!currentJob || currentJob.status !== "scheduled") {
      return NextResponse.json({ success: true, skipped: true });
    }

    if (new Date(currentJob.expires_at).getTime() > Date.now() + 3000) {
      return NextResponse.json(
        { error: "Consegna QStash anticipata." },
        { status: 409 }
      );
    }

    const nowIso = new Date().toISOString();
    const { data: claimedJob, error: claimError } = await admin
      .from("rest_timer_jobs")
      .update({
        status: "sending",
        alarm_started_at: currentJob.alarm_started_at || nowIso,
        updated_at: nowIso
      })
      .eq("id", jobId)
      .eq("status", "scheduled")
      .eq("alert_attempt", 0)
      .select("*")
      .maybeSingle();

    if (claimError) {
      return NextResponse.json({ error: claimError.message }, { status: 500 });
    }

    if (!claimedJob) {
      return NextResponse.json({ success: true, skipped: true });
    }

    const { data: subscriptions, error: subscriptionError } = await admin
      .from("push_subscriptions")
      .select("id, endpoint, subscription")
      .eq("user_id", claimedJob.user_id)
      .eq("enabled", true);

    if (subscriptionError) {
      await admin
        .from("rest_timer_jobs")
        .update({
          status: "failed",
          last_error: subscriptionError.message,
          updated_at: new Date().toISOString()
        })
        .eq("id", jobId)
        .eq("status", "sending");

      return NextResponse.json({ error: subscriptionError.message }, { status: 500 });
    }

    // Ultimo controllo: Stop può aver annullato il job mentre veniva preparata la push.
    const { data: latestJobBeforePush } = await admin
      .from("rest_timer_jobs")
      .select("status")
      .eq("id", jobId)
      .maybeSingle();

    if (latestJobBeforePush?.status !== "sending") {
      return NextResponse.json({ success: true, skipped: true, stopped: true });
    }

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    const seriesText =
      currentSeries > 0 && totalSeries > 0
        ? `Serie ${currentSeries} di ${totalSeries}`
        : "";
    const notificationBody = [
      exerciseName || workoutName || "Allenamento",
      seriesText,
      "Tocca per continuare"
    ]
      .filter(Boolean)
      .join(" · ");

    const notificationPayload = JSON.stringify({
      title: "TMFIT · Recupero terminato",
      body: notificationBody,
      url: `/?tmfit=training&tmfit_rest_action=next&tmfit_rest_job=${encodeURIComponent(jobId)}`,
      stopUrl: "/api/rest-timer/stop",
      tag: `tmfit-rest-${jobId}`,
      jobId,
      stopToken: claimedJob.stop_token,
      appBadge: 1
    });

    const results = await Promise.allSettled(
      (subscriptions || []).map(async (item) => {
        try {
          await webpush.sendNotification(item.subscription, notificationPayload, {
            TTL: 180,
            urgency: "high"
          });
          return { id: item.id, sent: true };
        } catch (error) {
          const statusCode = Number(error?.statusCode || 0);

          if ([404, 410].includes(statusCode)) {
            await admin.from("push_subscriptions").delete().eq("id", item.id);
          }

          throw error;
        }
      })
    );

    const deliveredCount = results.filter(
      (result) => result.status === "fulfilled"
    ).length;
    const failedMessages = results
      .filter((result) => result.status === "rejected")
      .map((result) =>
        String(result.reason?.message || result.reason || "Errore push")
      );

    if (!deliveredCount) {
      await admin
        .from("rest_timer_jobs")
        .update({
          status: "failed",
          last_error:
            failedMessages.slice(0, 3).join(" | ") ||
            "Nessuna sottoscrizione raggiungibile.",
          updated_at: new Date().toISOString()
        })
        .eq("id", jobId)
        .eq("status", "sending");

      return NextResponse.json({
        success: false,
        delivered: 0,
        failed: failedMessages.length
      });
    }

    const { data: transitionedJob, error: transitionError } = await admin
      .from("rest_timer_jobs")
      .update({
        status: "sent",
        alert_attempt: 0,
        delivered_count:
          Number(claimedJob.delivered_count || 0) + deliveredCount,
        last_error: failedMessages.length
          ? failedMessages.slice(0, 3).join(" | ")
          : null,
        sent_at: claimedJob.sent_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", jobId)
      .eq("status", "sending")
      .eq("alert_attempt", 0)
      .select("id")
      .maybeSingle();

    if (transitionError) {
      return NextResponse.json({ error: transitionError.message }, { status: 500 });
    }

    if (!transitionedJob) {
      return NextResponse.json({
        success: true,
        delivered: deliveredCount,
        stopped: true
      });
    }

    return NextResponse.json({
      success: true,
      delivered: deliveredCount,
      failed: failedMessages.length,
      repeated: false
    });
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || "Errore durante l'invio della notifica." },
      { status: 500 }
    );
  }
}

export const POST = verifySignatureAppRouter(deliverRestTimer);
