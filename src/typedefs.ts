export type ToHTML = (args: { markdown: string }) => string;
export type GetSlug = (args: { filePath: string, fmData: Record<string, any> }) => string;
