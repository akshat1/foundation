export type GetPostData = (args: {post?: string, property?: string}) => string|void;

export interface GetShortCodeArgs extends Record<string, any> {
  handler: String;
  raw: String;
}
export type GetShortCode = (args: GetShortCodeArgs) => string|void;
