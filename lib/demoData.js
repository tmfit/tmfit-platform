export const clients = [
  {
    id: 1,
    name: "Nicola Libetti",
    goal: "Aumento massa muscolare",
    sex: "Uomo",
    age: 18,
    height: 180,
    weight: 83.0,
    bf: 7.9,
    leanMass: 76.5,
    fatMass: 6.5,
    workouts: 3,
    lastUpdate: "06/10/2026"
  },
  {
    id: 2,
    name: "Simone Trobbiani",
    goal: "Ricomposizione corporea",
    sex: "Uomo",
    age: 19,
    height: 167,
    weight: 82.0,
    bf: 8.3,
    leanMass: 75.2,
    fatMass: 6.8,
    workouts: 4,
    lastUpdate: "11/05/2026"
  },
  {
    id: 3,
    name: "Martina Rossi",
    goal: "Tono muscolare e benessere",
    sex: "Donna",
    age: 31,
    height: 164,
    weight: 61.4,
    bf: 21.8,
    leanMass: 48.0,
    fatMass: 13.4,
    workouts: 2,
    lastUpdate: "02/09/2026"
  }
];

export const measurements = [
  { date: "10/04", peso: 81.0, bf: 8.7, addome: 82.0 },
  { date: "11/05", peso: 82.0, bf: 8.3, addome: 80.0 },
  { date: "06/10", peso: 83.0, bf: 7.9, addome: 78.5 }
];

export const workoutRows = [
  {
    exercise: "Panca inclinata multipower",
    series: "Sett. 1: 4x6 · Sett. 2: 4x8 · Sett. 3: 3x6+1x8 · Sett. 4: 4x5",
    recovery: "90 sec",
    execution: "Controllato continuo",
    superset: ""
  },
  {
    exercise: "Pec deck",
    series: "3x10",
    recovery: "60 sec",
    execution: "Isometria 1 sec",
    superset: "SS1"
  },
  {
    exercise: "Chest press presa stretta",
    series: "3x10",
    recovery: "60 sec",
    execution: "Controllato continuo",
    superset: "SS1"
  },
  {
    exercise: "Croci cavi alti",
    series: "2x16",
    recovery: "90 sec",
    execution: "Isometria + ogni 4",
    superset: ""
  },
  {
    exercise: "Dip machine",
    series: "3x8",
    recovery: "90 sec",
    execution: "Controllato continuo",
    superset: ""
  }
];
