/* eslint-disable @typescript-eslint/no-empty-function */
import { getExtension } from "./inline";
import { MarkedExtensionAsPerDocs } from "./typedefs";

export function getExtensions (): MarkedExtensionAsPerDocs[] {
  return [getExtension()];
}
