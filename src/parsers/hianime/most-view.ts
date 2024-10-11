import { IScrapedAnimeMostView } from "../../types/parsers"
import createHttpError, { HttpError } from "http-errors"
import { CheerioAPI, load } from "cheerio"
import { IAnimeResult } from "../../types/types"
import { USER_AGENT, ACCEPT_ENCODING_HEADER, ACCEPT_HEADER } from "../../utils"
import instance, { AxiosError } from "../../utils/axios"
import { hiAnimeBaseUrl } from "../../utils/constants"

export const fetchMostView = async function (): Promise<
  IScrapedAnimeMostView | HttpError
> {
  const results: IScrapedAnimeMostView = {
    today: {
      results: [],
    },
    week: {
      results: [],
    },
    month: {
      results: [],
    },
  }

  function scrapeMostViewCard($: CheerioAPI, period: string) {
    const mostViewResults: Array<IAnimeResult> = []

    const selector = `#top-viewed-${period} ul li`

    $(selector).each((_, el) => {
      const id = $(el)
        .find(".film-detail .dynamic-name")
        ?.attr("href")
        ?.slice(1)
        .trim()

      mostViewResults.push({
        id: id!,
        rank: Number($(el).find(".film-number span")?.text()?.trim()) || null,
        title: $(el).find(".film-detail .dynamic-name")?.text()?.trim(),
        japaneseTitle:
          $(el)
            .find(".film-detail .dynamic-name")
            ?.attr("data-jname")
            ?.trim() || null,
        image: $(el)
          .find(".film-poster .film-poster-img")
          ?.attr("data-src")
          ?.trim(),
        episodes: {
          sub:
            Number(
              $(el)
                .find(".film-detail .fd-infor .tick-item.tick-sub")
                ?.text()
                ?.trim()
            ) || null,
          dub:
            Number(
              $(el)
                .find(".film-detail .fd-infor .tick-item.tick-dub")
                ?.text()
                ?.trim()
            ) || null,
        },
      })
    })

    return mostViewResults
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

    const mostViewedSelector =
      '#main-sidebar .block_area-realtime [id^="top-viewed-"]'
    $(mostViewedSelector).each((i, el) => {
      const period = $(el).attr("id")?.split("-")?.pop()?.trim()

      if (period === "day") {
        results.today.results = scrapeMostViewCard($, period)
        return
      }
      if (period === "week") {
        results.week.results = scrapeMostViewCard($, period)
        return
      }
      if (period === "month") {
        results.week.results = scrapeMostViewCard($, period)
      }
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
