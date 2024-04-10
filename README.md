# Patrikā

### Patrikā (पत्रिका):—(nf) a magazine; journal.

A utility to read a collection of Markdown files and associated HTML. Intended to be used with site renderer of your choice. It could be a static site renderer, or even a client side renderer where you put behind (say) an Express wrapper.

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

Sometimes, you need to insert custom instructions in your markdown content. For instance, you might want to insert a hyperlink to a post by the post-id so that you don't have to specify the path to the actual html file. Or even, fetch data async from an external data source (say from a DB or a service). For such use-cases, Patrikā provides a mechanism to specify a shortcode handler in the getPatrika call. For example,

```markdown
# Example shortcode usage.

Our author Adam Smith has written [P:I tagName="author-data" authorID="adam-smith" requested="post-count"] posts. Here's his picture.

[P:I tagName="author-data" authorId="adam-smith" requested="picture"]
```

```js
const patrika = await getPatrika({
  pagesGlob: path.join("content", "pages", "**", "*.md"),
  postsGlob: path.join("content", "posts", "**", "*.md"),
  getSlug: ({ filePath, fmData }) => fmData.attributes.title || slugify(path.basename(filePath).replace(/\.md$/, "")),
  onShortCode: async (args) => {
    switch (args.tagName) {
      case "author-data": {
        switch (args.requested) {
          "post-count": return (await patrika.find({ authors: args.authorID }) ).length;
          "picture": return (await fetch(`${authorPictureService}/${args.authorID}`));
          // ....
          // Potential other data attributes
        },
        // Potential other tags.
      }
    }
  },
});
```

Patrikā's shortcode mechanism is very unopinionated, because it let's the user (you) implement an unlimited number of shortcodes using a single `onShortCode` callback. What would be a tagName in usual markup becomes a shortcode parameter which would show up in your args object. The only optinionated bits is the syntax (strings must be quoted with double quotes). Valid (made up) examples are

```markdown
[P:I toRender="picture" assetId=42]
[P:I tagName="postLink postId="a-particular-post" title="Link to a particular post" text="Click here"]
[P:I foo="bar" baz=42 qux=3.14 quux=true corge=false]
```

At the moment there's just one tag, `[P:I]` (Patrikā:inline) which is intended for standalone content. Eventually, we'll also provide a mechanism to enclose content (to create excerpts, for instance).

