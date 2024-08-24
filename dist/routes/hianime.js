"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const hianime_1 = require("../controllers/hianime");
const router = express_1.default.Router();
router.get("/search/:query", hianime_1.getSearch);
router.get("/info/:animeId", hianime_1.getAnimeInfo);
router.get("/episodes/:animeId", hianime_1.getAnimeEpisodes);
router.get("/watch/:episodeId", hianime_1.getAnimeSources);
router.get("/servers/:episodeId", hianime_1.getEpisodeServers);
router.get("/popular", hianime_1.getMostPopular);
router.get("/top-airing", hianime_1.getTopAiring);
router.get("/tv-series", hianime_1.getTvSeries);
router.get("/spotlight", hianime_1.getSpotlight);
router.get("/trending", hianime_1.getTrending);
router.get("/most-view", hianime_1.getMostView);
router.get("/latest-episodes", hianime_1.getLatestEpisodes);
router.get("/top-upcoming", hianime_1.getTopUpcoming);
router.get("/airing-schedule/:data", hianime_1.getAiringSchedule);
router.get("/studio/:studioId", hianime_1.getStudio);
exports.default = router;
//# sourceMappingURL=hianime.js.map