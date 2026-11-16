-- Keep the legacy completion RPC and existing logs available to older clients.
alter table public.workout_sessions
  add column if not exists workout_week_number integer,
  add column if not exists workout_sync_revision integer;

create or replace function public.tmfit_sync_workout(
  p_session_id uuid,
  p_client_id bigint,
  p_plan_id uuid,
  p_day_id uuid,
  p_week_number integer,
  p_session_date date,
  p_started_at timestamptz,
  p_revision integer,
  p_series jsonb,
  p_summary jsonb default null
) returns jsonb
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  v_user uuid := auth.uid();
  v_session public.workout_sessions%rowtype;
  v_set record;
  v_set_id uuid;
  v_planned_set_id uuid;
  v_count integer;
  v_planned integer;
  v_logs jsonb;
begin
  if v_user is null or not exists (
    select 1 from public.clients where id = p_client_id and user_id = v_user
  ) then
    raise exception 'Workout client does not belong to this account' using errcode = '42501';
  end if;

  if p_session_id is null or p_week_number is null or p_week_number < 1
    or p_revision is null or p_revision < 1 or p_session_date is null
    or p_started_at is null or jsonb_typeof(p_series) is distinct from 'array' then
    raise exception 'Invalid workout snapshot' using errcode = '22023';
  end if;

  if not exists (
    select 1 from public.workout_days d
    join public.workout_plans p on p.id = d.plan_id
    where d.id = p_day_id and p.id = p_plan_id and p.client_id = p_client_id
  ) then
    raise exception 'Workout plan or day has changed' using errcode = 'P0002';
  end if;

  insert into public.workout_sessions (
    id, client_id, user_id, plan_id, day_id, session_date, status, started_at
  ) values (
    p_session_id, p_client_id, v_user, p_plan_id, p_day_id, p_session_date, 'in_progress', p_started_at
  ) on conflict (id) do nothing;

  -- The session lock serializes requests from separate tabs and replayed requests.
  select * into v_session from public.workout_sessions
  where id = p_session_id and client_id = p_client_id and user_id = v_user
    and plan_id = p_plan_id and day_id = p_day_id
  for update;

  if not found then
    raise exception 'Workout session does not belong to this account and day' using errcode = '42501';
  end if;
  if v_session.workout_week_number is not null and v_session.workout_week_number <> p_week_number then
    raise exception 'Workout week has changed' using errcode = 'P0002';
  end if;

  if coalesce(v_session.workout_sync_revision, 0) < p_revision then
    if v_session.completed_at is not null then
      -- A pre-existing legacy completion might have succeeded before its response was lost.
      -- Acknowledge it only when the series recorded on this device are already present.
      if v_session.workout_sync_revision is not null or exists (
        select 1
        from jsonb_to_recordset(p_series) s(workout_exercise_id uuid, set_number integer,
          load_kg numeric, reps_done integer, rpe numeric, rir numeric, notes text)
        where not exists (
          select 1 from public.workout_set_logs l
          where l.session_id = p_session_id and l.workout_exercise_id = s.workout_exercise_id
            and l.set_number = s.set_number and l.completed is true
            and (l.load_kg, l.reps_done, l.rpe, l.rir, l.notes) is not distinct from
              (s.load_kg, s.reps_done, s.rpe, s.rir, s.notes)
        )
      ) then
        raise exception 'Workout already completed with different data' using errcode = 'P0002';
      end if;
    else
      for v_set in select * from jsonb_to_recordset(p_series) as s(
        workout_exercise_id uuid, planned_set_id uuid, set_number integer,
        load_kg numeric, reps_done integer, rpe numeric, rir numeric, notes text
      ) loop
        if v_set.set_number is null or v_set.set_number < 1 or v_set.load_kg is null
          or v_set.reps_done is null or v_set.reps_done < 0 then
          raise exception 'Invalid workout set' using errcode = '22023';
        end if;
        if not exists (
          select 1 from public.workout_exercises e
          where e.id = v_set.workout_exercise_id and e.day_id = p_day_id
        ) then
          raise exception 'Workout exercise has changed' using errcode = 'P0002';
        end if;
        select id into v_planned_set_id from public.workout_exercise_sets
        where id = v_set.planned_set_id and workout_exercise_id = v_set.workout_exercise_id;

        -- Reuse a legacy log if present. Preserve historical duplicates instead of deleting them.
        select id into v_set_id from public.workout_set_logs
        where session_id = p_session_id and workout_exercise_id = v_set.workout_exercise_id
          and set_number = v_set.set_number
        order by created_at desc nulls last, id limit 1;

        if v_set_id is null then
          insert into public.workout_set_logs (
            session_id, workout_exercise_id, planned_set_id, set_number, load_kg, reps_done, rpe, rir, notes, completed
          ) values (
            p_session_id, v_set.workout_exercise_id, v_planned_set_id, v_set.set_number,
            v_set.load_kg, v_set.reps_done, v_set.rpe, v_set.rir, v_set.notes, true
          );
        else
          update public.workout_set_logs
          set load_kg = v_set.load_kg, reps_done = v_set.reps_done, rpe = v_set.rpe,
            rir = v_set.rir, notes = v_set.notes, planned_set_id = v_planned_set_id, completed = true
          where id = v_set_id;
          if not found then
            raise exception 'Workout set could not be saved' using errcode = '42501';
          end if;
        end if;
      end loop;

      select count(distinct (workout_exercise_id, set_number)) into v_count
      from public.workout_set_logs
      where session_id = p_session_id and completed is true and load_kg is not null
        and reps_done is not null and workout_exercise_id is not null and set_number is not null;

      if p_summary is not null then
        v_planned := (p_summary->>'planned_sets')::integer;
        if v_count = 0 or v_planned is null or v_planned < 1
          or (p_summary->>'completed_sets')::integer is null
          or v_count < (p_summary->>'completed_sets')::integer then
          raise exception 'Workout sets are missing' using errcode = '22023';
        end if;
      end if;

      update public.workout_sessions
      set workout_sync_revision = p_revision, workout_week_number = p_week_number,
        completed_sets = v_count,
        status = case when p_summary is null then 'in_progress' else 'completed' end,
        completed_at = case when p_summary is null then null else now() end,
        planned_sets = case when p_summary is null then planned_sets else greatest(v_planned, v_count) end,
        duration_seconds = case when p_summary is null then duration_seconds
          else greatest(coalesce((p_summary->>'duration_seconds')::integer, 0), 0) end,
        session_rpe = case when p_summary is null then session_rpe else (p_summary->>'session_rpe')::integer end,
        session_feeling = case when p_summary is null then session_feeling else nullif(trim(p_summary->>'session_feeling'), '') end,
        client_notes = case when p_summary is null then client_notes else nullif(trim(p_summary->>'client_notes'), '') end,
        updated_at = now()
      where id = p_session_id
      returning * into v_session;
      if not found then
        raise exception 'Workout session could not be saved' using errcode = '42501';
      end if;
    end if;
  end if;

  select coalesce(jsonb_agg(to_jsonb(l)), '[]'::jsonb) into v_logs
  from public.workout_set_logs l where l.session_id = p_session_id;
  return jsonb_build_object('session', to_jsonb(v_session), 'logs', v_logs,
    'revision', coalesce(v_session.workout_sync_revision, p_revision));
end;
$function$;

revoke execute on function public.tmfit_sync_workout(uuid, bigint, uuid, uuid, integer, date, timestamptz, integer, jsonb, jsonb) from public, anon;
grant execute on function public.tmfit_sync_workout(uuid, bigint, uuid, uuid, integer, date, timestamptz, integer, jsonb, jsonb) to authenticated;

notify pgrst, 'reload schema';
