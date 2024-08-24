import { IVideo } from "../types/types";
declare class StreamWish {
    protected serverName: string;
    protected sources: IVideo[];
    extract: (videoUrl: URL) => Promise<IVideo[]>;
}
export default StreamWish;
