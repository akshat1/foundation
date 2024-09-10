import fs from "node:fs/promises";
import path from "node:path";
import { getCommandLineOptions } from "./commandLineArgs";

export interface RunnerConfiguration {
  lessDir: string;
  outDir: string;
  pagesGlob: string;
  postsGlob: string;
  template: string;
  watchedPaths: string[];
};

let configuration: RunnerConfiguration;

export const getRunnerConfig = async (): Promise<RunnerConfiguration> => {
  if (configuration) {
    return configuration;
  }

  const { config } = getCommandLineOptions();
  const filePath = path.join(config);
  /* The config file may have absolute paths, or paths relative to itself. Therefore, we find out
   * the directory of the config file. We'll actually resolve the paths into absolute paths in the
   * configuration we keep in memory. */
  const confDirectory = path.dirname(filePath);
  const loadedConf = JSON.parse((await fs.readFile(filePath, "utf-8")).toString());
  configuration = {
    lessDir: path.resolve(confDirectory, loadedConf.lessDir),
    outDir: path.resolve(confDirectory, loadedConf.outDir),
    pagesGlob: path.resolve(confDirectory, loadedConf.pagesGlob),
    postsGlob: path.resolve(confDirectory, loadedConf.postsGlob),
    template: path.resolve(confDirectory, loadedConf.template),
    watchedPaths: loadedConf.watchedPaths.map((p: string) => path.resolve(confDirectory, p)),
  };
  return configuration;
}
