import { getLogger } from "@akshat1/js-logger";
import { build } from "./build";
import { doCommandLineValidation, getCommandLineOptions } from "./commandLineArgs";
import { debounce } from "./debounce";
import { getRunnerConfig } from "./getConfiguration";
import { watch } from "./watch";

const logger = getLogger("runner-main");
// Main will be imported by bin/index.js
export const main = async () => {
  doCommandLineValidation();
  const conf = await getRunnerConfig();
  const clOptions = getCommandLineOptions();
  logger.debug("Configuration: ", JSON.stringify(conf, null, 2));
  await build();

  let signalReload: () => void;
  if (clOptions.serve) {
    logger.info("Start live server...");
    const { startServer } = await import("./server.js"); // Only load the server if required.
    signalReload = await startServer();
  }

  if (clOptions.serve || clOptions.watch) {
    logger.info("Watching for changes...");
    await watch(debounce(async () => {
      logger.info("Change detected. Rebuilding...");
      await build();
      if (signalReload) {
        logger.info("Signalling reload...");
        signalReload();
      }
    }));
  }
};
