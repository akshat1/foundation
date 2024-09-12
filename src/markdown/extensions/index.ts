/* eslint-disable @typescript-eslint/no-empty-function */
import { MarkedExtensionAsPerDocs } from "./MarkedExtensionAsPerDocs";
import { getExtension } from "./inline.js";

export function getExtensions (): MarkedExtensionAsPerDocs[] {
  return [getExtension()];
}
