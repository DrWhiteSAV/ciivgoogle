export const ERAS = [
  { name: "Первобытность", minYear: 0, minPop: 0 },
  { name: "Неолит", minYear: 500, minPop: 5000 },
  { name: "Бронзовый век", minYear: 2000, minPop: 50000 },
  { name: "Железный век", minYear: 3500, minPop: 200000 },
  { name: "Античность", minYear: 5000, minPop: 1000000 },
  { name: "Средневековье", minYear: 6500, minPop: 5000000 },
  { name: "Ренессанс", minYear: 8000, minPop: 20000000 },
  { name: "Индустриальная эра", minYear: 9500, minPop: 100000000 },
  { name: "Атомный век", minYear: 10500, minPop: 500000000 },
  { name: "Информационный век", minYear: 11500, minPop: 2000000000 },
  { name: "Космическая эра", minYear: 13000, minPop: 5000000000 },
];

export const getEra = (year: number, pop: number) => {
  let currentEra = ERAS[0].name;
  for (const era of ERAS) {
    if (year >= era.minYear && pop >= era.minPop) {
      currentEra = era.name;
    }
  }
  return currentEra;
};
