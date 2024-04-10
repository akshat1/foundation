import { comparePostsByPublishedDate,ContentItem, ContentItemType } from "./ContentItem";
import { fileWalker } from "./fileWalker";
import { FrontMatterAttributes } from "./front-matter";
import { GetSlug } from "./GetSlug";
import { renderAllMarkdown } from "./markdown";
import { OnShortCode } from "./markdown/extensions/OnShortCode";
import { Patrika } from "./Patrika";
import PicoDB from "picodb";

export {
  ContentItemType,
  ContentItem,
  FrontMatterAttributes,
  Patrika,
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
  onShortCode?: OnShortCode;
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
export const getPatrika = async (args: GetPatrikaArgs): Promise<Patrika> => {
  const {
    postsGlob,
    pagesGlob,
    getSlug,
    excerpts = DefaultExcerpts,
    onShortCode,
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
  posts.sort(comparePostsByPublishedDate);
  db.insertMany(posts); // @TODO: I wish Pico provided a sort method, but leaving that aside, does Pico maintain sort order? We might need to use TyrDB after all.

  // posts should be reverse chronologically sorted.
  posts.sort(comparePostsByPublishedDate);

  const patrika: Patrika = {
    getPosts: async () => db.find({ type: ContentItemType.Post }).toArray(),
    getPages: async () => db.find({ type: ContentItemType.Page }).toArray(),
    find: (query?: Record<string, any>, projection?: Record<string, unknown>) => db.find(query, projection).toArray(),
    _db: db,
  };

  // Render all markdown.
  await renderAllMarkdown({
    db,
    excerpts,
    patrika,
    onShortCode,
  });

  return patrika;
}
