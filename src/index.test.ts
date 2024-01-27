import { getPatrika } from ".";
import assert from "assert";

// TODO: Have more tests beyond just adhering to the interface (which TS checks anyway).
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
