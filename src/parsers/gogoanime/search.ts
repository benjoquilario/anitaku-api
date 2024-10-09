import createHttpError, { type HttpError } from "http-errors"
import { MediaStatus, SubOrSub, StreamingServers } from "../../types/types"
import { ISearch, IAnimeResult } from "../../types/types"
import instance, { AxiosError } from "../../utils/axios"
import { gogoBaseUrl } from "../../utils/constants"
import { CheerioAPI, load } from "cheerio"

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
    const res = await instance(gogoBaseUrl).get(
      `/filter.html?keyword=${encodeURIComponent(query)}&page=${page}`
    )

    const $: CheerioAPI = load(res.data)

    searchResult.hasNextPage =
      $("div.anime_name.new_series > div > div > ul > li.selected").next()
        .length > 0

    $("div.last_episodes > ul > li").each((i, el) => {
      searchResult.results.push({
        id: $(el).find("p.name > a").attr("href")?.split("/")[2]!,
        title: $(el).find("p.name > a").text(),
        url: `${gogoBaseUrl}/${$(el).find("p.name > a").attr("href")}`,
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
