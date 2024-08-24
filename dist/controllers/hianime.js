"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAiringSchedule = exports.getMostView = exports.getTrending = exports.getSpotlight = exports.getTopUpcoming = exports.getStudio = exports.getLatestEpisodes = exports.getRecentlyAdded = exports.getLatestCompleted = exports.getMostFavorite = exports.getTopAiring = exports.getMostPopular = exports.getTvSeries = exports.getEpisodeServers = exports.getAnimeSources = exports.getAnimeEpisodes = exports.getAnimeInfo = exports.getSearch = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const types_1 = require("../types/types");
const hianime_1 = require("../parsers/hianime");
const getSearch = async (req, res, next) => {
    try {
        const query = req.params.query;
        const page = req.query.page || 1;
        if (query === undefined)
            throw http_errors_1.default.BadRequest("Search keyword required");
        const data = await (0, hianime_1.search)(query, Number(page)).catch((err) => res.status(404).send({ message: err }));
        res.status(200).json(data);
    }
    catch (error) {
        res
            .status(500)
            .send({ message: "Something went wrong. Please try again later." });
        next(error);
    }
};
exports.getSearch = getSearch;
const getAnimeInfo = async function (req, res, next) {
    try {
        const animeId = decodeURIComponent(req.params.animeId);
        if (animeId === null)
            throw http_errors_1.default.BadRequest("Anime Id required");
        const data = await (0, hianime_1.fetchAnimeInfo)(animeId).catch((err) => res.status(404).send({ message: err }));
        res.status(200).json(data);
    }
    catch (error) {
        res
            .status(500)
            .send({ message: "Something went wrong. Please try again later." });
        next(error);
    }
};
exports.getAnimeInfo = getAnimeInfo;
const getAnimeEpisodes = async function (req, res, next) {
    try {
        const animeId = decodeURIComponent(req.params.animeId);
        if (animeId === null)
            throw http_errors_1.default.BadRequest("Anime Id required");
        const data = await (0, hianime_1.fetchAnimeEpisodes)(animeId).catch((err) => res.status(404).send({ message: err }));
        res.status(200).json(data);
    }
    catch (error) {
        res
            .status(500)
            .send({ message: "Something went wrong. Please try again later." });
        next(error);
    }
};
exports.getAnimeEpisodes = getAnimeEpisodes;
const getAnimeSources = async function (req, res, next) {
    let episodeId = req.params.episodeId;
    if (!episodeId) {
        episodeId = req.query.episodeId;
    }
    const server = req.query.server;
    if (server && !Object.values(types_1.StreamingServers).includes(server)) {
        return res.status(400).send({ message: "server is invalid" });
    }
    if (typeof episodeId === "undefined")
        return res.status(400).send({ message: "episodeId is required" });
    try {
        const data = await (0, hianime_1.fetchEpisodeSource)(episodeId, server).catch((err) => res.status(404).send({ message: err }));
        res.status(200).json(data);
    }
    catch (error) {
        res
            .status(500)
            .send({ message: "Something went wrong. Please try again later." });
        next(error);
    }
};
exports.getAnimeSources = getAnimeSources;
const getEpisodeServers = async function (req, res, next) {
    let episodeId = req.params.episodeId;
    if (!episodeId) {
        episodeId = req.query.episodeId;
    }
    if (typeof episodeId === "undefined")
        return res.status(400).send({ message: "episodeId is required" });
    try {
        const data = await (0, hianime_1.fetchEpisodeServers)(episodeId).catch((err) => res.status(404).send({ message: err }));
        res.status(200).json(data);
    }
    catch (error) {
        res
            .status(500)
            .send({ message: "Something went wrong. Please try again later." });
        next(error);
    }
};
exports.getEpisodeServers = getEpisodeServers;
const getTvSeries = async function (req, res, next) {
    const page = req.query.page || 1;
    try {
        const data = await (0, hianime_1.fetchTvSeries)(Number(page)).catch((err) => res.status(404).send({ message: err }));
        res.status(200).json(data);
    }
    catch (error) {
        res
            .status(500)
            .send({ message: "Something went wrong. Please try again later." });
        next(error);
    }
};
exports.getTvSeries = getTvSeries;
const getMostPopular = async function (req, res, next) {
    const page = req.query.page || 1;
    try {
        const data = await (0, hianime_1.fetchMostPopular)(Number(page)).catch((err) => res.status(404).send({ message: err }));
        res.status(200).json(data);
    }
    catch (error) {
        res
            .status(500)
            .send({ message: "Something went wrong. Please try again later." });
        next(error);
    }
};
exports.getMostPopular = getMostPopular;
const getTopAiring = async function (req, res, next) {
    const page = req.query.page || 1;
    try {
        const data = await (0, hianime_1.fetchTopAiring)(Number(page)).catch((err) => res.status(404).send({ message: err }));
        res.status(200).json(data);
    }
    catch (error) {
        res
            .status(500)
            .send({ message: "Something went wrong. Please try again later." });
        next(error);
    }
};
exports.getTopAiring = getTopAiring;
const getMostFavorite = async function (req, res, next) {
    const page = req.query.page || 1;
    try {
        const data = await (0, hianime_1.fetchMostFavorite)(Number(page)).catch((err) => res.status(404).send({ message: err }));
        res.status(200).json(data);
    }
    catch (error) {
        res
            .status(500)
            .send({ message: "Something went wrong. Please try again later." });
        next(error);
    }
};
exports.getMostFavorite = getMostFavorite;
const getLatestCompleted = async function (req, res, next) {
    const page = req.query.page || 1;
    try {
        const data = await (0, hianime_1.fetchLatestCompleted)(Number(page)).catch((err) => res.status(404).send({ message: err }));
        res.status(200).json(data);
    }
    catch (error) {
        res
            .status(500)
            .send({ message: "Something went wrong. Please try again later." });
        next(error);
    }
};
exports.getLatestCompleted = getLatestCompleted;
const getRecentlyAdded = async function (req, res, next) {
    const page = req.query.page || 1;
    try {
        const data = await (0, hianime_1.fetchRecentlyAdded)(Number(page)).catch((err) => res.status(404).send({ message: err }));
        res.status(200).json(data);
    }
    catch (error) {
        res
            .status(500)
            .send({ message: "Something went wrong. Please try again later." });
        next(error);
    }
};
exports.getRecentlyAdded = getRecentlyAdded;
const getLatestEpisodes = async function (req, res, next) {
    const page = req.query.page || 1;
    try {
        const data = await (0, hianime_1.fetchLatestEpisodes)(Number(page)).catch((err) => res.status(404).send({ message: err }));
        res.status(200).json(data);
    }
    catch (error) {
        res
            .status(500)
            .send({ message: "Something went wrong. Please try again later." });
        next(error);
    }
};
exports.getLatestEpisodes = getLatestEpisodes;
const getStudio = async function (req, res, next) {
    const studioId = req.params.studioId;
    const page = req.query.page || 1;
    try {
        const data = await (0, hianime_1.fetchStudio)(studioId, Number(page)).catch((err) => res.status(404).send({ message: err }));
        res.status(200).json(data);
    }
    catch (error) {
        res
            .status(500)
            .send({ message: "Something went wrong. Please try again later." });
        next(error);
    }
};
exports.getStudio = getStudio;
const getTopUpcoming = async function (req, res, next) {
    const page = req.query.page || 1;
    try {
        const data = await (0, hianime_1.fetchTopUpcoming)(Number(page)).catch((err) => res.status(404).send({ message: err }));
        res.status(200).json(data);
    }
    catch (error) {
        res
            .status(500)
            .send({ message: "Something went wrong. Please try again later." });
        next(error);
    }
};
exports.getTopUpcoming = getTopUpcoming;
const getSpotlight = async (_, res, next) => {
    try {
        const data = await (0, hianime_1.fetchSpotlight)().catch((err) => res.status(404).send({ message: err }));
        res.status(200).json(data);
    }
    catch (error) {
        res
            .status(500)
            .send({ message: "Something went wrong. Please try again later." });
        next(error);
    }
};
exports.getSpotlight = getSpotlight;
const getTrending = async (_, res, next) => {
    try {
        const data = await (0, hianime_1.fetchTrending)().catch((err) => res.status(404).send({ message: err }));
        res.status(200).json(data);
    }
    catch (error) {
        res
            .status(500)
            .send({ message: "Something went wrong. Please try again later." });
        next(error);
    }
};
exports.getTrending = getTrending;
const getMostView = async (_, res, next) => {
    try {
        const data = await (0, hianime_1.fetchMostView)().catch((err) => res.status(404).send({ message: err }));
        res.status(200).json(data);
    }
    catch (error) {
        res
            .status(500)
            .send({ message: "Something went wrong. Please try again later." });
        next(error);
    }
};
exports.getMostView = getMostView;
const getAiringSchedule = async (req, res, next) => {
    const date = req.params.date;
    if (date === null) {
        throw http_errors_1.default.BadRequest("Date payload required");
    }
    try {
        const data = await (0, hianime_1.fetchAiringSchedule)(date).catch((err) => res.status(404).send({ message: err }));
        res.status(200).json(data);
    }
    catch (error) {
        res
            .status(500)
            .send({ message: "Something went wrong. Please try again later." });
        next(error);
    }
};
exports.getAiringSchedule = getAiringSchedule;
//# sourceMappingURL=hianime.js.map