import { Patrika } from "../../Patrika";

export type OnShortCode = (args: Record<string, unknown>, patrika: Patrika) => Promise<string>;
