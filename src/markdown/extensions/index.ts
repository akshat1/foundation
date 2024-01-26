import { getShortCodeExtension } from "./shortCode";
import { GetShortCode } from "./typedefs";
import { marked } from "marked";

interface GetExtensionsArgs {
  getShortCode: GetShortCode
}

export const getExtensions = (args: GetExtensionsArgs): marked.MarkedExtension[] => [
  getShortCodeExtension(args),
];
