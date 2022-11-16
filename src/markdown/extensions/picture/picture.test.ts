import { marked } from "marked";
import { strict as assert } from "assert";
import { GetPictureData, PictureData } from "../typedefs";
import { getPictureExtension } from ".";

describe("picture", () => {
  const samplePictureData: PictureData = {
    "(max-width: 799px)": "elva-480w-close-portrait.jpg",
    "(min-width: 800px)": "elva-800w.jpg",
  };

  const getPictureData:GetPictureData = (src) => src === "NORESULT" ? undefined : samplePictureData;
  marked.use(getPictureExtension({ getPictureData }));

  it("works correctly without picture data and no alt", async () => {
    const srcMD = `[Picture src="NORESULT"]`;
    const output = await marked(srcMD);
    assert.equal(output, `<p><img src="NORESULT" /></p>\n`);
  });

  it("works correctly without picture data", async () => {
    const srcMD = `[Picture src="NORESULT" alt="foo bar"]`;
    const output = await marked(srcMD);
    assert.equal(output, `<p><img src="NORESULT" alt="foo bar" /></p>\n`);
  });

  it("works correctly with picture data and no alt", async () => {
    const srcMD = `[Picture src="image URL"]`;
    const expectedOutput = [
      "<p>",
      "<picture>",
      `<source media="(max-width: 799px)" srcset="elva-480w-close-portrait.jpg" />`,
      `<source media="(min-width: 800px)" srcset="elva-800w.jpg" />`,
      `<img src="image URL" />`,
      "</picture>",
      "</p>\n",
    ].join("");
    const output = await marked(srcMD);
    assert.equal(output, expectedOutput);
  });

  it("works correctly with picture data and alt", async () => {
    const srcMD = `[Picture src="another image URL" alt="fubar"]`;
    const expectedOutput = [
      "<p>",
      "<picture>",
      `<source media="(max-width: 799px)" srcset="elva-480w-close-portrait.jpg" />`,
      `<source media="(min-width: 800px)" srcset="elva-800w.jpg" />`,
      `<img src="another image URL" alt="fubar" />`,
      "</picture>",
      "</p>\n",
    ].join("");
    const output = await marked(srcMD);
    assert.equal(output, expectedOutput);
  });
});
