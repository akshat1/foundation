/* eslint-disable @typescript-eslint/no-empty-function */
import { getExtension } from "./inline";
import { MarkedExtensionAsPerDocs } from "./MarkedExtensionAsPerDocs";

export function getExtensions (): MarkedExtensionAsPerDocs[] {
  return [getExtension()];
}
