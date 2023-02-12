import { FrontMatterAttributes } from "./front-matter";
import { GetSlug } from "./typedefs";
import { FrontMatterResult } from "front-matter";
import { Stats } from "fs";

export enum ContentItemType {
  Page = "page",
  Post = "post",
}

export interface ContentItem {
  authors: string[];
  body?: string;
  collections: string[];
  draft: boolean;
  excerpt: Record<string, string>;
  id: string;
  image?: string;
  imgAlt?: string;
  markdown: string;
  publishDate: string|null; // Date
  slug: string;
  tags: string[];
  title: string;
  type: ContentItemType;
  frontMatter: Record<string, any>;
}

export const comparePostsByPublishedDate = (a: ContentItem, b: ContentItem): number => {
  /// @ts-expect-error
  const dA = new Date(a.publishDate).getTime();
  /// @ts-expect-error
  const dB = new Date(b.publishDate).getTime();
  return dB - dA;
};

export const getPublishDate = (args: { attributes: Record<string, any>, stats: Stats }): string|null => {
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
  filePath: string,
  stats: Stats,
  type: ContentItemType,
}

export const toContentItem = (args: ToContentItemArgs): ContentItem => {
  const {
    filePath,
    fmData,
    getSlug,
    stats,
    type,
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

  return {
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
      filePath,
      attributes: { ...fmData.attributes, publishDate },
      type,
    }),
    tags,
    title,
    type,
  };
};
