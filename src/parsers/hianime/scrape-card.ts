import { ISearch, IAnimeResult } from "../../types/types"
import createHttpError, { HttpError } from "http-errors"
import { USER_AGENT, ACCEPT_ENCODING_HEADER, ACCEPT_HEADER } from "../../utils"
import { hiAnimeBaseUrl } from "../../utils/constants"
import instance, { AxiosError } from "../../utils/axios"
import { CheerioAPI, load } from "cheerio"
import { scrapeCard } from "../../utils/methods"

export async function scrapeCardPage(
  url: string
): Promise<ISearch<IAnimeResult> | HttpError> {
  const results: ISearch<IAnimeResult> = {
    currentPage: 0,
    hasNextPage: false,
    totalPages: 0,
    results: [],
  }

  try {
    const { data } = await instance(hiAnimeBaseUrl).get(url, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept-Encoding": ACCEPT_ENCODING_HEADER,
        Accept: ACCEPT_HEADER,
        Referer: `${hiAnimeBaseUrl}/${url}`,
      },
    })

    const $: CheerioAPI = load(data)

    const selector = "#main-content .tab-content .film_list-wrap .flw-item"
    const pagination = $("ul.pagination")
    results.currentPage = parseInt(pagination.find(".page-item.active")?.text())

    const nextPage = pagination.find("a[title=Next]")?.attr("href")

    if (nextPage != undefined && nextPage != "") {
      results.hasNextPage = true
    }

    const totalPages = pagination
      .find("a[title=Last]")
      .attr("href")
      ?.split("=")
      .pop()
    if (totalPages === undefined || totalPages === "") {
      results.totalPages = results.currentPage
    } else {
      results.totalPages = parseInt(totalPages)
    }

    results.results = scrapeCard($, hiAnimeBaseUrl, selector)

    if (results.results.length === 0) {
      results.currentPage = 0
      results.hasNextPage = false
      results.totalPages = 0
    }

    return results
  } catch (err) {
    if (err instanceof AxiosError) {
      throw createHttpError(
        err?.response?.status || 500,
        err?.response?.statusText || "Something went wrong"
      )
    }
    // @ts-ignore
    throw createHttpError.InternalServerError(err?.message)
  }
}

export const fetchTvSeries = async function (
  page: number = 1
): Promise<ISearch<IAnimeResult> | HttpError> {
  const url = `/tv?page=${page}`

  return scrapeCardPage(url)
}

export const fetchMostPopular = async function (
  page: number = 1
): Promise<ISearch<IAnimeResult> | HttpError> {
  const url = `/most-popular?page=${page}`

  return scrapeCardPage(url)
}

export const fetchTopAiring = async function (
  page: number = 1
): Promise<ISearch<IAnimeResult> | HttpError> {
  const url = `/top-airing?page=${page}`

  return scrapeCardPage(url)
}

export const fetchMostFavorite = async function (
  page: number = 1
): Promise<ISearch<IAnimeResult> | HttpError> {
  const url = `/most-favorite?page=${page}`

  return scrapeCardPage(url)
}

export const fetchGenre = async function (genre: string, page: number = 1) {
  const url = `/genre/${genre}?page=${page}`

  return scrapeCardPage(url)
}

export const fetchLatestCompleted = async function (
  page: number = 1
): Promise<ISearch<IAnimeResult> | HttpError> {
  const url = `/completed?page=${page}`

  return scrapeCardPage(url)
}

export const fetchRecentlyAdded = async function (
  page: number = 1
): Promise<ISearch<IAnimeResult> | HttpError> {
  const url = `/recently-added?page=${page}`

  return scrapeCardPage(url)
}

export const fetchLatestEpisodes = async function (
  page: number = 1
): Promise<ISearch<IAnimeResult> | HttpError> {
  const url = `/recently-updated?page=${page}`

  return scrapeCardPage(url)
}

export const fetchTopUpcoming = async function (
  page: number = 1
): Promise<ISearch<IAnimeResult> | HttpError> {
  const url = `/top-upcoming?page=${page}`

  return scrapeCardPage(url)
}

export const fetchStudio = async function (
  studio: string,
  page: number = 1
): Promise<ISearch<IAnimeResult> | HttpError> {
  const url = `/producer/${studio}?page=${page}`

  return scrapeCardPage(url)
}
