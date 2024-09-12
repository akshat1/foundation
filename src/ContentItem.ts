import { Stats } from "fs";
import { FrontMatterResult } from "front-matter";
import { GetSlug } from "./GetSlug";
import { FrontMatterAttributes } from "./front-matter/index.js";
import { RunnerConfiguration } from "./runner/getConfiguration.js";
import { getFilePath } from "./runner/getFilePath.js";

export enum ContentItemType {
  Page = "page",
  Post = "post",
}

export interface ContentItem {
  authors: string[];
  /**
   * The HTML generated from the markdown content.
   *
   * This is optional because the body is generated in another pass and we need
   * to account for a half-baked ContentItem, one without a body. Ideally we
   * should use a partial type here so that the exposed API is consistent.
   * 
   * @TODO Use a partial type here instead of making `body` optional.
   */
  body?: string;
  collections: string[];
  draft: boolean;
  excerpt: Record<string, string>;
  /**
   * `id` as specified using front-matter in the markdown file.
   */
  id: string;
  image?: string;
  imgAlt?: string;
  markdown: string;
  publishDate: string|null; // Date
  slug: string;
  tags: string[];
  title: string;
  type: ContentItemType;
  frontMatter: FrontMatterAttributes;
  url: string;
  sourceFilePath: string;
  filePath: string;
}

export const comparePostsByPublishedDate = (a: ContentItem, b: ContentItem): number => {
  const dA = new Date(a.publishDate).getTime();
  const dB = new Date(b.publishDate).getTime();
  return dB - dA;
};

export const getPublishDate = (args: { attributes: FrontMatterAttributes, stats: Stats }): string|null => {
  const strDate = args.attributes?.publishDate || args.stats.ctime;
  if (strDate) {
    const date = new Date(strDate);
    return date.toISOString().replace(/T.*$/, "");
  }

  return null;
};

export interface ToContentItemArgs {
  fmData: FrontMatterResult<FrontMatterAttributes>,
  getSlug: GetSlug,
  sourceFilePath: string,
  stats: Stats,
  type: ContentItemType,
  conf: RunnerConfiguration,
}

/**
 * @TODO: Clean this (and associated code in other files) up. Right now we have some repetition and some peanut
 * buttering of logic into multiple modules. Can we get rid of some partial types and just pass around a dummy item
 * which gets progressively filled up? Similar to what we did for getFilePath?
 *
 * @param args 
 * @returns 
 */
export const toContentItem = (args: ToContentItemArgs): ContentItem => {
  const {
    sourceFilePath,
    fmData,
    getSlug,
    stats,
    type,
    conf,
  } = args;

  const {
    attributes,
    body: markdown,
  } = fmData;

  const {
    authors = [],
    collections = [],
    draft = false,
    id,
    image,
    imgAlt,
    tags = [],
    title,
  } = attributes;

  const publishDate = getPublishDate({ attributes, stats });
  const item = {
    sourceFilePath,
    filePath: "pending",
    url: "pending",
    authors,
    collections,
    draft,
    excerpt: {},
    frontMatter: attributes,
    id,
    image,
    imgAlt,
    markdown,
    publishDate,
    slug: getSlug({
      filePath: sourceFilePath,
      attributes: { ...fmData.attributes, publishDate },
      type,
    }),
    tags,
    title,
    type,
  };

  item.filePath = getFilePath(item, conf);
  item.url = item.filePath.replace(conf.outDir, "");

  return item;
};
