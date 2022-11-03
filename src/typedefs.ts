import { ContentItemType } from "./ContentItem";
import { FrontMatterAttributes } from "./front-matter";

interface GetSlugArgs {
  filePath: string;
  attributes: FrontMatterAttributes;
  type: ContentItemType;
};
export type GetSlug = (args: GetSlugArgs) => string;
