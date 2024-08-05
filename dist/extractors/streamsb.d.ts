import { IVideo } from "../types/types";
export declare const extract: (videoUrl: URL, isAlt?: boolean) => Promise<IVideo[]>;
export declare const addSources: (source: any) => void;
