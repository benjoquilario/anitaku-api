import { IAnimeResult, ISearch } from "../../types/types"
import instance, { AxiosError } from "../../utils/axios"
import { ajaxUrl, gogoBaseUrl } from "../../utils/constants"
import createHttpError, { HttpError } from "http-errors"
import { CheerioAPI, load } from "cheerio"

export const fetchRecentEpisodes = async (
  page: number = 1,
  type: number = 1
): Promise<ISearch<IAnimeResult> | HttpError> => {
  try {
    const res = await instance(ajaxUrl).get(
      `/page-recent-release.html?page=${page}&type=${type}`
    )

    const $: CheerioAPI = load(res.data)

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
        url: `${gogoBaseUrl}${$(el).find("a").attr("href")?.trim()}`,
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
