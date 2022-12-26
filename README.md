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

PostData let's you insert any data from another post's associated FrontMatter. For example, this MarkDown

```markdown
[PostData post="another-post" property="authors"]
```

Would insert the value of the authors field from the referred post's FrontMatter data.

## Post Processing

Patrikā provides a mechanism for you to alter the generated HTML. This is useful for things like adding code highlights, or TOC generation. To use this feature, supply the optional `postProcessHTML` argument to `getPatrika()`.

```javascript
const { getPatrika, ContentItemType } = require("@akshat1/patrika");
const path = require("path");
const slugify = require("slugify");
const Prism = require("prismjs");
const loadLanguages = require("prismjs/components/");

const highlightLangPattern = /^language-(\w+)$/;
/**
 * @param {Object} args 
 * @param {HTMLElement} args.body
 * @param {ContentItem} args.item
 */
const postProcessHTML = ({body, item}) => {
  const codeTags = Array.from(body.querySelectorAll("pre code"));
  console.log(`\nPost processing ${item.slug}`);
  codeTags.forEach(tag => {
    console.log("\n");
    console.log(tag.innerHTML.substring(0, 30));
    const matches = tag.className.match(highlightLangPattern);
    if (matches) {
      const lang = matches[1];
      if (lang) {
        try {
          console.log("load lang =>", [lang]);
          loadLanguages([lang]);
          console.log("loaded language");
          console.log("highlight...");
          tag.innerHTML = Prism.highlight(tag.innerHTML, Prism.languages[lang], lang);
          console.log("done highlighting");
        } catch (error) {
          console.error(`Error highlighting ${item.slug}`);
          console.error(error);
        }
      } else {
        console.log("no lang");
      }
    }
  });
  item.body = body.outerHTML;
};

const patrika = await getPatrika({
  postsGlob: path.join(process.cwd(), "src", "content", "posts", "**", "*.md"),
  pagesGlob: path.join(process.cwd(), "src", "content", "pages", "**", "*.md"),
  getSlug: ({ filePath, fmData }) => fmData.attributes.title || slugify(path.basename(filePath).replace(/\.md$/, "")),
  postProcessHTML,
});
```
