import fs from "node:fs/promises";
import { glob } from "glob";
import { ContentItem, ContentItemType, toContentItem } from "./ContentItem.js";
import { GetSlug } from "./GetSlug.js";
import { getFMData } from "./front-matter/index.js";
import { getRunnerConfig } from "./runner/getConfiguration.js";

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
  const conf = await getRunnerConfig();
  const sourceFilePaths = await glob(globPattern);
  const items = [];
  for (const sourceFilePath of sourceFilePaths) {
    const stats = await fs.stat(sourceFilePath);
    if (!stats.isFile()) {
      continue;
    }

    const markdown = (await fs.readFile(sourceFilePath)).toString();
    const fmData = getFMData({ markdown, filePath: sourceFilePath });
    const item = toContentItem({
      sourceFilePath,
      stats,
      fmData,
      getSlug,
      type,
      conf,
    });

    items.push(item);
  }

  return items;
};
