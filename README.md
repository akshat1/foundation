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

If you want to use the Picture shortcode, you also need to have a yaml file named "patrika-picture-data.yml". This file would describe media breakpoints and corresponding srcset values for your images. The shortcode will accept a single src attribute, look up the responsive images in patrika-picture-data.yml and insert a `<picture>` tag in the output HTML. This file should look like this

```yml
elva.jpg:
  "(max-width: 799px)": "elva-480w-close-portrait.jpg"
  "(min-width: 800px)": "elva.jpg"

another-picture.png:
  "(max-width: 799px)": "another-picture-480w-recropped.png"
  "(min-width: 800px)": "another-picture.png.jpg"
```

## Custom short-codes

Patrika is geared towards Markdown and FrontMatter, and fortunately, the Markdown node package let's us add custom extensions. We use this mechanism to add a few short-codes for convenience. These are entirely optional for you to use, but we find them useful.

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

### Picture

The Picture code will let you insert responsive `<picture>` elements into your output HTML given a single image path; as long as various recropped/resized versions are listed in the picture data file (as described previously). So given the patrika-picture-data.yml described earlier, the following MarkDown

```markdown
[Picture src="elva.jpg alt="responsive images example from MDN"]
```

Would produce the following HTML.
```HTML
<picture>
  <source media="(max-width: 799px)" srcset="elva-480w-close-portrait.jpg" />
  <source media="(min-width: 800px)" srcset="elva.jpg" />
  <img src="elva.jpg" alt="responsive images example from MDN" />
</picture>
```

If you use a src that's not described in the image data file then we fallback to using a non-responsive `img` tag.
