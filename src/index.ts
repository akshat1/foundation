import { getLogger } from "@akshat1/js-logger";
import PicoDB from "picodb";
import { ContentItem } from "./ContentItem.js";
import { getExtraContentItems } from "./GetExtraContentItems.js";
import { GetSlug } from "./GetSlug.js";
import { GetURLRelativeToRoot } from "./GetURLRelativeToRoot.js";
import { Patrika } from "./Patrika.js";
import { fileWalker } from "./fileWalker.js";
import { FrontMatterAttributes } from "./front-matter/index.js";
import { OnShortCode } from "./markdown/extensions/OnShortCode.js";
import { renderAllMarkdown } from "./markdown/index.js";
export { RunnerConfiguration } from "./runner/RunnerConfiguration.js";
export { Template } from "./runner/Template.js";

export {
  ContentItem,
  FrontMatterAttributes,
  Patrika,
  OnShortCode,
};

const logger = getLogger("getPatrika");
export interface GetPatrikaArgs {
  contentGlob: string;
  onShortCode?: OnShortCode;
  getSlug: GetSlug;
  getURLRelativeToRoot: GetURLRelativeToRoot;
  outDir: string;
  getExtraContentItems?: getExtraContentItems;
}
export const getPatrika = async (args: GetPatrikaArgs): Promise<Patrika> => {
  logger.debug(args);
  const {
    onShortCode,
    contentGlob,
    getSlug,
    getURLRelativeToRoot,
    outDir,
  } = args;
  const db = new PicoDB<ContentItem>();

  const items = await fileWalker({
    getSlug,
    getURLRelativeToRoot,
    globPattern: contentGlob,
    outDir,
  });
  db.insertMany(items);

  const patrika: Patrika = {
    find: (query?: Record<string, unknown>, projection?: Record<string, unknown>) => db.find(query, projection).toArray(),
    _db: db,
  };

  // Add extra content items (for things like tags, categories, etc).
  if (typeof args.getExtraContentItems === "function") {
    const extraItems = await args.getExtraContentItems(patrika);
    db.insertMany(extraItems);
  }

  // Render all markdown.
  await renderAllMarkdown({
    db,
    onShortCode,
    patrika,
  });

  return patrika;
}
