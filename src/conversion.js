function convertCInF(celsius) {
  return (celsius * 9) / 5 + 32;
}

function convertFInC(fahrenheit) {
  return ((fahrenheit - 32) * 5) / 9;
}

const cUnits = ["C", "°C"];
const fUnits = ["F", "°F"];

const absoluteUnitsTable = [
  [
    [1, "cm"],
    [2.54, "in", "inch", "inches"],
  ],
  [
    [1, "l", "liter", "liters"],
    [1000, "ml"],
    [4.22675, "cup", "cups"],
    [67.628, "tbsp", "tablespoon", "tablespoons"],
    [202.884, "tsp", "teaspoon", "teaspoons"],
  ],
  [
    [1, "kg"],
    [1000, "g", "gram", "grams"],
    [2.20462, "lb", "pound", "pounds"],
    [35.274, "oz", "ounce", "ounces"],
  ],
];

export function convert(from, to, value, table = absoluteUnitsTable) {
  if (
    from === to ||
    (cUnits.includes(from) && cUnits.includes(to)) ||
    (fUnits.includes(from) && fUnits.includes(to))
  ) {
    return value;
  } else if (cUnits.includes(from) && fUnits.includes(to)) {
    return convertCInF(value);
  } else if (fUnits.includes(from) && cUnits.includes(to)) {
    return convertFInC(value);
  }

  const unitGroup = table.find((group) =>
    group.some((unit) => unit.includes(from) && unit.includes(to))
  );
  if (!unitGroup) {
    throw new Error("Invalid unit");
  }

  const fromUnit = unitGroup.find((unit) => unit.includes(from));
  const toUnit = unitGroup.find((unit) => unit.includes(to));

  const fromBase = fromUnit[0];
  const toBase = toUnit[0];

  return (value * toBase) / fromBase;
}
