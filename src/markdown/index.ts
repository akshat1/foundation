import { Patrika, PostProcessHTML } from "../typedefs";
import { getExtensions } from "./extensions";
import { GetPostData } from "./extensions/typedefs";
import { JSDOM } from "jsdom";
import { marked } from "marked";

interface RenderAllMarkdownArgs {
  patrika: Patrika;
  postProcessHTML?: PostProcessHTML;
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
    postProcessHTML,
  } = args;
  const getPostData: GetPostData = ({ post, property }) => {
    if (post && property) {
      const item = patrika.getById(post);
      if (item) 
        /// @ts-ignore X-(
        return item[property];
      
    }
  }

  marked.use(...getExtensions({ getPostData }));

  for (const item of patrika.getAll()) {
    item.body = await marked(item.markdown);
    if (item.excerptMarkdown) 
      item.excerpt = await marked(item.excerptMarkdown);
    

    if (typeof postProcessHTML === "function") 
      postProcessHTML({
        body: new JSDOM(item.body).window.document.documentElement,
        excerpt: item.excerpt ? new JSDOM(item.excerpt).window.document.documentElement : undefined,
        item,
      });
    
  }
};
