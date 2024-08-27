import axios, { AxiosError } from "axios"
import { CheerioAPI, load } from "cheerio"
import type {
  ISearch,
  IAnimeResult,
  IAnimeInfo,
  MediaFormat,
  ISource,
  IEpisodeServer,
} from "../types/types"
import createHttpError, { type HttpError } from "http-errors"
import { MediaStatus, SubOrSub, StreamingServers } from "../types/types"
import GogoCDN from "../extractors/gogocdn"
import StreamSB from "../extractors/streamsb"
import { USER_AGENT, ACCEPT_ENCODING_HEADER, ACCEPT_HEADER } from "../utils"

const animeName = "Gogoanime"
const baseUrl = "https://anitaku.pe"
const gogoUrl = "https://gogotaku.info"
const logo =
  "https://play-lh.googleusercontent.com/MaGEiAEhNHAJXcXKzqTNgxqRmhuKB1rCUgb15UrN_mWUNRnLpO5T1qja64oRasO7mn0"
const classPath = "ANIME.Gogoanime"
const ajaxUrl = "https://ajax.gogocdn.net/ajax"

export const search = async function (
  query: string,
  page: number = 1
): Promise<ISearch<IAnimeResult> | HttpError> {
  const searchResult: ISearch<IAnimeResult> = {
    currentPage: page,
    hasNextPage: false,
    results: [],
  }
  try {
    const res = await axios.get(
      `${baseUrl}/filter.html?keyword=${encodeURIComponent(query)}&page=${page}`
    )

    const $ = load(res.data)

    searchResult.hasNextPage =
      $("div.anime_name.new_series > div > div > ul > li.selected").next()
        .length > 0

    $("div.last_episodes > ul > li").each((i, el) => {
      searchResult.results.push({
        id: $(el).find("p.name > a").attr("href")?.split("/")[2]!,
        title: $(el).find("p.name > a").text(),
        url: `${baseUrl}/${$(el).find("p.name > a").attr("href")}`,
        image: $(el).find("div > a > img").attr("src"),
        releaseDate: $(el).find("p.released").text().trim(),
        subOrDub: $(el)
          .find("p.name > a")
          .text()
          .toLowerCase()
          .includes("(dub)")
          ? SubOrSub.DUB
          : SubOrSub.SUB,
      })
    })

    return searchResult
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

export const fetchAnimeInfo = async (
  id: string
): Promise<IAnimeInfo | HttpError> => {
  if (!id.includes("gogoanime")) id = `${baseUrl}/category/${id}`

  const animeInfo: IAnimeInfo = {
    id: "",
    title: "",
    url: "",
    genres: [],
    totalEpisodes: 0,
  }
  try {
    const { data } = await axios.get(id)

    const $: CheerioAPI = load(data)

    animeInfo.id = new URL(id).pathname.split("/")[2]
    animeInfo.title = $(
      "section.content_left > div.main_body > div:nth-child(2) > div.anime_info_body_bg > h1"
    )
      .text()
      .trim()
    animeInfo.url = id
    animeInfo.image = $("div.anime_info_body_bg > img").attr("src")
    animeInfo.releaseDate = $("div.anime_info_body_bg > p:nth-child(8)")
      .text()
      .trim()
      .split("Released: ")[1]
    animeInfo.description = $("div.anime_info_body_bg > div:nth-child(6)")
      .text()
      .trim()
      .replace("Plot Summary: ", "")

    animeInfo.subOrDub = animeInfo.title.toLowerCase().includes("dub")
      ? SubOrSub.DUB
      : SubOrSub.SUB

    animeInfo.type = $("div.anime_info_body_bg > p:nth-child(4) > a")
      .text()
      .trim()
      .toUpperCase() as MediaFormat

    animeInfo.status = MediaStatus.UNKNOWN

    switch ($("div.anime_info_body_bg > p:nth-child(9) > a").text().trim()) {
      case "Ongoing":
        animeInfo.status = MediaStatus.ONGOING
        break
      case "Completed":
        animeInfo.status = MediaStatus.COMPLETED
        break
      case "Upcoming":
        animeInfo.status = MediaStatus.NOT_YET_AIRED
        break
      default:
        animeInfo.status = MediaStatus.UNKNOWN
        break
    }
    animeInfo.otherName = $("div.anime_info_body_bg > p:nth-child(10)")
      .text()
      .replace("Other name: ", "")
      .replace(/;/g, ",")

    $("div.anime_info_body_bg > p:nth-child(7) > a").each((i, el) => {
      animeInfo.genres?.push($(el).attr("title")!.toString())
    })

    const ep_start = $("#episode_page > li").first().find("a").attr("ep_start")
    const ep_end = $("#episode_page > li").last().find("a").attr("ep_end")
    const movie_id = $("#movie_id").attr("value")
    const alias = $("#alias_anime").attr("value")

    const html = await axios.get(
      `${
        ajaxUrl
      }/load-list-episode?ep_start=${ep_start}&ep_end=${ep_end}&id=${movie_id}&default_ep=${0}&alias=${alias}`
    )
    const $$ = load(html.data)

    animeInfo.episodes = []
    $$("#episode_related > li").each((i, el) => {
      animeInfo.episodes?.push({
        id: $(el).find("a").attr("href")?.split("/")[1]!,
        number: parseFloat($(el).find(`div.name`).text().replace("EP ", "")),
        url: `${baseUrl}/${$(el).find(`a`).attr("href")?.trim()}`,
      })
    })
    animeInfo.episodes = animeInfo.episodes.reverse()

    animeInfo.totalEpisodes = parseInt(ep_end ?? "0")

    return animeInfo
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

export const fetchAnimeData = async (id: string) => {
  const animeInfo: IAnimeInfo = {
    id: "",
    title: "",
    url: "",
    genres: [],
  }

  try {
    if (!id.includes("gogoanime")) id = `${gogoUrl}/category/${id}`

    const { data } = await axios.get(id, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept-Encoding": ACCEPT_ENCODING_HEADER,
        Accept: ACCEPT_HEADER,
      },
    })

    const $: CheerioAPI = load(data)

    const info = $("div.anime_info_body_bg")

    animeInfo.id = new URL(id).pathname.split("/")[2]
    animeInfo.title = $(
      "section.content_left > div.main_body > div:nth-child(2) > div.anime_info_body_bg > h1"
    )
      .text()
      .trim()
    animeInfo.url = `${baseUrl}/category/${new URL(id).pathname.split("/")[2]}`
    animeInfo.image = $("div.anime_info_body_bg > img").attr("data-original")
    animeInfo.releaseDate = $("div.anime_info_body_bg > p:nth-child(7)")
      .text()
      .trim()
      .replace("Released: ", "")

    animeInfo.description = $("div.anime_info_body_bg > div.description")
      .text()
      .trim()
      .replace("Plot Summary: ", "")

    animeInfo.subOrDub = animeInfo.title.toLowerCase().includes("dub")
      ? SubOrSub.DUB
      : SubOrSub.SUB

    animeInfo.type = $("div.anime_info_body_bg > p:nth-child(3)")
      .text()
      .trim()
      .replace("Type: ", "") as MediaFormat

    animeInfo.status = MediaStatus.UNKNOWN

    switch (
      $("div.anime_info_body_bg > p:nth-child(8)")
        .text()
        .trim()
        .replace("Status: ", "")
    ) {
      case "Ongoing":
        animeInfo.status = MediaStatus.ONGOING
        break
      case "Completed":
        animeInfo.status = MediaStatus.COMPLETED
        break
      case "Upcoming":
        animeInfo.status = MediaStatus.NOT_YET_AIRED
        break
      default:
        animeInfo.status = MediaStatus.UNKNOWN
        break
    }
    animeInfo.otherName = $("div.anime_info_body_bg > p:nth-child(10) > a")
      .text()
      .replace("Other name: ", "")
      .replace(/;/g, ",")

    animeInfo.genres = $("div.anime_info_body_bg > p:nth-child(6)")
      .text()
      .replace("Genre: ", "")
      .split(", ")

    animeInfo.countryOfOrigin = $("div.anime_info_body_bg > p:nth-child(9)")
      .text()
      .replace("Country: ", "")

    animeInfo.airDate = $("div.anime_info_body_bg > p:nth-child(11)")
      .text()
      .replace("Aired: ", "")
    animeInfo.relations = []

    $("div.page_content.related_anime > ul > li").each((i, el) => {
      animeInfo.relations?.push({
        id: $(el).find("div.name > a").attr("href")?.replace("/category/", "")!,
        title:
          $(el).find("div.name > a").attr("title")! ??
          $(el).find("div.name > a > h4").text()!,
        image: $(el).find("div.img > a img").attr("data-original"),
        releaseDate: $(el)
          .find("p.released")
          .text()
          .replace("Released: ", "")
          .trim(),
      })
    })

    animeInfo.charactersAndVoiceActors = []

    $("div.list_characters_voice > ul > li").each((i, el) => {
      animeInfo.charactersAndVoiceActors?.push({
        characters: {
          image: $(el)
            .find("div.left div.picture div.img > a img")
            .attr("data-original"),
          id: $(el)
            .find("div.left div.picture div.img > a")
            .attr("href")
            ?.replace("/characters", ""),
          title: $(el).find("div.left div.bottom p.title > a").attr("title"),
          roles: $(el).find("div.left div.bottom p.roles").text().trim(),
        },
        voiceActors: {
          image: $(el)
            .find("div.right div.picture div.img > a img")
            .attr("data-original"),
          id: $(el)
            .find("div.right div.picture div.img > a")
            .attr("href")
            ?.replace("/characters", ""),
          title: $(el).find("div.right div.bottom p.title > a").attr("title"),
          roles: $(el).find("div.right div.bottom p.roles").text().trim(),
        },
      })
    })

    return animeInfo
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

export const fetchEpisodeSources = async (
  episodeId: string,
  server: StreamingServers = StreamingServers.VidStreaming,
  downloadUrl: string | undefined = undefined
): Promise<ISource | HttpError> => {
  if (episodeId.startsWith("http")) {
    const serverUrl = new URL(episodeId)
    switch (server) {
      case StreamingServers.GogoCDN:
        return {
          headers: { Referer: serverUrl.href },
          sources: await new GogoCDN().extract(serverUrl),
          download: downloadUrl
            ? downloadUrl
            : `https://${serverUrl.host}/download${serverUrl.search}`,
        }
      case StreamingServers.StreamSB:
        return {
          headers: {
            Referer: serverUrl.href,
            watchsb: "streamsb",
            "User-Agent": USER_AGENT,
          },
          sources: await new StreamSB().extract(serverUrl),
          download: downloadUrl
            ? downloadUrl
            : `https://${serverUrl.host}/download${serverUrl.search}`,
        }
      case StreamingServers.StreamWish:
        return {
          headers: {
            Referer: serverUrl.href,
          },
          sources: await new StreamSB().extract(serverUrl),
          download: downloadUrl
            ? downloadUrl
            : `https://${serverUrl.host}/download${serverUrl.search}`,
        }
      default:
        return {
          headers: { Referer: serverUrl.href },
          sources: await new GogoCDN().extract(serverUrl),
          download: downloadUrl
            ? downloadUrl
            : `https://${serverUrl.host}/download${serverUrl.search}`,
        }
    }
  }

  try {
    const res = await axios.get(`${baseUrl}/${episodeId}`)

    const $ = load(res.data)

    let serverUrl: URL

    switch (server) {
      case StreamingServers.GogoCDN:
        serverUrl = new URL(
          `${$("#load_anime > div > div > iframe").attr("src")}`
        )
        break
      case StreamingServers.VidStreaming:
        serverUrl = new URL(
          `${$("div.anime_video_body > div.anime_muti_link > ul > li.vidcdn > a").attr("data-video")}`
        )
        break
      case StreamingServers.StreamSB:
        serverUrl = new URL(
          $(
            "div.anime_video_body > div.anime_muti_link > ul > li.streamsb > a"
          ).attr("data-video")!
        )
        break
      case StreamingServers.StreamWish:
        serverUrl = new URL(
          $(
            "div.anime_video_body > div.anime_muti_link > ul > li.streamwish > a"
          ).attr("data-video")!
        )
        break
      default:
        serverUrl = new URL(
          `${$("#load_anime > div > div > iframe").attr("src")}`
        )
        break
    }

    const downloadLink = `${$(".dowloads > a").attr("href")}`

    return downloadLink
      ? await fetchEpisodeSources(serverUrl.href, server, downloadLink)
      : await fetchEpisodeSources(serverUrl.href, server)
  } catch (err) {
    console.log(err)
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

export const fetchEpisodeServers = async (
  episodeId: string
): Promise<IEpisodeServer[] | HttpError> => {
  try {
    if (!episodeId.startsWith(baseUrl)) episodeId = `${baseUrl}/${episodeId}`

    const res = await axios.get(episodeId)

    const $ = load(res.data)

    const servers: IEpisodeServer[] = []

    $("div.anime_video_body > div.anime_muti_link > ul > li").each((i, el) => {
      let url = $(el).find("a").attr("data-video")
      if (!url?.startsWith("http")) url = `https:${url}`

      servers.push({
        name: $(el).find("a").text().replace("Choose this server", "").trim(),
        url: url,
      })
    })

    return servers
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

export const fetchRecentEpisodes = async (
  page: number = 1,
  type: number = 1
): Promise<ISearch<IAnimeResult> | HttpError> => {
  try {
    const res = await axios.get(
      `${ajaxUrl}/page-recent-release.html?page=${page}&type=${type}`
    )

    const $ = load(res.data)

    const recentEpisodes: IAnimeResult[] = []

    $("div.last_episodes.loaddub > ul > li").each((i, el) => {
      recentEpisodes.push({
        id: $(el).find("a").attr("href")?.split("/")[1]?.split("-episode")[0]!,
        episodeId: $(el).find("a").attr("href")?.split("/")[1]!,
        episodeNumber: parseFloat(
          $(el).find("p.episode").text().replace("Episode ", "")
        ),
        title: $(el).find("p.name > a").attr("title")!,
        image: $(el).find("div > a > img").attr("src"),
        url: `${baseUrl}${$(el).find("a").attr("href")?.trim()}`,
      })
    })

    const hasNextPage = !$("div.anime_name_pagination.intro > div > ul > li")
      .last()
      .hasClass("selected")

    return {
      currentPage: page,
      hasNextPage: hasNextPage,
      results: recentEpisodes,
    }
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

export const fetchTopAiring = async (
  page: number = 1
): Promise<ISearch<IAnimeResult> | HttpError> => {
  try {
    const res = await axios.get(
      `${ajaxUrl}/page-recent-release-ongoing.html?page=${page}`
    )

    const $ = load(res.data)

    const topAiring: IAnimeResult[] = []

    $("div.added_series_body.popular > ul > li").each((i, el) => {
      topAiring.push({
        id: $(el).find("a:nth-child(1)").attr("href")?.split("/")[2]!,
        title: $(el).find("a:nth-child(1)").attr("title")!,
        image: $(el)
          .find("a:nth-child(1) > div")
          .attr("style")
          ?.match("(https?://.*.(?:png|jpg))")![0],
        url: `${baseUrl}${$(el).find("a:nth-child(1)").attr("href")}`,
        genres: $(el)
          .find("p.genres > a")
          .map((i, el) => $(el).attr("title"))
          .get(),
      })
    })

    const hasNextPage = !$("div.anime_name.comedy > div > div > ul > li")
      .last()
      .hasClass("selected")

    return {
      currentPage: page,
      hasNextPage: hasNextPage,
      results: topAiring,
    }
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

export const fetchGenreInfo = async (
  genre: string,
  page: number = 1
): Promise<ISearch<IAnimeResult> | HttpError> => {
  try {
    const res = await axios.get(`${baseUrl}/genre/${genre}?page=${page}`)

    const $ = load(res.data)

    const genreInfo: IAnimeResult[] = []

    $("div.last_episodes > ul > li").each((i, elem) => {
      genreInfo.push({
        id: $(elem).find("p.name > a").attr("href")?.split("/")[2] as string,
        title: $(elem).find("p.name > a").text() as string,
        image: $(elem).find("div > a > img").attr("src"),
        released: $(elem)
          .find("p.released")
          .text()
          .replace("Released: ", "")
          .trim(),
        url: baseUrl + "/" + $(elem).find("p.name > a").attr("href"),
      })
    })

    const paginatorDom = $("div.anime_name_pagination > div > ul > li")
    const hasNextPage =
      paginatorDom.length > 0 && !paginatorDom.last().hasClass("selected")
    return {
      currentPage: page,
      hasNextPage: hasNextPage,
      results: genreInfo,
    }
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

export const fetchRecentMovies = async (
  page: number = 1
): Promise<ISearch<IAnimeResult> | HttpError> => {
  try {
    const res = await axios.get(`${baseUrl}/anime-movies.html?aph&page=${page}`)

    const $ = load(res.data)

    const recentMovies: IAnimeResult[] = []

    $("div.last_episodes > ul > li").each((i, el) => {
      const a = $(el).find("p.name > a")
      const pRelease = $(el).find("p.released")
      const pName = $(el).find("p.name > a")

      recentMovies.push({
        id: a.attr("href")?.replace(`/category/`, "")!,
        title: pName.text()!,
        releaseDate: pRelease.text().replace("Released: ", "").trim(),
        image: $(el).find("div > a > img").attr("src"),
        url: `${baseUrl}${a.attr("href")}`,
      })
    })

    const hasNextPage = !$("div.anime_name.anime_movies > div > div > ul > li")
      .last()
      .hasClass("selected")

    return {
      currentPage: page,
      hasNextPage: hasNextPage,
      results: recentMovies,
    }
  } catch (err) {
    console.log(err)
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

export const fetchPopular = async (
  page: number = 1
): Promise<ISearch<IAnimeResult> | HttpError> => {
  try {
    const res = await axios.get(`${baseUrl}/popular.html?page=${page}`)

    const $ = load(res.data)

    const recentMovies: IAnimeResult[] = []

    $("div.last_episodes > ul > li").each((i, el) => {
      const a = $(el).find("p.name > a")
      const pRelease = $(el).find("p.released")
      const pName = $(el).find("p.name > a")

      recentMovies.push({
        id: a.attr("href")?.replace(`/category/`, "")!,
        title: pName.text()!,
        releaseDate: pRelease.text().replace("Released: ", "").trim(),
        image: $(el).find("div > a > img").attr("src"),
        url: `${baseUrl}${a.attr("href")}`,
      })
    })

    const hasNextPage = !$("div.anime_name.anime_movies > div > div > ul > li")
      .last()
      .hasClass("selected")

    return {
      currentPage: page,
      hasNextPage: hasNextPage,
      results: recentMovies,
    }
  } catch (err) {
    console.log(err)
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

export const fetchNewSeason = async (
  page: number = 1
): Promise<ISearch<IAnimeResult> | HttpError> => {
  try {
    const res = await axios.get(`${baseUrl}/new-season.html?page=${page}`)

    const $ = load(res.data)

    const newSeason: IAnimeResult[] = []

    $("div.last_episodes > ul > li").each((i, el) => {
      const a = $(el).find("p.name > a")
      const pRelease = $(el).find("p.released")
      const pName = $(el).find("p.name > a")

      newSeason.push({
        id: a.attr("href")?.replace(`/category/`, "")!,
        title: pName.text()!,
        releaseDate: pRelease.text().replace("Released: ", "").trim(),
        image: $(el).find("div > a > img").attr("src"),
        url: `${baseUrl}${a.attr("href")}`,
      })
    })

    const hasNextPage = !$("div.anime_name.anime_movies > div > div > ul > li")
      .last()
      .hasClass("selected")

    return {
      currentPage: page,
      hasNextPage: hasNextPage,
      results: newSeason,
    }
  } catch (err) {
    console.log(err)
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

export const fetchCompletedAnime = async (
  page: number = 1
): Promise<ISearch<IAnimeResult> | HttpError> => {
  try {
    const res = await axios.get(`${baseUrl}/completed-anime.html?page=${page}`)

    const $ = load(res.data)

    const completedAnime: IAnimeResult[] = []

    $("div.last_episodes > ul > li").each((i, el) => {
      const a = $(el).find("p.name > a")
      const pRelease = $(el).find("p.released")
      const pName = $(el).find("p.name > a")

      completedAnime.push({
        id: a.attr("href")?.replace(`/category/`, "")!,
        title: pName.text()!,
        releaseDate: pRelease.text().replace("Released: ", "").trim(),
        image: $(el).find("div > a > img").attr("src"),
        url: `${baseUrl}${a.attr("href")}`,
      })
    })

    const hasNextPage = !$("div.anime_name.anime_movies > div > div > ul > li")
      .last()
      .hasClass("selected")

    return {
      currentPage: page,
      hasNextPage: hasNextPage,
      results: completedAnime,
    }
  } catch (err) {
    console.log(err)
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
export const fetchGenreList = async (): Promise<
  { id: string | undefined; title: string | undefined }[] | HttpError
> => {
  const genres: { id: string | undefined; title: string | undefined }[] = []
  let res = null
  try {
    res = await axios.get(`${baseUrl}/home.html`)
  } catch (err) {
    try {
      res = await axios.get(`${baseUrl}/`)
    } catch (error) {
      throw new Error("Something went wrong. Please try again later.")
    }
  }
  try {
    const $ = load(res.data)
    $("nav.menu_series.genre.right > ul > li").each((_index, element) => {
      const genre = $(element).find("a")
      genres.push(
        {
          id: genre.attr("href")?.replace("/genre/", ""),
          title: genre.attr("title"),
        }!
      )
    })
    return genres
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

export const fetchDirectDownloadLink = async (
  downloadUrl: string,
  captchaToken?: string
): Promise<
  { source: string | undefined; link: string | undefined }[] | HttpError
> => {
  const downloadLinks: {
    source: string | undefined
    link: string | undefined
  }[] = []

  const baseUrl = downloadUrl.split("?")[0]
  const idParam = downloadUrl.match(/[?&]id=([^&]+)/)
  const animeID = idParam ? idParam[1] : null
  if (!captchaToken)
    captchaToken =
      "03AFcWeA5zy7DBK82U_tctVKelJ6L2duTWac5at2zXjHLX8XqUm8tI6NKWMxGd2gjh1vi2hnEyRhVgbMhdb9WjexRsJkxTt-C-_iIIZ5yC3E5I19G5Q0buSTcIQIZS6tskrz-mDn-d37aWxAJtqbg0Yoo1XsdVc5Yf4sB-9iQxQK-W_9YLep_QaAz8uL17gMMlCz5WZM3dbBEEGmk_qPbJu_pZ8kk-lFPDzd6iBobcpyIDRZgTgD4bYUnby5WZc11i00mrRiRS3m-qSY0lprGaBqoyY1BbRkQZ25AGPp5al4kSwBZqpcVgLrs3bjdo8XVWAe73_XLa8HhqLWbz_m5Ebyl5F9awwL7w4qikGj-AK7v2G8pgjT22kDLIeenQ_ss4jYpmSzgnuTItur9pZVzpPkpqs4mzr6y274AmJjzppRTDH4VFtta_E02-R7Hc1rUD2kCYt9BqsD7kDjmetnvLtBm97q5XgBS8rQfeH4P-xqiTAsJwXlcrPybSjnwPEptqYCPX5St_BSj4NQfSuzZowXu_qKsP4hAaE9L2W36MvqePPlEm6LChBT3tnqUwcEYNe5k7lkAAbunxx8q_X5Q3iEdcFqt9_0GWHebRBd5abEbjbmoqqCoQeZt7AUvkXCRfBDne-bf25ypyTtwgyuvYMYXau3zGUjgPUO9WIotZwyKyrYmjsZJ7TiM"

  let res = null
  try {
    res = await axios.get(`${baseUrl}?id=${animeID}&captcha_v3=${captchaToken}`)
  } catch (err) {
    throw new Error("Something went wrong. Please try again later.")
  }
  try {
    const $ = load(res.data)
    $(".dowload").each((_index, element) => {
      const link = $(element).find("a")
      if (link.attr("target") != "_blank") {
        downloadLinks.push({ source: link.text(), link: link.attr("href") }!)
      }
    })
    return downloadLinks
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

export const fetchAnimeList = async (
  page: number = 1
): Promise<ISearch<IAnimeResult> | HttpError> => {
  const animeList: IAnimeResult[] = []
  let res = null
  try {
    res = await axios.get(`${baseUrl}/anime-list.html?page=${page}`)
    const $ = load(res.data)
    $(".anime_list_body .listing li").each((_index, element) => {
      const genres: string[] = []
      const entryBody = $("p.type", $(element).attr("title")!)
      const genresEl = entryBody.first()
      genresEl.find("a").each((_idx, genreAnchor) => {
        genres.push($(genreAnchor).attr("title")!)
      })

      const releaseDate = $(entryBody.get(1)).text()

      const img = $("div", $(element).attr("title")!)
      const a = $(element).find("a")
      animeList.push({
        id: a.attr("href")?.replace(`/category/`, "")!,
        title: a.text(),
        image: $(img).find("img").attr("src"),
        url: `${baseUrl}${a.attr("href")}`,
        genres,
        releaseDate,
      })
    })
    const hasNextPage = !$("div.anime_name.anime_list > div > div > ul > li")
      .last()
      .hasClass("selected")
    return {
      currentPage: page,
      hasNextPage: hasNextPage,
      results: animeList,
    }
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

export const fetchAzList = async (letter: string, page: number = 1) => {
  const animeList: IAnimeResult[] = []

  try {
    const url = `${baseUrl}/anime-list-${letter}?page=${page}`

    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept-Encoding": ACCEPT_ENCODING_HEADER,
        Accept: ACCEPT_HEADER,
      },
    })

    const $: CheerioAPI = load(data)

    $(".anime_list_body .listing li").each((_index, element) => {
      const genres: string[] = []
      const entryBody = $("p.type", $(element).attr("title")!)
      const genresEl = entryBody.first()

      genresEl.find("a").each((_idx, genreAnchor) => {
        genres.push($(genreAnchor).attr("title")!)
      })

      const releaseDate = $(entryBody.get(1)).text()

      const img = $("div", $(element).attr("title")!)
      const a = $(element).find("a")
      animeList.push({
        id: a.attr("href")?.replace(`/category/`, "")!,
        title: a.text(),
        image: $(img).find("img").attr("src"),
        url: `${baseUrl}${a.attr("href")}`,
        genres,
        releaseDate,
      })
    })
    const hasNextPage = !$("div.anime_name.anime_list > div > div > ul > li")
      .last()
      .hasClass("selected")
    return {
      currentPage: page,
      hasNextPage: hasNextPage,
      results: animeList,
    }
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

export const fetchUpcomingAnime = async (page: number = 1) => {
  const results: ISearch<IAnimeResult> = {
    results: [],
    hasNextPage: false,
    currentPage: 0,
  }

  try {
    const url = `${gogoUrl}/upcoming-anime/tv-series?page=${page}`

    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept-Encoding": ACCEPT_ENCODING_HEADER,
        Accept: ACCEPT_HEADER,
      },
    })

    const $: CheerioAPI = load(data)

    $("div.page_content > ul li").each((i, el) => {
      const a = $(el).find("div.name > a")
      const pRelease = $(el).find("p.released")
      const pName = $(el).find("div.name > a")
      const id = a.attr("href")?.replace("/category/", "")

      results.results.push({
        id: id!,
        title: a.attr("title")! || pName.text()!,
        releaseDate: pRelease.text(),
        image: $(el).find("div.img > a img").attr("src"),
        url: `${baseUrl}/category/${id}`,
      })
    })

    const hasNextPage = !$("div.anime_name.anime_movies > div > div > ul > li")
      .last()
      .hasClass("selected")

    results.hasNextPage = hasNextPage
    results.currentPage = page

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

export const fetchRequestList = async (page: number = 1) => {
  const results: ISearch<IAnimeResult> = {
    results: [],
    hasNextPage: false,
    currentPage: 0,
  }

  try {
    const url = `${gogoUrl}/requested-list.html?page=${page}`

    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept-Encoding": ACCEPT_ENCODING_HEADER,
        Accept: ACCEPT_HEADER,
      },
    })

    const $: CheerioAPI = load(data)

    $("div.page_content > ul li").each((i, el) => {
      const info = $(el).find("div.info")
      const cover = $(el).find("div.cover")
      const a = info.find("a").attr("href")!
      const id = a.replace("/requested/", "")

      results.results.push({
        id: id!,
        title: info.find("a").attr("title")!,
        releaseDate: info
          .find("p:nth-child(3)")
          .text()
          .replace("Released: ", ""),
        image: cover.find("a img").attr("data-original")!,
        url: `${baseUrl}/category/${id}`,
        requestStatus: cover.find("div.request_top span").text(),
        status: info
          .find("p:nth-child(4)")
          .text()
          .trim()
          .replace("Status: ", "") as MediaStatus,
        description: info
          .find("p:nth-child(5)")
          .text()
          .trim()
          .replace("Plot Summary: ", "")!,
      })
    })

    const hasNextPage = !$("div.anime_name.anime_movies > div > div > ul > li")
      .last()
      .hasClass("selected")

    results.hasNextPage = hasNextPage
    results.currentPage = page

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
