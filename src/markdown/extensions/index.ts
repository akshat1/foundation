/* eslint-disable @typescript-eslint/no-empty-function */
import { getExtension } from "./inline";
import { MarkedExtensionAsPerDocs, OnShortCode } from "./typedefs";

export function getExtensions (onShortCode?: OnShortCode): MarkedExtensionAsPerDocs[] {
  return [getExtension(onShortCode)];
}
