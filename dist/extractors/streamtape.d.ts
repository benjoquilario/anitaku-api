import type { IVideo } from "../types/types";
declare class StreamTape {
    private serverName;
    private sources;
    extract(videoUrl: URL): Promise<IVideo[]>;
}
export default StreamTape;
