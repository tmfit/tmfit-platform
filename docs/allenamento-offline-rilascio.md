# TMFIT · Rilascio di Allenati offline

Il ramo `fix/workout-offline-session` include la patch di verifica delle serie (`003d03c`) e gli aggiornamenti al builder e all’esportazione Excel dell’ultima versione di produzione verificata su Vercel (`f786b5c`). La seduta salva prima sul telefono, anche online. La sincronizzazione invia a Supabase le modifiche in background.

Su Supabase sono presenti `clients.service_type`, le tabelle del PDF Composer e `workout_sessions` nella pubblicazione `supabase_realtime`. Corrispondono allo schema previsto da Operativo V2 e dalle versioni successive. La migrazione `supabase/migrations/20261116154511_workout_offline_sync.sql` è stata applicata a `TMFIT Platformi` il 16 novembre 2026 e risulta nel registro con versione `20261116154511`.

## Anteprima

1. In Vercel apri il progetto collegato a `tmfit/tmfit-platform`. Individua il deployment **Preview** del ramo `fix/workout-offline-session`. In **Settings → Environment Variables**, associa alla preview `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` del progetto di prova. Se provi le API server o le notifiche, configura anche le credenziali server, VAPID e QStash del relativo ambiente. Dopo una modifica delle variabili, esegui **Redeploy**.
2. Prepara il progetto Supabase di prova con lo schema TMFIT già presente, un coach, un cliente con quattro sedute nella stessa settimana e un PDF attivo. Applica al database di prova la migrazione di questo ramo prima di provare il codice. Per la CLI v3 usa `supabase link --project-ref <ref-di-prova>` e `supabase db push --remote --dry-run`. Verifica il riferimento e il nome `20261116154511_workout_offline_sync.sql`, poi usa `supabase db push --remote`. Se il checkout non ha configurazione locale e la CLI la richiede, esegui prima `supabase init`.
3. Apri l’URL **Preview** in Safari su iPhone e in Chrome su Android. Ripeti da entrambe le icone della schermata Home dopo aver aperto l’anteprima online dal relativo contesto. Attendi **Scheda pronta offline**, avvia la seduta e attiva la modalità aereo. Registra più serie, blocca lo schermo durante un recupero, riaprilo e controlla il tempo residuo. Chiudi e riapri l’app in modalità aereo. Verifica serie, carichi, ripetizioni, posizione e note del riepilogo.
4. Tocca **Salva e termina** offline. Controlla **In attesa di sincronizzazione**, quindi torna online e riapri l’app. Nella Home verifica **Sedute confermate · Sett. 1** da `0/4` a `1/4`. In **Allenamento → Diario allenamenti** tocca il giorno e controlla che ci sia una sola seduta con tutte le serie. Il numero sul selettore Allenamenti indica la posizione della scheda. I pulsanti Settimana selezionano la settimana di programma.
5. Ripeti con rete instabile intorno alla conferma, doppio tocco e due schede sullo stesso browser. Controlla che la seconda scheda ricarichi la bozza se trova una revisione più recente. Prova la ripresa dopo un nuovo accesso. Verifica inoltre apertura e download del PDF, area **Update**, accesso coach e comparsa della seduta nel suo storico.

Per verificare la sincronizzazione con un account di prova su `TMFIT Platformi`, riapri sul telefono lo stesso indirizzo Preview in cui hai avviato la seduta e torna in Allenamento con Internet attivo. La seduta salvata sul telefono riprende l’invio in background. I salvataggi locali appartengono all’indirizzo da cui è stata aperta l’app.

I test del contatore, degli input numerici, della conferma con lo stesso identificativo e della cache offline si eseguono dal checkout con `node --test tests/*.test.mjs`.

## Produzione

1. Annota la distribuzione `Production` attiva in Vercel. In GitHub apri una pull request con base `main` e sorgente `fix/workout-offline-session`. Tienila aperta per la prova Preview.
2. La migrazione di `TMFIT Platformi` è già applicata. Prima del merge verifica che la versione `20261116154511` compaia nel registro delle migrazioni oppure esegui la verifica della funzione dal **SQL Editor** del progetto `mmxtgesmjbzcmyftehls`.

   ```sql
   select to_regprocedure(
     'public.tmfit_sync_workout(uuid,bigint,uuid,uuid,integer,date,timestamptz,integer,jsonb,jsonb)'
   ) is not null as sync_workout_disponibile;
   ```

3. Dopo `sync_workout_disponibile = true`, fai il merge della pull request. Attendi lo stato **Ready** in Vercel e verifica che il deployment **Production** corrisponda al nuovo commit su `main` e sia associato a `app.tmfit.it`.
4. Sul dominio pubblico esegui una seduta breve con l’account di prova. Controlla **Sincronizzato**, il diario e il contatore. Se serve rientrare, seleziona la precedente distribuzione di produzione in Vercel e usa **Instant Rollback**. Mantieni la migrazione additiva e i dati del sito sui telefoni, così le sedute ancora in coda potranno ripartire quando verrà servita la versione con Allenati offline.

- [Migrazioni Supabase](https://supabase.com/docs/guides/deployment/database-migrations)
- [Supabase CLI v3](https://supabase.com/changelog/supabase-cli-v3)
- [Ambienti e variabili Vercel](https://vercel.com/docs/environment-variables)
- [Rollback di un deployment Vercel](https://vercel.com/docs/instant-rollback)
