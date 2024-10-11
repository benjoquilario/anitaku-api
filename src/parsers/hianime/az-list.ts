import { ISearch, IAnimeResult } from "../../types/types"
import { HttpError } from "http-errors"
import { USER_AGENT, ACCEPT_ENCODING_HEADER, ACCEPT_HEADER } from "../../utils"
import { hiAnimeBaseUrl } from "../../utils/constants"
import instance, { AxiosError } from "../../utils/axios"
import { CheerioAPI, load } from "cheerio"
import { scrapeCard } from "../../utils/methods"
import createHttpError from "http-errors"

export const fetchAzList = async function (
  letter: string,
  page: number = 1
): Promise<ISearch<IAnimeResult> | HttpError> {
  const results: ISearch<IAnimeResult> = {
    currentPage: 0,
    hasNextPage: false,
    totalPages: 0,
    results: [],
  }

  try {
    const url = `/az-list/${letter}?page=${page}`

    const { data } = await instance(hiAnimeBaseUrl).get(url, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept-Encoding": ACCEPT_ENCODING_HEADER,
        Accept: ACCEPT_HEADER,
      },
    })

    const $: CheerioAPI = load(data)

    const selector =
      "#main-wrapper .page-az-wrap .tab-content .film_list-wrap .flw-item"
    const pagination = $("ul.pagination")
    results.currentPage = parseInt(pagination.find(".page-item.active")?.text())

    const nextPage = pagination.find("a[title=Next]")?.attr("href")
    if (nextPage != undefined && nextPage != "") {
      results.hasNextPage = true
    }

    const totalPages = pagination
      .find("a[title=Last]")
      .attr("href")
      ?.split("=")
      .pop()
    if (totalPages === undefined || totalPages === "") {
      results.totalPages = results.currentPage
    } else {
      results.totalPages = parseInt(totalPages)
    }

    results.results = scrapeCard($, hiAnimeBaseUrl, selector)

    if (results.results.length === 0) {
      results.currentPage = 0
      results.hasNextPage = false
      results.totalPages = 0
    }

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
