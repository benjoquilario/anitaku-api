import { IVideo } from "../types/types";
declare class GogoCDN {
    protected serverName: string;
    protected sources: IVideo[];
    private readonly keys;
    private referer;
    extract: (videoUrl: URL) => Promise<IVideo[]>;
    private addSources;
    private generateEncryptedAjaxParams;
    private decryptAjaxData;
}
export default GogoCDN;
