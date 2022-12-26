import ContentItem, { ContentItemType } from "./ContentItem";
import { FrontMatterAttributes } from "./front-matter";

interface GetSlugArgs {
  filePath: string;
  attributes: FrontMatterAttributes;
  type: ContentItemType;
};
export type GetSlug = (args: GetSlugArgs) => string;
export type PostProcessHTML = (args: { body: HTMLElement, item: ContentItem, excerpt?: HTMLElement }) => HTMLElement;

export interface Patrika {
  getAll(): ContentItem[];
  getById(id: string): ContentItem|undefined;
  getPages(): ContentItem[];
  getPosts(): ContentItem[];
  getTags(): Record<string, ContentItem[]>;
}
