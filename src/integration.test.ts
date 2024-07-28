import { getPatrika } from ".";
import { Patrika } from "./Patrika";
import path from "path";

describe("getPatrika", () => {
  let patrika: Patrika;
  const onShortCode = jest.fn(async (args) => {
    return `<span>OnShortCode Called With Args ${JSON.stringify(args)}</span>`;
  });
  

  beforeAll(async () => {
    patrika = await getPatrika({
      postsGlob: path.join(process.cwd(), "src", "fixtures", "content", "posts", "**", "*.md"),
      pagesGlob: path.join(process.cwd(), "src", "fixtures", "content", "pages", "**", "*.md"),
      getSlug: ({ filePath, attributes }) => attributes.title || path.basename(filePath).replace(/\.md$/, ""),
      onShortCode,
    });
  });

  test("onShortcode should be called when the shortcode is encountered.", async () => {
    // This is rather delicate test because only one of the files contains the shortcode at this
    // moment. If we ever add the shortcode to another file, this test will need to be updated.
    expect(onShortCode).toBeCalledTimes(1);
  });

  test("Item.body should include the return value from onShortCode", async () => {
    const item = (await patrika.find({ id: "fourth-one" }))[0];
    expect(item.body).toContain('<span>OnShortCode Called With Args {"foo":"bar","baz":"qux"}</span>');
  });

  test("Patrika should expose the expected API", () => {
    expect(patrika.getPages).toBeInstanceOf(Function);
    expect(patrika.getPosts).toBeInstanceOf(Function);
    expect(patrika.find).toBeInstanceOf(Function);
  });

  test("getPosts should return the correct number of posts", async () => {
    const posts = await patrika.getPosts();
    expect(posts).toBeInstanceOf(Array);
    expect(posts.length).toBe(6);
  });

  test("getPosts should return the correct number of pages", async () => {
    const pages = await patrika.getPages();
    expect(pages).toBeInstanceOf(Array);
    expect(pages.length).toBe(3);
  });

  test("find should return the correct number of ContentItems", async () => {
    const allItems = await patrika.find();
    expect(allItems).toBeInstanceOf(Array);
    expect(allItems.length).toBe(9);

    const allPosts = await patrika.find({ type: "post" });
    expect(allPosts).toBeInstanceOf(Array);
    expect(allPosts.length).toBe(6);

    const targetPost = (await patrika.find({ id: "post-one" }))[0];
    expect(targetPost.id).toBe("post-one");
  });
});
