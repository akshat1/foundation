import { marked } from "marked";
import { Patrika } from "../typedefs";
import { getExtensions } from "./extensions";
import { GetPictureData, GetPostData } from "./extensions/typedefs";

interface RenderAllMarkdownArgs {
  patrika: Patrika;
  getPictureData: GetPictureData,
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
    getPictureData,
  } = args;
  const getPostData: GetPostData = ({ post, property }) => {
    if (post && property) {
      const item = patrika.getById(post);
      if (item) {
        /// @ts-ignore X-(
        return item[property];
      }
    };
  }

  marked.use(...getExtensions({
    getPostData,
    getPictureData,
  }));

  for (const item of patrika.getAll()) {
    item.body = await marked(item.markdown);
    if (item.excerptMarkdown) {
      item.excerpt = await marked(item.excerptMarkdown);
    }
  }
};
