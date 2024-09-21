# Patrika

### Patrikā (पत्रिका):—(nf) a magazine; journal.

Patrika is

- a utility to programmatically access HTML from a bunch of markdown files.
- a command line tool to call the `renderToString()` function supplied by you, with an instance of Patrika and the markdown, HTML, and front-matter data for each markdown file indicated by your configuration.

Patrika can be used as

- an API to serve as a headless CMS for your frontend (when coupled with your REST code).
- an API to access data in your static site gen tool of choice.
- a stand alone, framework agnostic, unopinionated static site generator.

## Usage

### Stand alone

In the stand alone mode,

```sh
$ mkdir my-personal-website
$ cd my-personal-website
$ mkdir content                # All your markdown content goes into this directory
$ mkdir src                    # Your template goes into this directory
$ touch src/index.js
$ echo "@akshat1:registry=https://warehouse.akshatmedia.com" >> .npmrc
$ npm init
$ npm i -d @akshat1/patrika
$ npx patrika -t src/index.js
```

#### Template

```ts
// This is a TS example just to illustrate use of various interfaces from Patrika.
// You are free to use JS, or any compile to JS language; just pass the compiled JS to patrika on the CLI.
import { ContentItem, Patrika, Template, RunnerConfiguration } from "@akshat1/patrika";
import path from "node:path";
import slugify from "slugify";
import { renderToString } from "./renderer/index.js";

const config: RunnerConfiguration = {
  "watchedPaths": ["template", "content", "src/styles"],
  "outDir": "_site",
  "template": "template/index.js",
  "lessDir": "src/styles/",
  "contentGlob": "content/**/*.md",
};

const getSlug = ({ sourceFilePath, title }: ContentItem) => slugify((title ?? path.basename(sourceFilePath).replace(/\.md$/, ""))).toLowerCase();

const getURLRelativeToRoot = (item: ContentItem, pageNumber: number) => {
  const {
    id,
    slug,
    frontMatter,
  } = item;

  const { type } = frontMatter;
  if (type === "page") {
    const fileName = pageNumber ? `index-${pageNumber}.html` : "index.html";
    return id === "site-index" ? fileName : `${slug}/${fileName}`;
  } else if (type === "post") {
    const publishDate = new Date(frontMatter.publishDate);
    return path.join("posts", publishDate.getFullYear().toString(), publishDate.getMonth().toString(), `${slug}.html`);
  }

  throw new Error(`Unknown item type: ${type}`);
};

const template: Template = {
  getSlug,
  renderToString,
  getURLRelativeToRoot,
  getConfig: () => config,
  onShortCode: async (args: Record<string, unknown>, patrika: Patrika) => "",
};

export default template;
```

#### Renderer

Patrika doesn't care which frontend framework you use. It only expects the template to provide a `renderToString` function.

Here's a really simple TypeScript example.

```ts
// src/index.ts ==> template/index.js
import { renderHead } from "./head.js";
import { ContentItem, Patrika } from "@akshat1/patrika";
import { renderBody } from "./body.js";
import { renderFooter } from "./footer.js";

export const renderToString = async (item: ContentItem, patrika: Patrika) =>
  `
  <!DOCTYPE html>
  <html lang="en">
    ${await renderHead(item)}
    ${await renderBody(item, patrika)}
    ${await renderFooter()}
  </html>
  `;
```

#### What about CSS?

**:SUBJECT TO CHANGE:** Patrika currently supports building `.less` files through the `lessDir` property in the runner configuration, but this is likely to go away. Ideally, we want to be agnostic towards CSS compilation similar to how we are agnostic towards frontend frameworks. We'll either have a `toCSS` callback, or perhaps do away with CSS entirely (we'll expect the user to rig up CSS compilation separately). You are advised to not rely on Patrika for buidling CSS at this time.

#### Live development?

Patrika provides two mechanisms to enable live development:

1. Watch mode through the `--watch or -w` flag: In this mode, any changes made to the watchedPaths mentioned in the runner configuration trigger a rebuild.
2. Serve mode through the `--server or -s` flag: In this mode, Patrika watches for changes (same as watch mode) but also runs a minimal, live reloading webserver at http://localhost:3000.

### Headless CMS

Patrika reads markdown files indicated by globs provided in the runner configuration, compiles it to HTML, and loads the whole shebang into an in-memory database. Then it exposes a simple `.find({ })` API.

Here's a simple example of using Patrika as a headless CMS.

```ts
import express from "express";
import { getPatrika, ContentItemType } from "@akshat1/patrika";

const getSlug = ({ filePath, attributes }) =>
  (attributes?.title ?? slugify(path.basename(filePath).replace(/\.md$/, ""))).toLowerCase();
const patrika = await getPatrika({
  pagesGlob: "contentDir/pages/**/*.md",
  postsGlob: "contentDir/posts/**/*.md",
  getSlug,
});

const app = express();
app.get("/posts", async (req, res) => {
  const allPosts = await patrika.find({ type: ContentItemType.Post });
  res.send(allPosts);
});

app.get("/post/:postId", async (req, res) => {
  const post = (await patrika.find({
    type: ContentItemType.Post,
    id: req.params.postId,
  }))[0];
  res.send(post);
});
```

### Data source for a Static Side Generator

The details for this would depend on the SSG in question, but it would be similar to the headless CMS example.

## Requirements

Patrika expects the following [FrontMatter](https://frontmatter.codes/docs/markdown) data in each markdown file. It is fine to include more data in the attributes, but Patrika will throw an error if any of the required fields are missing.

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

Sometimes, you need to insert custom instructions in your markdown content. For instance, you might want to insert a hyperlink to a post by the post-id so that you don't have to specify the path to the actual html file. Or even, fetch data async from an external data source (say from a DB or a service). For such use-cases, Patrika provides a mechanism to specify a shortcode handler in the getPatrika call. For example,

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

Patrika's shortcode mechanism is very unopinionated, because it let's the user (you) implement an unlimited number of shortcodes using a single `onShortCode` callback. What would be a tagName in usual markup becomes a shortcode parameter which would show up in your args object. The only optinionated bits is the syntax (strings must be quoted with double quotes). Valid (made up) examples are

```markdown
[P:I toRender="picture" assetId=42]
[P:I tagName="postLink postId="a-particular-post" title="Link to a particular post" text="Click here"]
[P:I foo="bar" baz=42 qux=3.14 quux=true corge=false]
```

At the moment there's just one tag, `[P:I]` (Patrika:inline) which is intended for standalone content. Eventually, we'll also provide a mechanism to enclose content (to create excerpts, for instance).
