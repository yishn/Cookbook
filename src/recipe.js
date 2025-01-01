import { marked } from "marked";
import YAML from "yaml";

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
    .map((text) => text.slice(1).trim());
  result.times = codespans
    .filter((text) => text.startsWith("~"))
    .map((text) => text.slice(1).trim());
  result.ingredients = codespans.filter(
    (text) =>
      !text.startsWith("#") &&
      !text.startsWith("~") &&
      !result.subprocedures.includes(text)
  );

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
