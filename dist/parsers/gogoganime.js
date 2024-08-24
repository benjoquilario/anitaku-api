"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAnimeList = exports.fetchDirectDownloadLink = exports.fetchGenreList = exports.fetchCompletedAnime = exports.fetchNewSeason = exports.fetchPopular = exports.fetchRecentMovies = exports.fetchGenreInfo = exports.fetchTopAiring = exports.fetchRecentEpisodes = exports.fetchEpisodeServers = exports.fetchEpisodeSources = exports.fetchAnimeInfo = exports.search = void 0;
const axios_1 = __importStar(require("axios"));
const cheerio_1 = require("cheerio");
const http_errors_1 = __importDefault(require("http-errors"));
const types_1 = require("../types/types");
const gogocdn_1 = __importDefault(require("../extractors/gogocdn"));
const streamsb_1 = __importDefault(require("../extractors/streamsb"));
const utils_1 = require("../utils");
const animeName = "Gogoanime";
const baseUrl = "https://anitaku.pe";
const logo = "https://play-lh.googleusercontent.com/MaGEiAEhNHAJXcXKzqTNgxqRmhuKB1rCUgb15UrN_mWUNRnLpO5T1qja64oRasO7mn0";
const classPath = "ANIME.Gogoanime";
const ajaxUrl = "https://ajax.gogocdn.net/ajax";
const search = async function (query, page = 1) {
    var _a, _b;
    const searchResult = {
        currentPage: page,
        hasNextPage: false,
        results: [],
    };
    try {
        const res = await axios_1.default.get(`${baseUrl}/filter.html?keyword=${encodeURIComponent(query)}&page=${page}`);
        const $ = (0, cheerio_1.load)(res.data);
        searchResult.hasNextPage =
            $("div.anime_name.new_series > div > div > ul > li.selected").next()
                .length > 0;
        $("div.last_episodes > ul > li").each((i, el) => {
            var _a;
            searchResult.results.push({
                id: (_a = $(el).find("p.name > a").attr("href")) === null || _a === void 0 ? void 0 : _a.split("/")[2],
                title: $(el).find("p.name > a").text(),
                url: `${baseUrl}/${$(el).find("p.name > a").attr("href")}`,
                image: $(el).find("div > a > img").attr("src"),
                releaseDate: $(el).find("p.released").text().trim(),
                subOrDub: $(el)
                    .find("p.name > a")
                    .text()
                    .toLowerCase()
                    .includes("(dub)")
                    ? types_1.SubOrSub.DUB
                    : types_1.SubOrSub.SUB,
            });
        });
        return searchResult;
    }
    catch (err) {
        if (err instanceof axios_1.AxiosError) {
            throw (0, http_errors_1.default)(((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.status) || 500, ((_b = err === null || err === void 0 ? void 0 : err.response) === null || _b === void 0 ? void 0 : _b.statusText) || "Something went wrong");
        }
        // @ts-ignore
        throw http_errors_1.default.InternalServerError(err === null || err === void 0 ? void 0 : err.message);
    }
};
exports.search = search;
const fetchAnimeInfo = async (id) => {
    var _a, _b;
    if (!id.includes("gogoanime"))
        id = `${baseUrl}/category/${id}`;
    const animeInfo = {
        id: "",
        title: "",
        url: "",
        genres: [],
        totalEpisodes: 0,
    };
    try {
        const res = await axios_1.default.get(id);
        const $ = (0, cheerio_1.load)(res.data);
        animeInfo.id = new URL(id).pathname.split("/")[2];
        animeInfo.title = $("section.content_left > div.main_body > div:nth-child(2) > div.anime_info_body_bg > h1")
            .text()
            .trim();
        animeInfo.url = id;
        animeInfo.image = $("div.anime_info_body_bg > img").attr("src");
        animeInfo.releaseDate = $("div.anime_info_body_bg > p:nth-child(8)")
            .text()
            .trim()
            .split("Released: ")[1];
        animeInfo.description = $("div.anime_info_body_bg > div:nth-child(6)")
            .text()
            .trim()
            .replace("Plot Summary: ", "");
        animeInfo.subOrDub = animeInfo.title.toLowerCase().includes("dub")
            ? types_1.SubOrSub.DUB
            : types_1.SubOrSub.SUB;
        animeInfo.type = $("div.anime_info_body_bg > p:nth-child(4) > a")
            .text()
            .trim()
            .toUpperCase();
        animeInfo.status = types_1.MediaStatus.UNKNOWN;
        switch ($("div.anime_info_body_bg > p:nth-child(9) > a").text().trim()) {
            case "Ongoing":
                animeInfo.status = types_1.MediaStatus.ONGOING;
                break;
            case "Completed":
                animeInfo.status = types_1.MediaStatus.COMPLETED;
                break;
            case "Upcoming":
                animeInfo.status = types_1.MediaStatus.NOT_YET_AIRED;
                break;
            default:
                animeInfo.status = types_1.MediaStatus.UNKNOWN;
                break;
        }
        animeInfo.otherName = $("div.anime_info_body_bg > p:nth-child(10)")
            .text()
            .replace("Other name: ", "")
            .replace(/;/g, ",");
        $("div.anime_info_body_bg > p:nth-child(7) > a").each((i, el) => {
            var _a;
            (_a = animeInfo.genres) === null || _a === void 0 ? void 0 : _a.push($(el).attr("title").toString());
        });
        const ep_start = $("#episode_page > li").first().find("a").attr("ep_start");
        const ep_end = $("#episode_page > li").last().find("a").attr("ep_end");
        const movie_id = $("#movie_id").attr("value");
        const alias = $("#alias_anime").attr("value");
        const html = await axios_1.default.get(`${ajaxUrl}/load-list-episode?ep_start=${ep_start}&ep_end=${ep_end}&id=${movie_id}&default_ep=${0}&alias=${alias}`);
        const $$ = (0, cheerio_1.load)(html.data);
        animeInfo.episodes = [];
        $$("#episode_related > li").each((i, el) => {
            var _a, _b, _c;
            (_a = animeInfo.episodes) === null || _a === void 0 ? void 0 : _a.push({
                id: (_b = $(el).find("a").attr("href")) === null || _b === void 0 ? void 0 : _b.split("/")[1],
                number: parseFloat($(el).find(`div.name`).text().replace("EP ", "")),
                url: `${baseUrl}/${(_c = $(el).find(`a`).attr("href")) === null || _c === void 0 ? void 0 : _c.trim()}`,
            });
        });
        animeInfo.episodes = animeInfo.episodes.reverse();
        animeInfo.totalEpisodes = parseInt(ep_end !== null && ep_end !== void 0 ? ep_end : "0");
        return animeInfo;
    }
    catch (err) {
        if (err instanceof axios_1.AxiosError) {
            throw (0, http_errors_1.default)(((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.status) || 500, ((_b = err === null || err === void 0 ? void 0 : err.response) === null || _b === void 0 ? void 0 : _b.statusText) || "Something went wrong");
        }
        // @ts-ignore
        throw http_errors_1.default.InternalServerError(err === null || err === void 0 ? void 0 : err.message);
    }
};
exports.fetchAnimeInfo = fetchAnimeInfo;
const fetchEpisodeSources = async (episodeId, server = types_1.StreamingServers.VidStreaming, downloadUrl = undefined) => {
    var _a, _b;
    if (episodeId.startsWith("http")) {
        const serverUrl = new URL(episodeId);
        switch (server) {
            case types_1.StreamingServers.GogoCDN:
                return {
                    headers: { Referer: serverUrl.href },
                    sources: await new gogocdn_1.default().extract(serverUrl),
                    download: downloadUrl
                        ? downloadUrl
                        : `https://${serverUrl.host}/download${serverUrl.search}`,
                };
            case types_1.StreamingServers.StreamSB:
                return {
                    headers: {
                        Referer: serverUrl.href,
                        watchsb: "streamsb",
                        "User-Agent": utils_1.USER_AGENT,
                    },
                    sources: await new streamsb_1.default().extract(serverUrl),
                    download: downloadUrl
                        ? downloadUrl
                        : `https://${serverUrl.host}/download${serverUrl.search}`,
                };
            case types_1.StreamingServers.StreamWish:
                return {
                    headers: {
                        Referer: serverUrl.href,
                    },
                    sources: await new streamsb_1.default().extract(serverUrl),
                    download: downloadUrl
                        ? downloadUrl
                        : `https://${serverUrl.host}/download${serverUrl.search}`,
                };
            default:
                return {
                    headers: { Referer: serverUrl.href },
                    sources: await new gogocdn_1.default().extract(serverUrl),
                    download: downloadUrl
                        ? downloadUrl
                        : `https://${serverUrl.host}/download${serverUrl.search}`,
                };
        }
    }
    try {
        const res = await axios_1.default.get(`${baseUrl}/${episodeId}`);
        const $ = (0, cheerio_1.load)(res.data);
        let serverUrl;
        switch (server) {
            case types_1.StreamingServers.GogoCDN:
                serverUrl = new URL(`${$("#load_anime > div > div > iframe").attr("src")}`);
                break;
            case types_1.StreamingServers.VidStreaming:
                serverUrl = new URL(`${$("div.anime_video_body > div.anime_muti_link > ul > li.vidcdn > a").attr("data-video")}`);
                break;
            case types_1.StreamingServers.StreamSB:
                serverUrl = new URL($("div.anime_video_body > div.anime_muti_link > ul > li.streamsb > a").attr("data-video"));
                break;
            case types_1.StreamingServers.StreamWish:
                serverUrl = new URL($("div.anime_video_body > div.anime_muti_link > ul > li.streamwish > a").attr("data-video"));
                break;
            default:
                serverUrl = new URL(`${$("#load_anime > div > div > iframe").attr("src")}`);
                break;
        }
        const downloadLink = `${$(".dowloads > a").attr("href")}`;
        return downloadLink
            ? await (0, exports.fetchEpisodeSources)(serverUrl.href, server, downloadLink)
            : await (0, exports.fetchEpisodeSources)(serverUrl.href, server);
    }
    catch (err) {
        console.log(err);
        if (err instanceof axios_1.AxiosError) {
            throw (0, http_errors_1.default)(((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.status) || 500, ((_b = err === null || err === void 0 ? void 0 : err.response) === null || _b === void 0 ? void 0 : _b.statusText) || "Something went wrong");
        }
        // @ts-ignore
        throw http_errors_1.default.InternalServerError(err === null || err === void 0 ? void 0 : err.message);
    }
};
exports.fetchEpisodeSources = fetchEpisodeSources;
const fetchEpisodeServers = async (episodeId) => {
    var _a, _b;
    try {
        if (!episodeId.startsWith(baseUrl))
            episodeId = `${baseUrl}/${episodeId}`;
        const res = await axios_1.default.get(episodeId);
        const $ = (0, cheerio_1.load)(res.data);
        const servers = [];
        $("div.anime_video_body > div.anime_muti_link > ul > li").each((i, el) => {
            let url = $(el).find("a").attr("data-video");
            if (!(url === null || url === void 0 ? void 0 : url.startsWith("http")))
                url = `https:${url}`;
            servers.push({
                name: $(el).find("a").text().replace("Choose this server", "").trim(),
                url: url,
            });
        });
        return servers;
    }
    catch (err) {
        if (err instanceof axios_1.AxiosError) {
            throw (0, http_errors_1.default)(((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.status) || 500, ((_b = err === null || err === void 0 ? void 0 : err.response) === null || _b === void 0 ? void 0 : _b.statusText) || "Something went wrong");
        }
        // @ts-ignore
        throw http_errors_1.default.InternalServerError(err === null || err === void 0 ? void 0 : err.message);
    }
};
exports.fetchEpisodeServers = fetchEpisodeServers;
const fetchRecentEpisodes = async (page = 1, type = 1) => {
    var _a, _b;
    try {
        const res = await axios_1.default.get(`${ajaxUrl}/page-recent-release.html?page=${page}&type=${type}`);
        const $ = (0, cheerio_1.load)(res.data);
        const recentEpisodes = [];
        $("div.last_episodes.loaddub > ul > li").each((i, el) => {
            var _a, _b, _c, _d;
            recentEpisodes.push({
                id: (_b = (_a = $(el).find("a").attr("href")) === null || _a === void 0 ? void 0 : _a.split("/")[1]) === null || _b === void 0 ? void 0 : _b.split("-episode")[0],
                episodeId: (_c = $(el).find("a").attr("href")) === null || _c === void 0 ? void 0 : _c.split("/")[1],
                episodeNumber: parseFloat($(el).find("p.episode").text().replace("Episode ", "")),
                title: $(el).find("p.name > a").attr("title"),
                image: $(el).find("div > a > img").attr("src"),
                url: `${baseUrl}${(_d = $(el).find("a").attr("href")) === null || _d === void 0 ? void 0 : _d.trim()}`,
            });
        });
        const hasNextPage = !$("div.anime_name_pagination.intro > div > ul > li")
            .last()
            .hasClass("selected");
        return {
            currentPage: page,
            hasNextPage: hasNextPage,
            results: recentEpisodes,
        };
    }
    catch (err) {
        if (err instanceof axios_1.AxiosError) {
            throw (0, http_errors_1.default)(((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.status) || 500, ((_b = err === null || err === void 0 ? void 0 : err.response) === null || _b === void 0 ? void 0 : _b.statusText) || "Something went wrong");
        }
        // @ts-ignore
        throw http_errors_1.default.InternalServerError(err === null || err === void 0 ? void 0 : err.message);
    }
};
exports.fetchRecentEpisodes = fetchRecentEpisodes;
const fetchTopAiring = async (page = 1) => {
    var _a, _b;
    try {
        const res = await axios_1.default.get(`${ajaxUrl}/page-recent-release-ongoing.html?page=${page}`);
        const $ = (0, cheerio_1.load)(res.data);
        const topAiring = [];
        $("div.added_series_body.popular > ul > li").each((i, el) => {
            var _a, _b;
            topAiring.push({
                id: (_a = $(el).find("a:nth-child(1)").attr("href")) === null || _a === void 0 ? void 0 : _a.split("/")[2],
                title: $(el).find("a:nth-child(1)").attr("title"),
                image: (_b = $(el)
                    .find("a:nth-child(1) > div")
                    .attr("style")) === null || _b === void 0 ? void 0 : _b.match("(https?://.*.(?:png|jpg))")[0],
                url: `${baseUrl}${$(el).find("a:nth-child(1)").attr("href")}`,
                genres: $(el)
                    .find("p.genres > a")
                    .map((i, el) => $(el).attr("title"))
                    .get(),
            });
        });
        const hasNextPage = !$("div.anime_name.comedy > div > div > ul > li")
            .last()
            .hasClass("selected");
        return {
            currentPage: page,
            hasNextPage: hasNextPage,
            results: topAiring,
        };
    }
    catch (err) {
        if (err instanceof axios_1.AxiosError) {
            throw (0, http_errors_1.default)(((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.status) || 500, ((_b = err === null || err === void 0 ? void 0 : err.response) === null || _b === void 0 ? void 0 : _b.statusText) || "Something went wrong");
        }
        // @ts-ignore
        throw http_errors_1.default.InternalServerError(err === null || err === void 0 ? void 0 : err.message);
    }
};
exports.fetchTopAiring = fetchTopAiring;
const fetchGenreInfo = async (genre, page = 1) => {
    var _a, _b;
    try {
        const res = await axios_1.default.get(`${baseUrl}/genre/${genre}?page=${page}`);
        const $ = (0, cheerio_1.load)(res.data);
        const genreInfo = [];
        $("div.last_episodes > ul > li").each((i, elem) => {
            var _a;
            genreInfo.push({
                id: (_a = $(elem).find("p.name > a").attr("href")) === null || _a === void 0 ? void 0 : _a.split("/")[2],
                title: $(elem).find("p.name > a").text(),
                image: $(elem).find("div > a > img").attr("src"),
                released: $(elem)
                    .find("p.released")
                    .text()
                    .replace("Released: ", "")
                    .trim(),
                url: baseUrl + "/" + $(elem).find("p.name > a").attr("href"),
            });
        });
        const paginatorDom = $("div.anime_name_pagination > div > ul > li");
        const hasNextPage = paginatorDom.length > 0 && !paginatorDom.last().hasClass("selected");
        return {
            currentPage: page,
            hasNextPage: hasNextPage,
            results: genreInfo,
        };
    }
    catch (err) {
        if (err instanceof axios_1.AxiosError) {
            throw (0, http_errors_1.default)(((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.status) || 500, ((_b = err === null || err === void 0 ? void 0 : err.response) === null || _b === void 0 ? void 0 : _b.statusText) || "Something went wrong");
        }
        // @ts-ignore
        throw http_errors_1.default.InternalServerError(err === null || err === void 0 ? void 0 : err.message);
    }
};
exports.fetchGenreInfo = fetchGenreInfo;
const fetchRecentMovies = async (page = 1) => {
    var _a, _b;
    try {
        const res = await axios_1.default.get(`${baseUrl}/anime-movies.html?aph&page=${page}`);
        const $ = (0, cheerio_1.load)(res.data);
        const recentMovies = [];
        $("div.last_episodes > ul > li").each((i, el) => {
            var _a;
            const a = $(el).find("p.name > a");
            const pRelease = $(el).find("p.released");
            const pName = $(el).find("p.name > a");
            recentMovies.push({
                id: (_a = a.attr("href")) === null || _a === void 0 ? void 0 : _a.replace(`/category/`, ""),
                title: pName.text(),
                releaseDate: pRelease.text().replace("Released: ", "").trim(),
                image: $(el).find("div > a > img").attr("src"),
                url: `${baseUrl}${a.attr("href")}`,
            });
        });
        const hasNextPage = !$("div.anime_name.anime_movies > div > div > ul > li")
            .last()
            .hasClass("selected");
        return {
            currentPage: page,
            hasNextPage: hasNextPage,
            results: recentMovies,
        };
    }
    catch (err) {
        console.log(err);
        if (err instanceof axios_1.AxiosError) {
            throw (0, http_errors_1.default)(((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.status) || 500, ((_b = err === null || err === void 0 ? void 0 : err.response) === null || _b === void 0 ? void 0 : _b.statusText) || "Something went wrong");
        }
        // @ts-ignore
        throw http_errors_1.default.InternalServerError(err === null || err === void 0 ? void 0 : err.message);
    }
};
exports.fetchRecentMovies = fetchRecentMovies;
const fetchPopular = async (page = 1) => {
    var _a, _b;
    try {
        const res = await axios_1.default.get(`${baseUrl}/popular.html?page=${page}`);
        const $ = (0, cheerio_1.load)(res.data);
        const recentMovies = [];
        $("div.last_episodes > ul > li").each((i, el) => {
            var _a;
            const a = $(el).find("p.name > a");
            const pRelease = $(el).find("p.released");
            const pName = $(el).find("p.name > a");
            recentMovies.push({
                id: (_a = a.attr("href")) === null || _a === void 0 ? void 0 : _a.replace(`/category/`, ""),
                title: pName.text(),
                releaseDate: pRelease.text().replace("Released: ", "").trim(),
                image: $(el).find("div > a > img").attr("src"),
                url: `${baseUrl}${a.attr("href")}`,
            });
        });
        const hasNextPage = !$("div.anime_name.anime_movies > div > div > ul > li")
            .last()
            .hasClass("selected");
        return {
            currentPage: page,
            hasNextPage: hasNextPage,
            results: recentMovies,
        };
    }
    catch (err) {
        console.log(err);
        if (err instanceof axios_1.AxiosError) {
            throw (0, http_errors_1.default)(((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.status) || 500, ((_b = err === null || err === void 0 ? void 0 : err.response) === null || _b === void 0 ? void 0 : _b.statusText) || "Something went wrong");
        }
        // @ts-ignore
        throw http_errors_1.default.InternalServerError(err === null || err === void 0 ? void 0 : err.message);
    }
};
exports.fetchPopular = fetchPopular;
const fetchNewSeason = async (page = 1) => {
    var _a, _b;
    try {
        const res = await axios_1.default.get(`${baseUrl}/new-season.html?page=${page}`);
        const $ = (0, cheerio_1.load)(res.data);
        const newSeason = [];
        $("div.last_episodes > ul > li").each((i, el) => {
            var _a;
            const a = $(el).find("p.name > a");
            const pRelease = $(el).find("p.released");
            const pName = $(el).find("p.name > a");
            newSeason.push({
                id: (_a = a.attr("href")) === null || _a === void 0 ? void 0 : _a.replace(`/category/`, ""),
                title: pName.text(),
                releaseDate: pRelease.text().replace("Released: ", "").trim(),
                image: $(el).find("div > a > img").attr("src"),
                url: `${baseUrl}${a.attr("href")}`,
            });
        });
        const hasNextPage = !$("div.anime_name.anime_movies > div > div > ul > li")
            .last()
            .hasClass("selected");
        return {
            currentPage: page,
            hasNextPage: hasNextPage,
            results: newSeason,
        };
    }
    catch (err) {
        console.log(err);
        if (err instanceof axios_1.AxiosError) {
            throw (0, http_errors_1.default)(((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.status) || 500, ((_b = err === null || err === void 0 ? void 0 : err.response) === null || _b === void 0 ? void 0 : _b.statusText) || "Something went wrong");
        }
        // @ts-ignore
        throw http_errors_1.default.InternalServerError(err === null || err === void 0 ? void 0 : err.message);
    }
};
exports.fetchNewSeason = fetchNewSeason;
const fetchCompletedAnime = async (page = 1) => {
    var _a, _b;
    try {
        const res = await axios_1.default.get(`${baseUrl}/completed-anime.html?page=${page}`);
        const $ = (0, cheerio_1.load)(res.data);
        const completedAnime = [];
        $("div.last_episodes > ul > li").each((i, el) => {
            var _a;
            const a = $(el).find("p.name > a");
            const pRelease = $(el).find("p.released");
            const pName = $(el).find("p.name > a");
            completedAnime.push({
                id: (_a = a.attr("href")) === null || _a === void 0 ? void 0 : _a.replace(`/category/`, ""),
                title: pName.text(),
                releaseDate: pRelease.text().replace("Released: ", "").trim(),
                image: $(el).find("div > a > img").attr("src"),
                url: `${baseUrl}${a.attr("href")}`,
            });
        });
        const hasNextPage = !$("div.anime_name.anime_movies > div > div > ul > li")
            .last()
            .hasClass("selected");
        return {
            currentPage: page,
            hasNextPage: hasNextPage,
            results: completedAnime,
        };
    }
    catch (err) {
        console.log(err);
        if (err instanceof axios_1.AxiosError) {
            throw (0, http_errors_1.default)(((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.status) || 500, ((_b = err === null || err === void 0 ? void 0 : err.response) === null || _b === void 0 ? void 0 : _b.statusText) || "Something went wrong");
        }
        // @ts-ignore
        throw http_errors_1.default.InternalServerError(err === null || err === void 0 ? void 0 : err.message);
    }
};
exports.fetchCompletedAnime = fetchCompletedAnime;
const fetchGenreList = async () => {
    var _a, _b;
    const genres = [];
    let res = null;
    try {
        res = await axios_1.default.get(`${baseUrl}/home.html`);
    }
    catch (err) {
        try {
            res = await axios_1.default.get(`${baseUrl}/`);
        }
        catch (error) {
            throw new Error("Something went wrong. Please try again later.");
        }
    }
    try {
        const $ = (0, cheerio_1.load)(res.data);
        $("nav.menu_series.genre.right > ul > li").each((_index, element) => {
            var _a;
            const genre = $(element).find("a");
            genres.push({
                id: (_a = genre.attr("href")) === null || _a === void 0 ? void 0 : _a.replace("/genre/", ""),
                title: genre.attr("title"),
            });
        });
        return genres;
    }
    catch (err) {
        if (err instanceof axios_1.AxiosError) {
            throw (0, http_errors_1.default)(((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.status) || 500, ((_b = err === null || err === void 0 ? void 0 : err.response) === null || _b === void 0 ? void 0 : _b.statusText) || "Something went wrong");
        }
        // @ts-ignore
        throw http_errors_1.default.InternalServerError(err === null || err === void 0 ? void 0 : err.message);
    }
};
exports.fetchGenreList = fetchGenreList;
const fetchDirectDownloadLink = async (downloadUrl, captchaToken) => {
    var _a, _b;
    const downloadLinks = [];
    const baseUrl = downloadUrl.split("?")[0];
    const idParam = downloadUrl.match(/[?&]id=([^&]+)/);
    const animeID = idParam ? idParam[1] : null;
    if (!captchaToken)
        captchaToken =
            "03AFcWeA5zy7DBK82U_tctVKelJ6L2duTWac5at2zXjHLX8XqUm8tI6NKWMxGd2gjh1vi2hnEyRhVgbMhdb9WjexRsJkxTt-C-_iIIZ5yC3E5I19G5Q0buSTcIQIZS6tskrz-mDn-d37aWxAJtqbg0Yoo1XsdVc5Yf4sB-9iQxQK-W_9YLep_QaAz8uL17gMMlCz5WZM3dbBEEGmk_qPbJu_pZ8kk-lFPDzd6iBobcpyIDRZgTgD4bYUnby5WZc11i00mrRiRS3m-qSY0lprGaBqoyY1BbRkQZ25AGPp5al4kSwBZqpcVgLrs3bjdo8XVWAe73_XLa8HhqLWbz_m5Ebyl5F9awwL7w4qikGj-AK7v2G8pgjT22kDLIeenQ_ss4jYpmSzgnuTItur9pZVzpPkpqs4mzr6y274AmJjzppRTDH4VFtta_E02-R7Hc1rUD2kCYt9BqsD7kDjmetnvLtBm97q5XgBS8rQfeH4P-xqiTAsJwXlcrPybSjnwPEptqYCPX5St_BSj4NQfSuzZowXu_qKsP4hAaE9L2W36MvqePPlEm6LChBT3tnqUwcEYNe5k7lkAAbunxx8q_X5Q3iEdcFqt9_0GWHebRBd5abEbjbmoqqCoQeZt7AUvkXCRfBDne-bf25ypyTtwgyuvYMYXau3zGUjgPUO9WIotZwyKyrYmjsZJ7TiM";
    let res = null;
    try {
        res = await axios_1.default.get(`${baseUrl}?id=${animeID}&captcha_v3=${captchaToken}`);
    }
    catch (err) {
        throw new Error("Something went wrong. Please try again later.");
    }
    try {
        const $ = (0, cheerio_1.load)(res.data);
        $(".dowload").each((_index, element) => {
            const link = $(element).find("a");
            if (link.attr("target") != "_blank") {
                downloadLinks.push({ source: link.text(), link: link.attr("href") });
            }
        });
        return downloadLinks;
    }
    catch (err) {
        if (err instanceof axios_1.AxiosError) {
            throw (0, http_errors_1.default)(((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.status) || 500, ((_b = err === null || err === void 0 ? void 0 : err.response) === null || _b === void 0 ? void 0 : _b.statusText) || "Something went wrong");
        }
        // @ts-ignore
        throw http_errors_1.default.InternalServerError(err === null || err === void 0 ? void 0 : err.message);
    }
};
exports.fetchDirectDownloadLink = fetchDirectDownloadLink;
const fetchAnimeList = async (page = 1) => {
    var _a, _b;
    const animeList = [];
    let res = null;
    try {
        res = await axios_1.default.get(`${baseUrl}/anime-list.html?page=${page}`);
        const $ = (0, cheerio_1.load)(res.data);
        $(".anime_list_body .listing li").each((_index, element) => {
            var _a;
            const genres = [];
            const entryBody = $("p.type", $(element).attr("title"));
            const genresEl = entryBody.first();
            genresEl.find("a").each((_idx, genreAnchor) => {
                genres.push($(genreAnchor).attr("title"));
            });
            const releaseDate = $(entryBody.get(1)).text();
            const img = $("div", $(element).attr("title"));
            const a = $(element).find("a");
            animeList.push({
                id: (_a = a.attr("href")) === null || _a === void 0 ? void 0 : _a.replace(`/category/`, ""),
                title: a.text(),
                image: $(img).find("img").attr("src"),
                url: `${baseUrl}${a.attr("href")}`,
                genres,
                releaseDate,
            });
        });
        const hasNextPage = !$("div.anime_name.anime_list > div > div > ul > li")
            .last()
            .hasClass("selected");
        return {
            currentPage: page,
            hasNextPage: hasNextPage,
            results: animeList,
        };
    }
    catch (err) {
        if (err instanceof axios_1.AxiosError) {
            throw (0, http_errors_1.default)(((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.status) || 500, ((_b = err === null || err === void 0 ? void 0 : err.response) === null || _b === void 0 ? void 0 : _b.statusText) || "Something went wrong");
        }
        // @ts-ignore
        throw http_errors_1.default.InternalServerError(err === null || err === void 0 ? void 0 : err.message);
    }
};
exports.fetchAnimeList = fetchAnimeList;
//# sourceMappingURL=gogoganime.js.map