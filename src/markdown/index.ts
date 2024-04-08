import { Patrika } from "../Patrika";
import { getExtensions } from "./extensions";
import { OnShortCode } from "./extensions/typedefs";
/// @ts-ignore
import excerptHTML from "excerpt-html";
import { marked } from "marked";

interface RenderAllMarkdownArgs {
  patrika: Patrika;
  excerpts: Record<string, number>;
  onShortCode?: OnShortCode;
}

/**
 * We render markdown separately from constructing the ContentItem collections, because we have
 * custom markdown extensions that might refer to other items. For example, adding a hyperlink
 * in post A to post B, without having to know the URL of post B ahead of time; just the id.
 * @param patrika
 */
export const renderAllMarkdown = async (args: RenderAllMarkdownArgs): Promise<void> => {
  console.count("renderAllMarkdown");
  const {
    patrika,
    excerpts,
    onShortCode,
  } = args;

  if (typeof onShortCode === "function") {
    /// @ts-ignore See comments about ExtensionObject type in docs vs. typedefs in extensions/index
    marked.use({ extensions: getExtensions(args.onShortCode) });
    marked.use({
      async: true,
      walkTokens: async (token) => {
        if (token.type === "P:I") {
          token.html = await onShortCode(token.args);
        }
      },
    });
  }
  const items = await patrika.find({});
  for (const item of items) {
    console.log("Populating body...");
    // This might need to be tweaked for performance in the future.
    // Either by spinning up a worker pool or by using a different markdown renderer.
    // Could even be a good excuse to experiment with Rust and/or WASM.
    // But it's fine for now.
    item.body = await marked(item.markdown);
    console.log(item.body);
    item.excerpt = {};
    for (const excerptVariant in excerpts) {
      item.excerpt[excerptVariant] = excerptHTML(item.body, {
        pruneLength: excerpts[excerptVariant],
      });
    }
  }
};
