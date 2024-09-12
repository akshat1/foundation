import path from "node:path";
import { getLogger } from "@akshat1/js-logger";
import slugify from "slugify";
import { ContentItemType, getPatrika } from "../index.js";
import { buildStyle } from "./buildStyle.js";
import { getRunnerConfig } from "./getConfiguration.js";
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

  const conf = await getRunnerConfig();
  const patrika = await getPatrika({
    pagesGlob: conf.pagesGlob,
    postsGlob: conf.postsGlob,
    getSlug: ({ filePath, attributes }) => (attributes?.title ?? slugify(path.basename(filePath).replace(/\.md$/, ""))).toLowerCase(),
    // onShortCode, // This should be from the template.
  });

  const patrikaQuery = {
    type: {
      $in: [
        ContentItemType.Page,
        ContentItemType.Post
      ],
    },
  };
  await Promise.all([
    buildStyle(),
    renderAllContentItems(await patrika.find(patrikaQuery), patrika),
  ]);

  logger.debug("Done building everything.");
  isBuilding = false;
};
