import { type IAnimeEpisode, IAnimeResult } from "../types/types";
export interface IScrapedAnimeEpisodes {
    totalEpisodes: number;
    episodes: Array<IAnimeEpisode & {
        episodeId: string;
    }>;
}
interface Server {
    serverName: string;
    serverId: number | string;
}
export interface IScrapedEpisodeServers {
    sub: Server[];
    dub: Server[];
    raw: Server[];
    episodeId: string;
    episodeNo: number;
}
export interface IScrapedAnimeMostView {
    today: {
        results: IAnimeResult[];
    };
    week: {
        results: IAnimeResult[];
    };
    month: {
        results: IAnimeResult[];
    };
}
export {};
