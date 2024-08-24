import { IVideo } from "../types/types";
declare class StreamSB {
    protected serverName: string;
    protected sources: IVideo[];
    private readonly host;
    private readonly host2;
    private PAYLOAD;
    extract: (videoUrl: URL, isAlt?: boolean) => Promise<IVideo[]>;
    private addSources;
}
export default StreamSB;
