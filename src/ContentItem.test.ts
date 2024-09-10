import { ContentItem, ContentItemType, getPublishDate, toContentItem, ToContentItemArgs } from "./ContentItem";
import { comparePostsByPublishedDate } from "./ContentItem";
import { FrontMatterAttributes } from "./front-matter";
import assert from "assert";
import { FrontMatterResult } from "front-matter";
import { test, suite } from "node:test";

suite("ContentItem", () => {
  suite("comparePostsByPublishedDate", () => {
    const FakeItemStub: ContentItem = {
      authors: [],
      body: "",
      collections: [],
      draft: false,
      excerpt: {},
      frontMatter: {},
      id: "",
      markdown: "",
      publishDate: "",
      slug: "",
      tags: [],
      title: "",
      type: ContentItemType.Post,
    };
    const makeFakeItem = (publishDate: string): ContentItem => ({
      ...FakeItemStub,
      publishDate,
    });
  
    test("should return 0 when a and b are the same", () => {
      const a = makeFakeItem("2023-01-01");
      const b = makeFakeItem("2023-01-01");
      assert.equal(comparePostsByPublishedDate(a, b), 0);
    });
  
    test("should return > 0 when a is older than b", () => {
      const a = makeFakeItem("2023-01-01");
      const b = makeFakeItem("2023-02-01");
      assert.equal(comparePostsByPublishedDate(a, b) > 0, true);
    });
  
    test("should return < 0 when a is newer than b", () => {
      const a = makeFakeItem("2023-02-01");
      const b = makeFakeItem("2023-01-01");
      assert.equal(comparePostsByPublishedDate(a, b) < 0, true);
    });
  });

  suite("getPublishDate", () => {
    test("should return the date from front matter attributes when present", () => {
      const args = {
        attributes: { publishDate: "2020-03-02" },
        stats: { ctime: new Date("2021-01-01").toUTCString() },
      };
      /// @ts-expect-error Not going to create a full fs.Stats object for the test :-|
      const actualDate = getPublishDate(args);
      assert.equal(actualDate, "2020-03-02");
    });

    test("should return the date from file states when missing from attributes", () => {
      const args = {
        attributes: {},
        stats: { ctime: new Date("2021-01-01").toUTCString() },
      };
      /// @ts-expect-error Not going to create a full fs.Stats object for the test :-|
      const actualDate = getPublishDate(args);
      assert.equal(actualDate, "2021-01-01");
    });

    test("should return null when published date is missing from attributes, and ctime is missing from stats", () => {
      const args = {
        attributes: {},
        stats: {},
      };
      /// @ts-expect-error Not going to create a full fs.Stats object for the test :-|
      const actualDate = getPublishDate(args);
      assert.equal(actualDate, null);
    });
  });

  suite("toContentItem", () => {
    test("should return a well formed ContentItem", () => {
      const authors = ["foo", "bar"];
      const id = "post-42";
      const publishDate = "2023-01-01";
      const title = "Le Title";
      const collections = ["one", "two"];
      const image = "/images/blah";
      const imgAlt = "a fake image for testing";
      const tags = ["such", "tags"];
      const fmAttributes = {
        authors,
        id,
        publishDate,
        title,
        collections,
        draft: false,
        image,
        imgAlt,
        tags,
      };
      const frontMatter: FrontMatterResult<FrontMatterAttributes> = {
        attributes: fmAttributes,
        body: "ze markdown",
        bodyBegin: 0,
        frontmatter: "all ze frontmatter",
      };
      const contentItemArgs: ToContentItemArgs = {
        type: ContentItemType.Post,
        filePath: "foo/bar/baz.md",
        fmData: frontMatter,
        getSlug: () => "jabba-the-hut",
        /// @ts-expect-error We don't want to create an entire fs.Stat object.
        stats: {},
      };

      const expectedItem = {
        authors,
        collections,
        draft: false,
        frontMatter: fmAttributes,
        id,
        markdown: "ze markdown",
        publishDate,
        slug: "jabba-the-hut",
        tags,
        title,
        type: ContentItemType.Post,
        image,
        imgAlt,
        excerpt: {},
      };
      const actualItem = toContentItem(contentItemArgs);
      assert.deepEqual(actualItem, expectedItem);
    });
  });
});
