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

const getPageFilePath = (item: ContentItem, conf: RunnerConfiguration, index?: number): string => {
  const {
    id,
    slug,
  } = item;

  const parts = [conf.outDir];

  if (id === MagicID.SiteIndex) {
    parts.push("index.html");
  } else {
    const fileName = index ? `index-${index}.html` : "index.html";
    parts.push(path.join(slug, fileName));
  }

  return path.join(...parts);
};

/**
 * @param item - The content item for which we want the file path.
 * @param conf - The runner configuration.
 * @param index - The index of the item in the list of items. This only comes into play for Pages.
 * @returns 
 */
export const getFilePath = (item: ContentItem, conf: RunnerConfiguration, index?: number): string => {
  switch (item.type) {
    case ContentItemType.Post:
      return getPostFilePath(item, conf);
    case ContentItemType.Page:
      return getPageFilePath(item, conf, index);
    default:
      throw new Error(`Unknown content type: ${item.type}`);
  };
};
