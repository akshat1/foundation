# Patrikā

### Patrikā (पत्रिका):—(nf) a magazine; journal.

An API to serve content stored in markdown files on disk. Intended to serve as the back-end for lightweight static site generators such as Pequeno.

## Usage example (with [Pequeno](https://github.com/signalkuppe/pequeno))

```js
// Example usage with Pequeno for one of the data files.
const { marked } = require("marked");
const slugify = require("slugify");
const path = require("path");

module.exports = async () => {
 // in real usage you'd usually want to cache the instance and use it in all your data files.
 const patrika = await getPatrika({
   pagesGlob: path.join("content", "pages", "**", "*.md"),
   postsGlob: path.join("content", "posts", "**", "*.md"),
   getSlug: ({ filePath, fmData }) => fmData.attributes.title || slugify(path.basename(filePath).replace(/\.md$/, "")),
   toHTML: ({ markdown }) => marked(markdown),
 });

 return patrika.getPages();
};
```
