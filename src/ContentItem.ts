import { FrontMatterResult } from "front-matter";
import { Stats } from "fs";
import { FrontMatterAttributes } from "./FrontMatterAttributes";
import { ToHTML } from "./typedefs";
import { GetSlug } from "./typedefs";

export enum ContentItemType {
  Page = "page",
  Post = "post",
};

export default interface ContentItem {
  authors: string[];
  collections: string[];
  publishDate: string|null; // Date
  draft: boolean;
  html: string;
  markdown: string;
  slug: string;
  tags: string[];
  title: string;
  type: ContentItemType;
};

const getPublishDate = (args: { attributes: Record<string, any>, stats: Stats }): string|null => {
  const strDate = args.attributes?.publishDate || args.stats.ctime;
  if (strDate) {
    const date = new Date(strDate);
    return date.toISOString().replace(/T.*$/, "");
  }

  return null;
};

export interface ToContentItemArgs {
  fmData: FrontMatterResult<FrontMatterAttributes>,
  toHTML: ToHTML,
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
    toHTML,
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
    tags = [],
    title,
  } = attributes;

  const publishDate = getPublishDate({ attributes, stats });

  return {
    authors,
    collections,
    publishDate,
    draft,
    html: toHTML({ markdown }),
    markdown,
    slug: getSlug({
      filePath,
      attributes: { ...fmData.attributes, publishDate },
      type
    }),
    tags,
    title,
    type,
  };
};
