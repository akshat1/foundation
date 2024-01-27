import { ContentItem, ContentItemType } from "./ContentItem";
import { FrontMatterAttributes } from "./front-matter";

interface GetSlugArgs {
  filePath: string;
  attributes: FrontMatterAttributes;
  type: ContentItemType;
}
export type GetSlug = (args: GetSlugArgs) => string;

export interface Patrika {
  getAll(): Promise<ContentItem[]>;
  getById(id: string): Promise<ContentItem|undefined>;
  getPages(): Promise<ContentItem[]>;
  getPosts(): Promise<ContentItem[]>;
  getTags(): Record<string, ContentItem[]>;
}
