const weekdays = ["domenica", "lunedi", "martedi", "mercoledi", "giovedi", "venerdi", "sabato"];

export function homeWorkoutForDay(days, confirmedDayIds, date = new Date()) {
  if (!days.length) return { title: "Nessun allenamento disponibile" };

  const isPending = ({ day }) => !confirmedDayIds.has(String(day.id));
  const workouts = days.map((day, index) => {
    const words = String(day.title || "").toLowerCase().normalize("NFD")
      .replace(/\p{M}/gu, "").match(/[a-z]+/g) || [];
    const scheduledDays = weekdays.filter((name) => words.includes(name) || words.includes(name.slice(0, 3)));
    return { day, index, scheduledDays };
  });
  if (!workouts.some(isPending)) return { title: "Settimana completata" };

  // I vecchi programmi A/B/C possono indicare solo l’ordine delle sedute.
  const today = workouts.filter(({ scheduledDays }) => scheduledDays.includes(weekdays[date.getDay()]));
  const suggested = today.find(isPending) || today[0] ||
    workouts.find((item) => !item.scheduledDays.length && isPending(item));
  if (!suggested) return { title: "Nessuna seduta in programma oggi" };

  const { day, index } = suggested;
  const label = String(day.title || "").match(/\b(?:allenamento|all\.?|workout|seduta)\s+([a-z]|\d+)\b/i)?.[1];
  const position = index < 26 ? String.fromCharCode(65 + index) : String(index + 1);
  return { title: `Allenamento ${label?.toUpperCase() || position}`, minutes: day.estimated_minutes || 60 };
}
