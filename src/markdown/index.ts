import { Patrika } from "../typedefs";
/// @ts-ignore
import excerptHTML from "excerpt-html";
import { marked } from "marked";

interface RenderAllMarkdownArgs {
  patrika: Patrika;
  excerpts: Record<string, number>;
}

/**
 * @TODO: Update things so that folks are no longer specifying custom markdown extensions, but rather shortCode handlers.
 * The only extension we will have now is the shortCode extension. The reason for this is to simplify things for library
 * users so that they don't have to figure out how to write custom markdown extensions.
 */

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

  // const getPostData: GetPostData = ({ post, property }) => {
  //   if (post && property) {
  //     const item = patrika.getById(post);
  //     if (item) 
  //       /// @ts-expect-error X-(
  //       {return item[property];}
      
  //   }
  // }

  // marked.use(...getExtensions({ getShortCode: handleShortCode }));

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
