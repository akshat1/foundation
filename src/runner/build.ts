import { getLogger } from "@akshat1/js-logger";
import { getPatrika } from "../index.js";
import { flushTemplate, loadTemplate } from "./Template.js";
import { renderAllContentItems } from "./renderAllContentItems.js";

const logger = getLogger("build");

let isBuilding = false;
export const build = async () => {
  if (isBuilding) {
    logger.debug("Already building. Skipping this call.");
    return;
  }

  logger.debug("Build everything...");
  isBuilding = true;

  // Flush and reload template; because the user may have changed their template.
  await flushTemplate();
  const template = await loadTemplate();
  logger.debug("Template loaded afresh.", template);

  const {
    getURLRelativeToRoot,
    renderToString,
  } = template;
  const {
    contentGlob,
    outDir,
  } = template.getConfig();
  const patrika = await getPatrika({ contentGlob });

  // Re-read files from the glob; because we may have added/removed files.
  const contentItems = await patrika.find();
  logger.debug("Found content items:", contentItems.length);
  await Promise.all([
    // buildStyle(),
    renderAllContentItems({
      getURLRelativeToRoot,
      items: contentItems,
      outDir,
      patrika,
      renderToString,
    }),
  ]);

  logger.debug("Done building everything.");
  isBuilding = false;
};
