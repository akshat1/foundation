import fs from "node:fs/promises";
import { glob } from "glob";
import { ContentItem, toContentItem } from "./ContentItem.js";
import { getFMData } from "./front-matter/index.js";
import getLogger from "@akshat1/js-logger";

const logger = getLogger("fileWalker");
export const fileWalker = async (globPattern: string): Promise<ContentItem[]> => {
  const sourceFilePaths = await glob(globPattern);
  logger.debug({ globPattern, sourceFilePaths });
  const items = [];
  for (const sourceFilePath of sourceFilePaths) {
    const stats = await fs.stat(sourceFilePath);
    if (!stats.isFile()) {
      logger.warn("Skipping non-file", sourceFilePath);
      continue;
    }

    debugger;
    const markdown = (await fs.readFile(sourceFilePath)).toString();
    const fmData = getFMData({ markdown, filePath: sourceFilePath });
    const item = await toContentItem({
      sourceFilePath,
      stats,
      fmData,
    });

    items.push(item);
  }

  return items;
};
