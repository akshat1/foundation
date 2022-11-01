enum ContentItemType {
  Page = "page",
  Post = "post",
};

export default interface ContentItem {
  author: string[];
  collection: string[];
  createdAt: string;   // Date
  draft: boolean;
  html: string;
  markdown: string;
  publishedAt: string; // Date
  slug: string;
  tags: string[];
  title: string;
  type: ContentItemType;
  updatedAt: string;
};
