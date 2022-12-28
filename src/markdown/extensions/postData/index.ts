/**
 * @module postData
 * @description Implements PostData short-code, which inline renders some data from another post; used as `[PostData property="foo" post="bar"]`. Where bar is a post-identifier.
 */
import { GetPostData } from "../typedefs";
import { marked } from "marked";

const TokenType = "postData";
const tagPattern = /^\[postdata [^\]]+\]/i;
const propPattern = /(\w+)\s*=\s*"([^"]+)"/i;
const propPatternG = new RegExp(propPattern, "ig");  // Flags don't get copied in the constructor, so we must specify i again.

export interface GetPostDataExtensionArgs {
  getPostData: GetPostData,
}

interface PostDataToken extends marked.Tokens.Generic {
  property?: string;
  post?: string;
  postDataValue?: any;
}

export const getPostDataExtension = (args: GetPostDataExtensionArgs): marked.MarkedExtension => {
  const tokenizer = (src: string):void | PostDataToken => {
    const match = src.match(tagPattern);
    if (match) {
      const propMatches = match[0].match(propPatternG);
      const props = {};
      if (propMatches) {
        propMatches.forEach((pMatch) => {
          if (pMatch) {
            const pMatch2 = pMatch.match(propPattern);
            if (pMatch2 && pMatch2[1] && pMatch2[2]) 
              /// @ts-expect-error
              props[pMatch2[1].toLowerCase()] = pMatch2[2];
            
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

  const renderer = (token: PostDataToken): string | false => {
    const {
      type,
    } = token;

    if (type === TokenType) 
      return args.getPostData(token) || false;
    

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
