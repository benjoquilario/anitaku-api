import { ISearch, IAnimeResult } from "../../types/types"
import createHttpError, { HttpError } from "http-errors"
import { USER_AGENT, ACCEPT_ENCODING_HEADER, ACCEPT_HEADER } from "../../utils"

import { hiAnimeBaseUrl } from "../../utils/constants"
import instance, { AxiosError } from "../../utils/axios"
import { CheerioAPI, load } from "cheerio"

export const fetchTrending = async function (): Promise<
  ISearch<IAnimeResult> | HttpError
> {
  const results: ISearch<IAnimeResult> = {
    results: [],
  }

  try {
    const url = `/home`
    const { data } = await instance(hiAnimeBaseUrl).get(url, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept-Encoding": ACCEPT_ENCODING_HEADER,
        Accept: ACCEPT_HEADER,
      },
    })

    const $: CheerioAPI = load(data)

    const trendingSelector = "#trending-home .swiper-wrapper .swiper-slide"

    $(trendingSelector).each((i, el) => {
      const id = $(el)
        .find(".item .film-poster")
        ?.attr("href")
        ?.slice(1)
        ?.trim()

      results.results.push({
        rank: parseInt(
          $(el).find(".item .number")?.children()?.first()?.text()?.trim()
        ),
        id: id!,
        title: $(el)
          .find(".item .number .film-title.dynamic-name")
          ?.text()
          ?.trim(),
        japaneseTitle: $(el)
          .find(".item .number .film-title.dynamic-name")
          ?.attr("data-jname")
          ?.trim(),
        image: $(el)
          .find(".item .film-poster .film-poster-img")
          ?.attr("data-src")
          ?.trim(),
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
