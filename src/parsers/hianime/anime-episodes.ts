import { IScrapedAnimeEpisodes } from "../../types/parsers"
import { CheerioAPI, load } from "cheerio"
import instance, { AxiosError } from "../../utils/axios"
import { hiAnimeBaseUrl } from "../../utils/constants"
import createHttpError from "http-errors"

export const fetchAnimeEpisodes = async (animeId: string) => {
  const results: IScrapedAnimeEpisodes = {
    totalEpisodes: 0,
    episodes: [],
  }

  try {
    const episodesAjax = await instance(hiAnimeBaseUrl).get(
      `/ajax/v2/episode/list/${animeId.split("-").pop()}`,
      {
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          Referer: `${hiAnimeBaseUrl}/watch/${animeId}`,
        },
      }
    )

    const $$: CheerioAPI = load(episodesAjax.data.html)

    results.totalEpisodes = $$("div.detail-infor-content > div > a").length
    $$("div.detail-infor-content > div > a").each((i, el) => {
      const id = $$(el).attr("href")?.split("/")[2]?.replace("?ep=", "$ep$")!
      const number = parseInt($$(el).attr("data-number")!)
      const title = $$(el).attr("title")
      const url = hiAnimeBaseUrl + $$(el).attr("href")
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
