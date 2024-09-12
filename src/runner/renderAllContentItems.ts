import fs from "node:fs/promises";
import path from "node:path";
import { getLogger } from "@akshat1/js-logger";
import { ContentItem, Patrika } from "../index.js";
import { getRunnerConfig } from "./getConfiguration.js";
import { getFilePath } from "./getFilePath.js";

const reloadTemplate = async () => {
  // Need to bust the require cache. This is clunky, but I don't know of a better way ATM.
  // We are going to remove all files that live under this module.
  const { template } = await getRunnerConfig();
  // const stub = path.dirname(require.resolve(template)); // Clear from dirname to account for imported siblings.
  // for (const key in require.cache) {
  //   if (key.startsWith(stub)) {
  //     delete require.cache[key];
  //   }
  // }
  // And now we load a fresh copy of the template. Note that two elements are required; query param to the import, and
  // the delete require.cache[...] operation above.
  const { renderToString } = await import(template + "?t=" + Date.now());
  return renderToString;
};

export const renderAllContentItems = async (items: ContentItem[], patrika: Patrika) => {
  const logger = getLogger("renderAllContentItems");
  // We reload the template to account for changes in the template.
  logger.debug("Reload the template...");
  const renderToString = await reloadTemplate();
  logger.debug("Done reloading the template. Proceed...");
  const conf = await getRunnerConfig();
  for (const item of items) {
    const filePath = getFilePath(item, conf);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    /// @ts-ignore
    const strHTML = await renderToString(item, patrika);
    await fs.writeFile(filePath, strHTML);
    logger.debug(`Done writing ${item.slug} to ${filePath}.`);
  }
};
