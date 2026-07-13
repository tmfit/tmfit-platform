export const siteConfig = {
  name: "TMFIT",
  owner: "Matteo Trobbiani",
  description:
    "Nutrizione, movimento, nutraceutica e monitoraggio integrati in un percorso personalizzato e basato sul contesto reale della persona.",
  email: "info@tmfit.it",
  phoneDisplay: "+39 366 453 2882",
  phoneHref: "+393664532882",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://tmfit.it",
  appUrl:
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://tmfit-platform-matteo-trobbiani-s-projects.vercel.app/",
  questionnaireUrl:
    process.env.NEXT_PUBLIC_GOOGLE_FORM_URL ||
    "https://docs.google.com/forms/d/e/1FAIpQLScEZelbzgPANgR_hRYN4oevKJCQPtoth5tfP_oss04EGcNrwQ/viewform?usp=header",
  whatsappNumber:
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "393664532882",
  portraitUrl: "/images/matteo-portrait.webp",
  consultationUrl: "/images/matteo-consultation.webp",
  measurementUrl: "/images/matteo-measurement.webp",
  credentials: {
    profession: "Biologo nutrizionista",
    register:
      "Ordine dei Biologi dell’Emilia-Romagna e delle Marche — n. 5587 del 18/01/2026",
    vat: "P. IVA 02598770440",
    masterDegree:
      "Laurea magistrale in Scienze della Nutrizione Umana — Università Telematica San Raffaele Roma",
    masterThesis: "Tesi sul microbiota intestinale",
    bachelorDegree:
      "Laurea triennale in Scienze Motorie e Sportive della Salute — Università degli Studi di Urbino Carlo Bo",
    bachelorThesis: "Tesi sulla fibromialgia",
  },
};

export const navItems = [
  { label: "Metodo", href: "/metodo" },
  { label: "Servizi", href: "/servizi" },
  { label: "Chi sono", href: "/chi-sono" },
  { label: "Contatti", href: "/contatti" },
];

export function whatsappUrl(message?: string) {
  const text =
    message ||
    "Ciao Matteo, vorrei ricevere informazioni sui percorsi TMFIT.";

  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(text)}`;
}
