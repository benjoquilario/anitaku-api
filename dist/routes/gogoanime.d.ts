import type { ISearch, IAnimeResult, IAnimeInfo, ISource, IEpisodeServer } from "../types/types";
import { StreamingServers } from "../types/types";
export declare const search: (query: string, page?: number) => Promise<ISearch<IAnimeResult>>;
export declare const fetchAnimeInfo: (id: string) => Promise<IAnimeInfo>;
export declare const fetchEpisodeSources: (episodeId: string, server?: StreamingServers, downloadUrl?: string | undefined) => Promise<ISource>;
export declare const fetchEpisodeServers: (episodeId: string) => Promise<IEpisodeServer[]>;
export declare const fetchRecentEpisodes: (page?: number, type?: number) => Promise<ISearch<IAnimeResult>>;
export declare const fetchTopAiring: (page?: number) => Promise<ISearch<IAnimeResult>>;
export declare const fetchGenreInfo: (genre: string, page?: number) => Promise<ISearch<IAnimeResult>>;
export declare const fetchRecentMovies: (page?: number) => Promise<ISearch<IAnimeResult>>;
export declare const fetchPopular: (page?: number) => Promise<ISearch<IAnimeResult>>;
export declare const fetchNewSeason: (page?: number) => Promise<ISearch<IAnimeResult>>;
export declare const fetchCompletedAnime: (page?: number) => Promise<ISearch<IAnimeResult>>;
export declare const fetchGenreList: () => Promise<{
    id: string | undefined;
    title: string | undefined;
}[]>;
export declare const fetchDirectDownloadLink: (downloadUrl: string, captchaToken?: string) => Promise<{
    source: string | undefined;
    link: string | undefined;
}[]>;
export declare const fetchAnimeList: (page?: number) => Promise<ISearch<IAnimeResult>>;
