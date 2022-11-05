import { marked } from "marked";
import { getPostDataExtension, GetPostDataExtensionArgs } from "./postData";
import { getPostLinkExtension } from "./postLink";

interface GetExtensionsArgs extends GetPostDataExtensionArgs {}

export const getExtensions = (args: GetExtensionsArgs): marked.MarkedExtension[] => [
  getPostDataExtension(args),
  getPostLinkExtension(args),
];
