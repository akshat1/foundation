import ContentItem, { ContentItemType } from "./ContentItem";
import { FrontMatterAttributes } from "./front-matter";

interface GetSlugArgs {
  filePath: string;
  attributes: FrontMatterAttributes;
  type: ContentItemType;
};
export type GetSlug = (args: GetSlugArgs) => string;

export interface Patrika {
  getAll(): ContentItem[];
  getById(id: string): ContentItem|undefined;
  getPages(): ContentItem[];
  getPosts(): ContentItem[];
  getTags(): string[];
}
