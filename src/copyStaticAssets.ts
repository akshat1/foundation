import { promises as fs } from "node:fs";
import path from "node:path";
import { getLogger } from "@akshat1/js-logger";
import { RunnerConfiguration } from "./runner/RunnerConfiguration";

export const copyStaticAssets = async (config: RunnerConfiguration) => {
  const { outDir, staticAssets } = config;
  const logger = getLogger("copyStaticAssets");
  logger.debug("Copying static assets to", outDir);

  await Promise.all(
    staticAssets.map(async (staticAsset) => {
      const src = path.join(process.cwd(), staticAsset);
      const dest = path.join(outDir, staticAsset);
      logger.debug("Copying", src, "to", dest);
      await fs.cp(src, dest, {
        recursive: true,
        force: true,
      });
    })
  );

  logger.debug("Done copying static assets.");
}
