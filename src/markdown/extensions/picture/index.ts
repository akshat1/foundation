import { marked } from "marked";
import { GetPictureData } from "../typedefs";

const TokenType = "Picture";
const tagPattern = /^\[picture [^\]]+\]/i;
const propPattern = /(src|alt)\s*=\s*"([^"]+)"/i;
const propPatternG = new RegExp(propPattern, "ig");

export interface PictureToken extends marked.Tokens.Generic {
  src?: string;
  alt?: string;
}

export interface GetPictureExtensionArgs {
  getPictureData: GetPictureData;
}
export const getPictureExtension = (args: GetPictureExtensionArgs): marked.MarkedExtension => {
  const tokenizer = (src: string):void | PictureToken => {
    const match = src.match(tagPattern);
    if (match) {
      const propMatches = match[0].match(propPatternG);
      let props: Record<string, string> = {};
      if (propMatches) {
        propMatches.forEach((pMatch) => {
          if (pMatch) {
            const pMatch2 = pMatch.match(propPattern);
            if (pMatch2 && pMatch2[1] && pMatch2[2]) {
              /// @ts-ignore
              props[pMatch2[1].toLowerCase()] = pMatch2[2];
            }
          }
        });
      }

      if (!props.src) {
        throw new Error(`Missing src from Picture tag >[Picture src="${props.src}"]<`);
      }

      return {
        ...props,
        type: TokenType,
        raw: src,
      };
    }
  };

  const renderer = (token: PictureToken): string | false => {
    const {
      src,
      type,
      alt,
    } = token;

    if (type === TokenType && src) {
      const imgTag = alt ? `<img src="${src}" alt="${alt}" />` : `<img src="${src}" />`;
      const pictureData = args.getPictureData(src);
      if (pictureData) {
        const elements = ["<picture>"];
        for (const media in pictureData) {
          elements.push(`<source media="${media}" srcset="${pictureData[media]}" />`);
        }
        elements.push(imgTag, `</picture>`);
        return elements.join("");
      } else {
        // No picture data, just use the plain img tag.
        return imgTag;
      }
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
