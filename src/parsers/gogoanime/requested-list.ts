import { ISearch, IAnimeResult, MediaStatus } from "../../types/types"

import createHttpError, { HttpError } from "http-errors"
import { USER_AGENT, ACCEPT_ENCODING_HEADER, ACCEPT_HEADER } from "../../utils"
import { CheerioAPI, load } from "cheerio"
import { gogoBaseUrl, gogoTakuUrl } from "../../utils/constants"
import instance, { AxiosError } from "../../utils/axios"

export const fetchRequestList = async (
  page = 1
): Promise<ISearch<IAnimeResult> | HttpError> => {
  const results: ISearch<IAnimeResult> = {
    results: [],
    hasNextPage: false,
    currentPage: 0,
  }

  try {
    const url = `/requested-list.html?page=${page}`

    const { data } = await instance(gogoTakuUrl).get(url, {
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
        url: `${gogoBaseUrl}/category/${id}`,
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
