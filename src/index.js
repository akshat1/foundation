"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPatrika = exports.ContentItemType = void 0;
const ContentItem_1 = require("./ContentItem");
Object.defineProperty(exports, "ContentItemType", { enumerable: true, get: function () { return ContentItem_1.ContentItemType; } });
const fs_1 = require("fs");
const util_1 = require("util");
const glob_1 = require("glob");
const front_matter_1 = __importDefault(require("front-matter"));
const glob = (0, util_1.promisify)(glob_1.glob);
/**
 * @example
 * ```
 * // Example usage with Pequeno for one of the data files.
 * const { marked } = require("marked");
 * const slugify = require("slugify");
 * const path = require("path");
 *
 * module.exports = async () => {
 *  // in real usage you'd usually want to cache the instance and use it in all your data files.
 *  const patrika = await getPatrika({
 *    pagesGlob: path.join("content", "pages", "**", "*.md"),
 *    postsGlob: path.join("content", "posts", "**", "*.md"),
 *    getSlug: ({ filePath, fmData }) => fmData.attributes.title || slugify(path.basename(filePath).replace(/\.md$/, "")),
 *    toHTML: ({ markdown }) => marked(markdown),
 *  });
 *
 *  return patrika.getPages();
 * };
 * ```
 */
async function getPatrika(args) {
    const { postsGlob, pagesGlob, toHTML, getSlug, } = args;
    const tagsMap = new Map;
    const fileWalker = async (globPattern, type) => {
        const filePaths = await glob(globPattern);
        const items = [];
        for (const filePath of filePaths) {
            const stats = await fs_1.promises.stat(filePath);
            if (!stats.isFile()) {
                continue;
            }
            const markdown = (await fs_1.promises.readFile(filePath)).toString();
            const fmData = (0, front_matter_1.default)(markdown);
            const item = (0, ContentItem_1.toContentItem)({
                filePath,
                stats,
                fmData,
                getSlug,
                toHTML,
                type,
            });
            items.push(item);
            for (const tag of item.tags) {
                if (!tagsMap.has(tag)) {
                    tagsMap.set(tag, []);
                }
                tagsMap.get(tag).push(item);
            }
        }
        return items;
    };
    const pages = await fileWalker(pagesGlob, ContentItem_1.ContentItemType.Page);
    const posts = await fileWalker(postsGlob, ContentItem_1.ContentItemType.Post);
    return {
        getAll: () => [...pages, ...posts],
        getPages: () => pages,
        getPosts: () => posts,
        getTags: () => Array.from(tagsMap.keys()),
    };
}
exports.getPatrika = getPatrika;
