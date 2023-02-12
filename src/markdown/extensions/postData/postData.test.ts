import { GetPostData } from "../typedefs";
import { getPostDataExtension } from ".";
import { strict as assert } from "assert";
import { promises as fs } from "fs";
import { marked } from "marked";

const getFixture = async (fixturePath: string): Promise<string> =>
  (await fs.readFile(fixturePath)).toString();

describe("PostData", () => {
  const getPostData: GetPostData = ({ post, property }) => {
    if (property === "slug") {
      return "https://www.site.com/post/url";
    }
    return `>${post}:${property}<`;
  }
  marked.use(getPostDataExtension({ getPostData }));

  it("works correctly standalone", async () => {
    // Multiple variations of spacing and capitalization for the same property and post.
    // We only accept double quotes (clearly my regexp game is lacking) for now, so no quote variations.
    const sources = [
      "[PostData property=\"title\" post=\"post-one\"]",
      "[PostData property = \"title\" post = \"post-one\"]",
      "[PostData property=\"title\" post = \"post-one\"]",
      "[PostData property  =      \"title\" post=   \"post-one\"]",
      "[pOstDatA pRopErty=\"title\" PoSt=\"post-one\"]",
    ];
    const expected = "<p>>post-one:title<</p>\n";
    for (const src of sources) {
      assert.equal(await marked(src), expected);
    }
  });

  it("works with other text", async () => {
    const src = await getFixture("./src/markdown/extensions/postData/fixtures/simple-with-text.md");
    const expected = await getFixture("./src/markdown/extensions/postData/fixtures/simple-with-text-expectation.html");
    assert.equal(await marked(src), expected);
  });
});
