import { ContentItemType, FrontMatterAttributes } from ".";

interface GetSlugArgs {
  filePath: string;
  attributes: FrontMatterAttributes;
  type: ContentItemType;
}
export type GetSlug = (args: GetSlugArgs) => string;
