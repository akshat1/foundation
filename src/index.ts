import ContentItem, { ContentItemType, toContentItem } from "./ContentItem";
import { promises as fs, stat } from "fs";
import { promisify } from "util";
import { glob as callbackGlob } from "glob";
import { GetSlug, Patrika } from "./typedefs";
import { FrontMatterAttributes, getFMData } from "./front-matter";
import { renderAllMarkdown } from "./markdown";
import { GetPictureData } from "./markdown/extensions/typedefs";

export {
  ContentItemType,
  ContentItem,
  FrontMatterAttributes,
};

const glob = promisify(callbackGlob);

export interface GetPatrikaArgs {
  postsGlob: string;
  pagesGlob: string;
  /**
   * Letting clients supply this function lets client set their own slugification.
   */
  getSlug: GetSlug;
  /**
   * given an imgsrc (as specified in markdown), provide a dictionary of breakpoints
   * and the corresponding image URL. These breakpoints and URLs will be used to
   * populate a Picture element.
   */
  getPictureData: GetPictureData;
}

/**
 * @example
 * ```
 * // Example usage with Pequeno for one of the data files.
 * const slugify = require("slugify");
 * const path = require("path");
 * 
 * module.exports = async () => {
 *  // in real usage you'd usually want to cache the instance and use it in all your data files.
 *  const patrika = await getPatrika({
 *    pagesGlob: path.join("content", "pages", "**", "*.md"),
 *    postsGlob: path.join("content", "posts", "**", "*.md"),
 *    getSlug: ({ filePath, fmData }) => fmData.attributes.title || slugify(path.basename(filePath).replace(/\.md$/, "")),
 *    getPictureData: (imgSrc) => ({ "(max-width: 799px)": "small.jpg", "(min-width: 800px)": "large.jpg", }),
 *  });
 * 
 *  return patrika.getPages();
 * };
 * ```
 */
export async function getPatrika (args: GetPatrikaArgs): Promise<Patrika> {
  const {
    postsGlob,
    pagesGlob,
    getSlug,
    getPictureData,
  } = args;

  const tagsMap = new Map<string, ContentItem[]>;
  const idMap = new Map<string, ContentItem>;

  const fileWalker = async (globPattern: string, type: ContentItemType): Promise<ContentItem[]> => {
    const filePaths = await glob(globPattern);
    const items = [];
    for (const filePath of filePaths) {
      const stats = await fs.stat(filePath);
      if (!stats.isFile()) {
        continue;
      }

      const markdown = (await fs.readFile(filePath)).toString();
      const fmData = getFMData({ markdown, filePath });
      const item = toContentItem({
        filePath,
        stats,
        fmData,
        getSlug,
        type,
      });

      items.push(item);
      for (const tag of item.tags) {
        if (!tagsMap.has(tag)) {
          tagsMap.set(tag, []);
        }

        /// @ts-ignore We KNOW the result of this get is a string[] because the previous code block ensures that.
        tagsMap.get(tag).push(item);
      }

      idMap.set(item.id, item);
    }

    return items;
  };

  const pages = await fileWalker(pagesGlob, ContentItemType.Page);
  const posts = await fileWalker(postsGlob, ContentItemType.Post);

  const patrika = {
    getAll: () => [...pages, ...posts],
    getById: (id: string) => idMap.get(id),
    getPages: () => pages,
    getPosts: () => posts,
    getTags: () => Array.from(tagsMap.keys()),
  };

  // Render all markdown.
  await renderAllMarkdown({
    patrika,
    getPictureData,
  });

  return patrika;
}
