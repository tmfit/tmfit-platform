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
    if (!jobId) {
      return NextResponse.json({ error: "Job timer mancante." }, { status: 400 });
    }

    const admin = adminClient();

    const { data: claimedJob, error: claimError } = await admin
      .from("rest_timer_jobs")
      .update({
        status: "sending",
        updated_at: new Date().toISOString()
      })
      .eq("id", jobId)
      .eq("status", "scheduled")
      .select("*")
      .maybeSingle();

    if (claimError) {
      return NextResponse.json({ error: claimError.message }, { status: 500 });
    }

    if (!claimedJob) {
      return NextResponse.json({ success: true, skipped: true });
    }

    if (new Date(claimedJob.expires_at).getTime() > Date.now() + 3000) {
      await admin
        .from("rest_timer_jobs")
        .update({ status: "scheduled", updated_at: new Date().toISOString() })
        .eq("id", jobId);

      return NextResponse.json(
        { error: "Consegna QStash anticipata." },
        { status: 409 }
      );
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
        .eq("id", jobId);

      return NextResponse.json({ error: subscriptionError.message }, { status: 500 });
    }

    const { data: latestJob } = await admin
      .from("rest_timer_jobs")
      .select("status")
      .eq("id", jobId)
      .maybeSingle();

    if (latestJob?.status === "cancelled") {
      return NextResponse.json({ success: true, skipped: true, cancelled: true });
    }

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    const notificationPayload = JSON.stringify({
      title: "TMFIT · Recupero terminato",
      body: "È il momento di iniziare la prossima serie.",
      url: "/?tmfit=training",
      tag: `tmfit-rest-${jobId}`,
      jobId
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
      .map((result) => String(result.reason?.message || result.reason || "Errore push"));

    await admin
      .from("rest_timer_jobs")
      .update({
        status: deliveredCount > 0 ? "sent" : "failed",
        delivered_count: deliveredCount,
        last_error: failedMessages.length ? failedMessages.slice(0, 3).join(" | ") : null,
        sent_at: deliveredCount > 0 ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq("id", jobId);

    return NextResponse.json({
      success: deliveredCount > 0,
      delivered: deliveredCount,
      failed: failedMessages.length
    });
  } catch (error) {
    return NextResponse.json(
      { error: error?.message || "Errore durante l'invio della notifica." },
      { status: 500 }
    );
  }
}

export const POST = verifySignatureAppRouter(deliverRestTimer);
