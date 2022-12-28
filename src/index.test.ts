import { getPatrika } from ".";
import assert from "assert";

/*
At some point, I need to switch to Jest so that I can test getPatrika properly.
I could do that easily when we used CJS, but ESM requires module interception.
*/

describe("getPatrika", () => {
  it("should return an instance of Patrika", async () => {
    const patrika = await getPatrika({
      getSlug: () => "foo",
      pagesGlob: "/foo/bar/*.md",
      postsGlob: "goo/gaz/*.md",
    });
    const {
      getAll,
      getById,
      getPages,
      getPosts,
      getTags,
    } = patrika;

    assert.equal(typeof getAll, "function");
    assert.equal(typeof getById, "function");
    assert.equal(typeof getPages, "function");
    assert.equal(typeof getPosts, "function");
    assert.equal(typeof getTags, "function");
  });
});
