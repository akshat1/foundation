/**
 * Run using `yarn sandbox`, or use the launch configuration "Debug Sandbox" in VSCode.
 */
import { getPatrika } from "./src";
import path from "node:path";

const onShortCode = async (args: Record<string, unknown>) => {
  console.log("ShortCodeCalled!!!", args);
  return "<p>OnShortCode Called</p>";
  console.log("Huzzah!");
};

const main = async () => {
  const opts = {
    postsGlob: path.join(process.cwd(), "src", "fixtures", "content", "posts", "fourth.md"),
    pagesGlob: path.join(process.cwd(), "src","fixtures", "content", "foo", "**", "*.md"),
    /// @ts-ignore
    getSlug: ({ filePath, attributes }) => attributes.title || path.basename(filePath).replace(/\.md$/, ""),
    onShortCode,
  };
  console.log("Initialising Patrika with ", opts);
  const patrika = await getPatrika(opts);
  (await patrika.find({})).map((item) => console.log(item.body));
};
main();