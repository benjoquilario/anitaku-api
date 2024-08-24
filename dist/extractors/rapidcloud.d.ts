import { IVideo, ISubtitle } from "../types/types";
declare type extractReturn = {
    sources: IVideo[];
    subtitles: ISubtitle[];
};
declare class RapidCloud {
    private serverName;
    private sources;
    private readonly fallbackKey;
    private readonly host;
    extract(videoUrl: URL): Promise<extractReturn>;
}
export default RapidCloud;
