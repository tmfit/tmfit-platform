import { Dumbbell, Utensils } from "lucide-react";
import { dietFoodForDisplay } from "../../lib/diet-food-display.mjs";
import styles from "./ClientPlanCards.module.css";

export function ClientWorkoutOverview({ title, notes, week, minutes, exerciseCount, setCount, preview, children }) {
  const splitTitle = /^(Allenamento\s+(?:[A-Z]|\d+))\s*(?:[·:–—]|\s-\s)\s*(.+)$/i.exec(title);
  const remaining = exerciseCount - preview.length;

  return (
    <article className={styles.workout} aria-label={title}>
      <header className={styles.header}>
        <p className={styles.kicker}><Dumbbell aria-hidden="true" />Settimana {week}</p>
        <h4>{splitTitle ? splitTitle[1] : title}</h4>
        {splitTitle && <p className={styles.subtitle}>{splitTitle[2]}</p>}
        {notes && <p className={styles.notes}>{notes}</p>}
      </header>
      <div className={styles.workoutBody}>
        <p className={styles.metrics}>
          <span><b>{exerciseCount}</b> {exerciseCount === 1 ? "esercizio" : "esercizi"}</span>
          <span><b>{setCount}</b> serie</span>
          <span><b>{minutes}</b> min</span>
        </p>
        {preview.length > 0 && (
          <ol className={styles.exercises}>
            {preview.map((exercise, index) => (
              <li key={exercise.id}>
                <span className={styles.index} aria-hidden="true">{index + 1}</span>
                <strong>{exercise.name}</strong>
                <span className={styles.prescription}>{exercise.prescription}</span>
              </li>
            ))}
          </ol>
        )}
        {remaining > 0 && <p className={styles.extra}>+{remaining} {remaining === 1 ? "esercizio" : "esercizi"}</p>}
        {children}
      </div>
    </article>
  );
}

export function ClientMealCard({ title, children }) {
  return (
    <article className={styles.meal} aria-label={title}>
      <header className={styles.header}>
        <p className={styles.kicker}><Utensils aria-hidden="true" />Piano alimentare</p>
        <h4>{title}</h4>
      </header>
      {children}
    </article>
  );
}

function FoodRow({ block }) {
  const { main, preparation, alternatives } = dietFoodForDisplay(block);
  const unitStart = main.quantity.lastIndexOf(" ");

  return (
    <li>
      <div className={styles.foodLine}>
        <strong>{main.label}</strong>
        {main.quantity && <b>{main.quantity.slice(0, unitStart)} <small>{main.quantity.slice(unitStart + 1)}</small></b>}
      </div>
      {preparation && <p className={styles.preparation}>{preparation}</p>}
      {alternatives.map((alternative, index) => (
        <div key={index} className={styles.alternative}>
          <span>{alternative.label}</span>
          {alternative.quantity && <span className={styles.quantity}>{alternative.quantity}</span>}
        </div>
      ))}
    </li>
  );
}

export function ClientMealOption({ title, blocks }) {
  return (
    <section className={styles.option}>
      {title && <h5 className={styles.optionTitle}>{title}</h5>}
      {blocks.length ? (
        <ul className={styles.foods}>
          {blocks.map((block, index) => {
            if (block.type === "food") return <FoodRow key={index} block={block} />;
            if (block.type === "option") return <li key={index} className={styles.optionTitle}>{block.title}</li>;
            return <li key={index} className={styles.notes}><b>Note al pasto</b><p>{block.text}</p></li>;
          })}
        </ul>
      ) : <p className={styles.notes}>Nessun alimento disponibile in questa card.</p>}
    </section>
  );
}
