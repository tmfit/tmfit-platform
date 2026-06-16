import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function numberOrNull(value) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "replace-program",
    message: "API replace-program TMFIT Pro V3.1 attiva"
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
    const builder = body.builder;

    if (!programId) {
      return NextResponse.json(
        {
          error: "program_id mancante."
        },
        { status: 400 }
      );
    }

    if (!builder || !Array.isArray(builder.days)) {
      return NextResponse.json(
        {
          error: "builder mancante o non valido."
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
          error: "Solo il professionista può modificare programmi."
        },
        { status: 403 }
      );
    }

    const { data: program, error: programError } = await adminSupabase
      .from("workout_plans")
      .select("id, client_id, professional_id, title")
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

    const { error: updatePlanError } = await adminSupabase
      .from("workout_plans")
      .update({
        title: builder.title || "Programma allenamento",
        goal: builder.goal || null,
        notes: builder.notes || null,
        start_date: builder.start_date || null,
        end_date: builder.end_date || null,
        duration_weeks: Number(builder.duration_weeks) || 4,
        level: builder.level || null,
        location: builder.location || null,
        updated_at: new Date().toISOString()
      })
      .eq("id", programId)
      .eq("professional_id", user.id);

    if (updatePlanError) {
      return NextResponse.json(
        {
          error: `Errore aggiornamento programma: ${updatePlanError.message}`
        },
        { status: 500 }
      );
    }

    /*
      Sostituiamo la struttura della scheda.
      Le sessioni/log cliente rimangono, ma la scheda viene rigenerata pulita.
    */

    const { data: existingDays } = await adminSupabase
      .from("workout_days")
      .select("id")
      .eq("plan_id", programId);

    const existingDayIds = (existingDays || []).map((item) => item.id);

    if (existingDayIds.length > 0) {
      const { data: existingBlocks } = await adminSupabase
        .from("workout_blocks")
        .select("id")
        .in("day_id", existingDayIds);

      const existingBlockIds = (existingBlocks || []).map((item) => item.id);

      if (existingBlockIds.length > 0) {
        const { data: existingExercises } = await adminSupabase
          .from("workout_exercises")
          .select("id")
          .in("block_id", existingBlockIds);

        const existingExerciseIds = (existingExercises || []).map(
          (item) => item.id
        );

        if (existingExerciseIds.length > 0) {
          await adminSupabase
            .from("workout_exercise_progressions")
            .delete()
            .in("workout_exercise_id", existingExerciseIds);

          await adminSupabase
            .from("workout_exercise_sets")
            .delete()
            .in("workout_exercise_id", existingExerciseIds);

          await adminSupabase
            .from("workout_exercises")
            .delete()
            .in("id", existingExerciseIds);
        }

        await adminSupabase
          .from("workout_blocks")
          .delete()
          .in("id", existingBlockIds);
      }

      await adminSupabase.from("workout_days").delete().in("id", existingDayIds);
    }

    await adminSupabase.from("workout_weeks").delete().eq("plan_id", programId);

    const { data: weekRow, error: weekError } = await adminSupabase
      .from("workout_weeks")
      .insert({
        plan_id: programId,
        week_number: 1,
        title: "Programma base",
        goal: builder.goal || null,
        notes: "Settimana tecnica usata per organizzare la scheda.",
        sort_order: 1
      })
      .select()
      .single();

    if (weekError) {
      return NextResponse.json(
        {
          error: `Errore creazione settimana: ${weekError.message}`
        },
        { status: 500 }
      );
    }

    for (let dayIndex = 0; dayIndex < builder.days.length; dayIndex += 1) {
      const day = builder.days[dayIndex];

      const { data: dayRow, error: dayError } = await adminSupabase
        .from("workout_days")
        .insert({
          plan_id: programId,
          week_id: weekRow.id,
          title: day.title || `Allenamento ${dayIndex + 1}`,
          day_type: "training",
          estimated_minutes: numberOrNull(day.estimated_minutes),
          notes: day.notes || null,
          sort_order: dayIndex + 1
        })
        .select()
        .single();

      if (dayError) {
        return NextResponse.json(
          {
            error: `Errore creazione giorno: ${dayError.message}`
          },
          { status: 500 }
        );
      }

      const { data: blockRow, error: blockError } = await adminSupabase
        .from("workout_blocks")
        .insert({
          day_id: dayRow.id,
          title: "Esercizi",
          block_type: "normal",
          instructions: null,
          sort_order: 1
        })
        .select()
        .single();

      if (blockError) {
        return NextResponse.json(
          {
            error: `Errore creazione blocco: ${blockError.message}`
          },
          { status: 500 }
        );
      }

      for (
        let exerciseIndex = 0;
        exerciseIndex < day.exercises.length;
        exerciseIndex += 1
      ) {
        const exercise = day.exercises[exerciseIndex];

        if (!String(exercise.exercise_name || "").trim()) continue;

        const { data: exerciseRow, error: exerciseError } = await adminSupabase
          .from("workout_exercises")
          .insert({
            day_id: dayRow.id,
            block_id: blockRow.id,
            exercise_media_id: exercise.exercise_media_id || null,
            exercise_name: String(exercise.exercise_name || "").trim(),
            sets: exercise.sets || null,
            reps: exercise.reps || null,
            recovery_seconds: Number(exercise.recovery_seconds) || 90,
            execution_mode: exercise.execution_mode || null,
            target_rpe: exercise.target_rpe || null,
            target_rir: exercise.target_rir || null,
            video_url: exercise.video_url || null,
            image_url: exercise.image_url || null,
            notes: exercise.notes || null,
            smart_notes: exercise.notes || null,
            sort_order: exerciseIndex + 1,
            exercise_type: "normal",
            tracking_type: "load_reps",
            has_weekly_progression: !!exercise.has_weekly_progression,
            progression_mode: exercise.has_weekly_progression
              ? "weekly"
              : "none",
            is_active: true
          })
          .select()
          .single();

        if (exerciseError) {
          return NextResponse.json(
            {
              error: `Errore creazione esercizio: ${exerciseError.message}`
            },
            { status: 500 }
          );
        }

        const setsCount = Math.max(1, Number(exercise.sets) || 1);

        const setRows = Array.from({ length: setsCount }).map((_, index) => ({
          workout_exercise_id: exerciseRow.id,
          set_number: index + 1,
          target_reps: exercise.reps || null,
          target_load_kg: null,
          target_rpe: numberOrNull(exercise.target_rpe),
          target_rir: numberOrNull(exercise.target_rir),
          rest_seconds: Number(exercise.recovery_seconds) || 90,
          notes: null
        }));

        const { error: setsError } = await adminSupabase
          .from("workout_exercise_sets")
          .insert(setRows);

        if (setsError) {
          return NextResponse.json(
            {
              error: `Errore creazione serie: ${setsError.message}`
            },
            { status: 500 }
          );
        }

        if (exercise.has_weekly_progression) {
          const progressionRows = (exercise.progressions || []).map(
            (progression, index) => ({
              workout_exercise_id: exerciseRow.id,
              week_number: Number(progression.week_number) || index + 1,
              target_sets: progression.target_sets || null,
              target_reps: progression.target_reps || null,
              target_load_text: progression.target_load_text || null,
              target_load_kg: numberOrNull(progression.target_load_kg),
              target_rpe: progression.target_rpe || null,
              target_rir: progression.target_rir || null,
              recovery_seconds: numberOrNull(progression.recovery_seconds),
              notes: progression.notes || null,
              sort_order: index + 1
            })
          );

          if (progressionRows.length > 0) {
            const { error: progressionError } = await adminSupabase
              .from("workout_exercise_progressions")
              .insert(progressionRows);

            if (progressionError) {
              return NextResponse.json(
                {
                  error: `Errore creazione progressioni: ${progressionError.message}`
                },
                { status: 500 }
              );
            }
          }
        }
      }
    }

    return NextResponse.json({
      ok: true,
      program_id: programId
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error.message ||
          "Errore server imprevisto durante modifica programma."
      },
      { status: 500 }
    );
  }
}
