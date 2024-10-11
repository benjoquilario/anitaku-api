import { ISearch, IAnimeResult } from "../../types/types"
import instance, { AxiosError } from "../../utils/axios"
import createHttpError, { HttpError } from "http-errors"
import { hiAnimeBaseUrl } from "../../utils/constants"
import { USER_AGENT, ACCEPT_ENCODING_HEADER, ACCEPT_HEADER } from "../../utils"
import { CheerioAPI, load } from "cheerio"

export const fetchAiringSchedule = async function (
  date: string = new Date().toISOString().slice(0, 10)
): Promise<ISearch<IAnimeResult> | HttpError> {
  const results: ISearch<IAnimeResult> = {
    results: [],
  }

  try {
    const {
      data: { html },
    } = await instance(hiAnimeBaseUrl).get(
      `/ajax/schedule/list?tzOffset=360&date=${date}`,
      {
        headers: {
          Accept: "*/*",
          Referer: `${hiAnimeBaseUrl}/home`,
          "User-Agent": USER_AGENT,
          "X-Requested-With": "XMLHttpRequest",
          "Accept-Encoding": ACCEPT_ENCODING_HEADER,
        },
      }
    )

    const $: CheerioAPI = load(html)

    if ($("li")?.text()?.trim()?.includes("No data to display")) {
      return results
    }

    $("li").each((i, ele) => {
      const card = $(ele)
      const title = card.find(".film-name")

      const id = card
        .find("a.tsl-link")
        .attr("href")
        ?.split("/")[1]
        .split("?")[0]
      const airingTime = card.find("div.time").text().replace("\n", "").trim()
      const airingEpisode = card
        .find("div.film-detail div.fd-play button")
        .text()
        .replace("\n", "")
        .trim()
      results.results.push({
        id: id!,
        title: title.text(),
        japaneseTitle: title.attr("data-jname"),
        url: `${hiAnimeBaseUrl}/${id}`,
        airingEpisode: airingEpisode,
        airingTime: airingTime,
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
