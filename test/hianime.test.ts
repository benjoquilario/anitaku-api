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
} from "../src/parsers/hianime"
import { afterAll, expect, test } from "vitest"

test("returns a available server for episodeId", async () => {
  const data = await fetchEpisodeServers(
    "no-longer-allowed-in-another-world-19247$ep$126001"
  )

  expect(data.episodeId).not.toEqual([])
})

test("returns a anime episode sources", async () => {
  const data = await fetchEpisodeSource(
    "no-longer-allowed-in-another-world-19247$ep$126001"
  )

  expect(data.sources).not.toEqual([])
})

test("returns a filled array of anime list", async () => {
  const data = await fetchGenre("action")

  expect(data.results).not.toEqual([])
})
test("returns a filled array of anime list", async () => {
  const data = await fetchLatestEpisodes()

  expect(data.results).not.toEqual([])
})

test("returns a filled array of anime list", async () => {
  const data = await search("naruto")
  expect(data.results).not.toEqual([])
})
test("returns a filled array of anime list", async () => {
  const data = await fetchTvSeries(1)
  expect(data.results).not.toEqual([])
})
test("returns a filled array of anime list", async () => {
  const data = await fetchMostPopular()
  expect(data.results).not.toEqual([])
})
test("returns a filled array of anime list", async () => {
  const data = await fetchTopAiring()
  expect(data.results).not.toEqual([])
})
test("returns a filled array of anime list", async () => {
  const data = await fetchMostFavorite()
  expect(data.results).not.toEqual([])
})
test("returns a filled array of anime list", async () => {
  const data = await fetchTrending()
  expect(data.results).not.toEqual([])
})
test("returns a filled array of anime list", async () => {
  const data = await fetchTopUpcoming()
  expect(data.results).not.toEqual([])
})
test("returns a filled array of anime list", async () => {
  const data = await fetchStudio("toei-animation")
  expect(data.results).not.toEqual([])
})
test("returns a filled array of anime list", async () => {
  const data = await fetchSpotlight()
  expect(data.results).not.toEqual([])
})
test("returns a filled array of anime list", async () => {
  const data = await fetchRecentlyAdded()

  expect(data.results).not.toEqual([])
})
test("returns a filled array of anime list", async () => {
  const data = await fetchLatestCompleted()

  expect(data.results).not.toEqual([])
})
test("returns a filled array of most view anime", async () => {
  const data = await fetchMostView()

  expect(data.month).not.toEqual([])
  expect(data.today).not.toEqual([])
  expect(data.week).not.toEqual([])
})
test("returns a filled array of anime start with letter", async () => {
  const data = await fetchAzList("B")

  expect(data.results).not.toEqual([])
})
test("returns a filled object of anime data", async () => {
  const data = await fetchAnimeInfo("one-piece-100")

  expect(data).not.toBeNull()
})
test("returns a filled object of anime data", async () => {
  const data = await fetchAnimeEpisodes("one-piece-100")

  expect(data.episodes).not.toEqual([])
})
test("returns a filled object of anime data", async () => {
  const data = await fetchAnimeEpisodes("one-piece-100")

  expect(data.episodes).not.toEqual([])
})
