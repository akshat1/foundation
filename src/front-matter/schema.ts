import { FrontMatterResult } from "front-matter";

export interface FrontMatterAttributes {
  id: string;
  authors: string[];
  collections?: string[];
  draft?: boolean;
  tags?: string[];
  title: string;
  publishDate: string | null;
  excerpt?: string;
}

const DatePattern = /\d{4}-\d{2}-\d{2}/;
type ValidatorFunc = (obj: Record<string, any>) => boolean;
type Schema = Record<string, ValidatorFunc>;
const FMDataSchema: Schema = {
  id: obj => typeof obj.id === "string",
  authors: obj => Boolean(Array.isArray(obj.authors) && obj.authors.length),
  title: obj => typeof obj.title === "string",
  publishDate: obj => ((obj.publishDate instanceof Date) || (typeof obj.publishDate === "string" && DatePattern.test(obj.publishDate))),
};

const doValidate = (schema: Schema, data: Record<string, any>): string[] => {
  const missingFields: string[] = [];
  for (const key in schema) {
    if (!schema[key](data)) {
      missingFields.push(key);
    }
  }

  return missingFields.sort();
};

/**
 * @param frontmatter result.
 * @returns list of missing fields.
 */
export const validate = (data: FrontMatterAttributes): string[] =>
  doValidate(FMDataSchema, data);
