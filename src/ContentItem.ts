import { FrontMatterResult } from "front-matter";
import { Stats } from "fs";
import { FrontMatterAttributes } from "./front-matter";
import { GetSlug } from "./typedefs";

export enum ContentItemType {
  Page = "page",
  Post = "post",
};

export default interface ContentItem {
  authors: string[];
  collections: string[];
  draft: boolean;
  id: string;
  markdown: string;
  body?: string;
  publishDate: string|null; // Date
  slug: string;
  tags: string[];
  title: string;
  type: ContentItemType;
};

// TODO: Now that we are enforcing the schema and publishedDate as a required field, we stop looking at FS.Stats
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
    tags = [],
    title,
  } = attributes;

  const publishDate = getPublishDate({ attributes, stats });

  return {
    authors,
    collections,
    publishDate,
    draft,
    id,
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
