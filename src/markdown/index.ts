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
  const {
    patrika,
    excerpts,
  } = args;

  /// @ts-ignore See comments about ExtensionObject type in docs vs. typedefs in extensions/index
  marked.use(...getExtensions(args.onShortCode));

  for (const item of (await patrika.find())) {
    item.body = await marked(item.markdown);
    item.excerpt = {};
    for (const excerptVariant in excerpts) {
      item.excerpt[excerptVariant] = excerptHTML(item.body, {
        pruneLength: excerpts[excerptVariant],
      });
    }
  }
};
