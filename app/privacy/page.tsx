import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Informativa essenziale sul trattamento dei dati nel sito TMFIT.",
};

export default function PrivacyPage() {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <article className="mx-auto max-w-4xl rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-10 lg:p-12">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-teal-700">Privacy</p>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.05em] text-[#07111f] sm:text-5xl">
          Informativa essenziale sul sito TMFIT
        </h1>
        <p className="mt-5 text-sm font-medium leading-7 text-slate-600">Ultimo aggiornamento: luglio 2026.</p>

        <div className="mt-10 grid gap-8 text-sm font-medium leading-7 text-slate-600">
          <section>
            <h2 className="text-xl font-black text-[#07111f]">Titolare del trattamento</h2>
            <p className="mt-3">
              Il titolare del trattamento è TMFIT — Matteo Trobbiani. Per richieste relative ai dati personali è possibile scrivere a{" "}
              <a href={`mailto:${siteConfig.email}`} className="font-extrabold text-teal-800 underline underline-offset-4">
                {siteConfig.email}
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-[#07111f]">Dati trattati dal sito</h2>
            <p className="mt-3">
              Questa prima versione del sito non contiene moduli interni, account utente, strumenti di profilazione o sistemi pubblicitari. Il sito può trattare i dati tecnici strettamente necessari al funzionamento e alla sicurezza del servizio di hosting.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-[#07111f]">Contatti e servizi esterni</h2>
            <p className="mt-3">
              Quando l’utente sceglie di contattare TMFIT tramite email, telefono o WhatsApp, i dati vengono forniti volontariamente attraverso il servizio selezionato. Il questionario preliminare è ospitato su Google Forms e viene aperto su un sito esterno, soggetto anche alle condizioni e informative del relativo fornitore.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-[#07111f]">Finalità</h2>
            <p className="mt-3">
              I dati comunicati volontariamente vengono utilizzati per rispondere alle richieste, organizzare un eventuale primo incontro e gestire le attività professionali collegate al percorso richiesto.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-[#07111f]">Conservazione e diritti</h2>
            <p className="mt-3">
              I dati vengono conservati per il tempo necessario alla gestione della richiesta e agli eventuali obblighi applicabili. L’interessato può richiedere accesso, rettifica, cancellazione, limitazione o opposizione nei casi previsti dalla normativa scrivendo all’indirizzo indicato sopra.
            </p>
          </section>

          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
            <h2 className="text-base font-black">Verifica prima della pubblicazione</h2>
            <p className="mt-2 text-sm font-semibold leading-6">
              Questa informativa è stata predisposta per la versione tecnica iniziale, priva di analytics, cookie marketing e form interni. Deve essere verificata e completata con i dati legali effettivi dell’attività prima della pubblicazione definitiva.
            </p>
          </section>
        </div>
      </article>
    </section>
  );
}
