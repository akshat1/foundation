import {MarkedExtensionAsPerDocs, SCToken } from "./typedefs";



const StartPattern = /\S?\[P\:I[^\]]+\]/;
/**
 * @param src The markdown source
 * @returns The next potential start of the custom token.
 */
export const start = (src: string): number | void => {
  const match = StartPattern.exec(src);
  if (match && match[0] && match[0].startsWith("[P:I")) {
    return match.index;
  }
}

const TokenPattern = /^\[P\:I[^\]]+\]/;
const ParamPattern = /(\w+=[\w"'\.]+)/g;
/**
 * @param src The markdown source
 * @returns The custom token
 */
export const tokenizer = (src: string): SCToken | void => {
  const l1Match = TokenPattern.exec(src);
  if(l1Match) {
    const tag = l1Match[0];
    const args: Record<string, string|number|boolean> = {};
    const paramPairs = tag.match(ParamPattern);
    if(paramPairs) {
      // Look a for loop instead of a .map.map.reduce.
      // But we just avoided creating three functions, two arrays, and cloning N objects (N being the number of args in the shortcode).
      // For each call of the tokenizer.
      for (const pair of paramPairs) {
        const [key, value] = pair.split("=");
        args[key] = parseValue(value);
      }
    }

    return {
      type: "P:I",
      raw: tag,
      text: tag,
      html: "",
      args,
    };
  }
}

/**
 * @param str The string to parse
 * @returns The parsed value as an appropriate primitive type of either string, number, or boolean.
 *
 * @example
 * parseValue(`"foo"`) // string "foo"
 * parseValue(`'foo'`) // string "foo"
 * parseValue(`foo`) // string "foo"
 * parseValue(`0`) // number 0
 * parseValue(`1.1`) // number 1.1
 * parseValue(`false`) // string false
 * parseValue(false) // boolean false
 */
export const parseValue = (str: string): string|number|boolean => {
  if (/true|false|[\d\.]/.test(str)) { // Handle numbers and booleans
    // Could've added this to the regex above but I don't want to easily understand things a month from now.
    // JSON.parse will return the correct primitive type.
    return JSON.parse(str);
  }

  const strMatch = str.match(/["'](.*)["']/);
  if (strMatch && strMatch[1]) { // Handle strings
    // Make it easy to handle strings with escaped quotes
    // And incorrect quotes should cause a crash.
    return JSON.parse(`"${strMatch[1]}"`); // single-quoted strings will be converted to double-quoted strings.
  }

  return str; // Handle everything else as a string, the shortcode handler can handle it.
}

/**
 * Returns a Marked extension.
 * The extension will handle custom markdown syntax such that when it
 * encounters our custom markdown tag, it will call the supplied onShortCode
 * function with the args and assign the result to the html property of the
 * token.
 * 
 * For example, given the following markdown:
 * I'm writing this [PSC foo="bar" baz='qux' ab=0 cd=true] with a custom
 * markdown tag.
 * 
 * The extension will call onShortCode with the args
 * { foo: "bar", baz: "qux", ab: 0, cd: true } and assign the result to the
 * html property of the token.
 * 
 * @see https://marked.js.org/using_pro#extensions
 */
export const getExtension = (): MarkedExtensionAsPerDocs => ({
  name: "P:I", // Patrika Inline
  level: "inline",
  async: true,
  start,
  tokenizer,
  renderer: function (token) { return token.html },
});
