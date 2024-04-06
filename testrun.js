/* eslint-disable */
const { getPatrika } = require("./lib/");
const path = require("path");

const main = async () => {
  console.log("HEllo");
  const patrika = await getPatrika({
    postsGlob: path.join(process.cwd(), "src", "fixtures", "content", "posts", "fourth.md"),
    pagesGlob: path.join(process.cwd(), "src", "fixtures", "content", "foo", "**", "*.md"),
    getSlug: ({ filePath, attributes }) => attributes.title || path.basename(filePath).replace(/\.md$/, ""),
    onShortCode: async (args) => {
      console.log("Shortcode", args);
      return "Shortcode output";
    },
  });
};

main();
