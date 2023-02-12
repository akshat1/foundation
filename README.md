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

## Custom short-codes

Patrikā is geared towards Markdown and FrontMatter, and fortunately, the Markdown node package lets us add custom extensions. We use this mechanism to add a few short-codes for convenience. These are entirely optional for you to use, but we find them useful.

### PostLink

PostLink let's you insert a hyperlink to another post without having to know the actual URL of the post/page. You just need to provide the id of the target post, as defined in FrontMatter.

Consider this markdown

```markdown
[PostLink post="another-post" text="See this other post" title="hyperlink to another post"]
```

The given short-code would output

```html
<a href="https://my-site.com/path/to/another-post" title="hyperlink to another post">
  See this other post
</a>
```

### PostData

PostData let's you insert any data from another post's associated FrontMatter. For example, this MarkDown would insert the value of the authors field from the referred post's FrontMatter data.

```markdown
[PostData post="another-post" property="authors"]
```
