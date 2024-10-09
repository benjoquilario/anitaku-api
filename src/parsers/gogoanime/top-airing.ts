import { ISearch, IAnimeResult } from "../../types/types"
import createHttpError, { HttpError } from "http-errors"
import { load, CheerioAPI } from "cheerio"
import instance, { AxiosError } from "../../utils/axios"
import { ajaxUrl } from "../../utils/constants"
import { gogoBaseUrl } from "../../utils/constants"

export const fetchTopAiring = async (
  page: number = 1
): Promise<ISearch<IAnimeResult> | HttpError> => {
  try {
    const res = await instance(ajaxUrl).get(
      `/page-recent-release-ongoing.html?page=${page}`
    )

    const $: CheerioAPI = load(res.data)

    const topAiring: IAnimeResult[] = []

    $("div.added_series_body.popular > ul > li").each((i, el) => {
      topAiring.push({
        id: $(el).find("a:nth-child(1)").attr("href")?.split("/")[2]!,
        title: $(el).find("a:nth-child(1)").attr("title")!,
        image: $(el)
          .find("a:nth-child(1) > div")
          .attr("style")
          ?.match("(https?://.*.(?:png|jpg))")![0],
        url: `${gogoBaseUrl}${$(el).find("a:nth-child(1)").attr("href")}`,
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
