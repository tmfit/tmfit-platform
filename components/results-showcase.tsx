"use client";

import Image from "next/image";
import { useState } from "react";

const singleCases = [
  {
    id: "01",
    src: "/images/risultati/percorso-01.png",
    alt: "Confronto prima e dopo di un percorso TMFIT",
  },
  {
    id: "03",
    src: "/images/risultati/percorso-03.png",
    alt: "Confronto posteriore prima e dopo di un percorso TMFIT",
  },
  {
    id: "04",
    src: "/images/risultati/percorso-04.png",
    alt: "Confronto prima e dopo di un percorso TMFIT",
  },
  {
    id: "05",
    src: "/images/risultati/percorso-05.jpg",
    alt: "Evoluzione individuale documentata durante un percorso TMFIT",
  },
] as const;

const mambaViews = [
  {
    label: "Frontale",
    src: "/images/risultati/percorso-02-frontale.png",
  },
  {
    label: "Laterale",
    src: "/images/risultati/percorso-02-laterale.png",
  },
  {
    label: "Posteriore",
    src: "/images/risultati/percorso-02-posteriore.png",
  },
] as const;

type SingleCase = (typeof singleCases)[number];

type ShowcaseItem =
  | { kind: "single"; data: SingleCase }
  | { kind: "multi"; id: "02" };

const showcaseItems: ShowcaseItem[] = [
  { kind: "single", data: singleCases[0] },
  { kind: "multi", id: "02" },
  { kind: "single", data: singleCases[1] },
  { kind: "single", data: singleCases[2] },
  { kind: "single", data: singleCases[3] },
];

function CaseHeader({ id }: { id: string }) {
  return (
    <div className="results-card-meta">
      <span>Percorso {id}</span>
      <span className="results-card-dot" aria-hidden="true" />
      <span>Evoluzione</span>
    </div>
  );
}

function SingleCaseCard({ item }: { item: SingleCase }) {
  return (
    <article className="results-card">
      <CaseHeader id={item.id} />
      <div className="results-image-frame">
        <Image
          src={item.src}
          alt={item.alt}
          fill
          sizes="(max-width: 767px) 88vw, (max-width: 1399px) 48vw, 620px"
          className="results-image"
        />
      </div>
      <div className="results-single-footer">Evoluzione individuale</div>
    </article>
  );
}

function MultiViewCaseCard({ id }: { id: string }) {
  const [active, setActive] = useState(0);
  const current = mambaViews[active];

  return (
    <article className="results-card results-card-multi">
      <CaseHeader id={id} />
      <div className="results-image-frame">
        <Image
          key={current.src}
          src={current.src}
          alt={`Confronto ${current.label.toLowerCase()} prima e dopo di un percorso TMFIT`}
          fill
          sizes="(max-width: 767px) 88vw, (max-width: 1399px) 48vw, 620px"
          className="results-image results-image-switch"
        />
      </div>
      <div className="results-view-switch" aria-label="Scegli la vista del percorso">
        {mambaViews.map((view, index) => (
          <button
            key={view.label}
            type="button"
            className={index === active ? "is-active" : undefined}
            onClick={() => setActive(index)}
            aria-pressed={index === active}
          >
            {view.label}
          </button>
        ))}
      </div>
    </article>
  );
}

function ShowcaseCard({ item }: { item: ShowcaseItem }) {
  if (item.kind === "multi") {
    return <MultiViewCaseCard id={item.id} />;
  }

  return <SingleCaseCard item={item.data} />;
}

export function ResultsShowcase() {
  const desktopItems = [...showcaseItems, ...showcaseItems];

  return (
    <div className="results-showcase">
      <div className="results-track" aria-label="Percorsi reali TMFIT">
        {desktopItems.map((item, index) => (
          <div
            className="results-track-item"
            key={`${item.kind === "single" ? item.data.id : item.id}-${index}`}
            aria-hidden={index >= showcaseItems.length ? true : undefined}
          >
            <ShowcaseCard item={item} />
          </div>
        ))}
      </div>

      <div className="results-mobile-track" aria-label="Percorsi reali TMFIT">
        {showcaseItems.map((item) => (
          <div className="results-track-item" key={`mobile-${item.kind === "single" ? item.data.id : item.id}`}>
            <ShowcaseCard item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}
