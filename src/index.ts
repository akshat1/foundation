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

const comparePostsByPublishedDate = (a: ContentItem, b: ContentItem): number => {
  /// @ts-ignore
  const dA = new Date(a.publishDate).getTime();
  /// @ts-ignore
  const dB = new Date(b.publishDate).getTime();
  return dB - dA;
};

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

  const idMap:Record<string, ContentItem> = {};
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
      idMap[item.id] = item;
    }

    return items;
  };

  const pages = await fileWalker(pagesGlob, ContentItemType.Page);
  const posts = await fileWalker(postsGlob, ContentItemType.Post);
  // posts should be reverse chronologically sorted.
  posts.sort(comparePostsByPublishedDate);

  // Construct a map of tags to posts
  // We sorted posts before this step so that when we look up posts by tag, they are pre-sorted.
  const tagsMap: Record<string, ContentItem[]> = {};
  posts.forEach((post) => {
    for (const tag of post.tags) {
      if (!tagsMap[tag]) {
        tagsMap[tag] = [];
      }
  
      /// @ts-ignore We KNOW the result of this get is a string[] because the previous code block ensures that.
      tagsMap[tag].push(post);
    }
  });

  const patrika: Patrika = {
    getAll: () => [...pages, ...posts],
    getById: (id: string) => idMap[id],
    getPages: () => pages,
    getPosts: () => posts,
    getTags: () => tagsMap,
    /// @ts-ignore Doing a `?? []` here would potentially hide bugs in case something changes between populating and delivering map values.
    getPostsForTag: (tag: string) => tagsMap.get(tag),
  };

  // Render all markdown.
  await renderAllMarkdown({
    patrika,
    getPictureData,
  });

  return patrika;
}
