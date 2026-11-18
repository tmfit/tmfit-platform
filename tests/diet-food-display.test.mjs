import assert from "node:assert/strict";
import test from "node:test";
import { dietFoodForDisplay, dietPortionForDisplay } from "../lib/diet-food-display.mjs";

test("each food and its alternatives keep their own unit, range and decimal precision", () => {
  assert.deepEqual(dietFoodForDisplay({
    text: "50g gallette di mais",
    alternatives: ["oppure 40–50 gr di gallette di riso", "oppure gallette di farro 37,5 g"]
  }), {
    main: { label: "gallette di mais", quantity: "50 g" }, preparation: "",
    alternatives: [
      { label: "oppure gallette di riso", quantity: "40–50 g" },
      { label: "oppure gallette di farro", quantity: "37,5 g" }
    ]
  });
  assert.deepEqual(dietPortionForDisplay("0,25 l di latte"), { label: "latte", quantity: "0,25 l" });
});

test("the preparation and the measured parenthetical alternative stay with the same food", () => {
  const result = dietFoodForDisplay({
    text: "15g proteine in polvere del siero 90% (con acqua / oppure 150 gr di yogurt)",
    alternatives: ["oppure 120g skyr"]
  });
  assert.deepEqual(result, {
    main: { label: "proteine in polvere del siero 90%", quantity: "15 g" },
    preparation: "con acqua",
    alternatives: [{ label: "oppure yogurt", quantity: "150 g" }, { label: "oppure skyr", quantity: "120 g" }]
  });
});

test("free portions, compound amounts and ambiguous alternatives keep the coach's wording", () => {
  for (const text of ["1 uovo intero", "verdure q.b.", "40 g pane + 10 g olio", "yogurt 0%", "acqua fino a 300 ml", "pane 1/2 g"]) {
    assert.deepEqual(dietPortionForDisplay(text), { label: text, quantity: "" });
  }
  const food = dietFoodForDisplay({ text: "250g yogurt 0% (vaniglia / oppure cacao)", alternatives: [] });
  assert.deepEqual(food, { main: { label: "yogurt 0% (vaniglia / oppure cacao)", quantity: "250 g" }, preparation: "", alternatives: [] });
});
