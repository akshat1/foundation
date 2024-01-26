import { GetShortCode } from "../typedefs";
import { marked } from "marked";

const TokenType = "shortCode";
const tagPattern = /^\[P:SC [^\]]+\]/i;
const propPattern = /(\w+)\s*=\s*"([^"]+)"/i;
const propPatternG = new RegExp(propPattern, "ig");  // Flags don't get copied in the constructor, so we must specify i again.

export interface GetShortCodeExtensionArgs {
  getShortCode: GetShortCode,
}

export const getShortCodeExtension = (args: GetShortCodeExtensionArgs): marked.MarkedExtension => {
  const tokenizer = (src: string):void | marked.Tokens.Generic => {
    const match = src.match(tagPattern);
    if (match) {
      const propMatches = match[0].match(propPatternG);
      const props = {};
      if (propMatches) {
        propMatches.forEach((pMatch) => {
          if (pMatch) {
            const pMatch2 = pMatch.match(propPattern);
            if (pMatch2 && pMatch2[1] && pMatch2[2]) {
              /// @ts-expect-error
              props[pMatch2[1].toLowerCase()] = pMatch2[2];
            }
          }
        });

        return {
          ...props,
          type: TokenType,
          raw: match[0].trim(),
        };
      }

      throw new Error(`>${match[0]}< is missing one or more required props.`);
    }
  };

  const renderer = (token: marked.Tokens.Generic): string | false => {
    const {
      type,
    } = token;

    if (type === TokenType) {
      /// @ts-ignore
      return args.getShortCode(token) || false;
    }

    return false;
  };

  return {
    async: true,
    extensions: [{
      name: TokenType,
      level: "inline",
      tokenizer,
      renderer,
    }],
  };
};
