import { getPatrika } from ".";
import { Patrika } from "./Patrika";
import path from "path";

describe("getPatrika", () => {
  let patrika: Patrika;
  const onShortCode = jest.fn(async (args) => {
    console.log("ShortCodeCalled!!! with args:", args);
    return "&lt;OnShortCode Called&gt;";
  });
  

  beforeAll(async () => {
    console.log("Someone kill me please");
    patrika = await getPatrika({
      postsGlob: path.join(__dirname, "fixtures", "content", "posts", "fourth.md"),
      pagesGlob: path.join(__dirname, "fixtures", "content", "foo", "**", "*.md"),
      getSlug: ({ filePath, attributes }) => attributes.title || path.basename(filePath).replace(/\.md$/, ""),
      onShortCode,
    });
  });

  test("KILLME", async () => {
    expect(onShortCode).toBeCalledTimes(1);
  });

  test("Patrika should expose the expected API", () => {
    expect(patrika.getPages).toBeInstanceOf(Function);
    expect(patrika.getPosts).toBeInstanceOf(Function);
    expect(patrika.find).toBeInstanceOf(Function);
  });

  test.skip("getPosts should return the correct number of posts", async () => {
    const posts = await patrika.getPosts();
    expect(posts).toBeInstanceOf(Array);
    expect(posts.length).toBe(6);
  });

  test.skip("getPosts should return the correct number of pages", async () => {
    const pages = await patrika.getPages();
    expect(pages).toBeInstanceOf(Array);
    expect(pages.length).toBe(3);
  });

  test.skip("find should return the correct number of ContentItems", async () => {
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
