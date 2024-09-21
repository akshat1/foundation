import { getLogger } from "@akshat1/js-logger";
import { loadTemplate } from "./Template.js";
import { build } from "./build.js";
import { doCommandLineValidation, getCommandLineOptions } from "./commandLineArgs.js";
import { debounce } from "./debounce.js";
import { watch } from "./watch.js";

const logger = getLogger("runner-main");
// Main will be imported by bin/index.js
export const main = async () => {
  await doCommandLineValidation();
  const clOptions = getCommandLineOptions();
  const template = await loadTemplate();
  const conf = template.getConfig();
  await build();

  let signalReload: () => void;
  if (clOptions.serve) {
    logger.info("Start live server...");
    const { startServer } = await import("./server.js"); // Only load the server if required.
    signalReload = await startServer(conf);
  }

  if (clOptions.serve || clOptions.watch) {
    logger.info("Watching for changes...");
    await watch(conf.watchedPaths, debounce(async () => {
      logger.info("Change detected. Rebuilding...");
      await build();
      if (signalReload) {
        logger.info("Signalling reload...");
        signalReload();
      }
    }));
  }
};
