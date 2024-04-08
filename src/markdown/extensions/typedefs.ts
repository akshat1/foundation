export type GetPostData = (args: {post?: string, property?: string}) => string|void;

export type OnShortCode = (args: Record<string, unknown>) => Promise<string>;

/**
 * The Docs don't seem to match the MarkedExtension type, or I just don't
 * understand the intricacies of advanced TypeScript. Luckily, I don't need to
 * since I'm trying to write a Marked extension, not get a PHD in Type theory.
 *
 * We'll probably need to ts-ignore the marked.use call but I think it's
 * acceptable in this situation.
 */
export interface MarkedExtensionAsPerDocs {
  name: string;
  level: "block" | "inline";
  start(src: string, pos: number): number|void;
  async: boolean;
  tokenizer(src: string, tokens: SCToken[]): void;
  renderer(token: SCToken): string;
}

export interface SCToken {
  type: string;
  raw: string;
  text: string;
  tokens?: SCToken[];
  html: string;
  args: Record<string, unknown>;
}
