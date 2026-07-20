import { Platform, type Types } from "youtubei.js";

let configured = false;

export function ensureYouTubeEvaluator() {
  if (configured) return;
  configured = true;

  Platform.shim.eval = async (
    data: Types.BuildScriptResult,
    env: Record<string, Types.VMPrimative>
  ) => {
    const prelude = Object.entries(env)
      .map(([key, value]) => {
        const serialized =
          typeof value === "string"
            ? JSON.stringify(value)
            : value === undefined
              ? "undefined"
              : String(value);
        return `const ${key} = ${serialized};`;
      })
      .join("");

    return new Function(`${prelude}${data.output}`)();
  };
}
