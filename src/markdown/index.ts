import { Patrika } from "../Patrika";
// import { getExtensions } from "./extensions";
/// @ts-ignore
import excerptHTML from "excerpt-html";
import { marked } from "marked";

interface RenderAllMarkdownArgs {
  patrika: Patrika;
  excerpts: Record<string, number>;
  onShortCode?: (shortCode: string, args: string[]) => Promise<string>;
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
  // const getPostData: GetPostData = async ({ post, property }) => {
  //   if (post && property) {
  //     const item = await patrika.find({ id: post });
  //     if (item) 
  //       /// @ts-expect-error X-(
  //       {return item[property];}
      
  //   }
  // }

  // marked.use(...getExtensions({ onShortCode: args.onShortCode }));

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
