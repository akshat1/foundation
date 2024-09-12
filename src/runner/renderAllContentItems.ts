import fs from "node:fs/promises";
import path from "node:path";
import { getLogger } from "@akshat1/js-logger";
import { ContentItem, Patrika } from "../index.js";
import { getRunnerConfig } from "./getConfiguration.js";
import { getFilePath } from "./getFilePath.js";
import { loadTemplate, Template } from "../Template.js";

const rootLogger = getLogger("renderAllContentItems");

interface WriteHTMLFileArgs {
  item: ContentItem;
  strHTML: string;
  index?: number;
}
const writeHTMLFile = async ({ item, strHTML, index } : WriteHTMLFileArgs) => {
  const logger = getLogger("writeHTMLFile", rootLogger);
  logger.debug(`Writing ${item.slug} / ${index}...`);
  const conf = await getRunnerConfig();
  const filePath = getFilePath(item, conf, index);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, strHTML);
  logger.debug(`Done writing ${item.slug} to ${filePath}.`);
};

export const renderAllContentItems = async (items: ContentItem[], patrika: Patrika) => {
  const logger = getLogger("implementation", rootLogger);
  // We reload the template to account for changes in the template.
  logger.debug("Reload the template...");
  const { renderToString } = await loadTemplate();
  logger.debug("Done reloading the template. Proceed...");
  for (const item of items) {
    logger.debug(`Rendering ${item.slug}...`);
    const output = await renderToString(item, patrika);
    if (Array.isArray(output)) {
      logger.debug(`Multiple (${output.length}) files will be written for ${item.slug}.`);
      for (const [index, strHTML] of output.entries()) {
        await writeHTMLFile({item, strHTML, index});
      }
    } else {
      await writeHTMLFile({ item, strHTML: output });
    }
  }
};
