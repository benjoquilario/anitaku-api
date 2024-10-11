import {
  IAnimeInfo,
  MediaFormat,
  MediaStatus,
  SubOrSub,
} from "../../types/types"
import { hiAnimeBaseUrl } from "../../utils/constants"
import instance, { AxiosError } from "../../utils/axios"
import { USER_AGENT, ACCEPT_ENCODING_HEADER, ACCEPT_HEADER } from "../../utils"
import { CheerioAPI, load } from "cheerio"
import createHttpError, { HttpError } from "http-errors"
import { scrapeCard } from "../../utils/methods"
import axios from "axios"

export const fetchAnimeInfo = async (
  id: string
): Promise<IAnimeInfo | HttpError> => {
  const results: IAnimeInfo = {
    id: id,
    title: "",
  }

  try {
    const animeUrl: URL = new URL(id, hiAnimeBaseUrl)
    const { data } = await axios.get(animeUrl.href, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept-Encoding": ACCEPT_ENCODING_HEADER,
        Accept: ACCEPT_HEADER,
      },
    })

    const $: CheerioAPI = load(data)

    const selector = "#ani_detail .container .anis-content"

    try {
      results.anilistId = Number(
        JSON.parse($("body")?.find("#syncData")?.text())?.anilist_id
      )
      results.malId = Number(
        JSON.parse($("body")?.find("#syncData")?.text())?.mal_id
      )
    } catch (err) {
      results.anilistId = null
      results.malId = ""
    }

    results.title = $(selector)
      ?.find(".anisc-detail .film-name.dynamic-name")
      ?.text()
      ?.trim()

    results.japaneseTitle = $(
      "div.anisc-info div:nth-child(2) span.name"
    ).text()
    results.image = $("img.film-poster-img").attr("src")
    results.description = $("div.film-description").text().trim()
    // Movie, TV, OVA, ONA, Special, Music
    results.type = $("span.item")
      .last()
      .prev()
      .prev()
      .text()
      .toUpperCase() as MediaFormat
    results.url = `${hiAnimeBaseUrl}/${id}`

    const recommendationsSelector =
      "#main-content .block_area.block_area_category .tab-content .flw-item"
    results.recommendations = scrapeCard(
      $,
      hiAnimeBaseUrl,
      recommendationsSelector
    )
    results.relatedAnime = []
    $("#main-sidebar section:nth-child(1) div.anif-block-ul li").each(
      (i, ele) => {
        const card = $(ele)
        const aTag = card.find(".film-name a")
        const id = aTag.attr("href")?.split("/")[1].split("?")[0]
        results.relatedAnime.push({
          id: id!,
          title: aTag.text(),
          url: `${hiAnimeBaseUrl}${aTag.attr("href")}`,
          image: card.find("img")?.attr("data-src"),
          japaneseTitle: aTag.attr("data-jname"),
          type: card
            .find(".tick")
            .contents()
            .last()
            ?.text()
            ?.trim() as MediaFormat,
          sub: parseInt(card.find(".tick-item.tick-sub")?.text()) || 0,
          dub: parseInt(card.find(".tick-item.tick-dub")?.text()) || 0,
          episodes: parseInt(card.find(".tick-item.tick-eps")?.text()) || 0,
        })
      }
    )
    const hasSub: boolean =
      $("div.film-stats div.tick div.tick-item.tick-sub").length > 0
    const hasDub: boolean =
      $("div.film-stats div.tick div.tick-item.tick-dub").length > 0

    if (hasSub) {
      results.subOrDub = SubOrSub.SUB
      results.hasSub = hasSub
    }
    if (hasDub) {
      results.subOrDub = SubOrSub.DUB
      results.hasDub = hasDub
    }
    if (hasSub && hasDub) {
      results.subOrDub = SubOrSub.BOTH
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
