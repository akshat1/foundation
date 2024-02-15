export interface FrontMatterAttributes {
  // Required attributes. Patrikā will throw an error if one of these is missing.
  authors: string[];
  id: string;
  publishDate: string | null;
  title: string;

  // Optional attributes. Don't show up in the validation schema object.
  collections?: string[];
  draft?: boolean;
  excerpt?: string;
  image?: string;
  imgAlt?: string;
  tags?: string[];
}

const DatePattern = /\d{4}-\d{1,2}-\d{1,2}/;
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
