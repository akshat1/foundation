import * as fs from "fs/promises";

const previouslyEnsuredDirectories: Set<string> = new Set();
export const ensureDirectory = async (dir: string) => {
  if (previouslyEnsuredDirectories.has(dir)) {
    return;
  }
  await fs.mkdir(dir, { recursive: true });
  previouslyEnsuredDirectories.add(dir);
};
