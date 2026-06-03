# TM FIT Platform - Supabase Connected

Versione aggiornata della piattaforma TM FIT con prima connessione a Supabase.

## Cosa contiene

- Next.js App Router
- Tailwind CSS
- Supabase client
- Lettura tabella `clients`
- Fallback ai dati demo se il database è vuoto o le policy RLS bloccano la lettura

## Variabili Vercel richieste

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Tabelle Supabase previste

- `clients`
- `workouts`
- `exercises`
- `workout_logs`

## Prossimo step

Configurare le policy RLS e creare funzioni app per:
- nuovo cliente
- schede da 2 a 6 allenamenti
- progressioni settimanali
- inserimento carichi lato cliente
