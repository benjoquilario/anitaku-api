import {
  type IAnimeInfo,
  MediaFormat,
  MediaStatus,
  SubOrSub,
} from "../../types/types"
import createHttpError, { type HttpError } from "http-errors"

import { gogoBaseUrl, ajaxUrl } from "../../utils/constants"
import instance, { AxiosError } from "../../utils/axios"

import { CheerioAPI, load } from "cheerio"

export const fetchAnimeInfo = async (
  id: string
): Promise<IAnimeInfo | HttpError> => {
  if (!id.includes("gogoanime")) id = `${gogoBaseUrl}/category/${id}`

  const animeInfo: IAnimeInfo = {
    id: "",
    title: "",
    url: "",
    genres: [],
    totalEpisodes: 0,
  }
  try {
    const { data } = await instance(gogoBaseUrl).get(id)

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

    const html = await instance(ajaxUrl).get(
      `/load-list-episode?ep_start=${ep_start}&ep_end=${ep_end}&id=${movie_id}&default_ep=${0}&alias=${alias}`
    )

    const $$ = load(html.data)

    animeInfo.episodes = []
    $$("#episode_related > li").each((i, el) => {
      animeInfo.episodes?.push({
        id: $(el).find("a").attr("href")?.split("/")[1]!,
        number: parseFloat($(el).find(`div.name`).text().replace("EP ", "")),
        url: `${gogoBaseUrl}/${$(el).find(`a`).attr("href")?.trim()}`,
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
