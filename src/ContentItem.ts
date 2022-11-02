import { Stats } from "fs";
import { ToHTML } from "./typedefs";
import { GetSlug } from "./typedefs";

export enum ContentItemType {
  Page = "page",
  Post = "post",
};

export default interface ContentItem {
  author: string[];
  collections: string[];
  createdAt: string; // Date
  draft: boolean;
  html: string;
  markdown: string;
  slug: string;
  tags: string[];
  title: string;
  type: ContentItemType;
  updatedAt: string; // Date
};

const getCreatedAt = (args: { attributes: Record<string, any>, stats: Stats }): string|null => {
  const strDate = args.attributes?.createdAt || args.stats.ctime;
  if (strDate) {
    const date = new Date(strDate);
    return `${date.getFullYear}-${date.getMonth()}-${date.getDay()}`;
  }

  return null;
};

const getUpdatedAt = (args: { attributes: Record<string, any>, stats: Stats }): string|null => {
  const strDate = args.attributes?.updatedAt || args.stats.mtime;
  if (strDate) {
    const date = new Date(strDate);
    return `${date.getFullYear}-${date.getMonth()}-${date.getDay()}`;
  }

  return null;
};

export interface ToContentItemArgs {
  fmData: {
    attributes: Record<string, any>,
    body: string,
  },
  toHTML: ToHTML,
  getSlug: GetSlug,
  filePath,
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
    author,
    collections,
    draft = false,
    tags,
    title,
  } = attributes;

  return {
    author,
    collections,
    createdAt: getCreatedAt({ attributes, stats }),
    draft,
    html: toHTML({ markdown }),
    markdown,
    slug: getSlug({ filePath, fmData }),
    tags,
    title,
    type,
    updatedAt: getUpdatedAt({ attributes, stats }),
  };
};
