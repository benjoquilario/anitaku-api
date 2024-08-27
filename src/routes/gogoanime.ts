import express from "express"
import {
  getAnimeInfo,
  getAnimeList,
  getAnimeMovies,
  getAzList,
  getCompletedAnime,
  getDownload,
  getEpisodeServers,
  getEpisodeSource,
  getGenre,
  getGenreList,
  getNewSeason,
  getPopular,
  getRecentEpisodes,
  getRequestedAnime,
  getSearch,
  getTopAiring,
  getUpcomingAnime,
} from "../controllers/gogoanime"
import { getAnimeDataInformation } from "../controllers/hianime"
const router = express.Router()

router.get("/search/:query", getSearch)
router.get("/info/:animeId", getAnimeInfo)
router.get("/data/:animeId", getAnimeDataInformation)
router.get("/watch/:episodeId", getEpisodeSource)
router.get("/servers/:episodeId", getEpisodeServers)
router.get("/recent-episodes", getRecentEpisodes)
router.get("/genre/:genre", getGenre)
router.get("/genre/list", getGenreList)
router.get("/top-airing", getTopAiring)
router.get("/popular", getPopular)
router.get("/movies", getAnimeMovies)
router.get("/anime-list", getAnimeList)
router.get("/new-season", getNewSeason)
router.get("/completed-anime", getCompletedAnime)
router.get("/download", getDownload)
router.get("/az-list/:letter", getAzList)
router.get("/upcoming", getUpcomingAnime)
router.get("/requested", getRequestedAnime)

export default router
