import { getPatrika } from ".";
import { Patrika } from "./Patrika";
import path from "path";
import assert from "node:assert";
import { test, suite, mock, before } from "node:test";

suite("getPatrika", () => {
  let patrika: Patrika;
  const onShortCode = mock.fn(async (args) => {
    return `<span>OnShortCode Called With Args ${JSON.stringify(args)}</span>`;
  });
  

  before(async () => {
    patrika = await getPatrika({
      postsGlob: path.join(process.cwd(), "src", "fixtures", "content", "posts", "**", "*.md"),
      pagesGlob: path.join(process.cwd(), "src", "fixtures", "content", "pages", "**", "*.md"),
      getSlug: ({ filePath, attributes }) => attributes.title || path.basename(filePath).replace(/\.md$/, ""),
      onShortCode,
    });
  });

  test("onShortcode should be called when the shortcode is encountered.", async () => {
    // This is rather fragile test because only one of the files contains the shortcode at this
    // moment. If we ever add the shortcode to another file, this test will need to be updated.
    assert.strictEqual(onShortCode.mock.callCount, 1);
  });

  test("Item.body should include the return value from onShortCode", async () => {
    const item = (await patrika.find({ id: "fourth-one" }))[0];
    assert.strictEqual(item.body?.includes('<span>OnShortCode Called With Args {"foo":"bar","baz":"qux"}</span>'), true);
  });

  test("Patrika should expose the expected API", () => {
    assert.strictEqual(patrika.getPages instanceof Function, true);
    assert.strictEqual(patrika.getPosts instanceof Function, true);
    assert.strictEqual(patrika.find instanceof Function, true);
  });

  test("getPosts should return the correct number of posts", async () => {
    const posts = await patrika.getPosts();
    assert.strictEqual(Array.isArray(posts), true);
    assert.strictEqual(posts.length, 6);
  });

  test("getPosts should return the correct number of pages", async () => {
    const pages = await patrika.getPages();
    assert.strictEqual(Array.isArray(pages), true);
    assert.strictEqual(pages.length, 3);
  });

  test("find should return the correct number of ContentItems", async () => {
    const allItems = await patrika.find();
    assert.strictEqual(Array.isArray(allItems), true);
    assert.strictEqual(allItems.length, 9);

    const allPosts = await patrika.find({ type: "post" });
    assert.strictEqual(Array.isArray(allPosts), true);
    assert.strictEqual(allPosts.length, 6);

    const targetPost = (await patrika.find({ id: "post-one" }))[0];
    assert.strictEqual(targetPost.id, "post-one");
  });
});
