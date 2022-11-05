import { getPostLinkExtension, PostLinkToken } from ".";
import { marked } from "marked";
import * as assert from "assert";
import sinon from "sinon";

describe("PostLink", async () => {
  const getPostData = sinon.spy(({ post, property }) => {
    if (property === "slug")
      return "https://www.site.com/post/url";
    return `>${post}:${property}<`;
  });

  const extension = getPostLinkExtension({ getPostData });

  describe("tokenizer", () => {
    /// @ts-ignore
    const { tokenizer } = extension.extensions[0];
    it("identifies a well formed usage of the tag.", () => {
      const src = `[PostLink post="foo" text="bar"]`;
      const token: PostLinkToken = tokenizer(src);
      assert.deepEqual(token, {
        type: "PostLink",
        raw: src,
        post: "foo",
        text: "bar",
      });
    });

    it("identifies a well formed usage of the tag with a title", () => {
      const src = `[PostLink post="foo" text="bar" title="baz"]`;
      const token: PostLinkToken = tokenizer(src);
      assert.deepEqual(token, {
        type: "PostLink",
        raw: src,
        post: "foo",
        text: "bar",
        title: "baz",
      });
    });
  });

  describe("renderer", () => {
    /// @ts-ignore
    const { renderer } = extension.extensions[0];
    it("renders the hyperlink given a well formed token.", () => {
      getPostData.resetHistory();
      const actual = renderer({
        type: "PostLink",
        post: "foo",
        text: "bar"
      });

      assert.equal(getPostData.callCount, 1);
      assert.equal(`<a href="https://www.site.com/post/url">bar</a>`, actual);
    });

    it("renders the hyperlink with a title given a well formed token.", () => {
      getPostData.resetHistory();
      const actual = renderer({
        type: "PostLink",
        post: "foo",
        text: "bar",
        title: "baz",
      });

      assert.equal(getPostData.callCount, 1);
      assert.equal(`<a href="https://www.site.com/post/url" title="baz">bar</a>`, actual);
    });
  });

  describe("the whole extension ", () => {
    marked.use(extension);
    it("renders a simple link", async () => {
      assert.equal(
        await marked('[PostLink post="foo" text="My HyperLink Text"]'),
        `<p><a href="https://www.site.com/post/url">My HyperLink Text</a></p>\n`,
      );
    });

    it("renders a link with a title", async () => {
      assert.equal(
        await marked('[PostLink post="foo" text="My HyperLink Text" title="blah"]'),
        `<p><a href="https://www.site.com/post/url" title="blah">My HyperLink Text</a></p>\n`,
      );
    });
  });
});
