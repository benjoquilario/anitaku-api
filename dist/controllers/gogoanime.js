"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDownload = exports.getCompletedAnime = exports.getNewSeason = exports.getAnimeList = exports.getAnimeMovies = exports.getPopular = exports.getTopAiring = exports.getGenreList = exports.getGenre = exports.getRecentEpisodes = exports.getEpisodeServers = exports.getEpisodeSource = exports.getAnimeInfo = exports.getSearch = void 0;
const gogoganime_1 = require("../parsers/gogoganime");
const http_errors_1 = __importDefault(require("http-errors"));
const getSearch = async (req, res, next) => {
    try {
        const query = req.params.query;
        const page = req.query.page;
        if (query === undefined)
            throw http_errors_1.default.BadRequest("Search keyword required");
        const data = await (0, gogoganime_1.search)(query, Number(page)).catch((err) => res.status(404).send({ message: err }));
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
const getAnimeInfo = async (req, res, next) => {
    try {
        const animeId = decodeURIComponent(req.params.animeId);
        if (animeId === null)
            throw http_errors_1.default.BadRequest("Anime Id required");
        const data = await (0, gogoganime_1.fetchAnimeInfo)(animeId).catch((err) => res.status(404).send({ message: err }));
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
const getEpisodeSource = async (req, res, next) => {
    try {
        const episodeId = req.params.episodeId;
        const server = req.query.server;
        if (episodeId === null)
            throw http_errors_1.default.BadRequest("Episode Id required");
        const data = await (0, gogoganime_1.fetchEpisodeSources)(episodeId, server).catch((err) => res.status(404).send({ message: err }));
        res.status(200).json(data);
    }
    catch (error) {
        res
            .status(500)
            .send({ message: "Something went wrong. Please try again later." });
        next(error);
    }
};
exports.getEpisodeSource = getEpisodeSource;
const getEpisodeServers = async (req, res, next) => {
    const episodeId = req.params.episodeId;
    if (episodeId === null)
        throw http_errors_1.default.BadRequest("Episode Id required");
    try {
        const data = await (0, gogoganime_1.fetchEpisodeServers)(episodeId).catch((err) => res.status(404).send({ message: err }));
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
const getRecentEpisodes = async (req, res, next) => {
    try {
        const type = req.query.type || 1;
        const page = req.query.page || 1;
        const data = await (0, gogoganime_1.fetchRecentEpisodes)(Number(page), Number(type)).catch((err) => res.status(404).send({ message: err }));
        res.status(200).json(data);
    }
    catch (error) {
        res
            .status(500)
            .send({ message: "Something went wrong. Please try again later." });
        next(error);
    }
};
exports.getRecentEpisodes = getRecentEpisodes;
const getGenre = async (req, res, next) => {
    const genre = req.params.genre;
    const page = req.query.page || 1;
    if (genre === null)
        throw http_errors_1.default.BadRequest("Genre is required");
    try {
        const data = await (0, gogoganime_1.fetchGenreInfo)(genre, Number(page)).catch((err) => res.status(404).send({ message: err }));
        res.status(200).json(data);
    }
    catch (error) {
        res
            .status(500)
            .send({ message: "Something went wrong. Please try again later." });
        next(error);
    }
};
exports.getGenre = getGenre;
const getGenreList = async (_, res, next) => {
    try {
        const data = await (0, gogoganime_1.fetchGenreList)().catch((err) => res.status(404).send({ message: err }));
        res.status(200).json(data);
    }
    catch (error) {
        res
            .status(500)
            .send({ message: "Something went wrong. Please try again later." });
        next(error);
    }
};
exports.getGenreList = getGenreList;
const getTopAiring = async (req, res, next) => {
    const page = req.query.page || 1;
    try {
        const data = await (0, gogoganime_1.fetchTopAiring)(Number(page)).catch((err) => res.status(404).send({ message: err }));
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
const getPopular = async (req, res, next) => {
    const page = req.query.page || 1;
    try {
        const data = await (0, gogoganime_1.fetchPopular)(Number(page)).catch((err) => res.status(404).send({ message: err }));
        res.status(200).json(data);
    }
    catch (error) {
        res
            .status(500)
            .send({ message: "Something went wrong. Please try again later." });
        next(error);
    }
};
exports.getPopular = getPopular;
const getAnimeMovies = async (req, res, next) => {
    const page = req.query.page || 1;
    try {
        const data = await (0, gogoganime_1.fetchRecentMovies)(Number(page)).catch((err) => res.status(404).send({ message: err }));
        res.status(200).json(data);
    }
    catch (error) {
        res
            .status(500)
            .send({ message: "Something went wrong. Please try again later." });
        next(error);
    }
};
exports.getAnimeMovies = getAnimeMovies;
const getAnimeList = async (req, res, next) => {
    const page = req.query.page || 1;
    try {
        const data = await (0, gogoganime_1.fetchAnimeList)(Number(page)).catch((err) => res.status(404).send({ message: err }));
        res.status(200).json(data);
    }
    catch (error) {
        res
            .status(500)
            .send({ message: "Something went wrong. Please try again later." });
        next(error);
    }
};
exports.getAnimeList = getAnimeList;
const getNewSeason = async (req, res, next) => {
    const page = req.query.page || 1;
    try {
        const data = await (0, gogoganime_1.fetchNewSeason)(Number(page)).catch((err) => res.status(404).send({ message: err }));
        res.status(200).json(data);
    }
    catch (error) {
        res
            .status(500)
            .send({ message: "Something went wrong. Please try again later." });
        next(error);
    }
};
exports.getNewSeason = getNewSeason;
const getCompletedAnime = async (req, res, next) => {
    const page = req.query.page || 1;
    try {
        const data = await (0, gogoganime_1.fetchCompletedAnime)(Number(page)).catch((err) => res.status(404).send({ message: err }));
        res.status(200).json(data);
    }
    catch (error) {
        res
            .status(500)
            .send({ message: "Something went wrong. Please try again later." });
        next(error);
    }
};
exports.getCompletedAnime = getCompletedAnime;
const getDownload = async (req, res, next) => {
    try {
        const downloadLink = req.query.link;
        if (!downloadLink) {
            res.status(400).send("Invalid link");
        }
        const data = await (0, gogoganime_1.fetchDirectDownloadLink)(downloadLink).catch((err) => res.status(404).send({ message: err }));
        res.status(200).json(data);
    }
    catch (error) {
        res
            .status(500)
            .send({ message: "Something went wrong. Please try again later." });
        next(error);
    }
};
exports.getDownload = getDownload;
//# sourceMappingURL=gogoanime.js.map