const unitsTable = [
  [
    ["C", "°C"],
    ["F", "°F"],
  ],
  [
    [1, "h", "hr", "hour", "hours"],
    [60, "m", "min", "minute", "minutes"],
    [3600, "s", "sec", "second", "seconds"],
  ],
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
const temperatureUnits = unitsTable[0].flat();
const cUnits = unitsTable[0][0];
const fUnits = unitsTable[0][1];

function convertCInF(celsius) {
  return (celsius * 9) / 5 + 32;
}

function convertFInC(fahrenheit) {
  return ((fahrenheit - 32) * 5) / 9;
}

function convert(from, to, value, table = unitsTable) {
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

  const unitGroup = table.find(
    (group) =>
      group.some((unit) => unit.includes(from)) &&
      group.some((unit) => unit.includes(to))
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

const fractions = {
  "": 0,
  "½": 1 / 2,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
  "¼": 1 / 4,
  "¾": 3 / 4,
  "⅛": 1 / 8,
  "⅜": 3 / 8,
  "⅝": 5 / 8,
  "⅞": 7 / 8,
};

export class UnitNumber {
  static parse(str) {
    const match = str.match(/^(\d*\.?\d+)\s*([°\w]*)$/);
    if (!match) throw new Error("Invalid unit number");

    return new UnitNumber(parseFloat(match[1]), match[2]);
  }

  constructor(value, unit) {
    this.value = value;
    this.unit = unit;

    if (unit === "cup" && value > 1) {
      this.unit = "cups";
    } else if (unit === "cups" && value <= 1) {
      this.unit = "cup";
    }
  }

  equalUnits(other) {
    return unitsTable
      .flat()
      .some((unit) => unit.includes(this.unit) && unit.includes(other.unit));
  }

  convert(unit) {
    return new UnitNumber(convert(this.unit, unit, this.value), unit);
  }

  add(other) {
    if (!this.equalUnits(other)) {
      try {
        other = other.convert(this.unit);
      } catch (err) {
        throw new Error("Units do not match");
      }
    }

    return new UnitNumber(this.value + other.value, this.unit);
  }

  toString() {
    const integer = Math.floor(this.value);
    let fraction;

    if (integer < 10 && !temperatureUnits.includes(this.unit)) {
      // Find closest fraction to decimal
      const decimal = this.value - integer;

      fraction = Object.entries(fractions).reduce((prev, [key, value]) =>
        Math.abs(value - decimal) < Math.abs(prev[1] - decimal)
          ? [key, value]
          : prev
      )[0];
    }

    return `${integer}${fraction ?? ""} ${this.unit}`;
  }
}

export class UnitNumberSum {
  data = {};

  add(unitNumber) {
    if (this.data[unitNumber.unit]) {
      this.data[unitNumber.unit] = this.data[unitNumber.unit].add(unitNumber);
    } else {
      for (const unit of Object.keys(this.data)) {
        try {
          this.data[unit] = this.data[unit].add(unitNumber);
          return this;
        } catch (err) {
          // Ignore
        }
      }

      this.data[unitNumber.unit] = unitNumber;
    }

    return this;
  }

  toString() {
    return Object.values(this.data)
      .map((unitNumber) => unitNumber.toString())
      .join(" + ");
  }
}
