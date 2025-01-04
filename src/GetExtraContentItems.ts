import { ContentItem } from "./ContentItem.js";
import { Patrika } from "./Patrika.js";

/**
 * For tags, categories, etc.
 * These won't go through the fileWalker function (which calls various callbacks to build ContentItems from markdown
 * files). `args.getExtraContentItems` must provide the fully fleshed out ContentItem as per the expectations of the
 * rendering code (i.e. `args.renderAllMarkdown`).
 */
export type getExtraContentItems = (patrika: Patrika) => Promise<ContentItem[]>;
