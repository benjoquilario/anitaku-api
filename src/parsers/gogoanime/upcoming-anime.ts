import { USER_AGENT, ACCEPT_ENCODING_HEADER, ACCEPT_HEADER } from "../../utils"

import { CheerioAPI, load } from "cheerio"
import { ISearch, IAnimeResult } from "../../types/types"
import { gogoBaseUrl, gogoTakuUrl } from "../../utils/constants"
import instance, { AxiosError } from "../../utils/axios"
import createHttpError, { HttpError } from "http-errors"

export const fetchUpcomingAnime = async (
  page = 1
): Promise<ISearch<IAnimeResult> | HttpError> => {
  const results: ISearch<IAnimeResult> = {
    results: [],
    hasNextPage: false,
    currentPage: 0,
  }

  try {
    const url = `/upcoming-anime/tv-series?page=${page}`

    const { data } = await instance(gogoTakuUrl).get(url, {
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
        image: $(el).find("div.img > a img").attr("src")!,
        url: `${gogoBaseUrl}/category/${id}`,
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
