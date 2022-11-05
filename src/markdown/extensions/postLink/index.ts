import { marked } from "marked";
import { GetPostData } from "../typedefs"

const TokenType = "PostLink";
const tagPattern = /^\[postlink [^\]]+\]/i;
const propPattern = /(post|text|title)\s*=\s*"([^"]+)"/i;
const propPatternG = new RegExp(propPattern, "ig");

export interface PostLinkToken extends marked.Tokens.Generic {
  post?: string;
  text?: string;
}

interface GetPostLinkArgs {
  getPostData: GetPostData;
}
export const getPostLinkExtension = (args: GetPostLinkArgs): marked.MarkedExtension => {
  const tokenizer = (src: string):void | PostLinkToken => {
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

      if (!(props.post && props.text)) {
        throw new Error(`Missing props from PostLink tag >[PostLink post="${props.post}" text="${props.text}"]<`);
      }

      return {
        ...props,
        type: TokenType,
        raw: src,
      };
    }
  };

  const renderer = (token: PostLinkToken): string | false => {
    const {
      post,
      text,
      title,
      type,
    } = token;

    if (type === TokenType) {
      const url = args.getPostData({
        post,
        property: "slug",
      });
  
      if (url) {
        const attribs = [`href="${url}"`];
        if (title) {
          attribs.push(`title="${title}"`);
        }
        return `<a ${attribs.join(" ")}>${text}</a>`;
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
