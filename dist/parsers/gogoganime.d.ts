import type { ISearch, IAnimeResult, IAnimeInfo, ISource, IEpisodeServer } from "../types/types";
import { type HttpError } from "http-errors";
import { StreamingServers } from "../types/types";
export declare const search: (query: string, page?: number) => Promise<ISearch<IAnimeResult> | HttpError>;
export declare const fetchAnimeInfo: (id: string) => Promise<IAnimeInfo | HttpError>;
export declare const fetchEpisodeSources: (episodeId: string, server?: StreamingServers, downloadUrl?: string | undefined) => Promise<ISource | HttpError>;
export declare const fetchEpisodeServers: (episodeId: string) => Promise<IEpisodeServer[] | HttpError>;
export declare const fetchRecentEpisodes: (page?: number, type?: number) => Promise<ISearch<IAnimeResult> | HttpError>;
export declare const fetchTopAiring: (page?: number) => Promise<ISearch<IAnimeResult> | HttpError>;
export declare const fetchGenreInfo: (genre: string, page?: number) => Promise<ISearch<IAnimeResult> | HttpError>;
export declare const fetchRecentMovies: (page?: number) => Promise<ISearch<IAnimeResult> | HttpError>;
export declare const fetchPopular: (page?: number) => Promise<ISearch<IAnimeResult> | HttpError>;
export declare const fetchNewSeason: (page?: number) => Promise<ISearch<IAnimeResult> | HttpError>;
export declare const fetchCompletedAnime: (page?: number) => Promise<ISearch<IAnimeResult> | HttpError>;
export declare const fetchGenreList: () => Promise<{
    id: string | undefined;
    title: string | undefined;
}[] | HttpError>;
export declare const fetchDirectDownloadLink: (downloadUrl: string, captchaToken?: string) => Promise<{
    source: string | undefined;
    link: string | undefined;
}[] | HttpError>;
export declare const fetchAnimeList: (page?: number) => Promise<ISearch<IAnimeResult> | HttpError>;
