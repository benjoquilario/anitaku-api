import { Request, RequestHandler, Response, NextFunction } from "express"
import {
  fetchAnimeInfo,
  fetchEpisodeSources,
  fetchRecentEpisodes,
  fetchGenreList,
  fetchAnimeList,
  fetchDirectDownloadLink,
  fetchRecentMovies,
  fetchTopAiring,
  fetchPopular,
  fetchEpisodeServers,
  fetchGenreInfo,
  search,
  fetchNewSeason,
  fetchCompletedAnime,
  fetchAzList,
  fetchUpcomingAnime,
  fetchRequestList,
} from "../parsers/gogoganime"
import { StreamingServers } from "../types/types"
import createHttpError from "http-errors"

export const getSearch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = (req.params as { query: string }).query
    const page = req.query.page

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

export const getAnimeInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

export const getEpisodeSource = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const episodeId = (req.params as { episodeId: string }).episodeId
    const server = (req.query as { server: StreamingServers }).server

    if (episodeId === null)
      throw createHttpError.BadRequest("Episode Id required")

    const data = await fetchEpisodeSources(episodeId, server).catch((err) =>
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

export const getEpisodeServers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const episodeId = (req.params as { episodeId: string }).episodeId

  if (episodeId === null)
    throw createHttpError.BadRequest("Episode Id required")

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

export const getRecentEpisodes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const type = req.query.type || 1
    const page = req.query.page || 1

    const data = await fetchRecentEpisodes(Number(page), Number(type)).catch(
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

export const getGenre = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const genre = (req.params as { genre: string }).genre
  const page = req.query.page || 1

  if (genre === null) throw createHttpError.BadRequest("Genre is required")

  try {
    const data = await fetchGenreInfo(genre, Number(page)).catch((err) =>
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

export const getAzList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const letter = (req.params as { letter: string }).letter
  const page = req.query.page || 1

  if (letter === null) throw createHttpError.BadRequest("Letter is required")

  try {
    const data = await fetchAzList(letter, Number(page)).catch((err) =>
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

export const getGenreList = async (
  _: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await fetchGenreList().catch((err) =>
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

export const getTopAiring = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

export const getPopular = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const page = req.query.page || 1

  try {
    const data = await fetchPopular(Number(page)).catch((err) =>
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

export const getAnimeMovies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const page = req.query.page || 1

  try {
    const data = await fetchRecentMovies(Number(page)).catch((err) =>
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

export const getAnimeList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const page = req.query.page || 1

  try {
    const data = await fetchAnimeList(Number(page)).catch((err) =>
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

export const getNewSeason = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const page = req.query.page || 1

  try {
    const data = await fetchNewSeason(Number(page)).catch((err) =>
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

export const getCompletedAnime = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const page = req.query.page || 1

  try {
    const data = await fetchCompletedAnime(Number(page)).catch((err) =>
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

export const getDownload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const downloadLink = (req.query as { link: string }).link
    if (!downloadLink) {
      res.status(400).send("Invalid link")
    }

    const data = await fetchDirectDownloadLink(downloadLink).catch((err) =>
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

export const getUpcomingAnime = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const page = req.query.page || 1

  try {
    const data = await fetchUpcomingAnime(Number(page)).catch((err) =>
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

export const getRequestedAnime = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const page = req.query.page || 1

  try {
    const data = await fetchRequestList(Number(page)).catch((err) =>
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
