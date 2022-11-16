import { marked } from "marked";
import { getPostDataExtension, GetPostDataExtensionArgs } from "./postData";
import { getPostLinkExtension } from "./postLink";
import { getPictureExtension, GetPictureExtensionArgs } from "./picture";

interface GetExtensionsArgs extends GetPostDataExtensionArgs, GetPictureExtensionArgs {}

export const getExtensions = (args: GetExtensionsArgs): marked.MarkedExtension[] => [
  getPostDataExtension(args),
  getPostLinkExtension(args),
  getPictureExtension(args),
];
