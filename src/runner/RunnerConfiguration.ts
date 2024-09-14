import fs from "node:fs/promises";
import path from "node:path";
import { getCommandLineOptions } from "./commandLineArgs.js";

export interface RunnerConfiguration {
  lessDir: string;
  outDir: string;
  contentGlob: string;
  template: string;
  watchedPaths: string[];
};

let configuration: RunnerConfiguration;
