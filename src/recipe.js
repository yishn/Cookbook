import { marked } from "marked";
import YAML from "yaml";
import { UnitNumber } from "./unit.js";

export function extractRecipeData(content) {
  const codespans = [];
  const result = {
    title: "",
    meta: {},
    subprocedures: [],
    equipment: [],
    ingredients: [],
    times: [],
  };

  let inMeta = false;

  marked.use({
    renderer: {
      heading(tokens) {
        if (tokens.depth === 1) {
          result.title = tokens.text;
        } else if (tokens.depth === 2) {
          inMeta = tokens.text === "meta";
        } else if (tokens.depth === 3) {
          result.subprocedures.push(tokens.text);
        }

        return false;
      },
      list(tokens) {
        if (inMeta) {
          result.meta = YAML.parse(tokens.raw);
          return "";
        }

        return false;
      },
      codespan(tokens) {
        codespans.push(tokens.text);

        return false;
      },
    },
  });

  marked(content);

  result.equipment = codespans
    .filter((text) => text.startsWith("#"))
    .map((text) => text.slice(1).trim())
    .map((text) => parseCodespan(text))
    .filter((value) => value != null);
  result.times = codespans
    .filter((text) => text.startsWith("~"))
    .map((text) => text.slice(1).trim())
    .map((text) => parseCodespan(text))
    .filter((value) => value != null);
  result.ingredients = codespans
    .filter(
      (text) =>
        !text.startsWith("#") &&
        !text.startsWith("~") &&
        !result.subprocedures.includes(text)
    )
    .map((text) => parseCodespan(text))
    .filter((value) => value != null);

  // Reset marked

  marked.use({
    renderer: {
      heading: () => false,
      list: () => false,
      codespan: () => false,
    },
  });

  return result;
}

function parseCodespan(value) {
  const match = value.match(/^((?:\d*\.?\d+[°\w]*\/?)*)\s*(.*)$/);
  if (!match) return null;

  const result = {};

  if (match[1]) result.amount = UnitNumber.parse(match[1]);
  if (match[2]) result.label = match[2];

  return result;
}
