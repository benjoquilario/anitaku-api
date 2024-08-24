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
exports.fetchSearchSuggestion = exports.fetchAiringSchedule = exports.fetchMostView = exports.fetchTrending = exports.fetchSpotlight = exports.fetchStudio = exports.fetchTopUpcoming = exports.fetchLatestEpisodes = exports.fetchRecentlyAdded = exports.fetchLatestCompleted = exports.fetchMostFavorite = exports.fetchTopAiring = exports.fetchMostPopular = exports.fetchTvSeries = exports.fetchEpisodeServers = exports.fetchEpisodeSource = exports.fetchAnimeEpisodes = exports.fetchAnimeInfo = exports.search = void 0;
const axios_1 = __importStar(require("axios"));
const cheerio_1 = require("cheerio");
const http_errors_1 = __importDefault(require("http-errors"));
const types_1 = require("../types/types");
const dotenv_1 = require("dotenv");
const utils_1 = require("../utils");
const methods_1 = require("../utils/methods");
// import { MediaStatus, SubOrSub, StreamingServers } from "../types/types"
(0, dotenv_1.config)();
const baseUrl = "https://hianime.to";
async function scrapeCardPage(url) {
    var _a, _b, _c, _d, _e;
    const results = {
        currentPage: 0,
        hasNextPage: false,
        totalPages: 0,
        results: [],
    };
    try {
        const { data } = await axios_1.default.get(url, {
            headers: {
                "User-Agent": utils_1.USER_AGENT,
                "Accept-Encoding": utils_1.ACCEPT_ENCODING_HEADER,
                Accept: utils_1.ACCEPT_HEADER,
            },
        });
        const $ = (0, cheerio_1.load)(data);
        const selector = "#main-content .tab-content .film_list-wrap .flw-item";
        const pagination = $("ul.pagination");
        results.currentPage = parseInt((_a = pagination.find(".page-item.active")) === null || _a === void 0 ? void 0 : _a.text());
        const nextPage = (_b = pagination.find("a[title=Next]")) === null || _b === void 0 ? void 0 : _b.attr("href");
        if (nextPage != undefined && nextPage != "") {
            results.hasNextPage = true;
        }
        const totalPages = (_c = pagination
            .find("a[title=Last]")
            .attr("href")) === null || _c === void 0 ? void 0 : _c.split("=").pop();
        if (totalPages === undefined || totalPages === "") {
            results.totalPages = results.currentPage;
        }
        else {
            results.totalPages = parseInt(totalPages);
        }
        results.results = (0, methods_1.scrapeCard)($, baseUrl, selector);
        if (results.results.length === 0) {
            results.currentPage = 0;
            results.hasNextPage = false;
            results.totalPages = 0;
        }
        return results;
    }
    catch (err) {
        if (err instanceof axios_1.AxiosError) {
            throw (0, http_errors_1.default)(((_d = err === null || err === void 0 ? void 0 : err.response) === null || _d === void 0 ? void 0 : _d.status) || 500, ((_e = err === null || err === void 0 ? void 0 : err.response) === null || _e === void 0 ? void 0 : _e.statusText) || "Something went wrong");
        }
        // @ts-ignore
        throw http_errors_1.default.InternalServerError(err === null || err === void 0 ? void 0 : err.message);
    }
}
const search = async function (query, page = 1) {
    const url = `${baseUrl}/search?keyword=${decodeURIComponent(query)}&page=${page}`;
    return scrapeCardPage(url);
};
exports.search = search;
const fetchAnimeInfo = async (id) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    const results = {
        id: id,
        title: "",
    };
    try {
        const animeUrl = new URL(id, baseUrl);
        const { data } = await axios_1.default.get(animeUrl.href, {
            headers: {
                "User-Agent": utils_1.USER_AGENT,
                "Accept-Encoding": utils_1.ACCEPT_ENCODING_HEADER,
                Accept: utils_1.ACCEPT_HEADER,
            },
        });
        const $ = (0, cheerio_1.load)(data);
        const selector = "#ani_detail .container .anis-content";
        try {
            results.anilistId = Number((_c = JSON.parse((_b = (_a = $("body")) === null || _a === void 0 ? void 0 : _a.find("#syncData")) === null || _b === void 0 ? void 0 : _b.text())) === null || _c === void 0 ? void 0 : _c.anilist_id);
            results.malId = Number((_f = JSON.parse((_e = (_d = $("body")) === null || _d === void 0 ? void 0 : _d.find("#syncData")) === null || _e === void 0 ? void 0 : _e.text())) === null || _f === void 0 ? void 0 : _f.mal_id);
        }
        catch (err) {
            results.anilistId = null;
            results.malId = "";
        }
        results.title = (_j = (_h = (_g = $(selector)) === null || _g === void 0 ? void 0 : _g.find(".anisc-detail .film-name.dynamic-name")) === null || _h === void 0 ? void 0 : _h.text()) === null || _j === void 0 ? void 0 : _j.trim();
        results.japaneseTitle = $("div.anisc-info div:nth-child(2) span.name").text();
        results.image = $("img.film-poster-img").attr("src");
        results.description = $("div.film-description").text().trim();
        // Movie, TV, OVA, ONA, Special, Music
        results.type = $("span.item")
            .last()
            .prev()
            .prev()
            .text()
            .toUpperCase();
        results.url = `${baseUrl}/${id}`;
        const recommendationsSelector = "#main-content .block_area.block_area_category .tab-content .flw-item";
        results.recommendations = (0, methods_1.scrapeCard)($, baseUrl, recommendationsSelector);
        results.relatedAnime = [];
        $("#main-sidebar section:nth-child(1) div.anif-block-ul li").each((i, ele) => {
            var _a, _b, _c, _d, _e, _f, _g;
            const card = $(ele);
            const aTag = card.find(".film-name a");
            const id = (_a = aTag.attr("href")) === null || _a === void 0 ? void 0 : _a.split("/")[1].split("?")[0];
            results.relatedAnime.push({
                id: id,
                title: aTag.text(),
                url: `${baseUrl}${aTag.attr("href")}`,
                image: (_b = card.find("img")) === null || _b === void 0 ? void 0 : _b.attr("data-src"),
                japaneseTitle: aTag.attr("data-jname"),
                type: (_d = (_c = card
                    .find(".tick")
                    .contents()
                    .last()) === null || _c === void 0 ? void 0 : _c.text()) === null || _d === void 0 ? void 0 : _d.trim(),
                sub: parseInt((_e = card.find(".tick-item.tick-sub")) === null || _e === void 0 ? void 0 : _e.text()) || 0,
                dub: parseInt((_f = card.find(".tick-item.tick-dub")) === null || _f === void 0 ? void 0 : _f.text()) || 0,
                episodes: parseInt((_g = card.find(".tick-item.tick-eps")) === null || _g === void 0 ? void 0 : _g.text()) || 0,
            });
        });
        const hasSub = $("div.film-stats div.tick div.tick-item.tick-sub").length > 0;
        const hasDub = $("div.film-stats div.tick div.tick-item.tick-dub").length > 0;
        if (hasSub) {
            results.subOrDub = types_1.SubOrSub.SUB;
            results.hasSub = hasSub;
        }
        if (hasDub) {
            results.subOrDub = types_1.SubOrSub.DUB;
            results.hasDub = hasDub;
        }
        if (hasSub && hasDub) {
            results.subOrDub = types_1.SubOrSub.BOTH;
        }
        return results;
    }
    catch (err) {
        if (err instanceof axios_1.AxiosError) {
            throw (0, http_errors_1.default)(((_k = err === null || err === void 0 ? void 0 : err.response) === null || _k === void 0 ? void 0 : _k.status) || 500, ((_l = err === null || err === void 0 ? void 0 : err.response) === null || _l === void 0 ? void 0 : _l.statusText) || "Something went wrong");
        }
        // @ts-ignore
        throw http_errors_1.default.InternalServerError(err === null || err === void 0 ? void 0 : err.message);
    }
};
exports.fetchAnimeInfo = fetchAnimeInfo;
const fetchAnimeEpisodes = async (animeId) => {
    var _a, _b;
    const results = {
        totalEpisodes: 0,
        episodes: [],
    };
    try {
        const episodesAjax = await axios_1.default.get(`${baseUrl}/ajax/v2/episode/list/${animeId.split("-").pop()}`, {
            headers: {
                "X-Requested-With": "XMLHttpRequest",
                Referer: `${baseUrl}/watch/${animeId}`,
            },
        });
        const $$ = (0, cheerio_1.load)(episodesAjax.data.html);
        results.totalEpisodes = $$("div.detail-infor-content > div > a").length;
        $$("div.detail-infor-content > div > a").each((i, el) => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            const id = (_b = (_a = $$(el).attr("href")) === null || _a === void 0 ? void 0 : _a.split("/")[2]) === null || _b === void 0 ? void 0 : _b.replace("?ep=", "$ep$");
            const number = parseInt($$(el).attr("data-number"));
            const title = $$(el).attr("title");
            const url = baseUrl + $$(el).attr("href");
            const isFiller = $$(el).hasClass("ssl-item-filler");
            const episodeId = (_g = (_f = (_e = (_d = (_c = $$(el)) === null || _c === void 0 ? void 0 : _c.attr("href")) === null || _d === void 0 ? void 0 : _d.split("/")) === null || _e === void 0 ? void 0 : _e.pop()) === null || _f === void 0 ? void 0 : _f.split("?ep=")) === null || _g === void 0 ? void 0 : _g.pop();
            (_h = results.episodes) === null || _h === void 0 ? void 0 : _h.push({
                id: id,
                episodeId: episodeId,
                number: number,
                title: title,
                isFiller: isFiller,
                url: url,
            });
        });
        return results;
    }
    catch (err) {
        if (err instanceof axios_1.AxiosError) {
            throw (0, http_errors_1.default)(((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.status) || 500, ((_b = err === null || err === void 0 ? void 0 : err.response) === null || _b === void 0 ? void 0 : _b.statusText) || "Something went wrong");
        }
        // @ts-ignore
        throw http_errors_1.default.InternalServerError(err === null || err === void 0 ? void 0 : err.message);
    }
};
exports.fetchAnimeEpisodes = fetchAnimeEpisodes;
const megacloud_1 = __importDefault(require("../extractors/megacloud"));
const rapidcloud_1 = __importDefault(require("../extractors/rapidcloud"));
const streamsb_1 = __importDefault(require("../extractors/streamsb"));
const streamtape_1 = __importDefault(require("../extractors/streamtape"));
const fetchEpisodeSource = async (episodeId, server = types_1.StreamingServers.VidCloud, category = "sub") => {
    var _a, _b;
    if (episodeId.startsWith("http")) {
        const serverUrl = new URL(episodeId);
        switch (server) {
            case types_1.StreamingServers.VidStreaming:
            case types_1.StreamingServers.VidCloud:
                return {
                    ...(await new megacloud_1.default().extract(serverUrl)),
                };
            case types_1.StreamingServers.StreamSB:
                return {
                    headers: {
                        Referer: serverUrl.href,
                        watchsb: "streamsb",
                        "User-Agent": utils_1.USER_AGENT,
                    },
                    sources: await new streamsb_1.default().extract(serverUrl, true),
                };
            case types_1.StreamingServers.StreamTape:
                return {
                    headers: { Referer: serverUrl.href, "User-Agent": utils_1.USER_AGENT },
                    sources: await new streamtape_1.default().extract(serverUrl),
                };
            default: // vidcloud
                return {
                    headers: { Referer: serverUrl.href },
                    ...(await new rapidcloud_1.default().extract(serverUrl)),
                };
        }
    }
    const epId = `${baseUrl}/watch/${episodeId
        .replace("$ep$", "?ep=")
        .replace(/\$auto|\$sub|\$dub/gi, "")}`;
    try {
        const { data } = await axios_1.default.get(`${baseUrl}/ajax/v2/episode/servers?episodeId=${epId.split("?ep=")[1]}`, {
            headers: {
                Referer: epId,
                "User-Agent": utils_1.USER_AGENT,
                "X-Requested-With": "XMLHttpRequest",
            },
        });
        const $ = (0, cheerio_1.load)(data.html);
        let serverId = null;
        try {
            switch (server) {
                case types_1.StreamingServers.VidCloud: {
                    serverId = (0, methods_1.retrieveServerId)($, 1, category);
                    if (!serverId)
                        throw new Error("RapidCloud not found");
                    break;
                }
                case types_1.StreamingServers.VidStreaming: {
                    serverId = (0, methods_1.retrieveServerId)($, 4, category);
                    if (!serverId)
                        throw new Error("VidStreaming not found");
                    break;
                }
                case types_1.StreamingServers.StreamSB: {
                    serverId = (0, methods_1.retrieveServerId)($, 5, category);
                    if (!serverId)
                        throw new Error("StreamSB not found");
                    break;
                }
                case types_1.StreamingServers.StreamTape: {
                    serverId = (0, methods_1.retrieveServerId)($, 3, category);
                    if (!serverId)
                        throw new Error("StreamTape not found");
                    break;
                }
            }
        }
        catch (err) {
            throw http_errors_1.default.NotFound("Couldn't find server. Try another server");
        }
        const { data: { link }, } = await axios_1.default.get(`${baseUrl}/ajax/v2/episode/sources?id=${serverId}`);
        return await (0, exports.fetchEpisodeSource)(link, server);
    }
    catch (err) {
        if (err instanceof axios_1.AxiosError) {
            throw (0, http_errors_1.default)(((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.status) || 500, ((_b = err === null || err === void 0 ? void 0 : err.response) === null || _b === void 0 ? void 0 : _b.statusText) || "Something went wrong");
        }
        //@ts-ignore
        throw http_errors_1.default.InternalServerError(err === null || err === void 0 ? void 0 : err.message);
    }
};
exports.fetchEpisodeSource = fetchEpisodeSource;
const fetchEpisodeServers = async (episodeId) => {
    var _a, _b;
    const results = {
        sub: [],
        dub: [],
        raw: [],
        episodeId,
        episodeNo: 0,
    };
    try {
        const epId = episodeId.split("$ep$")[1];
        const { data } = await axios_1.default.get(`${baseUrl}/ajax/v2/episode/servers?episodeId=${epId}`, {
            headers: {
                Accept: utils_1.ACCEPT_HEADER,
                "User-Agent": utils_1.USER_AGENT,
                "X-Requested-With": "XMLHttpRequest",
                "Accept-Encoding": utils_1.ACCEPT_ENCODING_HEADER,
                Referer: `${baseUrl}/watch/${episodeId
                    .replace("$ep$", "?ep=")
                    .replace(/\$auto|\$sub|\$dub/gi, "")}`,
            },
        });
        const $ = (0, cheerio_1.load)(data.html);
        const epNoSelector = ".server-notice strong";
        results.episodeNo = Number($(epNoSelector).text().split(" ").pop()) || 0;
        $(`.ps_-block.ps_-block-sub.servers-sub .ps__-list .server-item`).each((_, el) => {
            var _a, _b;
            results.sub.push({
                serverName: $(el).find("a").text().toLowerCase().trim(),
                serverId: Number((_b = (_a = $(el)) === null || _a === void 0 ? void 0 : _a.attr("data-server-id")) === null || _b === void 0 ? void 0 : _b.trim()) || "",
            });
        });
        $(`.ps_-block.ps_-block-sub.servers-dub .ps__-list .server-item`).each((_, el) => {
            var _a, _b;
            results.dub.push({
                serverName: $(el).find("a").text().toLowerCase().trim(),
                serverId: Number((_b = (_a = $(el)) === null || _a === void 0 ? void 0 : _a.attr("data-server-id")) === null || _b === void 0 ? void 0 : _b.trim()) || "",
            });
        });
        $(`.ps_-block.ps_-block-sub.servers-raw .ps__-list .server-item`).each((_, el) => {
            var _a, _b;
            results.raw.push({
                serverName: $(el).find("a").text().toLowerCase().trim(),
                serverId: Number((_b = (_a = $(el)) === null || _a === void 0 ? void 0 : _a.attr("data-server-id")) === null || _b === void 0 ? void 0 : _b.trim()) || "",
            });
        });
        return results;
    }
    catch (err) {
        if (err instanceof axios_1.AxiosError) {
            throw (0, http_errors_1.default)(((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.status) || 500, ((_b = err === null || err === void 0 ? void 0 : err.response) === null || _b === void 0 ? void 0 : _b.statusText) || "Something went wrong");
        }
        //@ts-ignore
        throw http_errors_1.default.InternalServerError(err === null || err === void 0 ? void 0 : err.message);
    }
};
exports.fetchEpisodeServers = fetchEpisodeServers;
const fetchTvSeries = async function (page = 1) {
    const url = `${baseUrl}/tv?page=${page}`;
    return scrapeCardPage(url);
};
exports.fetchTvSeries = fetchTvSeries;
const fetchMostPopular = async function (page = 1) {
    const url = `${baseUrl}/most-popular?page=${page}`;
    return scrapeCardPage(url);
};
exports.fetchMostPopular = fetchMostPopular;
const fetchTopAiring = async function (page = 1) {
    const url = `${baseUrl}/top-airing?page=${page}`;
    return scrapeCardPage(url);
};
exports.fetchTopAiring = fetchTopAiring;
const fetchMostFavorite = async function (page = 1) {
    const url = `${baseUrl}/most-favorite?page=${page}`;
    return scrapeCardPage(url);
};
exports.fetchMostFavorite = fetchMostFavorite;
const fetchLatestCompleted = async function (page = 1) {
    const url = `${baseUrl}/completed?page=${page}`;
    return scrapeCardPage(url);
};
exports.fetchLatestCompleted = fetchLatestCompleted;
const fetchRecentlyAdded = async function (page = 1) {
    const url = `${baseUrl}/recently-added?page=${page}`;
    return scrapeCardPage(url);
};
exports.fetchRecentlyAdded = fetchRecentlyAdded;
const fetchLatestEpisodes = async function (page = 1) {
    const url = `${baseUrl}/recently-updated?page=${page}`;
    return scrapeCardPage(url);
};
exports.fetchLatestEpisodes = fetchLatestEpisodes;
const fetchTopUpcoming = async function (page = 1) {
    const url = `${baseUrl}/top-upcoming?page=${page}`;
    return scrapeCardPage(url);
};
exports.fetchTopUpcoming = fetchTopUpcoming;
const fetchStudio = async function (studio, page = 1) {
    const url = `${baseUrl}/producer/${studio}?page=${page}`;
    return scrapeCardPage(url);
};
exports.fetchStudio = fetchStudio;
const fetchSpotlight = async function () {
    var _a, _b;
    const results = {
        results: [],
    };
    try {
        const url = `${baseUrl}/home`;
        const { data } = await axios_1.default.get(url, {
            headers: {
                "User-Agent": utils_1.USER_AGENT,
                "Accept-Encoding": utils_1.ACCEPT_ENCODING_HEADER,
                Accept: utils_1.ACCEPT_HEADER,
            },
        });
        const $ = (0, cheerio_1.load)(data);
        const spotlightSelector = "#slider .swiper-wrapper .swiper-slide";
        $(spotlightSelector).each((i, el) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
            const otherInfo = $(el)
                .find(".deslide-item-content .sc-detail .scd-item")
                .map((i, el) => $(el).text().trim())
                .get()
                .slice(0, -1);
            const id = ((_b = (_a = $(el)
                .find("div.desi-buttons .btn-secondary")
                .attr("href")) === null || _a === void 0 ? void 0 : _a.match(/\/([^/]+)$/)) === null || _b === void 0 ? void 0 : _b[1]) || null;
            const img = $(el).find("img.film-poster-img");
            results.results.push({
                rank: Number((_c = $(el)
                    .find(".deslide-item-content .desi-sub-text")) === null || _c === void 0 ? void 0 : _c.text().trim().split(" ")[0].slice(1)) || null,
                id: id,
                title: (_d = $(el)
                    .find(".deslide-item-content .desi-head-title.dynamic-name")) === null || _d === void 0 ? void 0 : _d.text().trim(),
                description: (_h = (_g = (_f = (_e = $(el)
                    .find(".deslide-item-content .desi-description")) === null || _e === void 0 ? void 0 : _e.text()) === null || _f === void 0 ? void 0 : _f.split("[")) === null || _g === void 0 ? void 0 : _g.shift()) === null || _h === void 0 ? void 0 : _h.trim(),
                url: `${baseUrl}/${id}`,
                type: $(el)
                    .find("div.sc-detail .scd-item:nth-child(1)")
                    .text()
                    .trim(),
                banner: img.attr("data-src") || img.attr("src") || null,
                duration: $(el).find("div.sc-detail > div:nth-child(2)").text().trim(),
                releaseDate: $(el)
                    .find("div.sc-detail > div:nth-child(3)")
                    .text()
                    .trim(),
                japaneseTitle: (_k = (_j = $(el)
                    .find(".deslide-item-content .desi-head-title.dynamic-name")) === null || _j === void 0 ? void 0 : _j.attr("data-jname")) === null || _k === void 0 ? void 0 : _k.trim(),
                episodes: {
                    sub: Number((_m = (_l = $(el)
                        .find(".deslide-item-content .sc-detail .scd-item .tick-item.tick-sub")) === null || _l === void 0 ? void 0 : _l.text()) === null || _m === void 0 ? void 0 : _m.trim()) || 0,
                    dub: Number((_p = (_o = $(el)
                        .find(".deslide-item-content .sc-detail .scd-item .tick-item.tick-dub")) === null || _o === void 0 ? void 0 : _o.text()) === null || _p === void 0 ? void 0 : _p.trim()) || 0,
                },
                otherInfo,
            });
        });
        return results;
    }
    catch (err) {
        if (err instanceof axios_1.AxiosError) {
            throw (0, http_errors_1.default)(((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.status) || 500, ((_b = err === null || err === void 0 ? void 0 : err.response) === null || _b === void 0 ? void 0 : _b.statusText) || "Something went wrong");
        }
        // @ts-ignore
        throw http_errors_1.default.InternalServerError(err === null || err === void 0 ? void 0 : err.message);
    }
};
exports.fetchSpotlight = fetchSpotlight;
const fetchTrending = async function () {
    var _a, _b;
    const results = {
        results: [],
    };
    try {
        const url = `${baseUrl}/home`;
        const { data } = await axios_1.default.get(url, {
            headers: {
                "User-Agent": utils_1.USER_AGENT,
                "Accept-Encoding": utils_1.ACCEPT_ENCODING_HEADER,
                Accept: utils_1.ACCEPT_HEADER,
            },
        });
        const $ = (0, cheerio_1.load)(data);
        const trendingSelector = "#trending-home .swiper-wrapper .swiper-slide";
        $(trendingSelector).each((i, el) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
            const id = (_c = (_b = (_a = $(el)
                .find(".item .film-poster")) === null || _a === void 0 ? void 0 : _a.attr("href")) === null || _b === void 0 ? void 0 : _b.slice(1)) === null || _c === void 0 ? void 0 : _c.trim();
            results.results.push({
                rank: parseInt((_g = (_f = (_e = (_d = $(el).find(".item .number")) === null || _d === void 0 ? void 0 : _d.children()) === null || _e === void 0 ? void 0 : _e.first()) === null || _f === void 0 ? void 0 : _f.text()) === null || _g === void 0 ? void 0 : _g.trim()),
                id: id,
                title: (_j = (_h = $(el)
                    .find(".item .number .film-title.dynamic-name")) === null || _h === void 0 ? void 0 : _h.text()) === null || _j === void 0 ? void 0 : _j.trim(),
                japaneseTitle: (_l = (_k = $(el)
                    .find(".item .number .film-title.dynamic-name")) === null || _k === void 0 ? void 0 : _k.attr("data-jname")) === null || _l === void 0 ? void 0 : _l.trim(),
                image: (_o = (_m = $(el)
                    .find(".item .film-poster .film-poster-img")) === null || _m === void 0 ? void 0 : _m.attr("data-src")) === null || _o === void 0 ? void 0 : _o.trim(),
            });
        });
        return results;
    }
    catch (err) {
        if (err instanceof axios_1.AxiosError) {
            throw (0, http_errors_1.default)(((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.status) || 500, ((_b = err === null || err === void 0 ? void 0 : err.response) === null || _b === void 0 ? void 0 : _b.statusText) || "Something went wrong");
        }
        // @ts-ignore
        throw http_errors_1.default.InternalServerError(err === null || err === void 0 ? void 0 : err.message);
    }
};
exports.fetchTrending = fetchTrending;
const fetchMostView = async function () {
    var _a, _b;
    const results = {
        today: {
            results: [],
        },
        week: {
            results: [],
        },
        month: {
            results: [],
        },
    };
    function scrapeMostViewCard($, period) {
        const mostViewResults = [];
        const selector = `#top-viewed-${period} ul li`;
        $(selector).each((_, el) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
            const id = (_b = (_a = $(el)
                .find(".film-detail .dynamic-name")) === null || _a === void 0 ? void 0 : _a.attr("href")) === null || _b === void 0 ? void 0 : _b.slice(1).trim();
            mostViewResults.push({
                id: id,
                rank: Number((_d = (_c = $(el).find(".film-number span")) === null || _c === void 0 ? void 0 : _c.text()) === null || _d === void 0 ? void 0 : _d.trim()) || null,
                title: (_f = (_e = $(el).find(".film-detail .dynamic-name")) === null || _e === void 0 ? void 0 : _e.text()) === null || _f === void 0 ? void 0 : _f.trim(),
                japaneseTitle: ((_h = (_g = $(el)
                    .find(".film-detail .dynamic-name")) === null || _g === void 0 ? void 0 : _g.attr("data-jname")) === null || _h === void 0 ? void 0 : _h.trim()) || null,
                image: (_k = (_j = $(el)
                    .find(".film-poster .film-poster-img")) === null || _j === void 0 ? void 0 : _j.attr("data-src")) === null || _k === void 0 ? void 0 : _k.trim(),
                episodes: {
                    sub: Number((_m = (_l = $(el)
                        .find(".film-detail .fd-infor .tick-item.tick-sub")) === null || _l === void 0 ? void 0 : _l.text()) === null || _m === void 0 ? void 0 : _m.trim()) || null,
                    dub: Number((_p = (_o = $(el)
                        .find(".film-detail .fd-infor .tick-item.tick-dub")) === null || _o === void 0 ? void 0 : _o.text()) === null || _p === void 0 ? void 0 : _p.trim()) || null,
                },
            });
        });
        return mostViewResults;
    }
    try {
        const url = `${baseUrl}/home`;
        const { data } = await axios_1.default.get(url, {
            headers: {
                "User-Agent": utils_1.USER_AGENT,
                "Accept-Encoding": utils_1.ACCEPT_ENCODING_HEADER,
                Accept: utils_1.ACCEPT_HEADER,
            },
        });
        const $ = (0, cheerio_1.load)(data);
        const mostViewedSelector = '#main-sidebar .block_area-realtime [id^="top-viewed-"]';
        $(mostViewedSelector).each((i, el) => {
            var _a, _b, _c;
            const period = (_c = (_b = (_a = $(el).attr("id")) === null || _a === void 0 ? void 0 : _a.split("-")) === null || _b === void 0 ? void 0 : _b.pop()) === null || _c === void 0 ? void 0 : _c.trim();
            if (period === "day") {
                results.today.results = scrapeMostViewCard($, period);
                return;
            }
            if (period === "week") {
                results.week.results = scrapeMostViewCard($, period);
                return;
            }
            if (period === "month") {
                results.week.results = scrapeMostViewCard($, period);
            }
        });
        return results;
    }
    catch (err) {
        if (err instanceof axios_1.AxiosError) {
            throw (0, http_errors_1.default)(((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.status) || 500, ((_b = err === null || err === void 0 ? void 0 : err.response) === null || _b === void 0 ? void 0 : _b.statusText) || "Something went wrong");
        }
        // @ts-ignore
        throw http_errors_1.default.InternalServerError(err === null || err === void 0 ? void 0 : err.message);
    }
};
exports.fetchMostView = fetchMostView;
const fetchAiringSchedule = async function (date = new Date().toISOString().slice(0, 10)) {
    var _a, _b, _c, _d, _e;
    const results = {
        results: [],
    };
    try {
        const { data: { html }, } = await axios_1.default.get(`${baseUrl}/ajax/schedule/list?tzOffset=360&date=${date}`, {
            headers: {
                Accept: "*/*",
                Referer: `${baseUrl}/home`,
                "User-Agent": utils_1.USER_AGENT,
                "X-Requested-With": "XMLHttpRequest",
                "Accept-Encoding": utils_1.ACCEPT_ENCODING_HEADER,
            },
        });
        const $ = (0, cheerio_1.load)(html);
        if ((_c = (_b = (_a = $("li")) === null || _a === void 0 ? void 0 : _a.text()) === null || _b === void 0 ? void 0 : _b.trim()) === null || _c === void 0 ? void 0 : _c.includes("No data to display")) {
            return results;
        }
        $("li").each((i, ele) => {
            var _a;
            const card = $(ele);
            const title = card.find(".film-name");
            const id = (_a = card
                .find("a.tsl-link")
                .attr("href")) === null || _a === void 0 ? void 0 : _a.split("/")[1].split("?")[0];
            const airingTime = card.find("div.time").text().replace("\n", "").trim();
            const airingEpisode = card
                .find("div.film-detail div.fd-play button")
                .text()
                .replace("\n", "")
                .trim();
            results.results.push({
                id: id,
                title: title.text(),
                japaneseTitle: title.attr("data-jname"),
                url: `${baseUrl}/${id}`,
                airingEpisode: airingEpisode,
                airingTime: airingTime,
            });
        });
        return results;
    }
    catch (err) {
        if (err instanceof axios_1.AxiosError) {
            throw (0, http_errors_1.default)(((_d = err === null || err === void 0 ? void 0 : err.response) === null || _d === void 0 ? void 0 : _d.status) || 500, ((_e = err === null || err === void 0 ? void 0 : err.response) === null || _e === void 0 ? void 0 : _e.statusText) || "Something went wrong");
        }
        // @ts-ignore
        throw http_errors_1.default.InternalServerError(err === null || err === void 0 ? void 0 : err.message);
    }
};
exports.fetchAiringSchedule = fetchAiringSchedule;
const fetchSearchSuggestion = async function (query) {
    var _a, _b;
    try {
        const encodedQuery = encodeURIComponent(query);
        const { data } = await axios_1.default.get(`${baseUrl}/ajax/search/suggest?keyword=${encodedQuery}`, {
            headers: {
                Accept: "*/*",
                Pragma: "no-cache",
                Referer: `${baseUrl}/home`,
                "User-Agent": utils_1.USER_AGENT,
                "X-Requested-With": "XMLHttpRequest",
                "Accept-Encoding": utils_1.ACCEPT_ENCODING_HEADER,
            },
        });
        const $ = (0, cheerio_1.load)(data.html);
        const res = {
            results: [],
        };
        $(".nav-item").each((i, el) => {
            var _a;
            const card = $(el);
            if (!card.hasClass("nav-bottom")) {
                const image = card.find(".film-poster img").attr("data-src");
                const title = card.find(".film-name");
                const id = (_a = card.attr("href")) === null || _a === void 0 ? void 0 : _a.split("/")[1].split("?")[0];
                const duration = card.find(".film-infor span").last().text().trim();
                const releaseDate = card
                    .find(".film-infor span:nth-child(1)")
                    .text()
                    .trim();
                const type = card
                    .find(".film-infor")
                    .find("span, i")
                    .remove()
                    .end()
                    .text()
                    .trim();
                res.results.push({
                    image: image,
                    id: id,
                    title: title.text(),
                    japaneseTitle: title.attr("data-jname"),
                    aliasTitle: card.find(".alias-name").text(),
                    releaseDate: releaseDate,
                    type: type,
                    duration: duration,
                    url: `${baseUrl}/${id}`,
                });
            }
        });
        return res;
    }
    catch (err) {
        if (err instanceof axios_1.AxiosError) {
            throw (0, http_errors_1.default)(((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.status) || 500, ((_b = err === null || err === void 0 ? void 0 : err.response) === null || _b === void 0 ? void 0 : _b.statusText) || "Something went wrong");
        }
        // @ts-ignore
        throw http_errors_1.default.InternalServerError(err === null || err === void 0 ? void 0 : err.message);
    }
};
exports.fetchSearchSuggestion = fetchSearchSuggestion;
//# sourceMappingURL=hianime.js.map