import ContentItem from "./ContentItem";

interface SortCriterion {
  by: string;
  desc?: boolean;
}

interface GetCollectionArgs {
  filter?: Record<string, any>;
  sort?: SortCriterion[];
  pagination?: {
    from: number;
    size: number;
  }
}

interface Foundation {
  getAll: (GetCollectionArgs) => ContentItem[];
  getPages: (GetCollectionArgs) => ContentItem[];
  getPosts: (GetCollectionArgs) => ContentItem[];
  getTags: (GetCollectionArgs) => string[];
}

interface GetFoundationArgs {
  src: string;
}

export async function getFoundation (args: GetFoundationArgs): Promise<Foundation> {
  return {
    getAll: () => [],
    getPages: () => [],
    getPosts: () => [],
    getTags: () => [],
  };
}
