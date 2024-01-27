import { comparePostsByPublishedDate,ContentItem, ContentItemType } from "./ContentItem";
import { fileWalker } from "./fileWalker";
import { FrontMatterAttributes } from "./front-matter";
import { renderAllMarkdown } from "./markdown";
import { GetSlug, Patrika } from "./typedefs";
import PicoDB from "picodb";

export {
  ContentItemType,
  ContentItem,
  FrontMatterAttributes,
};

export interface GetPatrikaArgs {
  postsGlob: string;
  pagesGlob: string;
  /**
   * Letting clients supply this function lets client set their own slugification.
   */
  getSlug: GetSlug;
  /**
   * A dictionary to describe excerpt lengths; with the default values being shown here in the example.
   * @example
   * {
   *   large: 600,
   *   medium: 300,
   *   small: 150
   * }
   */
  excerpts?: Record<string, number>;
}

const DefaultExcerpts = {
  large: 600,
  medium: 300,
  small: 150,
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
    excerpts = DefaultExcerpts,
  } = args;
  const db = new PicoDB<ContentItem>();

  const pages = await fileWalker({
    globPattern: pagesGlob,
    type: ContentItemType.Page,
    getSlug,
  });
  db.insertMany(pages);

  const posts = await fileWalker({
    globPattern: postsGlob,
    type: ContentItemType.Post,
    getSlug,
  });
  db.insertMany(posts);

  // posts should be reverse chronologically sorted.
  posts.sort(comparePostsByPublishedDate);

  // @TODO: How do we stop having the need to maintain a tagsMap?
  // Construct a map of tags to posts
  // We sorted posts before this step so that when we look up posts by tag, they are pre-sorted.
  const tagsMap: Record<string, ContentItem[]> = {};
  posts.forEach((post) => {
    for (const tag of post.tags) {
      if (!tagsMap[tag]) 
        {tagsMap[tag] = [];}

      tagsMap[tag].push(post);
    }
  });

  const patrika: Patrika = {
    getAll: () => db.toArray(),
    getById: async (id: string) => (await db.find({ id }).toArray())[0],
    getPages: () => db.find({ type: ContentItemType.Page }).toArray(),
    getPosts: () => db.find({ type: ContentItemType.Post }).toArray(),
    getTags: () => tagsMap,
    /// @ts-expect-error Doing a `?? []` here would potentially hide bugs in case something changes between populating and delivering map values.
    getPostsForTag: (tag: string) => tagsMap.get(tag),
  };

  // Render all markdown.
  await renderAllMarkdown({
    excerpts,
    patrika,
  });

  return patrika;
}
