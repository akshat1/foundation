import { ContentItemType } from "./ContentItem";
import { FrontMatterAttributes } from "./FrontMatterAttributes";

export type ToHTML = (args: { markdown: string }) => string;

interface GetSlugArgs {
  filePath: string;
  attributes: FrontMatterAttributes;
  type: ContentItemType;
};
export type GetSlug = (args: GetSlugArgs) => string;
