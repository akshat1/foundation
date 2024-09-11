import excerptHTML from "excerpt-html";
import JSBeatufiy from "js-beautify";
import { marked } from "marked";
import PicoDB from "picodb";
import { ContentItem } from "..";
import { Patrika } from "../Patrika.js";
import { OnShortCode } from "./extensions/OnShortCode.js";
import { getExtensions } from "./extensions/index.js";

const { html } = JSBeatufiy;

interface RenderAllMarkdownArgs {
  db: PicoDB<ContentItem>;
  patrika: Patrika;
  excerpts: Record<string, number>;
  onShortCode?: OnShortCode;
  prettify?: boolean;
}

/**
 * We render markdown separately from constructing the ContentItem collections, because we have
 * custom markdown extensions that might refer to other items. For example, adding a hyperlink
 * in post A to post B, without having to know the URL of post B ahead of time; just the id.
 * @param patrika
 */
export const renderAllMarkdown = async (args: RenderAllMarkdownArgs): Promise<void> => {
  const {
    db,
    excerpts,
    onShortCode,
    patrika,
  } = args;

  if (typeof onShortCode === "function") {
    /// @ts-ignore See comments about ExtensionObject type in docs vs. typedefs in extensions/index
    marked.use({ extensions: getExtensions(args.onShortCode) });
    marked.use({
      async: true,
      walkTokens: async (token) => {
        if (token.type === "P:I") {
          token.html = await onShortCode(token.args, patrika);
        }
      },
    });
  }
  const items = await patrika.find({});
  for (const item of items) {
    // This might need to be tweaked for performance in the future.
    // Either by spinning up a worker pool or by using a different markdown renderer.
    // Could even be a good excuse to experiment with Rust and/or WASM.
    // But it's fine for now.
    item.body = await marked(item.markdown);
    if (args.prettify) {  // This doesn't work very well; need to spend some time on it.
      item.body = html(item.body, {
        "indent_size": "2",
        "indent_char": " ",
        "max_preserve_newlines": "5",
        "preserve_newlines": true,
        "keep_array_indentation": false,
        "break_chained_methods": false,
        "indent_scripts": "normal",
        "brace_style": "collapse",
        "space_before_conditional": true,
        "unescape_strings": false,
        "jslint_happy": false,
        "end_with_newline": false,
        "wrap_line_length": "0",
        "indent_inner_html": false,
        "comma_first": false,
        "e4x": false,
        "indent_empty_lines": false,
      });
    }

    item.excerpt = {};
    for (const excerptVariant in excerpts) {
      item.excerpt[excerptVariant] = excerptHTML(item.body, {
        pruneLength: excerpts[excerptVariant],
      });
    }
    db.updateOne({ id: item.id }, item);
  }
};
