import { OnShortCode } from "./typedefs";
import { MarkedExtension } from "marked";

interface SCToken {
  type: string;
  raw: string;
  text: string;
  tokens: SCToken[];
  html: string;
  args: Record<string, unknown>;
}

const ShortCodePattern = /(\\)?\[PSC[^\]]+]/;
const ParameterPattern = /\w+=(\w+|([",']\w+[",']))/g;
export function tokenizer (src: string): SCToken | false {
  const match = ShortCodePattern.exec(src);
  if (match && (!match[0].startsWith("\\"))) {
    const propMatches = match[0].match(ParameterPattern);
    let props: Record<string, unknown> = {};
    if (propMatches?.length) {
      const buff = [];
      for (const propMatch of propMatches) {
        const [prop, value] = propMatch.split("=");
        buff.push(`"${prop}": ${value.replace(/(^')|('$)/g, '"')}`);
      }
      const objStr = `{${buff.join(",")}}`;
      props = JSON.parse(objStr);
    }

    const token: SCToken = {
      type: "PSC",
      raw: match[0],
      text: match[0].trim(),
      tokens: [],
      html: "",
      args: props, // TODO: populate this with the shortcode arguments
    };

    /// @ts-ignore
    this.lexer.inline(token.text, token.tokens);
    return token;
  }

  return false;
}

export const getWalkTokens = (onShortCode: OnShortCode): Function =>
  async (token: SCToken): Promise<void> => {
    token.html = await onShortCode(token.args); // TODO: Should we separate handler name from args (both will be specific in the ShortCode)?
  };

const getUniversalShortCodeExtension = (onShortCode: OnShortCode): MarkedExtension => {
  /**
   * A Marked extension that identifies the Patrika shortcode and invokes the onShortCode function.
   */
  const universalShortCode: Record<string, unknown> = {
    name: "Patrika",
    async: true,
    level: "block",
    start: (src: string): number|undefined => src.match(ShortCodePattern)?.index,
    tokenizer,
    walkTokens: getWalkTokens(onShortCode),
  };

  return universalShortCode;
};

export const getExtensions = (onShortCode?: OnShortCode): MarkedExtension[] =>
  onShortCode instanceof Function ? [getUniversalShortCodeExtension(onShortCode)] : [];
// See https://marked.js.org/using_pro#extensions
