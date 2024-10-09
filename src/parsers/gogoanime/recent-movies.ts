import { ISearch, IAnimeResult } from "../../types/types"
import createHttpError, { HttpError } from "http-errors"
import { CheerioAPI, load } from "cheerio"
import { gogoBaseUrl } from "../../utils/constants"
import instance, { AxiosError } from "../../utils/axios"

export const fetchRecentMovies = async (
  page: number = 1
): Promise<ISearch<IAnimeResult> | HttpError> => {
  try {
    const res = await instance(gogoBaseUrl).get(
      `/anime-movies.html?aph&page=${page}`
    )

    const $: CheerioAPI = load(res.data)

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
        url: `${gogoBaseUrl}${a.attr("href")}`,
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
