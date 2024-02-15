import { ContentItem } from "./ContentItem";
import PicoDB from "picodb";

export interface Patrika {
  getPages(): Promise<ContentItem[]>;
  getPosts(): Promise<ContentItem[]>;
  find: (query?: Record<string, any>, projection?: Record<string, unknown>) => Promise<ContentItem[]>;
  /** WARNING, this will disappear _any_ time, _without_ warning. This is just to help the devs experiment and troubleshoot. */
  _db: PicoDB<ContentItem>;
}
