export type GetPostData = (args: {post?: string, property?: string}) => string|void;

/**
 * A dictionary, where keys are values for media attribute and values are srcset values.
 * @example
 * ```json
 * {
 *   "(max-width: 799px)": "elva-480w-close-portrait.jpg",
 *   "(min-width: 800px)": "elva-800w.jpg",
 * };
 * ```
 * This would result in the following HTML
 * ```html
 * <picture>
 *   <source media="(max-width: 799px)" srcset="elva-480w-close-portrait.jpg" />
 *   <source media="(min-width: 800px)" srcset="elva-800w.jpg" />
 *   <img src="elva-800w.jpg" alt="Chris standing up holding his daughter Elva" />
 * </picture>
 * ```
 */
 export type PictureData = Record<string, string>;
 export type GetPictureData = (imgSrc: string) => PictureData|undefined;
