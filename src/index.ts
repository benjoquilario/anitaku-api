import cors from "cors"
import express, { Request, Response } from "express"
import dotenv from "dotenv"
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
} from "./routes/gogoanime"
import { StreamingServers } from "./types/types"

console.log("")

dotenv.config()

const PORT = process.env.PORT || 5000
const app = express()

app.use(
  cors({
    origin: "*",
    credentials: true,
    optionsSuccessStatus: 200,
    // port: PORT,
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!!")
})

app.listen(PORT, () => console.log("Server Running on PORT:", { PORT }))

app.get("/search/:query", async (req: Request, res: Response) => {
  try {
    const query = (req.params as { query: string }).query
    const page = req.query.page

    const data = await search(query, Number(page)).catch((err) =>
      res.status(404).send({ message: err })
    )

    res.status(200).json(data)
  } catch (error) {}
})

app.get("/info/:id", async (req: Request, res: Response) => {
  try {
    const id = decodeURIComponent((req.params as { id: string }).id)
    const data = await fetchAnimeInfo(id).catch((err) =>
      res.status(404).send({ message: err })
    )

    res.status(200).json(data)
  } catch (error) {
    res
      .status(500)
      .send({ message: "Something went wrong. Please try again later." })
  }
})

app.get("/watch/:episodeId", async (req: Request, res: Response) => {
  try {
    const episodeId = (req.params as { episodeId: string }).episodeId
    const server = (req.query as { server: StreamingServers }).server

    const data = await fetchEpisodeSources(episodeId, server).catch((err) =>
      res.status(404).send({ message: err })
    )

    res.status(200).json(data)
  } catch (error) {
    res
      .status(500)
      .send({ message: "Something went wrong. Please try again later." })
  }
})

app.get("/servers/:episodeId", async (req: Request, res: Response) => {
  const episodeId = (req.params as { episodeId: string }).episodeId

  try {
    const data = await fetchEpisodeServers(episodeId).catch((err) =>
      res.status(404).send({ message: err })
    )
    res.status(200).json(data)
  } catch (error) {
    res
      .status(500)
      .send({ message: "Something went wrong. Please try again later." })
  }
})

app.get("/recent-episodes", async (req: Request, res: Response) => {
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
  }
})

app.get("/genre/:genre", async (req: Request, res: Response) => {
  const genre = (req.params as { genre: string }).genre
  const page = req.query.page || 1

  try {
    const data = await fetchGenreInfo(genre, Number(page)).catch((err) =>
      res.status(404).send({ message: err })
    )

    res.status(200).json(data)
  } catch (error) {
    res
      .status(500)
      .send({ message: "Something went wrong. Please try again later." })
  }
})

app.get("/genre/list", async (req: Request, res: Response) => {
  try {
    const data = await fetchGenreList().catch((err) =>
      res.status(404).send({ message: err })
    )

    res.status(200).json(data)
  } catch (error) {
    res
      .status(500)
      .send({ message: "Something went wrong. Please try again later." })
  }
})

app.get("/top-airing", async (req: Request, res: Response) => {
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
  }
})

app.get("/popular", async (req: Request, res: Response) => {
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
  }
})

app.get("/movies", async (req: Request, res: Response) => {
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
  }
})

app.get("/anime-list", async (req: Request, res: Response) => {
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
  }
})

app.get("/new-season", async (req: Request, res: Response) => {
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
  }
})

app.get("/completed-anime", async (req: Request, res: Response) => {
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
  }
})

app.get("/download", async (req: Request, res: Response) => {
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
  }
})
