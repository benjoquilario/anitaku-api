import axios, { AxiosError } from "axios"
import { load, type CheerioAPI } from "cheerio"
import createHttpError, { type HttpError } from "http-errors"
import type {
  ISearch,
  IAnimeResult,
  IAnimeInfo,
  MediaFormat,
  ISource,
  IEpisodeServer,
} from "../types/types"
import { IAnimeEpisode, SubOrSub, StreamingServers } from "../types/types"
import { config } from "dotenv"
import { USER_AGENT, ACCEPT_ENCODING_HEADER, ACCEPT_HEADER } from "../utils"
import { retrieveServerId, scrapeCard } from "../utils/methods"
import {
  IScrapedAnimeEpisodes,
  IScrapedAnimeMostView,
  IScrapedEpisodeServers,
} from "../types/parsers"
// import { MediaStatus, SubOrSub, StreamingServers } from "../types/types"

config()

const baseUrl = "https://hianime.to"

async function scrapeCardPage(
  url: string
): Promise<ISearch<IAnimeResult> | HttpError> {
  const results: ISearch<IAnimeResult> = {
    currentPage: 0,
    hasNextPage: false,
    totalPages: 0,
    results: [],
  }

  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept-Encoding": ACCEPT_ENCODING_HEADER,
        Accept: ACCEPT_HEADER,
        Referer: `${baseUrl}/${url}`,
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

    results.results = scrapeCard($, baseUrl, selector)

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

export const search = async function (
  query: string,
  page: number = 1
): Promise<ISearch<IAnimeResult> | HttpError> {
  const url = `${baseUrl}/search?keyword=${decodeURIComponent(query)}&page=${page}`

  return scrapeCardPage(url)
}

export const fetchAnimeInfo = async (
  id: string
): Promise<IAnimeInfo | HttpError> => {
  const results: IAnimeInfo = {
    id: id,
    title: "",
  }

  try {
    const animeUrl: URL = new URL(id, baseUrl)
    const { data } = await axios.get(animeUrl.href, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept-Encoding": ACCEPT_ENCODING_HEADER,
        Accept: ACCEPT_HEADER,
      },
    })

    const $: CheerioAPI = load(data)

    const selector = "#ani_detail .container .anis-content"

    try {
      results.anilistId = Number(
        JSON.parse($("body")?.find("#syncData")?.text())?.anilist_id
      )
      results.malId = Number(
        JSON.parse($("body")?.find("#syncData")?.text())?.mal_id
      )
    } catch (err) {
      results.anilistId = null
      results.malId = ""
    }

    results.title = $(selector)
      ?.find(".anisc-detail .film-name.dynamic-name")
      ?.text()
      ?.trim()

    results.japaneseTitle = $(
      "div.anisc-info div:nth-child(2) span.name"
    ).text()
    results.image = $("img.film-poster-img").attr("src")
    results.description = $("div.film-description").text().trim()
    // Movie, TV, OVA, ONA, Special, Music
    results.type = $("span.item")
      .last()
      .prev()
      .prev()
      .text()
      .toUpperCase() as MediaFormat
    results.url = `${baseUrl}/${id}`

    const recommendationsSelector =
      "#main-content .block_area.block_area_category .tab-content .flw-item"
    results.recommendations = scrapeCard($, baseUrl, recommendationsSelector)
    results.relatedAnime = []
    $("#main-sidebar section:nth-child(1) div.anif-block-ul li").each(
      (i, ele) => {
        const card = $(ele)
        const aTag = card.find(".film-name a")
        const id = aTag.attr("href")?.split("/")[1].split("?")[0]
        results.relatedAnime.push({
          id: id!,
          title: aTag.text(),
          url: `${baseUrl}${aTag.attr("href")}`,
          image: card.find("img")?.attr("data-src"),
          japaneseTitle: aTag.attr("data-jname"),
          type: card
            .find(".tick")
            .contents()
            .last()
            ?.text()
            ?.trim() as MediaFormat,
          sub: parseInt(card.find(".tick-item.tick-sub")?.text()) || 0,
          dub: parseInt(card.find(".tick-item.tick-dub")?.text()) || 0,
          episodes: parseInt(card.find(".tick-item.tick-eps")?.text()) || 0,
        })
      }
    )
    const hasSub: boolean =
      $("div.film-stats div.tick div.tick-item.tick-sub").length > 0
    const hasDub: boolean =
      $("div.film-stats div.tick div.tick-item.tick-dub").length > 0

    if (hasSub) {
      results.subOrDub = SubOrSub.SUB
      results.hasSub = hasSub
    }
    if (hasDub) {
      results.subOrDub = SubOrSub.DUB
      results.hasDub = hasDub
    }
    if (hasSub && hasDub) {
      results.subOrDub = SubOrSub.BOTH
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

export const fetchAnimeEpisodes = async (animeId: string) => {
  const results: IScrapedAnimeEpisodes = {
    totalEpisodes: 0,
    episodes: [],
  }

  try {
    const episodesAjax = await axios.get(
      `${baseUrl}/ajax/v2/episode/list/${animeId.split("-").pop()}`,
      {
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          Referer: `${baseUrl}/watch/${animeId}`,
        },
      }
    )

    const $$ = load(episodesAjax.data.html)

    results.totalEpisodes = $$("div.detail-infor-content > div > a").length
    $$("div.detail-infor-content > div > a").each((i, el) => {
      const id = $$(el).attr("href")?.split("/")[2]?.replace("?ep=", "$ep$")!
      const number = parseInt($$(el).attr("data-number")!)
      const title = $$(el).attr("title")
      const url = baseUrl + $$(el).attr("href")
      const isFiller = $$(el).hasClass("ssl-item-filler")
      const episodeId = $$(el)
        ?.attr("href")
        ?.split("/")
        ?.pop()
        ?.split("?ep=")
        ?.pop()!

      results.episodes?.push({
        id: id,
        episodeId: episodeId,
        number: number,
        title: title,
        isFiller: isFiller,
        url: url,
      })
    })

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

import MegaCloud from "../extractors/megacloud"
import RapidCloud from "../extractors/rapidcloud"
import StreamSB from "../extractors/streamsb"
import StreamTape from "../extractors/streamtape"

export const fetchEpisodeSource = async (
  episodeId: string,
  server: StreamingServers = StreamingServers.VidCloud,
  category: "sub" | "dub" | "raw" = "sub"
): Promise<ISource> => {
  if (episodeId.startsWith("http")) {
    const serverUrl = new URL(episodeId)

    switch (server) {
      case StreamingServers.VidStreaming:
      case StreamingServers.VidCloud:
        return {
          ...(await new MegaCloud().extract(serverUrl)),
        }
      case StreamingServers.StreamSB:
        return {
          headers: {
            Referer: serverUrl.href,
            watchsb: "streamsb",
            "User-Agent": USER_AGENT,
          },
          sources: await new StreamSB().extract(serverUrl, true),
        }
      case StreamingServers.StreamTape:
        return {
          headers: { Referer: serverUrl.href, "User-Agent": USER_AGENT },
          sources: await new StreamTape().extract(serverUrl),
        }
      default: // vidcloud
        return {
          headers: { Referer: serverUrl.href },
          ...(await new RapidCloud().extract(serverUrl)),
        }
    }
  }

  const epId = `${baseUrl}/watch/${episodeId
    .replace("$ep$", "?ep=")
    .replace(/\$auto|\$sub|\$dub/gi, "")}`

  try {
    const { data } = await axios.get(
      `${baseUrl}/ajax/v2/episode/servers?episodeId=${epId.split("?ep=")[1]}`,
      {
        headers: {
          Referer: epId,
          "User-Agent": USER_AGENT,
          "X-Requested-With": "XMLHttpRequest",
        },
      }
    )

    const $ = load(data.html)

    let serverId: string | null = null

    try {
      switch (server) {
        case StreamingServers.VidCloud: {
          serverId = retrieveServerId($, 1, category)
          if (!serverId) throw new Error("RapidCloud not found")
          break
        }
        case StreamingServers.VidStreaming: {
          serverId = retrieveServerId($, 4, category)
          if (!serverId) throw new Error("VidStreaming not found")
          break
        }
        case StreamingServers.StreamSB: {
          serverId = retrieveServerId($, 5, category)
          if (!serverId) throw new Error("StreamSB not found")
          break
        }
        case StreamingServers.StreamTape: {
          serverId = retrieveServerId($, 3, category)
          if (!serverId) throw new Error("StreamTape not found")
          break
        }
      }
    } catch (err) {
      throw createHttpError.NotFound("Couldn't find server. Try another server")
    }

    const {
      data: { link },
    } = await axios.get(`${baseUrl}/ajax/v2/episode/sources?id=${serverId}`)

    return await fetchEpisodeSource(link, server)
  } catch (err) {
    if (err instanceof AxiosError) {
      throw createHttpError(
        err?.response?.status || 500,
        err?.response?.statusText || "Something went wrong"
      )
    }
    //@ts-ignore
    throw createHttpError.InternalServerError(err?.message)
  }
}

export const fetchEpisodeServers = async (episodeId: string) => {
  const results: IScrapedEpisodeServers = {
    sub: [],
    dub: [],
    raw: [],
    episodeId,
    episodeNo: 0,
  }

  try {
    const epId = episodeId.split("$ep$")[1]

    const { data } = await axios.get(
      `${baseUrl}/ajax/v2/episode/servers?episodeId=${epId}`,
      {
        headers: {
          Accept: ACCEPT_HEADER,
          "User-Agent": USER_AGENT,
          "X-Requested-With": "XMLHttpRequest",
          "Accept-Encoding": ACCEPT_ENCODING_HEADER,
          Referer: `${baseUrl}/watch/${episodeId
            .replace("$ep$", "?ep=")
            .replace(/\$auto|\$sub|\$dub/gi, "")}`,
        },
      }
    )

    const $: CheerioAPI = load(data.html)

    const epNoSelector = ".server-notice strong"

    results.episodeNo = Number($(epNoSelector).text().split(" ").pop()) || 0
    $(`.ps_-block.ps_-block-sub.servers-sub .ps__-list .server-item`).each(
      (_, el) => {
        results.sub.push({
          serverName: $(el).find("a").text().toLowerCase().trim(),
          serverId: Number($(el)?.attr("data-server-id")?.trim()) || "",
        })
      }
    )

    $(`.ps_-block.ps_-block-sub.servers-dub .ps__-list .server-item`).each(
      (_, el) => {
        results.dub.push({
          serverName: $(el).find("a").text().toLowerCase().trim(),
          serverId: Number($(el)?.attr("data-server-id")?.trim()) || "",
        })
      }
    )

    $(`.ps_-block.ps_-block-sub.servers-raw .ps__-list .server-item`).each(
      (_, el) => {
        results.raw.push({
          serverName: $(el).find("a").text().toLowerCase().trim(),
          serverId: Number($(el)?.attr("data-server-id")?.trim()) || "",
        })
      }
    )

    return results
  } catch (err) {
    if (err instanceof AxiosError) {
      throw createHttpError(
        err?.response?.status || 500,
        err?.response?.statusText || "Something went wrong"
      )
    }
    //@ts-ignore
    throw createHttpError.InternalServerError(err?.message)
  }
}

export const fetchTvSeries = async function (
  page: number = 1
): Promise<ISearch<IAnimeResult> | HttpError> {
  const url = `${baseUrl}/tv?page=${page}`

  return scrapeCardPage(url)
}

export const fetchMostPopular = async function (
  page: number = 1
): Promise<ISearch<IAnimeResult> | HttpError> {
  const url = `${baseUrl}/most-popular?page=${page}`

  return scrapeCardPage(url)
}

export const fetchTopAiring = async function (
  page: number = 1
): Promise<ISearch<IAnimeResult> | HttpError> {
  const url = `${baseUrl}/top-airing?page=${page}`

  return scrapeCardPage(url)
}

export const fetchMostFavorite = async function (
  page: number = 1
): Promise<ISearch<IAnimeResult> | HttpError> {
  const url = `${baseUrl}/most-favorite?page=${page}`

  return scrapeCardPage(url)
}

export const fetchGenre = async function (genre: string, page: number = 1) {
  const url = `${baseUrl}/genre/${genre}?page=${page}`

  return scrapeCardPage(url)
}

export const fetchLatestCompleted = async function (
  page: number = 1
): Promise<ISearch<IAnimeResult> | HttpError> {
  const url = `${baseUrl}/completed?page=${page}`

  return scrapeCardPage(url)
}

export const fetchRecentlyAdded = async function (
  page: number = 1
): Promise<ISearch<IAnimeResult> | HttpError> {
  const url = `${baseUrl}/recently-added?page=${page}`

  return scrapeCardPage(url)
}

export const fetchLatestEpisodes = async function (
  page: number = 1
): Promise<ISearch<IAnimeResult> | HttpError> {
  const url = `${baseUrl}/recently-updated?page=${page}`

  return scrapeCardPage(url)
}

export const fetchTopUpcoming = async function (
  page: number = 1
): Promise<ISearch<IAnimeResult> | HttpError> {
  const url = `${baseUrl}/top-upcoming?page=${page}`

  return scrapeCardPage(url)
}

export const fetchStudio = async function (
  studio: string,
  page: number = 1
): Promise<ISearch<IAnimeResult> | HttpError> {
  const url = `${baseUrl}/producer/${studio}?page=${page}`

  return scrapeCardPage(url)
}

export const fetchAzList = async function (
  letter: string,
  page: number = 1
): Promise<ISearch<IAnimeResult> | HttpError> {
  const results: ISearch<IAnimeResult> = {
    currentPage: 0,
    hasNextPage: false,
    totalPages: 0,
    results: [],
  }

  try {
    const url = `${baseUrl}/az-list/${letter}?page=${page}`

    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept-Encoding": ACCEPT_ENCODING_HEADER,
        Accept: ACCEPT_HEADER,
      },
    })

    const $: CheerioAPI = load(data)

    const selector =
      "#main-wrapper .page-az-wrap .tab-content .film_list-wrap .flw-item"
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

    results.results = scrapeCard($, baseUrl, selector)

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

export const fetchSpotlight = async function (): Promise<
  ISearch<IAnimeResult> | HttpError
> {
  const results: ISearch<IAnimeResult> = {
    results: [],
  }

  try {
    const url = `${baseUrl}/home`
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept-Encoding": ACCEPT_ENCODING_HEADER,
        Accept: ACCEPT_HEADER,
      },
    })

    const $: CheerioAPI = load(data)

    const spotlightSelector = "#slider .swiper-wrapper .swiper-slide"

    $(spotlightSelector).each((i, el) => {
      const otherInfo = $(el)
        .find(".deslide-item-content .sc-detail .scd-item")
        .map((i, el) => $(el).text().trim())
        .get()
        .slice(0, -1)

      const id =
        $(el)
          .find("div.desi-buttons .btn-secondary")
          .attr("href")
          ?.match(/\/([^/]+)$/)?.[1] || null
      const img = $(el).find("img.film-poster-img")
      results.results.push({
        rank:
          Number(
            $(el)
              .find(".deslide-item-content .desi-sub-text")
              ?.text()
              .trim()
              .split(" ")[0]
              .slice(1)
          ) || null,
        id: id!,
        title: $(el)
          .find(".deslide-item-content .desi-head-title.dynamic-name")
          ?.text()
          .trim(),
        description: $(el)
          .find(".deslide-item-content .desi-description")
          ?.text()
          ?.split("[")
          ?.shift()
          ?.trim(),
        url: `${baseUrl}/${id}`,
        type: $(el)
          .find("div.sc-detail .scd-item:nth-child(1)")
          .text()
          .trim() as MediaFormat,
        banner: img.attr("data-src") || img.attr("src") || null,
        duration: $(el).find("div.sc-detail > div:nth-child(2)").text().trim(),
        releaseDate: $(el)
          .find("div.sc-detail > div:nth-child(3)")
          .text()
          .trim(),
        japaneseTitle: $(el)
          .find(".deslide-item-content .desi-head-title.dynamic-name")
          ?.attr("data-jname")
          ?.trim(),
        episodes: {
          sub:
            Number(
              $(el)
                .find(
                  ".deslide-item-content .sc-detail .scd-item .tick-item.tick-sub"
                )
                ?.text()
                ?.trim()
            ) || 0,
          dub:
            Number(
              $(el)
                .find(
                  ".deslide-item-content .sc-detail .scd-item .tick-item.tick-dub"
                )
                ?.text()
                ?.trim()
            ) || 0,
        },
        otherInfo,
      })
    })

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

export const fetchTrending = async function (): Promise<
  ISearch<IAnimeResult> | HttpError
> {
  const results: ISearch<IAnimeResult> = {
    results: [],
  }

  try {
    const url = `${baseUrl}/home`
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept-Encoding": ACCEPT_ENCODING_HEADER,
        Accept: ACCEPT_HEADER,
      },
    })

    const $: CheerioAPI = load(data)

    const trendingSelector = "#trending-home .swiper-wrapper .swiper-slide"

    $(trendingSelector).each((i, el) => {
      const id = $(el)
        .find(".item .film-poster")
        ?.attr("href")
        ?.slice(1)
        ?.trim()

      results.results.push({
        rank: parseInt(
          $(el).find(".item .number")?.children()?.first()?.text()?.trim()
        ),
        id: id!,
        title: $(el)
          .find(".item .number .film-title.dynamic-name")
          ?.text()
          ?.trim(),
        japaneseTitle: $(el)
          .find(".item .number .film-title.dynamic-name")
          ?.attr("data-jname")
          ?.trim(),
        image: $(el)
          .find(".item .film-poster .film-poster-img")
          ?.attr("data-src")
          ?.trim(),
      })
    })

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

export const fetchMostView = async function (): Promise<
  IScrapedAnimeMostView | HttpError
> {
  const results: IScrapedAnimeMostView = {
    today: {
      results: [],
    },
    week: {
      results: [],
    },
    month: {
      results: [],
    },
  }

  function scrapeMostViewCard($: CheerioAPI, period: string) {
    const mostViewResults: Array<IAnimeResult> = []

    const selector = `#top-viewed-${period} ul li`

    $(selector).each((_, el) => {
      const id = $(el)
        .find(".film-detail .dynamic-name")
        ?.attr("href")
        ?.slice(1)
        .trim()

      mostViewResults.push({
        id: id!,
        rank: Number($(el).find(".film-number span")?.text()?.trim()) || null,
        title: $(el).find(".film-detail .dynamic-name")?.text()?.trim(),
        japaneseTitle:
          $(el)
            .find(".film-detail .dynamic-name")
            ?.attr("data-jname")
            ?.trim() || null,
        image: $(el)
          .find(".film-poster .film-poster-img")
          ?.attr("data-src")
          ?.trim(),
        episodes: {
          sub:
            Number(
              $(el)
                .find(".film-detail .fd-infor .tick-item.tick-sub")
                ?.text()
                ?.trim()
            ) || null,
          dub:
            Number(
              $(el)
                .find(".film-detail .fd-infor .tick-item.tick-dub")
                ?.text()
                ?.trim()
            ) || null,
        },
      })
    })

    return mostViewResults
  }

  try {
    const url = `${baseUrl}/home`
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept-Encoding": ACCEPT_ENCODING_HEADER,
        Accept: ACCEPT_HEADER,
      },
    })

    const $: CheerioAPI = load(data)

    const mostViewedSelector =
      '#main-sidebar .block_area-realtime [id^="top-viewed-"]'
    $(mostViewedSelector).each((i, el) => {
      const period = $(el).attr("id")?.split("-")?.pop()?.trim()

      if (period === "day") {
        results.today.results = scrapeMostViewCard($, period)
        return
      }
      if (period === "week") {
        results.week.results = scrapeMostViewCard($, period)
        return
      }
      if (period === "month") {
        results.week.results = scrapeMostViewCard($, period)
      }
    })

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

export const fetchAiringSchedule = async function (
  date: string = new Date().toISOString().slice(0, 10)
): Promise<ISearch<IAnimeResult> | HttpError> {
  const results: ISearch<IAnimeResult> = {
    results: [],
  }

  try {
    const {
      data: { html },
    } = await axios.get(
      `${baseUrl}/ajax/schedule/list?tzOffset=360&date=${date}`,
      {
        headers: {
          Accept: "*/*",
          Referer: `${baseUrl}/home`,
          "User-Agent": USER_AGENT,
          "X-Requested-With": "XMLHttpRequest",
          "Accept-Encoding": ACCEPT_ENCODING_HEADER,
        },
      }
    )

    const $ = load(html)

    if ($("li")?.text()?.trim()?.includes("No data to display")) {
      return results
    }

    $("li").each((i, ele) => {
      const card = $(ele)
      const title = card.find(".film-name")

      const id = card
        .find("a.tsl-link")
        .attr("href")
        ?.split("/")[1]
        .split("?")[0]
      const airingTime = card.find("div.time").text().replace("\n", "").trim()
      const airingEpisode = card
        .find("div.film-detail div.fd-play button")
        .text()
        .replace("\n", "")
        .trim()
      results.results.push({
        id: id!,
        title: title.text(),
        japaneseTitle: title.attr("data-jname"),
        url: `${baseUrl}/${id}`,
        airingEpisode: airingEpisode,
        airingTime: airingTime,
      })
    })

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

export const fetchSearchSuggestion = async function (
  query: string
): Promise<ISearch<IAnimeResult> | HttpError> {
  try {
    const encodedQuery = encodeURIComponent(query)
    const { data } = await axios.get(
      `${baseUrl}/ajax/search/suggest?keyword=${encodedQuery}`,
      {
        headers: {
          Accept: "*/*",
          Pragma: "no-cache",
          Referer: `${baseUrl}/home`,
          "User-Agent": USER_AGENT,
          "X-Requested-With": "XMLHttpRequest",
          "Accept-Encoding": ACCEPT_ENCODING_HEADER,
        },
      }
    )
    const $ = load(data.html)
    const res: ISearch<IAnimeResult> = {
      results: [],
    }

    $(".nav-item").each((i, el) => {
      const card = $(el)
      if (!card.hasClass("nav-bottom")) {
        const image = card.find(".film-poster img").attr("data-src")
        const title = card.find(".film-name")
        const id = card.attr("href")?.split("/")[1].split("?")[0]

        const duration = card.find(".film-infor span").last().text().trim()
        const releaseDate = card
          .find(".film-infor span:nth-child(1)")
          .text()
          .trim()
        const type = card
          .find(".film-infor")
          .find("span, i")
          .remove()
          .end()
          .text()
          .trim()
        res.results.push({
          image: image,
          id: id!,
          title: title.text(),
          japaneseTitle: title.attr("data-jname"),
          aliasTitle: card.find(".alias-name").text(),
          releaseDate: releaseDate,
          type: type as MediaFormat,
          duration: duration,
          url: `${baseUrl}/${id}`,
        })
      }
    })

    return res
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
