import { getPostDataExtension, GetPostDataExtensionArgs } from "./postData";
import { getPostLinkExtension } from "./postLink";
import { marked } from "marked";

type GetExtensionsArgs = GetPostDataExtensionArgs

export const getExtensions = (args: GetExtensionsArgs): marked.MarkedExtension[] => [
  getPostDataExtension(args),
  getPostLinkExtension(args),
];
