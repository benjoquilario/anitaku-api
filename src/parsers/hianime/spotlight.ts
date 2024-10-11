import { ISearch, IAnimeResult } from "../../types/types"
import { hiAnimeBaseUrl } from "../../utils/constants"
import { USER_AGENT, ACCEPT_ENCODING_HEADER, ACCEPT_HEADER } from "../../utils"
import { CheerioAPI, load } from "cheerio"
import createHttpError, { HttpError } from "http-errors"
import instance, { AxiosError } from "../../utils/axios"
import { MediaFormat } from "../../types/types"

export const fetchSpotlight = async function (): Promise<
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

    const spotlightSelector = "#slider .swiper-wrapper .swiper-slide"

    $(spotlightSelector).each((i, el) => {
      const otherInfo = $(el)
        .find(".deslide-item-content .sc-detail .scd-item")
        .map((i, el) => $(el).text().trim())
        .get()
        .slice(0, -1)

      const id =
        $(el)
          .find("div.desi-buttons .btn-secondary")
          .attr("href")
          ?.match(/\/([^/]+)$/)?.[1] || null
      const img = $(el).find("img.film-poster-img")
      results.results.push({
        rank:
          Number(
            $(el)
              .find(".deslide-item-content .desi-sub-text")
              ?.text()
              .trim()
              .split(" ")[0]
              .slice(1)
          ) || null,
        id: id!,
        title: $(el)
          .find(".deslide-item-content .desi-head-title.dynamic-name")
          ?.text()
          .trim(),
        description: $(el)
          .find(".deslide-item-content .desi-description")
          ?.text()
          ?.split("[")
          ?.shift()
          ?.trim(),
        url: `${hiAnimeBaseUrl}/${id}`,
        type: $(el)
          .find("div.sc-detail .scd-item:nth-child(1)")
          .text()
          .trim() as MediaFormat,
        banner: img.attr("data-src") || img.attr("src") || null,
        duration: $(el).find("div.sc-detail > div:nth-child(2)").text().trim(),
        releaseDate: $(el)
          .find("div.sc-detail > div:nth-child(3)")
          .text()
          .trim(),
        japaneseTitle: $(el)
          .find(".deslide-item-content .desi-head-title.dynamic-name")
          ?.attr("data-jname")
          ?.trim(),
        episodes: {
          sub:
            Number(
              $(el)
                .find(
                  ".deslide-item-content .sc-detail .scd-item .tick-item.tick-sub"
                )
                ?.text()
                ?.trim()
            ) || 0,
          dub:
            Number(
              $(el)
                .find(
                  ".deslide-item-content .sc-detail .scd-item .tick-item.tick-dub"
                )
                ?.text()
                ?.trim()
            ) || 0,
        },
        otherInfo,
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
