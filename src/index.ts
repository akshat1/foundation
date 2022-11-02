import ContentItem, { ContentItemType, toContentItem } from "./ContentItem";
import { promises as fs, stat } from "fs";
import { promisify } from "util";
import glob from "glob";
import frontmatter from "front-matter";
import { GetSlug, ToHTML } from "./typedefs";

export interface Foundation {
  getAll: (GetCollectionArgs) => ContentItem[];
  getPages: (GetCollectionArgs) => ContentItem[];
  getPosts: (GetCollectionArgs) => ContentItem[];
  getTags: (GetCollectionArgs) => string[];
}

export interface GetFoundationArgs {
  postsGlob: string;
  pagesGlob: string;
  /**
   * Given markdown, return HTML.
   * This is a an argument here so that clients may supply their own markdown parser, which enables
   * use of custom markdown extensions.
   */
  toHTML: ToHTML;
  /**
   * Letting clients supply this function lets client set their own slugification.
   */
  getSlug: GetSlug;
}

/**
 * @example
 * ```
 * // Example usage with Pequeno for one of the data files.
 * const { marked } = require("marked");
 * const slugify = require("slugify");
 * const path = require("path");
 * 
 * module.exports = async () => {
 *  // in real usage you'd usually want to cache the instance and use it in all your data files.
 *  const foundation = await getFoundation({
 *    pagesGlob: path.join("content", "pages", "**", "*.md"),
 *    postsGlob: path.join("content", "posts", "**", "*.md"),
 *    getSlug: ({ filePath, fmData }) => fmData.attributes.title || slugify(path.basename(filePath).replace(/\.md$/, "")),
 *    toHTML: ({ markdown }) => marked(markdown),
 *  });
 * 
 *  return foundation.getPages();
 * };
 * ```
 */
export async function getFoundation (args: GetFoundationArgs): Promise<Foundation> {
  const {
    postsGlob,
    pagesGlob,
    toHTML,
    getSlug,
  } = args;

  const tagsMap = new Map<string, ContentItem[]>;

  const fileWalker = async (globPattern: string, type: ContentItemType): Promise<ContentItem[]> => {
    const filePaths = await glob(globPattern);
    const items = [];
    for (const filePath of filePaths) {
      const stats = await fs.stat(filePath);
      if (!stats.isFile()) {
        continue;
      }

      const markdown = (await fs.readFile(filePath)).toString();
      const fmData = frontmatter(markdown);
      const item = toContentItem({
        filePath,
        stats,
        fmData,
        getSlug,
        toHTML,
        type,
      });

      items.push(item);
      for (const tag of item.tags) {
        if (!tagsMap.has(tag)) {
          tagsMap.set(tag, []);
        }

        tagsMap.get(tag).push(item);
      }
    }

    return items;
  };

  const pages = await fileWalker(pagesGlob, ContentItemType.Page);
  const posts = await fileWalker(postsGlob, ContentItemType.Post);

  return {
    getAll: () => [...pages, ...posts],
    getPages: () => pages,
    getPosts: () => posts,
    getTags: () => Array.from(tagsMap.keys()),
  };
}
