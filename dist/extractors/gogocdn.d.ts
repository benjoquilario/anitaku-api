import { CheerioAPI } from "cheerio";
import { IVideo } from "../types/types";
export declare const generateEncryptedAjaxParams: ($: CheerioAPI, id: string) => Promise<string>;
export declare const addSources: (source: any) => Promise<void>;
export declare const decryptAjaxData: (encryptedData: string) => Promise<any>;
export declare const extract: (videoUrl: URL) => Promise<IVideo[]>;
