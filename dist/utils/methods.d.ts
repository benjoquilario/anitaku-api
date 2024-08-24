import { type CheerioAPI } from "cheerio";
import { IAnimeResult } from "../types/types";
export declare const scrapeCard: ($: CheerioAPI, baseUrl: string, selector: string) => Array<IAnimeResult>;
export declare function retrieveServerId($: CheerioAPI, index: number, category: "sub" | "dub" | "raw"): string | null;
