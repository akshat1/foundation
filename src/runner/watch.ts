import fs from "node:fs";
import { getLogger } from "@akshat1/js-logger";
import { loadTemplate } from "../Template.js";

const logger = getLogger("watch");
/**
 * Starts watching all the paths mentioned in RunnerConfig.watchedPaths, and calls the onChange
 * callback when any of them change.
 */
export const watch = async (onChange: () => void) => {
  logger.debug("Watching for changes...");
  const { watchedPaths } = (await loadTemplate()).getConfig();
  for (const watchedPath of watchedPaths) {
    logger.debug(`Watching ${watchedPath}`);
    fs.watch(watchedPath, { recursive: true }, onChange);
  }
  logger.debug("Watchers setup and running.");
};
