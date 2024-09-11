import path from "node:path";
import { ContentItem, ContentItemType } from "../index.js";
import { MagicID } from "./Constants.js";
import { RunnerConfiguration } from "./getConfiguration.js";

// https://www.akshatsharma.com/2016/7/18/SPS-Final-(For-Now)-Update.html
// year/month/day/slug.html
const getPostFilePath = (item: ContentItem, conf: RunnerConfiguration) => {
  const {
    frontMatter: { publishDate },
    slug,
  } = item;
  return path.join(
    conf.outDir,
    /// @ts-ignore Somewhere we are turning string into Date. @TODO: Find out where.
    publishDate.getFullYear().toString(),
    /// @ts-ignore
    (publishDate.getMonth() + 1).toString(),
    /// @ts-ignore
    (publishDate.getDate() + 1).toString(),
    `${slug}.html`,
  );
}

const getPageFilePath = (item: ContentItem, conf: RunnerConfiguration) => {
  const {
    id,
    slug,
  } = item;

  const parts = [conf.outDir];

  if (id === MagicID.SiteIndex) {
    parts.push("index.html");
  } else {
    parts.push(path.join(slug, "index.html"));
  }

  return path.join(...parts);
};

export const getFilePath = (item: ContentItem, conf: RunnerConfiguration): string => {
  switch (item.type) {
    case ContentItemType.Post:
      return getPostFilePath(item, conf);
    case ContentItemType.Page:
      return getPageFilePath(item, conf);
    default:
      throw new Error(`Unknown content type: ${item.type}`);
  };
};
