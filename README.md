# Patrikā

### Patrikā (पत्रिका):—(nf) a magazine; journal.

An API to serve content stored in markdown files on disk. Intended to be used with static site generators like [Pequeno](https://github.com/signalkuppe/pequeno).

## Usage example with Pequeno

```js
// Example usage with Pequeno for one of the data files.
const slugify = require("slugify");
const path = require("path");

module.exports = async () => {
 // in real usage you'd usually want to cache the instance and use it in all your data files.
 const patrika = await getPatrika({
   pagesGlob: path.join("content", "pages", "**", "*.md"),
   postsGlob: path.join("content", "posts", "**", "*.md"),
   getSlug: ({ filePath, fmData }) => fmData.attributes.title || slugify(path.basename(filePath).replace(/\.md$/, "")),
 });

 return patrika.getPages();
};
```

## Requirements

Patrikā expects the following [FrontMatter](https://frontmatter.codes/docs/markdown) data in each markdown file. It is fine to include more data in the attributes, but Patrikā will throw an error if any of the required fields are missing.

```ts
export interface FrontMatterAttributes {
  id: string;
  authors: string[];
  collections?: string[];
  draft?: boolean;
  tags?: string[];
  title: string;
  publishDate: string | null;
}
```
