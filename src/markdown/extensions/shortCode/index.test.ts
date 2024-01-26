import { GetShortCode } from "../typedefs";
import { getShortCodeExtension } from ".";
import { strict as assert } from "assert";
import { marked } from "marked";

describe("ShortCode", () => {
  const getShortCode: GetShortCode = (args) =>
    Object.keys(args)
      .sort()
      .map(prop => `${prop}=${args[prop]}`)
      .join("---");

  marked.use(getShortCodeExtension({ getShortCode }));

  it("works correctly standalone", async () => {
    const out = await marked('[P:SC handler="test" prop1="value1" prop2="value2"]')
    assert.equal(
      out,
      '<p>handler=test---prop1=value1---prop2=value2---raw=[P:SC handler="test" prop1="value1" prop2="value2"]---type=shortCode</p>\n'
    );
  });
});
