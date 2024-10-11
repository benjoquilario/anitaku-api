import instance, { AxiosError } from "../../utils/axios"
import { ISearch, IAnimeResult } from "../../types/types"
import createHttpError, { HttpError } from "http-errors"
import { USER_AGENT, ACCEPT_ENCODING_HEADER, ACCEPT_HEADER } from "../../utils"
import { MediaFormat } from "../../types/types"
import { hiAnimeBaseUrl } from "../../utils/constants"
import { CheerioAPI, load } from "cheerio"

export const fetchSearchSuggestion = async function (
  query: string
): Promise<ISearch<IAnimeResult> | HttpError> {
  try {
    const encodedQuery = encodeURIComponent(query)
    const { data } = await instance(hiAnimeBaseUrl).get(
      `/ajax/search/suggest?keyword=${encodedQuery}`,
      {
        headers: {
          Accept: "*/*",
          Pragma: "no-cache",
          Referer: `${hiAnimeBaseUrl}/home`,
          "User-Agent": USER_AGENT,
          "X-Requested-With": "XMLHttpRequest",
          "Accept-Encoding": ACCEPT_ENCODING_HEADER,
        },
      }
    )
    const $ = load(data.html)
    const res: ISearch<IAnimeResult> = {
      results: [],
    }

    $(".nav-item").each((i, el) => {
      const card = $(el)
      if (!card.hasClass("nav-bottom")) {
        const image = card.find(".film-poster img").attr("data-src")
        const title = card.find(".film-name")
        const id = card.attr("href")?.split("/")[1].split("?")[0]

        const duration = card.find(".film-infor span").last().text().trim()
        const releaseDate = card
          .find(".film-infor span:nth-child(1)")
          .text()
          .trim()
        const type = card
          .find(".film-infor")
          .find("span, i")
          .remove()
          .end()
          .text()
          .trim()
        res.results.push({
          image: image,
          id: id!,
          title: title.text(),
          japaneseTitle: title.attr("data-jname"),
          aliasTitle: card.find(".alias-name").text(),
          releaseDate: releaseDate,
          type: type as MediaFormat,
          duration: duration,
          url: `${hiAnimeBaseUrl}/${id}`,
        })
      }
    })

    return res
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
