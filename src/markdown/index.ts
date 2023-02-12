import { Patrika } from "../typedefs";
import { getExtensions } from "./extensions";
import { GetPostData } from "./extensions/typedefs";
/// @ts-ignore
import excerptHTML from "excerpt-html";
import { marked } from "marked";

interface RenderAllMarkdownArgs {
  patrika: Patrika;
  excerpts: Record<string, number>;
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
  const getPostData: GetPostData = ({ post, property }) => {
    if (post && property) {
      const item = patrika.getById(post);
      if (item) 
        /// @ts-expect-error X-(
        {return item[property];}
      
    }
  }

  marked.use(...getExtensions({ getPostData }));

  for (const item of patrika.getAll()) {
    item.body = await marked(item.markdown);
    item.excerpt = {};
    for (const excerptVariant in excerpts) {
      item.excerpt[excerptVariant] = excerptHTML(item.body, {
        pruneLength: excerpts[excerptVariant],
      });
    }
  }
};
