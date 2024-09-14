import { getLogger } from "@akshat1/js-logger";
import { getPatrika } from "../index.js";
import { renderAllContentItems } from "./renderAllContentItems.js";
import { flushTemplate, loadTemplate } from "../Template.js";
import path from "node:path";

const logger = getLogger("build");
let isBuilding = false;
export const build = async () => {
  if (isBuilding) {
    logger.debug("Already building. Skipping this call.");
    return;
  }

  logger.debug("Build everything...");
  isBuilding = true;

  flushTemplate();
  const template = await loadTemplate();
  logger.debug("Template loaded.", template);
  const conf = template.getConfig();
  logger.debug("Configuration", conf);
  const { contentGlob } = conf;
  const patrika = await getPatrika({ contentGlob });

  const contentItems = await patrika.find();
  logger.debug("Found content items:", contentItems.length);
  await Promise.all([
    // buildStyle(),
    renderAllContentItems(contentItems, patrika),
  ]);

  logger.debug("Done building everything.");
  isBuilding = false;
};
