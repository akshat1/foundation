export type GetPostData = (args: {post?: string, property?: string}) => string|void;

export type OnShortCode = (args: Record<string, unknown>) => Promise<string>;
