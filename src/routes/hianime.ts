import express from "express"

import {
  getAiringSchedule,
  getAnimeEpisodes,
  getAnimeInfo,
  getAnimeSources,
  getEpisodeServers,
  getLatestEpisodes,
  getMostPopular,
  getMostView,
  getSearch,
  getSpotlight,
  getTopAiring,
  getTopUpcoming,
  getTrending,
  getTvSeries,
  getStudio,
  getAzList,
  getGenre,
} from "../controllers/hianime"

const router = express.Router()

router.get("/search/:query", getSearch)
router.get("/info/:animeId", getAnimeInfo)
router.get("/episodes/:animeId", getAnimeEpisodes)
router.get("/watch/:episodeId", getAnimeSources)
router.get("/servers/:episodeId", getEpisodeServers)
router.get("/popular", getMostPopular)
router.get("/top-airing", getTopAiring)
router.get("/tv-series", getTvSeries)
router.get("/spotlight", getSpotlight)
router.get("/trending", getTrending)
router.get("/most-view", getMostView)
router.get("/latest-episodes", getLatestEpisodes)
router.get("/top-upcoming", getTopUpcoming)
router.get("/airing-schedule/:data", getAiringSchedule)
router.get("/studio/:studioId", getStudio)
router.get("/az-list/:letter", getAzList)
router.get("/genre/:genre", getGenre)

export default router
