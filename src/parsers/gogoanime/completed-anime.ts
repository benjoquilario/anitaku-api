import { ISearch, IAnimeResult } from "../../types/types"
import { gogoBaseUrl } from "../../utils/constants"
import instance, { AxiosError } from "../../utils/axios"
import { CheerioAPI, load } from "cheerio"

import createHttpError, { HttpError } from "http-errors"

export const fetchCompletedAnime = async (
  page: number = 1
): Promise<ISearch<IAnimeResult> | HttpError> => {
  try {
    const res = await instance(gogoBaseUrl).get(
      `/completed-anime.html?page=${page}`
    )

    const $: CheerioAPI = load(res.data)

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
        url: `${gogoBaseUrl}${a.attr("href")}`,
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
