export interface RunnerConfiguration {
  /** Something like mySiteContent\/**\/*.md */
  contentGlob: string;
  /** @deprecated */
  lessDir: string;
  outDir: string;
  /** Any and all static assets that should be copied over as is. */
  staticAssets: string[];
  /**
   * All directories that should be watched in order to trigger a re-build. This should include the content directory,
   * the renderer JS, and any other directories that are used to generate the site (such as styles / images etc.).
   */
  watchedPaths: string[];
};
