import fs from "node:fs/promises";
import { glob } from "glob";
import { ContentItem, ContentItemType, toContentItem } from "./ContentItem.js";
import { GetSlug } from "./GetSlug.js";
import { getFMData } from "./front-matter/index.js";

interface FileWalkerArgs {
  globPattern: string;
  getSlug: GetSlug;
  type: ContentItemType;
}

export const fileWalker = async (args: FileWalkerArgs): Promise<ContentItem[]> => {
  const {
    globPattern,
    getSlug,
    type,
  } = args;
  const filePaths = await glob(globPattern);
  const items = [];
  for (const filePath of filePaths) {
    const stats = await fs.stat(filePath);
    if (!stats.isFile()) {
      continue;
    }

    const markdown = (await fs.readFile(filePath)).toString();
    const fmData = getFMData({ markdown, filePath });
    const item = toContentItem({
      filePath,
      stats,
      fmData,
      getSlug,
      type,
    });

    items.push(item);
  }

  return items;
};
