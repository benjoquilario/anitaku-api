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
  fetchAnimeData,
} from "../src/parsers/gogoanime"

import { afterAll, expect, test } from "vitest"

test("returns a available server for episodeId", async () => {
  const data = await fetchEpisodeServers("one-piece-episode-1")

  expect(data).not.toBeNull()
})

test("returns a anime episode sources", async () => {
  const data = await fetchEpisodeSources("one-piece-episode-1")

  expect(data.sources).not.toEqual([])
})

test("returns a filled array of anime list", async () => {
  const data = await fetchGenreInfo("action")

  expect(data.results).not.toEqual([])
})
test("returns a filled array of anime list", async () => {
  const data = await fetchAnimeData("one-piece")

  expect(data.results).not.toEqual([])
})

test("returns a filled array of anime list", async () => {
  const data = await search("naruto")
  expect(data.results).not.toEqual([])
})
test("returns a filled array of anime list", async () => {
  const data = await fetchRequestList()
  expect(data.results).not.toEqual([])
})
test("returns a filled array of anime list", async () => {
  const data = await fetchUpcomingAnime()
  expect(data.results).not.toEqual([])
})
test("returns a filled array of anime list", async () => {
  const data = await fetchTopAiring()
  expect(data.results).not.toEqual([])
})
test("returns a filled array of anime list", async () => {
  const data = await fetchCompletedAnime()
  expect(data.results).not.toEqual([])
})
test("returns a filled array of anime list", async () => {
  const data = await fetchNewSeason()
  expect(data.results).not.toEqual([])
})
test("returns a filled array of anime list", async () => {
  const data = await fetchPopular()
  expect(data.results).not.toEqual([])
})
test("returns a filled array of anime list", async () => {
  const data = await fetchRecentMovies()
  expect(data.results).not.toEqual([])
})
test("returns a filled array of anime list", async () => {
  const data = await fetchAnimeList()
  expect(data.results).not.toEqual([])
})
test("returns a filled array of anime list", async () => {
  const data = await fetchGenreList()

  expect(data).not.toEqual([])
})
test("returns a filled array of anime list", async () => {
  const data = await fetchRecentEpisodes()

  expect(data.results).not.toEqual([])
})

test("returns a filled array of anime start with letter", async () => {
  const data = await fetchAzList("B")

  expect(data.results).not.toEqual([])
})
test("returns a filled object of anime data", async () => {
  const data = await fetchAnimeInfo("one-piece")

  expect(data).not.toBeNull()
})
