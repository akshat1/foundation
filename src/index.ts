import PicoDB from "picodb";
import { ContentItem } from "./ContentItem.js";
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

export interface GetPatrikaArgs {
  contentGlob,
  onShortCode?: OnShortCode;
  prettify?: boolean;
}

export const getPatrika = async (args: GetPatrikaArgs): Promise<Patrika> => {
  const {
    onShortCode,
    contentGlob,
  } = args;
  const db = new PicoDB<ContentItem>();

  const items = await fileWalker(contentGlob);
  db.insertMany(items);

  const patrika: Patrika = {
    find: (query?: Record<string, unknown>, projection?: Record<string, unknown>) => db.find(query, projection).toArray(),
    _db: db,
  };

  // Render all markdown.
  await renderAllMarkdown({
    db,
    onShortCode,
    patrika,
  });

  return patrika;
}
