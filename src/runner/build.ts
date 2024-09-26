import { getLogger } from "@akshat1/js-logger";
import { copyStaticAssets } from "../copyStaticAssets.js";
import { getPatrika } from "../index.js";
import { loadTemplate } from "./Template.js";
import { buildStyle } from "./buildStyle.js";
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

  const template = await loadTemplate(true);
  logger.debug("Template loaded afresh.", template);

  const {
    getURLRelativeToRoot,
    renderToString,
    getConfig,
    getSlug,
    onShortCode,
  } = template;
  const config = getConfig();
  const {
    contentGlob,
    outDir,
  } = config;
  logger.debug("Config:", config);
  const patrika = await getPatrika({
    contentGlob,
    config,
    getSlug,
    getURLRelativeToRoot,
    onShortCode,
  });

  // Re-read files from the glob; because we may have added/removed files.
  const contentItems = await patrika.find();
  logger.debug("Found content items:", contentItems.length);
  await Promise.all([
    copyStaticAssets(config),
    buildStyle({
      outDir,
      lessDir: config.lessDir,
    }),
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
