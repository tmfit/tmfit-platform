// Le quantità qui servono solo all'impaginazione delle righe già estratte dal piano.
const amount = String.raw`\d+(?:[.,]\d+)?(?:\s*[-–]\s*\d+(?:[.,]\d+)?)?`;
const unit = "kg|mg|grammi|grammo|gr|g|ml|cl|l";
const measure = new RegExp(`(${amount})\\s*(${unit})\\b`, "i");
const leadingMeasure = new RegExp(`^(?:(oppure|o)\\s+)?(${amount})\\s*(${unit})\\s+(?:di\\s+)?(.+)$`, "i");
const trailingMeasure = new RegExp(`^(.+?)\\s+(${amount})\\s*(${unit})$`, "i");

function quantity(value, rawUnit) {
  const label = /^(?:gr|grammi|grammo)$/i.test(rawUnit) ? "g" : rawUnit.toLowerCase();
  return `${value} ${label}`;
}

export function dietPortionForDisplay(text) {
  const first = text.match(leadingMeasure);
  if (first && !measure.test(first[4])) {
    return { label: first[1] ? `${first[1]} ${first[4]}` : first[4], quantity: quantity(first[2], first[3]) };
  }

  const last = text.match(trailingMeasure);
  if (last && !measure.test(last[1]) && !/[\d/–+−<>≤≥~:-]$/.test(last[1]) &&
      !/\b(?:da|a|di|circa|fino|max|min|massimo|minimo|oltre|meno|più|per)\s*$/i.test(last[1])) {
    return { label: last[1], quantity: quantity(last[2], last[3]) };
  }

  // Una riga composta o una porzione libera resta leggibile per intero.
  return { label: text, quantity: "" };
}

export function dietFoodForDisplay(block) {
  let main = block.text;
  let preparation = "";
  let alternatives = block.alternatives;
  const parenthesis = /^(.+?)\s*\(([^()]*)\)$/.exec(main);
  if (parenthesis) {
    const parts = parenthesis[2].trim().split(/\s*\/\s*(?=oppure\s)/i);
    const notes = /^oppure\s/i.test(parts[0]) ? "" : parts.shift();
    if (parts.length && parts.every((part) => /^oppure\s/i.test(part) && dietPortionForDisplay(part).quantity)) {
      main = parenthesis[1].trim();
      preparation = notes;
      alternatives = [...parts, ...alternatives];
    }
  }
  return { main: dietPortionForDisplay(main), preparation, alternatives: alternatives.map(dietPortionForDisplay) };
}
