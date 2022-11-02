"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toContentItem = exports.ContentItemType = void 0;
var ContentItemType;
(function (ContentItemType) {
    ContentItemType["Page"] = "page";
    ContentItemType["Post"] = "post";
})(ContentItemType = exports.ContentItemType || (exports.ContentItemType = {}));
;
;
const getPublishDate = (args) => {
    // Use file creation time as a fallback.
    const strDate = args.attributes?.publishDate || args.stats.ctime;
    if (strDate) {
        const date = new Date(strDate);
        return date.toISOString().replace(/T.*$/, "");
    }
    return null;
};

const toContentItem = (args) => {
    const { filePath, fmData, getSlug, stats, toHTML, type, } = args;
    const { attributes, body: markdown, } = fmData;
    const { author, collections, draft = false, tags, title, } = attributes;
    return {
        author,
        collections,
        publishedDate: getPublishDate({ attributes, stats }),
        draft,
        html: toHTML({ markdown }),
        markdown,
        slug: getSlug({ filePath, fmData, type }),
        tags,
        title,
        type,
    };
};
exports.toContentItem = toContentItem;
