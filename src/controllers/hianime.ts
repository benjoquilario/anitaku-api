import { Request, RequestHandler, Response, NextFunction } from "express"
import createHttpError from "http-errors"
import { StreamingServers } from "../types/types"
import {
  fetchAiringSchedule,
  fetchAnimeEpisodes,
  fetchAnimeInfo,
  fetchAzList,
  fetchEpisodeServers,
  fetchEpisodeSource,
  fetchGenre,
  fetchLatestCompleted,
  fetchLatestEpisodes,
  fetchMostFavorite,
  fetchMostPopular,
  fetchMostView,
  fetchRecentlyAdded,
  fetchSpotlight,
  fetchStudio,
  fetchTopAiring,
  fetchTopUpcoming,
  fetchTrending,
  fetchTvSeries,
  search,
} from "../parsers/hianime"
import { fetchAnimeData } from "../parsers/gogoganime"

export const getSearch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = (req.params as { query: string }).query
    const page = req.query.page || 1

    if (query === undefined)
      throw createHttpError.BadRequest("Search keyword required")

    const data = await search(query, Number(page)).catch((err) =>
      res.status(404).send({ message: err })
    )

    res.status(200).json(data)
  } catch (error) {
    res
      .status(500)
      .send({ message: "Something went wrong. Please try again later." })
    next(error)
  }
}

export const getAnimeInfo = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const animeId = decodeURIComponent(
      (req.params as { animeId: string }).animeId
    )

    if (animeId === null) throw createHttpError.BadRequest("Anime Id required")

    const data = await fetchAnimeInfo(animeId).catch((err) =>
      res.status(404).send({ message: err })
    )

    res.status(200).json(data)
  } catch (error) {
    res
      .status(500)
      .send({ message: "Something went wrong. Please try again later." })
    next(error)
  }
}

export const getAnimeEpisodes = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const animeId = decodeURIComponent(
      (req.params as { animeId: string }).animeId
    )

    if (animeId === null) throw createHttpError.BadRequest("Anime Id required")

    const data = await fetchAnimeEpisodes(animeId).catch((err) =>
      res.status(404).send({ message: err })
    )

    res.status(200).json(data)
  } catch (error) {
    res
      .status(500)
      .send({ message: "Something went wrong. Please try again later." })
    next(error)
  }
}

export const getAnimeSources = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  let episodeId = (req.params as { episodeId: string }).episodeId

  if (!episodeId) {
    episodeId = (req.query as { episodeId: string }).episodeId
  }

  const server = (req.query as { server: string }).server as StreamingServers
  if (server && !Object.values(StreamingServers).includes(server)) {
    return res.status(400).send({ message: "server is invalid" })
  }

  if (typeof episodeId === "undefined")
    return res.status(400).send({ message: "episodeId is required" })

  try {
    const data = await fetchEpisodeSource(episodeId, server).catch((err) =>
      res.status(404).send({ message: err })
    )

    res.status(200).json(data)
  } catch (error) {
    res
      .status(500)
      .send({ message: "Something went wrong. Please try again later." })
    next(error)
  }
}

export const getEpisodeServers = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  let episodeId = (req.params as { episodeId: string }).episodeId

  if (!episodeId) {
    episodeId = (req.query as { episodeId: string }).episodeId
  }

  if (typeof episodeId === "undefined")
    return res.status(400).send({ message: "episodeId is required" })

  try {
    const data = await fetchEpisodeServers(episodeId).catch((err) =>
      res.status(404).send({ message: err })
    )

    res.status(200).json(data)
  } catch (error) {
    res
      .status(500)
      .send({ message: "Something went wrong. Please try again later." })
    next(error)
  }
}

export const getTvSeries = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const page = req.query.page || 1

  try {
    const data = await fetchTvSeries(Number(page)).catch((err) =>
      res.status(404).send({ message: err })
    )

    res.status(200).json(data)
  } catch (error) {
    res
      .status(500)
      .send({ message: "Something went wrong. Please try again later." })
    next(error)
  }
}

export const getMostPopular = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const page = req.query.page || 1

  try {
    const data = await fetchMostPopular(Number(page)).catch((err) =>
      res.status(404).send({ message: err })
    )

    res.status(200).json(data)
  } catch (error) {
    res
      .status(500)
      .send({ message: "Something went wrong. Please try again later." })
    next(error)
  }
}

export const getTopAiring = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const page = req.query.page || 1

  try {
    const data = await fetchTopAiring(Number(page)).catch((err) =>
      res.status(404).send({ message: err })
    )

    res.status(200).json(data)
  } catch (error) {
    res
      .status(500)
      .send({ message: "Something went wrong. Please try again later." })
    next(error)
  }
}

export const getMostFavorite = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const page = req.query.page || 1

  try {
    const data = await fetchMostFavorite(Number(page)).catch((err) =>
      res.status(404).send({ message: err })
    )

    res.status(200).json(data)
  } catch (error) {
    res
      .status(500)
      .send({ message: "Something went wrong. Please try again later." })
    next(error)
  }
}

export const getLatestCompleted = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const page = req.query.page || 1

  try {
    const data = await fetchLatestCompleted(Number(page)).catch((err) =>
      res.status(404).send({ message: err })
    )

    res.status(200).json(data)
  } catch (error) {
    res
      .status(500)
      .send({ message: "Something went wrong. Please try again later." })
    next(error)
  }
}

export const getRecentlyAdded = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const page = req.query.page || 1

  try {
    const data = await fetchRecentlyAdded(Number(page)).catch((err) =>
      res.status(404).send({ message: err })
    )

    res.status(200).json(data)
  } catch (error) {
    res
      .status(500)
      .send({ message: "Something went wrong. Please try again later." })
    next(error)
  }
}

export const getLatestEpisodes = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const page = req.query.page || 1

  try {
    const data = await fetchLatestEpisodes(Number(page)).catch((err) =>
      res.status(404).send({ message: err })
    )

    res.status(200).json(data)
  } catch (error) {
    res
      .status(500)
      .send({ message: "Something went wrong. Please try again later." })
    next(error)
  }
}

export const getStudio = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const studioId = (req.params as { studioId: string }).studioId
  const page = req.query.page || 1

  try {
    const data = await fetchStudio(studioId, Number(page)).catch((err) =>
      res.status(404).send({ message: err })
    )

    res.status(200).json(data)
  } catch (error) {
    res
      .status(500)
      .send({ message: "Something went wrong. Please try again later." })
    next(error)
  }
}

export const getAzList = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const letter = (req.params as { letter: string }).letter
  const page = req.query.page || 1

  try {
    const data = await fetchAzList(letter.toUpperCase(), Number(page)).catch(
      (err) => res.status(404).send({ message: err })
    )

    res.status(200).json(data)
  } catch (error) {
    res
      .status(500)
      .send({ message: "Something went wrong. Please try again later." })
    next(error)
  }
}

export const getGenre = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const genre = (req.params as { genre: string }).genre
  const page = req.query.page || 1

  try {
    const data = await fetchGenre(genre, Number(page)).catch((err) =>
      res.status(404).send({ message: err })
    )

    res.status(200).json(data)
  } catch (error) {
    res
      .status(500)
      .send({ message: "Something went wrong. Please try again later." })
    next(error)
  }
}

export const getTopUpcoming = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const page = req.query.page || 1

  try {
    const data = await fetchTopUpcoming(Number(page)).catch((err) =>
      res.status(404).send({ message: err })
    )

    res.status(200).json(data)
  } catch (error) {
    res
      .status(500)
      .send({ message: "Something went wrong. Please try again later." })
    next(error)
  }
}

export const getSpotlight = async (
  _: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await fetchSpotlight().catch((err) =>
      res.status(404).send({ message: err })
    )

    res.status(200).json(data)
  } catch (error) {
    res
      .status(500)
      .send({ message: "Something went wrong. Please try again later." })
    next(error)
  }
}

export const getTrending = async (
  _: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await fetchTrending().catch((err) =>
      res.status(404).send({ message: err })
    )

    res.status(200).json(data)
  } catch (error) {
    res
      .status(500)
      .send({ message: "Something went wrong. Please try again later." })
    next(error)
  }
}

export const getMostView = async (
  _: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await fetchMostView().catch((err) =>
      res.status(404).send({ message: err })
    )

    res.status(200).json(data)
  } catch (error) {
    res
      .status(500)
      .send({ message: "Something went wrong. Please try again later." })
    next(error)
  }
}

export const getAiringSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const date = (req.params as { date: string }).date

  if (date === null) {
    throw createHttpError.BadRequest("Date payload required")
  }

  try {
    const data = await fetchAiringSchedule(date).catch((err) =>
      res.status(404).send({ message: err })
    )

    res.status(200).json(data)
  } catch (error) {
    res
      .status(500)
      .send({ message: "Something went wrong. Please try again later." })
    next(error)
  }
}

export const getAnimeDataInformation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const animeId = decodeURIComponent(
      (req.params as { animeId: string }).animeId
    )

    if (animeId === null) throw createHttpError.BadRequest("Anime Id required")

    const data = await fetchAnimeData(animeId).catch((err) =>
      res.status(404).send({ message: err })
    )

    res.status(200).json(data)
  } catch (error) {
    res
      .status(500)
      .send({ message: "Something went wrong. Please try again later." })
    next(error)
  }
}
