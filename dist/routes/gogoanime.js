"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const gogoanime_1 = require("../controllers/gogoanime");
const router = express_1.default.Router();
router.get("/search/:query", gogoanime_1.getSearch);
router.get("/info/:animeId", gogoanime_1.getAnimeInfo);
router.get("/watch/:episodeId", gogoanime_1.getEpisodeSource);
router.get("/servers/:episodeId", gogoanime_1.getEpisodeServers);
router.get("/recent-episodes", gogoanime_1.getRecentEpisodes);
router.get("/genre/:genre", gogoanime_1.getGenre);
router.get("/genre/list", gogoanime_1.getGenreList);
router.get("/top-airing", gogoanime_1.getTopAiring);
router.get("/popular", gogoanime_1.getPopular);
router.get("/movies", gogoanime_1.getAnimeMovies);
router.get("/anime-list", gogoanime_1.getAnimeList);
router.get("/new-season", gogoanime_1.getNewSeason);
router.get("/completed-anime", gogoanime_1.getCompletedAnime);
router.get("/download", gogoanime_1.getDownload);
exports.default = router;
//# sourceMappingURL=gogoanime.js.map